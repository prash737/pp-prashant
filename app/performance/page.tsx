
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertTriangle, 
  Clock, 
  Database, 
  Server, 
  Zap,
  TrendingUp,
  CheckCircle,
  XCircle,
  Activity,
  FileText,
  GitBranch,
  Settings,
  Code,
  Wrench,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Monitor,
  Cpu,
  Network,
  Globe
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { performanceMonitor } from "@/lib/performance-monitor";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  files: string[];
  estimatedHours: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  dependencies?: string[];
  expectedImpact: string;
}

interface PhaseData {
  id: string;
  name: string;
  description: string;
  duration: string;
  tasks: TaskItem[];
  status: 'Not Started' | 'In Progress' | 'Completed';
}

interface PerformanceData {
  timestamp: string;
  url: string;
  totalLoadTime: number;
  phases: any[];
  bottlenecks: any[];
  recommendations: string[];
  detailedLogs: any[];
}

const COLORS = ['#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'];

export default function PerformancePage() {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [phases, setPhases] = useState<PhaseData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);

  useEffect(() => {
    // Load roadmap progress from localStorage
    const saved = localStorage.getItem('pathpiper-performance-tasks');
    if (saved) {
      const data = JSON.parse(saved);
      setCompletedTasks(new Set(data.completedTasks || []));
    }
    
    setPhases(roadmapData);

    // Load performance report from localStorage
    const perfReport = localStorage.getItem('latestPerformanceReport');
    if (perfReport) {
      try {
        setPerformanceData(JSON.parse(perfReport));
      } catch (error) {
        console.error('Error parsing performance data:', error);
      }
    }
  }, []);

  const startPerformanceMonitoring = () => {
    setIsMonitoring(true);
    performanceMonitor.startMonitoring('Performance Dashboard Analysis');
    
    // Simulate performance monitoring
    const interval = setInterval(() => {
      const data = performanceMonitor.getLogs();
      setLiveData(data);
    }, 1000);

    // Stop after 10 seconds
    setTimeout(async () => {
      clearInterval(interval);
      setIsMonitoring(false);
      
      try {
        const report = await performanceMonitor.generateReport();
        setPerformanceData(report);
      } catch (error) {
        console.error('Error generating performance report:', error);
      }
    }, 10000);
  };

  const downloadReport = () => {
    if (performanceData) {
      const blob = new Blob([JSON.stringify(performanceData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
    
    // Save to localStorage
    localStorage.setItem('pathpiper-performance-tasks', JSON.stringify({
      completedTasks: Array.from(newCompleted),
      lastUpdated: new Date().toISOString()
    }));
  };

  const getPhaseProgress = (phase: PhaseData | undefined) => {
    if (!phase || !phase.tasks) return 0;
    const totalTasks = phase.tasks.length;
    const completedPhase = phase.tasks.filter(task => completedTasks.has(task.id)).length;
    return totalTasks > 0 ? (completedPhase / totalTasks) * 100 : 0;
  };

  const getTotalProgress = () => {
    if (phases.length === 0) return 0;
    const allTasks = phases.flatMap(phase => phase.tasks || []);
    const completed = allTasks.filter(task => completedTasks.has(task.id)).length;
    return allTasks.length > 0 ? (completed / allTasks.length) * 100 : 0;
  };

  const getTasksByPriority = () => {
    if (phases.length === 0) {
      return { Critical: 0, High: 0, Medium: 0, Low: 0 };
    }
    const allTasks = phases.flatMap(phase => phase.tasks || []);
    return {
      Critical: allTasks.filter(t => t.priority === 'Critical').length,
      High: allTasks.filter(t => t.priority === 'High').length,
      Medium: allTasks.filter(t => t.priority === 'Medium').length,
      Low: allTasks.filter(t => t.priority === 'Low').length,
    };
  };

  const getCurrentPhase = () => {
    if (phases.length === 0) return undefined;
    return phases.find(phase => {
      const progress = getPhaseProgress(phase);
      return progress > 0 && progress < 100;
    }) || phases[0];
  };

  // Performance metrics charts data
  const getPhasePerformanceData = () => {
    if (!performanceData?.phaseAnalysis) return [];
    return performanceData.phaseAnalysis.map(phase => ({
      name: phase.phase.replace(/_/g, ' '),
      duration: phase.duration || 0,
      events: phase.eventCount || 0
    }));
  };

  const getBottleneckData = () => {
    if (!performanceData?.bottlenecks) return [];
    return performanceData.bottlenecks.slice(0, 10).map((bottleneck, index) => ({
      name: bottleneck.event?.substring(0, 20) + '...' || `Operation ${index + 1}`,
      duration: bottleneck.details?.duration || bottleneck.duration || 0,
      phase: bottleneck.phase || 'Unknown'
    }));
  };

  const roadmapData: PhaseData[] = [
    {
      id: "phase-1",
      name: "Phase 1: Database Migration (Drizzle)",
      description: "Replace Prisma with Drizzle ORM for better performance and type safety",
      duration: "Week 1-2 (10-14 days)",
      status: 'Not Started',
      tasks: [
        {
          id: "drizzle-setup",
          title: "Install and Configure Drizzle",
          description: "Install drizzle-orm, drizzle-kit and configure the setup",
          files: ["package.json", "drizzle.config.ts", "lib/db/drizzle.ts"],
          estimatedHours: 4,
          priority: 'Critical',
          status: 'Not Started',
          expectedImpact: "Foundation for all database optimizations"
        },
        {
          id: "schema-migration",
          title: "Migrate Prisma Schema to Drizzle",
          description: "Convert all Prisma models to Drizzle schema definitions",
          files: [
            "lib/db/schema/enums.ts",
            "lib/db/schema/profiles.ts", 
            "lib/db/schema/students.ts",
            "lib/db/schema/mentors.ts",
            "lib/db/schema/institutions.ts",
            "lib/db/schema/connections.ts",
            "lib/db/schema/feed.ts",
            "lib/db/schema/skills-interests.ts",
            "lib/db/schema/index.ts"
          ],
          estimatedHours: 16,
          priority: 'Critical',
          status: 'Not Started',
          dependencies: ["drizzle-setup"],
          expectedImpact: "Type-safe database schema with better performance"
        },
        {
          id: "migration-scripts",
          title: "Create Database Migration Scripts",
          description: "Generate SQL migrations and data migration scripts",
          files: ["drizzle/migrations/", "scripts/migrate-data.ts"],
          estimatedHours: 6,
          priority: 'Critical',
          status: 'Not Started',
          dependencies: ["schema-migration"],
          expectedImpact: "Safe database migration without data loss"
        },
        {
          id: "auth-api-migration",
          title: "Migrate Authentication APIs",
          description: "Convert all auth-related API endpoints to use Drizzle",
          files: [
            "app/api/auth/login/route.ts",
            "app/api/auth/register/route.ts",
            "app/api/auth/user/route.ts",
            "app/api/auth/logout/route.ts",
            "app/api/auth/check-token/route.ts",
            "app/api/auth/callback/route.ts",
            "app/api/auth/verify-student-email/route.ts",
            "app/api/auth/verify-parent/route.ts",
            "lib/services/auth-service.ts"
          ],
          estimatedHours: 12,
          priority: 'Critical',
          status: 'Not Started',
          dependencies: ["migration-scripts"],
          expectedImpact: "50% faster authentication queries"
        },
        {
          id: "profile-api-migration",
          title: "Migrate Profile Management APIs",
          description: "Convert profile-related API endpoints to Drizzle",
          files: [
            "app/api/profile/personal-info/route.ts",
            "app/api/profile/social-contact/route.ts",
            "app/api/student/profile/[id]/route.ts",
            "lib/db/profile.ts"
          ],
          estimatedHours: 8,
          priority: 'Critical',
          status: 'Not Started',
          dependencies: ["auth-api-migration"],
          expectedImpact: "60% faster profile loading"
        }
      ]
    },
    {
      id: "phase-2",
      name: "Phase 2: Database Performance Optimization",
      description: "Add indexes, optimize queries, and implement caching",
      duration: "Week 3-4 (7-10 days)",
      status: 'Not Started',
      tasks: [
        {
          id: "database-indexes",
          title: "Add Database Indexes",
          description: "Create strategic indexes for frequently queried fields",
          files: ["drizzle/migrations/add-performance-indexes.sql"],
          estimatedHours: 4,
          priority: 'Critical',
          status: 'Not Started',
          expectedImpact: "70% faster database queries"
        },
        {
          id: "connection-pooling",
          title: "Implement Connection Pooling",
          description: "Configure optimized database connection pooling",
          files: ["lib/db/drizzle.ts", "drizzle.config.ts"],
          estimatedHours: 3,
          priority: 'Critical',
          status: 'Not Started',
          expectedImpact: "Better database connection management"
        },
        {
          id: "query-optimization",
          title: "Optimize Student Profile Query",
          description: "Rewrite the main student profile API with optimized queries",
          files: ["app/api/student/profile/[id]/route.ts"],
          estimatedHours: 6,
          priority: 'Critical',
          status: 'Not Started',
          dependencies: ["database-indexes"],
          expectedImpact: "Reduce API response from 3.5s to 200ms"
        },
        {
          id: "redis-caching",
          title: "Implement Redis Caching",
          description: "Add Redis caching for frequently accessed data",
          files: [
            "lib/cache/redis.ts",
            "lib/cache/profile-cache.ts",
            "app/api/student/profile/[id]/route.ts",
            "app/api/connections/route.ts"
          ],
          estimatedHours: 8,
          priority: 'High',
          status: 'Not Started',
          dependencies: ["query-optimization"],
          expectedImpact: "90% cache hit rate for profile data"
        },
        {
          id: "payload-optimization",
          title: "Optimize API Payload Size",
          description: "Reduce JSON response sizes and implement selective loading",
          files: [
            "app/api/student/profile/[id]/route.ts",
            "app/api/connections/route.ts",
            "app/api/achievements/route.ts",
            "app/api/mood-board/route.ts"
          ],
          estimatedHours: 6,
          priority: 'High',
          status: 'Not Started',
          expectedImpact: "Reduce JSON parsing from 1.4s to 100ms"
        }
      ]
    },
    {
      id: "phase-3",
      name: "Phase 3: API Migration & Optimization",
      description: "Migrate remaining APIs to Drizzle and optimize performance",
      duration: "Week 5-6 (10-12 days)",
      status: 'Not Started',
      tasks: [
        {
          id: "student-apis",
          title: "Migrate Student APIs",
          description: "Convert all student-related API endpoints",
          files: [
            "app/api/student/profile/[id]/achievements/route.ts",
            "app/api/student/profile/[id]/circles/route.ts",
            "app/api/student/profile/[id]/goals/route.ts",
            "app/api/student/following/route.ts"
          ],
          estimatedHours: 10,
          priority: 'High',
          status: 'Not Started',
          expectedImpact: "Consistent performance across all student APIs"
        },
        {
          id: "institution-apis",
          title: "Migrate Institution APIs",
          description: "Convert all institution-related API endpoints",
          files: [
            "app/api/institution/profile/route.ts",
            "app/api/institution/profile/[id]/route.ts",
            "app/api/institution/events/route.ts",
            "app/api/institution/gallery/route.ts",
            "app/api/institution/facilities/route.ts",
            "app/api/institution/faculty/route.ts",
            "app/api/institution/programs/route.ts",
            "app/api/institution/contact-info/route.ts",
            "app/api/institution/quick-facts/route.ts",
            "app/api/institution/faculty-stats/route.ts",
            "app/api/institution/academic-communities/route.ts",
            "app/api/institution/self-analysis/route.ts"
          ],
          estimatedHours: 16,
          priority: 'High',
          status: 'Not Started',
          expectedImpact: "Better institution profile loading performance"
        },
        {
          id: "social-apis",
          title: "Migrate Social Feature APIs",
          description: "Convert connections, circles, and messaging APIs",
          files: [
            "app/api/connections/route.ts",
            "app/api/connections/request/route.ts",
            "app/api/connections/requests/route.ts",
            "app/api/connections/requests/[id]/route.ts",
            "app/api/circles/route.ts",
            "app/api/circles/invitations/route.ts",
            "app/api/circles/invitations/[id]/route.ts",
            "app/api/messages/conversations/route.ts",
            "app/api/messages/[conversationId]/route.ts"
          ],
          estimatedHours: 12,
          priority: 'Medium',
          status: 'Not Started',
          expectedImpact: "Faster social interactions and real-time features"
        },
        {
          id: "feed-apis",
          title: "Migrate Feed System APIs",
          description: "Convert all feed and content-related APIs",
          files: [
            "app/api/feed/posts/route.ts",
            "app/api/feed/posts/[id]/route.ts",
            "app/api/feed/posts/[id]/like/route.ts",
            "app/api/feed/posts/[id]/comment/route.ts",
            "app/api/feed/posts/[id]/bookmark/route.ts",
            "app/api/feed/posts/[id]/react/route.ts",
            "app/api/feed/user-posts/route.ts",
            "app/api/mood-board/route.ts"
          ],
          estimatedHours: 14,
          priority: 'Medium',
          status: 'Not Started',
          expectedImpact: "Faster feed loading and content interactions"
        }
      ]
    },
    {
      id: "phase-4",
      name: "Phase 4: Client-Side Optimization",
      description: "Optimize React components and implement progressive loading",
      duration: "Week 7-8 (8-10 days)",
      status: 'Not Started',
      tasks: [
        {
          id: "progressive-loading",
          title: "Implement Progressive Data Loading",
          description: "Load critical data first, then secondary data progressively",
          files: [
            "app/student/profile/[handle]/page.tsx",
            "components/profile/student-profile.tsx",
            "components/profile/profile-header.tsx"
          ],
          estimatedHours: 8,
          priority: 'High',
          status: 'Not Started',
          expectedImpact: "Perceived load time reduction by 60%"
        },
        {
          id: "web-workers",
          title: "Implement Web Workers for JSON Parsing",
          description: "Move heavy JSON parsing to Web Workers",
          files: [
            "lib/workers/json-parser-worker.ts",
            "hooks/use-worker-json-parser.ts",
            "components/profile/student-profile.tsx"
          ],
          estimatedHours: 6,
          priority: 'Medium',
          status: 'Not Started',
          expectedImpact: "Prevent main thread blocking during parsing"
        },
        {
          id: "response-compression",
          title: "Enable Response Compression",
          description: "Configure gzip/brotli compression for API responses",
          files: ["next.config.mjs", "middleware.ts"],
          estimatedHours: 2,
          priority: 'Medium',
          status: 'Not Started',
          expectedImpact: "30-50% reduction in response sizes"
        },
        {
          id: "component-optimization",
          title: "Optimize React Components",
          description: "Implement memoization and reduce unnecessary re-renders",
          files: [
            "components/profile/student-profile.tsx",
            "components/profile/profile-header.tsx",
            "components/profile/about-section.tsx",
            "components/profile/skills-canvas.tsx",
            "components/profile/achievement-timeline.tsx",
            "components/profile/circle-view.tsx",
            "components/profile/mood-board-section.tsx",
            "components/profile/education-cards.tsx"
          ],
          estimatedHours: 12,
          priority: 'Medium',
          status: 'Not Started',
          expectedImpact: "Smoother UI interactions and faster rendering"
        }
      ]
    },
    {
      id: "phase-5",
      name: "Phase 5: Testing & Monitoring",
      description: "Performance testing, monitoring setup, and final optimization",
      duration: "Week 9-10 (5-7 days)",
      status: 'Not Started',
      tasks: [
        {
          id: "performance-monitoring",
          title: "Enhanced Performance Monitoring",
          description: "Implement comprehensive performance tracking",
          files: [
            "lib/performance-monitor.ts",
            "lib/analytics/performance-tracker.ts",
            "app/api/performance/metrics/route.ts"
          ],
          estimatedHours: 6,
          priority: 'High',
          status: 'Not Started',
          expectedImpact: "Real-time performance monitoring and alerts"
        },
        {
          id: "load-testing",
          title: "Performance Load Testing",
          description: "Conduct comprehensive load testing and optimization",
          files: ["scripts/load-test.ts", "scripts/performance-benchmark.ts"],
          estimatedHours: 8,
          priority: 'High',
          status: 'Not Started',
          expectedImpact: "Validate performance improvements under load"
        },
        {
          id: "error-monitoring",
          title: "Error Monitoring & Logging",
          description: "Implement error tracking and performance logging",
          files: [
            "lib/monitoring/error-tracker.ts",
            "lib/monitoring/performance-logger.ts",
            "app/api/monitoring/errors/route.ts"
          ],
          estimatedHours: 4,
          priority: 'Medium',
          status: 'Not Started',
          expectedImpact: "Proactive issue detection and resolution"
        },
        {
          id: "final-optimization",
          title: "Final Performance Tuning",
          description: "Final optimizations based on testing results",
          files: ["Various files based on testing results"],
          estimatedHours: 8,
          priority: 'Medium',
          status: 'Not Started',
          dependencies: ["load-testing"],
          expectedImpact: "Fine-tuned performance achieving target metrics"
        }
      ]
    }
  ];

  const overallStats = {
    totalTasks: phases.flatMap(p => p.tasks || []).length,
    completedTasks: Array.from(completedTasks).length,
    totalEstimatedHours: phases.flatMap(p => p.tasks || []).reduce((sum, task) => sum + task.estimatedHours, 0),
    completedHours: phases.flatMap(p => p.tasks || []).filter(task => completedTasks.has(task.id)).reduce((sum, task) => sum + task.estimatedHours, 0)
  };

  const priorityStats = getTasksByPriority();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Performance Optimization Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete roadmap for PathPiper performance optimization with Drizzle migration
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={startPerformanceMonitoring}
              disabled={isMonitoring}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isMonitoring ? (
                <>
                  <Monitor className="h-4 w-4 mr-2 animate-pulse" />
                  Monitoring...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Start Monitoring
                </>
              )}
            </Button>
            {performanceData && (
              <Button onClick={downloadReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(getTotalProgress())}% Complete
              </div>
              <div className="text-sm text-gray-500">
                {Array.from(completedTasks).length} of {overallStats.totalTasks} tasks
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(getTotalProgress())}%</div>
              <Progress value={getTotalProgress()} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Array.from(completedTasks).length}/{overallStats.totalTasks} tasks completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Investment</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.completedHours}h</div>
              <p className="text-xs text-muted-foreground">
                of {overallStats.totalEstimatedHours}h total estimated
              </p>
              <Progress value={(overallStats.completedHours / overallStats.totalEstimatedHours) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {getCurrentPhase()?.name?.split(':')[0] || 'Phase 1'}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(getPhaseProgress(getCurrentPhase()))}% complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Tasks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{priorityStats.Critical}</div>
              <p className="text-xs text-muted-foreground">
                Critical priority tasks remaining
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roadmap" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roadmap">Detailed Roadmap</TabsTrigger>
            <TabsTrigger value="analytics">Progress Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
            <TabsTrigger value="bottlenecks">Bottleneck Analysis</TabsTrigger>
            <TabsTrigger value="files">File Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="space-y-6">
            {phases.map((phase, phaseIndex) => (
              <Card key={phase.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle asChild>
                        <div className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            getPhaseProgress(phase) === 100 ? 'bg-green-500' : 
                            getPhaseProgress(phase) > 0 ? 'bg-blue-500' : 'bg-gray-400'
                          }`}>
                            {phaseIndex + 1}
                          </div>
                          {phase.name}
                        </div>
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {phase.description}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {phase.duration}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {Math.round(getPhaseProgress(phase))}%
                      </div>
                      <Progress value={getPhaseProgress(phase)} className="w-32 mt-2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {phase.tasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={completedTasks.has(task.id)}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className={`font-medium ${completedTasks.has(task.id) ? 'line-through text-gray-500' : ''}`}>
                                {task.title}
                              </h4>
                              <Badge variant={
                                task.priority === 'Critical' ? 'destructive' :
                                task.priority === 'High' ? 'default' :
                                task.priority === 'Medium' ? 'secondary' : 'outline'
                              }>
                                {task.priority}
                              </Badge>
                              <Badge variant="outline">
                                {task.estimatedHours}h
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {task.description}
                            </p>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
                              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Expected Impact:</h5>
                              <p className="text-blue-700 dark:text-blue-300 text-sm">{task.expectedImpact}</p>
                            </div>

                            <div className="mb-3">
                              <h5 className="font-medium mb-2 flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                Files to modify ({task.files.length}):
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {task.files.map((file, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {file}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {task.dependencies && (
                              <div className="mb-3">
                                <h5 className="font-medium mb-1 text-orange-600">Dependencies:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {task.dependencies.map((dep, index) => (
                                    <Badge key={index} variant="outline" className="text-xs border-orange-200">
                                      {phases.flatMap(p => p.tasks).find(t => t.id === dep)?.title || dep}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress by Phase</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={phases.map(phase => ({
                        name: phase.name.split(':')[0],
                        progress: getPhaseProgress(phase),
                        tasks: phase.tasks.length
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="progress" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tasks by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={Object.entries(priorityStats).map(([priority, count]) => ({
                            name: priority,
                            value: count
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          nameKey="name"
                        >
                          {Object.entries(priorityStats).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Expected Performance Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-red-500">5,028ms</div>
                    <div className="text-sm text-gray-600">Current Load Time</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-green-500">400ms</div>
                    <div className="text-sm text-gray-600">Target Load Time</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-blue-500">92%</div>
                    <div className="text-sm text-gray-600">Performance Improvement</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Live Monitoring */}
            {isMonitoring && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 animate-pulse text-blue-500" />
                    Live Performance Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Duration: {liveData ? `${liveData.totalDuration.toFixed(0)}ms` : '0ms'}</span>
                      <span>Events: {liveData ? liveData.logs.length : 0}</span>
                    </div>
                    <Progress value={(liveData?.totalDuration || 0) / 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Overview */}
            {performanceData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Load Time</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{performanceData.totalLoadTime || performanceData.metadata?.totalDuration || 0}ms</div>
                      <p className="text-xs text-muted-foreground">
                        Total page load duration
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{performanceData.detailedLogs?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Performance events tracked
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Phases</CardTitle>
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{performanceData.summary?.phases?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Execution phases
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Bottlenecks</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{performanceData.bottlenecks?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Performance bottlenecks identified
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Phase Performance Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Phase Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getPhasePerformanceData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="duration" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5" />
                        Performance Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={performanceData.detailedLogs?.slice(0, 20).map((log, index) => ({
                            index,
                            duration: log.duration || 0,
                            event: log.event
                          })) || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="index" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area type="monotone" dataKey="duration" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                {performanceData.recommendations && performanceData.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Performance Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {performanceData.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!performanceData && !isMonitoring && (
              <Card>
                <CardContent className="text-center py-12">
                  <Monitor className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Performance Data Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start monitoring to collect performance metrics and generate detailed reports.
                  </p>
                  <Button onClick={startPerformanceMonitoring} className="bg-blue-600 hover:bg-blue-700">
                    <Activity className="h-4 w-4 mr-2" />
                    Start Performance Monitoring
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bottlenecks" className="space-y-6">
            {performanceData && performanceData.bottlenecks && performanceData.bottlenecks.length > 0 ? (
              <>
                {/* Bottleneck Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Performance Bottlenecks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getBottleneckData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="duration" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Detailed Bottleneck Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Detailed Bottleneck Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {performanceData.bottlenecks.map((bottleneck, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-red-900 dark:text-red-100">
                                  {bottleneck.event}
                                </h4>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                  Phase: {bottleneck.phase}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-red-600">
                                {(bottleneck.details?.duration || bottleneck.duration || 0).toFixed(0)}ms
                              </div>
                              <Badge variant="destructive" className="mt-1">
                                High Impact
                              </Badge>
                            </div>
                          </div>
                          
                          {bottleneck.details && (
                            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                              <h5 className="font-medium mb-2">Details:</h5>
                              <pre className="text-xs overflow-auto">
                                {JSON.stringify(bottleneck.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Parallel Operations Analysis */}
                {performanceData.parallelOperations && performanceData.parallelOperations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Parallel Operations Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {performanceData.parallelOperations.map((parallel, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">Time Window: {parallel.timeWindow}</h4>
                              <Badge variant="secondary">{parallel.operationCount} operations</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {parallel.operations.map((op: any, opIndex: number) => (
                                <div key={opIndex} className="bg-white dark:bg-gray-800 p-2 rounded text-sm">
                                  <div className="font-medium">{op.event}</div>
                                  <div className="text-gray-600 dark:text-gray-400">{op.phase} - {op.duration}ms</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertTriangle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Bottleneck Data Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Run performance monitoring to identify bottlenecks and optimization opportunities.
                  </p>
                  <Button onClick={startPerformanceMonitoring} disabled={isMonitoring}>
                    <Activity className="h-4 w-4 mr-2" />
                    Start Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>File Impact Analysis</CardTitle>
                <p className="text-sm text-gray-600">Files that will be modified during optimization</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Group files by directory */}
                  {Object.entries(
                    phases.flatMap(p => p.tasks)
                      .flatMap(task => task.files.map(file => ({ file, task: task.title, priority: task.priority })))
                      .reduce((acc, {file, task, priority}) => {
                        const dir = file.includes('/') ? file.split('/').slice(0, -1).join('/') : 'Root';
                        if (!acc[dir]) acc[dir] = [];
                        acc[dir].push({file, task, priority});
                        return acc;
                      }, {} as Record<string, Array<{file: string, task: string, priority: string}>>)
                  ).map(([directory, files]) => (
                    <div key={directory} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        {directory}/ ({files.length} files)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {files.map(({file, task, priority}, index) => (
                          <div key={index} className="text-sm border rounded p-2">
                            <div className="font-medium">{file.split('/').pop()}</div>
                            <div className="text-xs text-gray-600 truncate">{task}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* JSON Report Section */}
        {performanceData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Complete Performance Report (JSON)
              </CardTitle>
              <div className="flex gap-2">
                <Button onClick={downloadReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-xs">
                  {JSON.stringify(performanceData, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
