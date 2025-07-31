"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Send,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Trophy,
  Code,
  HelpCircle,
  Plus,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message?: string;
  duration?: number;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed';
}

export default function ComprehensiveFeedTest() {
  const { user } = useAuth();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSuite, setCurrentSuite] = useState<string>('');
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [createdTestData, setCreatedTestData] = useState<{
    postId?: string;
    trailId?: string;
  }>({});

  const updateTest = (suiteName: string, testName: string, status: TestResult['status'], message?: string, duration?: number, details?: any) => {
    setTestSuites(prev => prev.map(suite => 
      suite.name === suiteName 
        ? {
            ...suite,
            tests: suite.tests.map(test => 
              test.name === testName 
                ? { ...test, status, message, duration, details }
                : test
            )
          }
        : suite
    ));
  };

  const updateSuiteStatus = (suiteName: string, status: TestSuite['status']) => {
    setTestSuites(prev => prev.map(suite => 
      suite.name === suiteName 
        ? { ...suite, status }
        : suite
    ));
  };

  const initializeTestSuites = () => {
    const suites: TestSuite[] = [
      {
        name: "Core Feed API",
        status: 'pending',
        tests: [
          { name: "Fetch Feed Posts", status: 'pending' },
          { name: "Create Post", status: 'pending' },
          { name: "Create Post with Image", status: 'pending' },
          { name: "Create Achievement Post", status: 'pending' },
          { name: "Create Project Post", status: 'pending' },
          { name: "Create Question Post", status: 'pending' },
          { name: "Test Content Moderation", status: 'pending' },
          { name: "Test Character Limit", status: 'pending' }
        ]
      },
      {
        name: "Post Interactions",
        status: 'pending',
        tests: [
          { name: "Like Post", status: 'pending' },
          { name: "Unlike Post", status: 'pending' },
          { name: "Enhanced Reactions", status: 'pending' },
          { name: "Bookmark Post", status: 'pending' },
          { name: "Share/Repost", status: 'pending' },
          { name: "Comment on Post", status: 'pending' }
        ]
      },
      {
        name: "Trail System",
        status: 'pending',
        tests: [
          { name: "Create Trail", status: 'pending' },
          { name: "Create Multiple Trails", status: 'pending' },
          { name: "Trail Ordering", status: 'pending' },
          { name: "Like Trail", status: 'pending' },
          { name: "Delete Trail", status: 'pending' }
        ]
      },
      {
        name: "Feed Filtering",
        status: 'pending',
        tests: [
          { name: "Filter by Post Type", status: 'pending' },
          { name: "Filter by Subject", status: 'pending' },
          { name: "Filter by Difficulty", status: 'pending' },
          { name: "Trending Filter", status: 'pending' },
          { name: "Achievement Filter", status: 'pending' }
        ]
      },
      {
        name: "Data Integrity",
        status: 'pending',
        tests: [
          { name: "User Posts Debug", status: 'pending' },
          { name: "Feed Debug Analysis", status: 'pending' },
          { name: "Orphaned Trails Check", status: 'pending' },
          { name: "Missing Authors Check", status: 'pending' },
          { name: "Moderation Status Check", status: 'pending' }
        ]
      },
      {
        name: "Cleanup",
        status: 'pending',
        tests: [
          { name: "Delete Test Post", status: 'pending' },
          { name: "Verify Cleanup", status: 'pending' }
        ]
      }
    ];

    setTestSuites(suites);
  };

  const runCoreAPITests = async () => {
    const suiteName = "Core Feed API";
    updateSuiteStatus(suiteName, 'running');
    setCurrentSuite(suiteName);

    // Test 1: Fetch Feed Posts
    setCurrentTest("Fetch Feed Posts");
    try {
      const start = Date.now();
      const response = await fetch('/api/feed/posts', {
        credentials: 'include'
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        updateTest(suiteName, "Fetch Feed Posts", 'success', 
          `Fetched ${data.posts?.length || 0} posts`, duration, data);
      } else {
        const error = await response.text();
        updateTest(suiteName, "Fetch Feed Posts", 'error', 
          `HTTP ${response.status}: ${error}`);
      }
    } catch (error) {
      updateTest(suiteName, "Fetch Feed Posts", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: Create Basic Post
    setCurrentTest("Create Post");
    try {
      const start = Date.now();
      const testContent = `Test post created at ${new Date().toISOString()}`;
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: testContent,
          postType: 'GENERAL'
        })
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        setCreatedTestData(prev => ({ ...prev, postId: data.post?.id }));
        updateTest(suiteName, "Create Post", 'success', 
          `Post created: ${data.post?.id}`, duration, data);
      } else {
        const error = await response.json();
        updateTest(suiteName, "Create Post", 'error', 
          `HTTP ${response.status}: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      updateTest(suiteName, "Create Post", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3: Create Achievement Post
    setCurrentTest("Create Achievement Post");
    try {
      const start = Date.now();
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: "Just completed my first coding project! 🎉",
          postType: 'ACHIEVEMENT',
          achievementType: 'Project Completion',
          tags: ['coding', 'achievement'],
          isAchievement: true
        })
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        updateTest(suiteName, "Create Achievement Post", 'success', 
          `Achievement post created`, duration, data);
      } else {
        const error = await response.json();
        updateTest(suiteName, "Create Achievement Post", 'error', 
          `HTTP ${response.status}: ${error.error}`);
      }
    } catch (error) {
      updateTest(suiteName, "Create Achievement Post", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: Create Project Post
    setCurrentTest("Create Project Post");
    try {
      const start = Date.now();
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: "Working on a new web app using React and TypeScript!",
          postType: 'PROJECT',
          projectCategory: 'Web Development',
          difficultyLevel: 'intermediate',
          subjects: ['programming', 'web-development']
        })
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        updateTest(suiteName, "Create Project Post", 'success', 
          `Project post created`, duration, data);
      } else {
        const error = await response.json();
        updateTest(suiteName, "Create Project Post", 'error', 
          `HTTP ${response.status}: ${error.error}`);
      }
    } catch (error) {
      updateTest(suiteName, "Create Project Post", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 5: Create Question Post
    setCurrentTest("Create Question Post");
    try {
      const start = Date.now();
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: "How do I optimize React performance for large datasets?",
          postType: 'QUESTION',
          isQuestion: true,
          difficultyLevel: 'advanced',
          subjects: ['react', 'performance']
        })
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        updateTest(suiteName, "Create Question Post", 'success', 
          `Question post created`, duration, data);
      } else {
        const error = await response.json();
        updateTest(suiteName, "Create Question Post", 'error', 
          `HTTP ${response.status}: ${error.error}`);
      }
    } catch (error) {
      updateTest(suiteName, "Create Question Post", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6: Test Content Moderation
    setCurrentTest("Test Content Moderation");
    try {
      const start = Date.now();
      const response = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: "This is a test message for moderation checking.",
          type: 'post',
          userId: user?.id
        })
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        updateTest(suiteName, "Test Content Moderation", 'success', 
          `Moderation status: ${data.moderation?.status}`, duration, data);
      } else {
        updateTest(suiteName, "Test Content Moderation", 'warning', 
          `Moderation service unavailable (${response.status})`);
      }
    } catch (error) {
      updateTest(suiteName, "Test Content Moderation", 'warning', 
        'Moderation service not available');
    }

    // Test 7: Test Character Limit
    setCurrentTest("Test Character Limit");
    try {
      const longContent = "A".repeat(300); // Exceeds 287 character limit
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: longContent,
          postType: 'GENERAL'
        })
      });

      if (response.status === 400) {
        const error = await response.json();
        if (error.error?.includes('287 characters')) {
          updateTest(suiteName, "Test Character Limit", 'success', 
            'Character limit enforced correctly');
        } else {
          updateTest(suiteName, "Test Character Limit", 'warning', 
            'Character limit error message unclear');
        }
      } else {
        updateTest(suiteName, "Test Character Limit", 'error', 
          'Character limit not enforced');
      }
    } catch (error) {
      updateTest(suiteName, "Test Character Limit", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    updateSuiteStatus(suiteName, 'completed');
  };

  const runInteractionTests = async () => {
    if (!createdTestData.postId) {
      updateTest("Post Interactions", "Like Post", 'error', 'No test post available');
      return;
    }

    const suiteName = "Post Interactions";
    updateSuiteStatus(suiteName, 'running');
    setCurrentSuite(suiteName);

    // Test 1: Like Post
    setCurrentTest("Like Post");
    try {
      const start = Date.now();
      const response = await fetch(`/api/feed/posts/${createdTestData.postId}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        updateTest(suiteName, "Like Post", 'success', 
          `Like status: ${data.liked}`, duration, data);
      } else {
        const error = await response.json();
        updateTest(suiteName, "Like Post", 'error', 
          `HTTP ${response.status}: ${error.error}`);
      }
    } catch (error) {
      updateTest(suiteName, "Like Post", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: Unlike Post
    setCurrentTest("Unlike Post");
    try {
      const start = Date.now();
      const response = await fetch(`/api/feed/posts/${createdTestData.postId}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        updateTest(suiteName, "Unlike Post", 'success', 
          `Like status: ${data.liked}`, duration, data);
      } else {
        const error = await response.json();
        updateTest(suiteName, "Unlike Post", 'error', 
          `HTTP ${response.status}: ${error.error}`);
      }
    } catch (error) {
      updateTest(suiteName, "Unlike Post", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3: Enhanced Reactions
    setCurrentTest("Enhanced Reactions");
    try {
      const start = Date.now();
      const response = await fetch(`/api/feed/posts/${createdTestData.postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reactionType: 'love' })
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        updateTest(suiteName, "Enhanced Reactions", 'success', 
          `Reaction: ${data.reactionType}`, duration, data);
      } else {
        const error = await response.json();
        if (error.error?.includes('not available')) {
          updateTest(suiteName, "Enhanced Reactions", 'warning', 
            'Enhanced reactions table not available - using fallback');
        } else {
          updateTest(suiteName, "Enhanced Reactions", 'error', 
            `HTTP ${response.status}: ${error.error}`);
        }
      }
    } catch (error) {
      updateTest(suiteName, "Enhanced Reactions", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: Bookmark Post
    setCurrentTest("Bookmark Post");
    try {
      const start = Date.now();
      const response = await fetch(`/api/feed/posts/${createdTestData.postId}/bookmark`, {
        method: 'POST',
        credentials: 'include'
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        updateTest(suiteName, "Bookmark Post", 'success', 
          'Post bookmarked successfully', duration, data);
      } else {
        const error = await response.json();
        updateTest(suiteName, "Bookmark Post", 'error', 
          `HTTP ${response.status}: ${error.error}`);
      }
    } catch (error) {
      updateTest(suiteName, "Bookmark Post", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    updateSuiteStatus(suiteName, 'completed');
  };

  const runTrailTests = async () => {
    if (!createdTestData.postId) {
      updateTest("Trail System", "Create Trail", 'error', 'No test post available');
      return;
    }

    const suiteName = "Trail System";
    updateSuiteStatus(suiteName, 'running');
    setCurrentSuite(suiteName);

    // Test 1: Create Trail
    setCurrentTest("Create Trail");
    try {
      const start = Date.now();
      const response = await fetch(`/api/feed/posts/${createdTestData.postId}/trails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: "This is a trail message to continue the story!"
        })
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        setCreatedTestData(prev => ({ ...prev, trailId: data.trail?.id }));
        updateTest(suiteName, "Create Trail", 'success', 
          `Trail created: ${data.trail?.id}`, duration, data);
      } else {
        const error = await response.json();
        updateTest(suiteName, "Create Trail", 'error', 
          `HTTP ${response.status}: ${error.error}`);
      }
    } catch (error) {
      updateTest(suiteName, "Create Trail", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: Create Multiple Trails
    setCurrentTest("Create Multiple Trails");
    try {
      const trail2Response = await fetch(`/api/feed/posts/${createdTestData.postId}/trails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: "This is the second trail message!"
        })
      });

      const trail3Response = await fetch(`/api/feed/posts/${createdTestData.postId}/trails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: "This is the third trail message!"
        })
      });

      if (trail2Response.ok && trail3Response.ok) {
        updateTest(suiteName, "Create Multiple Trails", 'success', 
          'Multiple trails created successfully');
      } else {
        updateTest(suiteName, "Create Multiple Trails", 'error', 
          'Failed to create multiple trails');
      }
    } catch (error) {
      updateTest(suiteName, "Create Multiple Trails", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3: Verify Trail Ordering
    setCurrentTest("Trail Ordering");
    try {
      const response = await fetch(`/api/feed/posts/${createdTestData.postId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const trails = data.trails || [];
        const isOrdered = trails.every((trail: any, index: number) => 
          trail.trailOrder === index + 1
        );

        if (isOrdered) {
          updateTest(suiteName, "Trail Ordering", 'success', 
            `${trails.length} trails in correct order`);
        } else {
          updateTest(suiteName, "Trail Ordering", 'error', 
            'Trail ordering incorrect');
        }
      } else {
        updateTest(suiteName, "Trail Ordering", 'error', 
          'Failed to fetch post with trails');
      }
    } catch (error) {
      updateTest(suiteName, "Trail Ordering", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    updateSuiteStatus(suiteName, 'completed');
  };

  const runFilterTests = async () => {
    const suiteName = "Feed Filtering";
    updateSuiteStatus(suiteName, 'running');
    setCurrentSuite(suiteName);

    const filters = [
      { name: "Filter by Post Type", param: "type=ACHIEVEMENT" },
      { name: "Filter by Subject", param: "subject=programming" },
      { name: "Filter by Difficulty", param: "difficulty=intermediate" },
      { name: "Trending Filter", param: "filter=trending" },
      { name: "Achievement Filter", param: "filter=achievements" }
    ];

    for (const filter of filters) {
      setCurrentTest(filter.name);
      try {
        const start = Date.now();
        const response = await fetch(`/api/feed/posts?${filter.param}`, {
          credentials: 'include'
        });
        const duration = Date.now() - start;

        if (response.ok) {
          const data = await response.json();
          updateTest(suiteName, filter.name, 'success', 
            `Filtered ${data.posts?.length || 0} posts`, duration, data);
        } else {
          updateTest(suiteName, filter.name, 'error', 
            `HTTP ${response.status}`);
        }
      } catch (error) {
        updateTest(suiteName, filter.name, 'error', 
          error instanceof Error ? error.message : 'Unknown error');
      }
    }

    updateSuiteStatus(suiteName, 'completed');
  };

  const runDataIntegrityTests = async () => {
    const suiteName = "Data Integrity";
    updateSuiteStatus(suiteName, 'running');
    setCurrentSuite(suiteName);

    // Test 1: User Posts Debug
    setCurrentTest("User Posts Debug");
    try {
      const response = await fetch('/api/feed/user-posts', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        updateTest(suiteName, "User Posts Debug", 'success', 
          `Found ${data.posts?.length || 0} user posts`, undefined, data);
      } else {
        updateTest(suiteName, "User Posts Debug", 'error', 
          `HTTP ${response.status}`);
      }
    } catch (error) {
      updateTest(suiteName, "User Posts Debug", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: Feed Debug Analysis
    setCurrentTest("Feed Debug Analysis");
    try {
      const response = await fetch('/api/feed/debug', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        updateTest(suiteName, "Feed Debug Analysis", 'success', 
          `DB has ${data.summary?.totalPostsInDB} posts, API returns ${data.summary?.postsReturnedByAPI}`, 
          undefined, data);
      } else {
        updateTest(suiteName, "Feed Debug Analysis", 'error', 
          `HTTP ${response.status}`);
      }
    } catch (error) {
      updateTest(suiteName, "Feed Debug Analysis", 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    updateSuiteStatus(suiteName, 'completed');
  };

  const runCleanupTests = async () => {
    const suiteName = "Cleanup";
    updateSuiteStatus(suiteName, 'running');
    setCurrentSuite(suiteName);

    if (createdTestData.postId) {
      setCurrentTest("Delete Test Post");
      try {
        const response = await fetch(`/api/feed/posts/${createdTestData.postId}/delete`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          updateTest(suiteName, "Delete Test Post", 'success', 
            'Test post deleted successfully');
        } else {
          updateTest(suiteName, "Delete Test Post", 'warning', 
            'Could not delete test post');
        }
      } catch (error) {
        updateTest(suiteName, "Delete Test Post", 'warning', 
          'Cleanup failed but tests completed');
      }
    } else {
      updateTest(suiteName, "Delete Test Post", 'warning', 
        'No test post to delete');
    }

    // Test error collection
    setCurrentTest('System Error Collection');
    try {
      const response = await fetch('/api/feed/errors');
      const result = await response.json();

      updateTest(suiteName, 'System Error Collection', {
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 
          `Found ${result.totalErrorTypes} error types` : 
          'Error collection failed',
        details: result
      });
    } catch (error) {
      updateTest(suiteName, 'System Error Collection', {
        status: 'error',
        message: `Error collection failed: ${error}`,
        details: null
      });
    }

    // Test health check
    setCurrentTest('System Health Check');
    try {
      const response = await fetch('/api/feed/health-check');
      const result = await response.json();

      updateTest(suiteName, 'System Health Check', {
        status: result.status === 'healthy' ? 'success' : 'warning',
        message: `System status: ${result.status}`,
        details: result
      });
    } catch (error) {
      updateTest(suiteName, 'System Health Check', {
        status: 'error',
        message: `Health check failed: ${error}`,
        details: null
      });
    }

    updateSuiteStatus(suiteName, 'completed');
  };

  const runAllTests = async () => {
    if (!user) {
      toast.error("Please log in to run feed tests");
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setCreatedTestData({});

    try {
      // Initialize test suites
      initializeTestSuites();

      // Run test suites sequentially
      await runCoreAPITests();
      setProgress(20);

      await runInteractionTests();
      setProgress(40);

      await runTrailTests();
      setProgress(60);

      await runFilterTests();
      setProgress(80);

      await runDataIntegrityTests();
      setProgress(90);

      await runCleanupTests();
      setProgress(100);

      toast.success("All feed tests completed!");
    } catch (error) {
      console.error("Test execution error:", error);
      toast.error("Test execution failed");
    } finally {
      setIsRunning(false);
      setCurrentSuite('');
      setCurrentTest('');
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  const getTotalCounts = () => {
    const allTests = testSuites.flatMap(suite => suite.tests);
    return {
      total: allTests.length,
      success: allTests.filter(t => t.status === 'success').length,
      error: allTests.filter(t => t.status === 'error').length,
      warning: allTests.filter(t => t.status === 'warning').length,
      pending: allTests.filter(t => t.status === 'pending').length
    };
  };

  const counts = getTotalCounts();

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Comprehensive Feed Testing Suite</span>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning || !user}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Run All Tests
              </>
            )}
          </Button>
        </CardTitle>

        {!user && (
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-700">Please log in to run feed tests</p>
          </div>
        )}

        {testSuites.length > 0 && (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                ✓ {counts.success} Passed
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                ✗ {counts.error} Failed
              </Badge>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                ⚠ {counts.warning} Warning
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                ⏳ {counts.pending} Pending
              </Badge>
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress: {progress}%</span>
                  <span>{currentSuite} - {currentTest}</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="debug">Debug Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {testSuites.map((suite) => (
              <Card key={suite.name} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{suite.name}</h3>
                    <Badge 
                      variant={suite.status === 'completed' ? 'default' : 'secondary'}
                      className={
                        suite.status === 'completed' ? 'bg-green-100 text-green-700' :
                        suite.status === 'running' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }
                    >
                      {suite.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {suite.tests.map((test) => (
                      <div key={test.name} className="flex items-center gap-2 p-2 rounded border">
                        {getStatusIcon(test.status)}
                        <span className="text-sm flex-1">{test.name}</span>
                        {test.duration && (
                          <span className="text-xs text-gray-500">{test.duration}ms</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            {testSuites.map((suite) => (
              <Card key={suite.name} className="border">
                <CardHeader>
                  <h3 className="font-medium">{suite.name}</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suite.tests.map((test) => (
                      <div key={test.name} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(test.status)}
                            <span className="font-medium">{test.name}</span>
                          </div>
                          {test.duration && (
                            <span className="text-sm text-gray-500">{test.duration}ms</span>
                          )}
                        </div>
                        {test.message && (
                          <p className={`text-sm ${getStatusColor(test.status)}`}>
                            {test.message}
                          </p>
                        )}
                        {test.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-gray-600">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                              {JSON.stringify(test.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="debug" className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-medium">Test Environment</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>User ID:</strong> {user?.id || 'Not logged in'}
                  </div>
                  <div>
                    <strong>User Role:</strong> {user?.user_metadata?.role || 'Unknown'}
                  </div>
                  <div>
                    <strong>Test Post ID:</strong> {createdTestData.postId || 'None'}
                  </div>
                  <div>
                    <strong>Test Trail ID:</strong> {createdTestData.trailId || 'None'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}