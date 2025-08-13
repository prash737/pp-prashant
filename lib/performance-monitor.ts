
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private logs: Array<{
    timestamp: number;
    event: string;
    duration?: number;
    phase: string;
    details?: any;
    sequenceNumber: number;
  }> = [];
  private startTime: number;
  private phaseStartTimes: Map<string, number> = new Map();
  private sequenceCounter: number = 0;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(context: string) {
    this.startTime = performance.now();
    this.logs = [];
    this.phaseStartTimes.clear();
    this.sequenceCounter = 0;
    this.log('MONITORING_START', 'INITIALIZATION', { 
      context,
      startTime: this.startTime,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'API Route'
    });
  }

  log(event: string, phase: string, details?: any) {
    const timestamp = performance.now();
    this.sequenceCounter++;
    
    const logEntry = {
      sequenceNumber: this.sequenceCounter,
      timestamp,
      event,
      phase,
      details,
      duration: timestamp - this.startTime
    };
    
    this.logs.push(logEntry);
    
    console.log(`🔄 [${this.sequenceCounter.toString().padStart(3, '0')}] [${phase}] ${event} - ${(timestamp - this.startTime).toFixed(2)}ms`, details || '');
  }

  startPhase(phaseName: string) {
    const timestamp = performance.now();
    this.phaseStartTimes.set(phaseName, timestamp);
    this.log(`PHASE_START_${phaseName}`, phaseName);
  }

  endPhase(phaseName: string) {
    const timestamp = performance.now();
    const startTime = this.phaseStartTimes.get(phaseName);
    if (startTime) {
      const duration = timestamp - startTime;
      this.log(`PHASE_END_${phaseName}`, phaseName, { phaseDuration: duration });
    }
  }

  async generateReport(): Promise<any> {
    const totalDuration = performance.now() - this.startTime;
    
    // Calculate phase durations
    const phases = [...new Set(this.logs.map(log => log.phase))];
    const phaseAnalysis = phases.map(phase => {
      const phaseLogs = this.logs.filter(log => log.phase === phase);
      const phaseStart = Math.min(...phaseLogs.map(log => log.duration || 0));
      const phaseEnd = Math.max(...phaseLogs.map(log => log.duration || 0));
      
      return {
        phase,
        duration: phaseEnd - phaseStart,
        eventCount: phaseLogs.length,
        events: phaseLogs.map(log => ({
          event: log.event,
          duration: log.duration,
          details: log.details
        }))
      };
    });

    // Identify bottlenecks
    const bottlenecks = this.logs
      .filter(log => log.details?.duration && log.details.duration > 100) // Operations taking more than 100ms
      .sort((a, b) => (b.details?.duration || 0) - (a.details?.duration || 0))
      .slice(0, 10);

    const report = {
      metadata: {
        reportGeneratedAt: new Date().toISOString(),
        totalDuration,
        totalEvents: this.logs.length,
        url: typeof window !== 'undefined' ? window.location.href : 'API Route',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server'
      },
      summary: {
        phases: phases.length,
        longestPhase: phaseAnalysis.sort((a, b) => b.duration - a.duration)[0],
        bottlenecks: bottlenecks.length
      },
      phaseAnalysis,
      bottlenecks,
      parallelOperations: this.identifyParallelOperations(),
      detailedLogs: this.logs,
      recommendations: this.generateRecommendations(phaseAnalysis, bottlenecks)
    };

    return report;
  }

  private identifyParallelOperations(): any[] {
    const parallelOps = [];
    const timeWindows = new Map<number, any[]>();
    
    // Group operations by 100ms time windows
    this.logs.forEach(log => {
      const window = Math.floor((log.duration || 0) / 100) * 100;
      if (!timeWindows.has(window)) {
        timeWindows.set(window, []);
      }
      timeWindows.get(window)?.push(log);
    });

    // Identify windows with multiple operations
    timeWindows.forEach((logs, window) => {
      if (logs.length > 1) {
        parallelOps.push({
          timeWindow: `${window}ms - ${window + 100}ms`,
          operationCount: logs.length,
          operations: logs.map(log => ({
            event: log.event,
            phase: log.phase,
            duration: log.duration
          }))
        });
      }
    });

    return parallelOps;
  }

  private generateRecommendations(phases: any[], bottlenecks: any[]): string[] {
    const recommendations = [];

    // Phase-based recommendations
    const slowPhases = phases.filter(p => p.duration > 1000);
    slowPhases.forEach(phase => {
      recommendations.push(`Consider optimizing ${phase.phase} phase (${phase.duration}ms) - it's taking over 1 second`);
    });

    // Bottleneck recommendations
    bottlenecks.forEach(bottleneck => {
      if (bottleneck.event.includes('FETCH') || bottleneck.event.includes('API')) {
        recommendations.push(`API call ${bottleneck.event} is slow (${bottleneck.details?.duration}ms) - consider caching or optimization`);
      }
      if (bottleneck.event.includes('QUERY') || bottleneck.event.includes('DATABASE')) {
        recommendations.push(`Database operation ${bottleneck.event} is slow (${bottleneck.details?.duration}ms) - consider query optimization or indexing`);
      }
    });

    // General recommendations
    if (phases.some(p => p.phase === 'DATA_TRANSFORMATION' && p.duration > 500)) {
      recommendations.push('Data transformation is taking significant time - consider optimizing data structure or using memoization');
    }

    return recommendations;
  }

  async saveReport(filename?: string) {
    try {
      const report = await this.generateReport();
      const reportFileName = filename || `performance-report-${Date.now()}.json`;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('latestPerformanceReport', JSON.stringify(report, null, 2));
        
        // Download as file
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = reportFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      console.log('📊 PERFORMANCE REPORT GENERATED:', report);
      console.log('💾 Report saved to localStorage and downloaded as file');
      
      return report;
    } catch (error) {
      console.error('❌ Failed to generate performance report:', error);
      throw error;
    }
  }

  getLogs() {
    return {
      totalDuration: performance.now() - this.startTime,
      logs: this.logs
    };
  }

  reset() {
    this.logs = [];
    this.phaseStartTimes.clear();
    this.sequenceCounter = 0;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
