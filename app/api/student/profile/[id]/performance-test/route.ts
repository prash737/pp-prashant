
import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/performance-monitor'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const studentId = resolvedParams.id;
  
  console.log('🧪 Starting Student Profile API Performance Test...');
  
  const testResults = [];
  const iterations = 5;
  
  for (let i = 1; i <= iterations; i++) {
    console.log(`🔄 Test iteration ${i}/${iterations}`);
    
    const startTime = performance.now();
    
    try {
      // Call the actual API endpoint
      const response = await fetch(`${request.nextUrl.origin}/api/student/profile/${studentId}`, {
        headers: {
          'cookie': request.headers.get('cookie') || ''
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const result = {
        iteration: i,
        status: response.status,
        duration: Math.round(duration),
        success: response.ok,
        timestamp: new Date().toISOString()
      };
      
      testResults.push(result);
      console.log(`✅ Iteration ${i}: ${duration.toFixed(2)}ms - Status: ${response.status}`);
      
      // Brief pause between iterations
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const result = {
        iteration: i,
        status: 500,
        duration: Math.round(duration),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      
      testResults.push(result);
      console.log(`❌ Iteration ${i}: ${duration.toFixed(2)}ms - Error: ${result.error}`);
    }
  }
  
  // Calculate statistics
  const successfulTests = testResults.filter(r => r.success);
  const durations = successfulTests.map(r => r.duration);
  
  const stats = {
    totalTests: iterations,
    successfulTests: successfulTests.length,
    failedTests: iterations - successfulTests.length,
    averageTime: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
    minTime: durations.length > 0 ? Math.min(...durations) : 0,
    maxTime: durations.length > 0 ? Math.max(...durations) : 0,
    successRate: Math.round((successfulTests.length / iterations) * 100)
  };
  
  console.log('📊 Student Profile API Performance Test Complete:', stats);
  
  return NextResponse.json({
    testType: 'Student Profile API Performance Test',
    studentId,
    timestamp: new Date().toISOString(),
    statistics: stats,
    detailedResults: testResults,
    performanceAnalysis: {
      classification: stats.averageTime < 500 ? 'Excellent' : 
                     stats.averageTime < 1000 ? 'Good' : 
                     stats.averageTime < 2000 ? 'Fair' : 'Poor',
      recommendation: stats.averageTime < 500 ? 
        'API performance is excellent! Ready for production.' :
        stats.averageTime < 1000 ?
        'API performance is good. Monitor under load.' :
        'API needs optimization. Consider caching and query optimization.'
    }
  });
}
