
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Clock, 
  Database, 
  Server, 
  Zap,
  TrendingUp,
  CheckCircle,
  XCircle,
  Activity
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface PerformanceData {
  pageUrl: string;
  totalLoadTime: number;
  timestamp: string;
  userAgent: string;
  summary: {
    totalEvents: number;
    phases: string[];
    longestOperations: any[];
  };
}

const COLORS = ['#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'];

export default function PerformancePage() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data based on your JSON - in real implementation, load from localStorage or API
  const mockData = {
    pageUrl: "https://2374dc7d-99ed-4276-9293-296b01bb20f1-00-1zgzx53ybd3pv.sisko.replit.dev/student/profile/006a3d59-ec4d-42e6-aee4-d04f1d0caf2b",
    totalLoadTime: 5028,
    timestamp: "2025-08-13T13:06:54.675Z",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    summary: {
      totalEvents: 52,
      phases: [
        "INITIALIZATION",
        "PARAMS_RESOLUTION", 
        "MAIN_LOGIC",
        "RENDERING",
        "AUTHENTICATION_CHECKS",
        "DATA_FETCHING",
        "STATE_UPDATES",
        "COMPONENT_LIFECYCLE",
        "DATA_TRANSFORMATION",
        "CONNECTIONS_FETCH",
        "FINALIZATION"
      ],
      longestOperations: []
    }
  };

  useEffect(() => {
    // In real implementation, load from localStorage or fetch from API
    setPerformanceData(mockData);
    setLoading(false);
  }, []);

  // Analysis data based on your performance report
  const bottleneckData = [
    {
      name: "API Response Time",
      duration: 3497,
      percentage: 69.5,
      severity: "critical",
      phase: "DATA_FETCHING"
    },
    {
      name: "JSON Parsing",
      duration: 1416,
      percentage: 28.2,
      severity: "high", 
      phase: "DATA_TRANSFORMATION"
    },
    {
      name: "Rendering",
      duration: 13,
      percentage: 0.3,
      severity: "low",
      phase: "RENDERING"
    },
    {
      name: "Authentication",
      duration: 8,
      percentage: 0.2,
      severity: "low",
      phase: "AUTHENTICATION_CHECKS"
    }
  ];

  const phaseData = [
    { phase: "Initialization", duration: 8, percentage: 0.2 },
    { phase: "API Fetch", duration: 3497, percentage: 69.5 },
    { phase: "JSON Parse", duration: 1416, percentage: 28.2 },
    { phase: "Rendering", duration: 13, percentage: 0.3 },
    { phase: "Other", duration: 94, percentage: 1.8 }
  ];

  const solutions = {
    "API Response Time": {
      problem: "API endpoint taking 3.5 seconds to respond",
      solutions: [
        "Add database indexes on frequently queried fields (user_id, connections)",
        "Implement API response caching with Redis (5-10 minute TTL)",
        "Optimize Prisma queries - reduce nested includes, use select instead",
        "Implement database connection pooling",
        "Add pagination for large datasets (connections, education history)",
        "Use database query analysis to identify N+1 problems"
      ],
      expectedImprovement: "Reduce from 3.5s to 200-500ms (85% improvement)",
      priority: "Critical"
    },
    "JSON Parsing": {
      problem: "Client-side JSON parsing taking 1.4 seconds",
      solutions: [
        "Reduce API payload size by removing unnecessary nested data",
        "Implement data streaming/chunking for large responses",
        "Use Web Workers for JSON parsing to avoid blocking main thread",
        "Compress API responses with gzip/brotli",
        "Implement progressive data loading (load profile first, then details)",
        "Use JSON.parse() alternatives for large objects"
      ],
      expectedImprovement: "Reduce from 1.4s to 50-100ms (93% improvement)",
      priority: "High"
    }
  };

  const improvementProjections = [
    { metric: "Current Load Time", value: 5028, color: "#ef4444" },
    { metric: "After API Optimization", value: 1531, color: "#f59e0b" },
    { metric: "After JSON Optimization", value: 431, color: "#10b981" },
    { metric: "Target Load Time", value: 300, color: "#3b82f6" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Performance Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Student Profile Page Analysis - {new Date(performanceData?.timestamp || '').toLocaleString()}
            </p>
          </div>
          <Badge variant={performanceData && performanceData.totalLoadTime > 3000 ? "destructive" : "secondary"}>
            {performanceData?.totalLoadTime}ms Total Load Time
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Load Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{performanceData?.totalLoadTime}ms</div>
              <p className="text-xs text-muted-foreground">Target: &lt;1000ms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Response</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">3,497ms</div>
              <p className="text-xs text-muted-foreground">69.5% of total time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">JSON Parsing</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">1,416ms</div>
              <p className="text-xs text-muted-foreground">28.2% of total time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">15/100</div>
              <p className="text-xs text-muted-foreground">Needs immediate attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bottlenecks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bottlenecks">Bottlenecks Analysis</TabsTrigger>
            <TabsTrigger value="solutions">Solutions & Roadmap</TabsTrigger>
            <TabsTrigger value="projections">Performance Projections</TabsTrigger>
            <TabsTrigger value="charts">Visual Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="bottlenecks" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bottlenecks List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Critical Bottlenecks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bottleneckData.map((bottleneck, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            bottleneck.severity === 'critical' ? 'destructive' :
                            bottleneck.severity === 'high' ? 'secondary' : 'outline'
                          }>
                            {bottleneck.severity}
                          </Badge>
                          <h4 className="font-medium">{bottleneck.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {bottleneck.duration}ms ({bottleneck.percentage}% of total)
                        </p>
                        <Progress value={bottleneck.percentage} className="mt-2 h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Phase Breakdown Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Load Time Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={phaseData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="duration"
                          nameKey="phase"
                        >
                          {phaseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="solutions" className="space-y-6">
            {Object.entries(solutions).map(([problem, solution]) => (
              <Card key={problem}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    {problem} Solutions
                  </CardTitle>
                  <Badge variant={solution.priority === 'Critical' ? 'destructive' : 'secondary'}>
                    {solution.priority} Priority
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Problem</h4>
                    <p className="text-red-700 dark:text-red-300">{solution.problem}</p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Recommended Solutions</h4>
                    <ul className="space-y-2">
                      {solution.solutions.map((sol, index) => (
                        <li key={index} className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {sol}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Expected Improvement</h4>
                    <p className="text-green-700 dark:text-green-300">{solution.expectedImprovement}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="projections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Performance Improvement Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={improvementProjections} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="#8884d8">
                        {improvementProjections.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Implementation Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Week 1-2: Database optimization & indexing</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Week 3-4: API caching implementation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Week 5-6: Client-side optimizations</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Week 7-8: Final testing & monitoring</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Success Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Page Load Time</span>
                        <span className="text-sm font-medium">&lt;1000ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">API Response Time</span>
                        <span className="text-sm font-medium">&lt;500ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">JSON Parse Time</span>
                        <span className="text-sm font-medium">&lt;100ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Performance Score</span>
                        <span className="text-sm font-medium">&gt;90/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Load Time Phases</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={phaseData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="phase" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="duration" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Improvement Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={improvementProjections}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle>Immediate Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <h4 className="font-medium">Critical (Do Now)</h4>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Add database indexes</li>
                      <li>• Optimize Prisma queries</li>
                      <li>• Implement connection pooling</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <h4 className="font-medium">High (This Week)</h4>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Implement Redis caching</li>
                      <li>• Reduce API payload size</li>
                      <li>• Add response compression</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium">Medium (Next Sprint)</h4>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Progressive data loading</li>
                      <li>• Web Workers for JSON</li>
                      <li>• Performance monitoring</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
