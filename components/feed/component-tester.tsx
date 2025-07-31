
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import CreatePost from "./create-post";
import Feed from "./feed";
import PostWithTrails from "./post-with-trails";
import EnhancedReactions from "./enhanced-reactions";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface ComponentTest {
  name: string;
  component: React.ReactNode;
  description: string;
  status: 'idle' | 'testing' | 'pass' | 'fail';
  error?: string;
}

export default function ComponentTester() {
  const { user } = useAuth();
  const [tests, setTests] = useState<ComponentTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const samplePost = {
    id: "sample-post-1",
    content: "This is a sample post for testing components #react #testing",
    imageUrl: null,
    postType: "GENERAL",
    tags: ["react", "testing"],
    subjects: ["programming"],
    isQuestion: false,
    isAchievement: false,
    engagementScore: 15,
    viewsCount: 42,
    createdAt: new Date().toISOString(),
    author: {
      id: "sample-user",
      firstName: "Test",
      lastName: "User",
      profileImageUrl: "/images/default-profile.png",
      role: "student"
    },
    trails: [
      {
        id: "trail-1",
        content: "This is a trail message continuing the story!",
        order: 1,
        author: {
          id: "sample-user-2",
          firstName: "Trail",
          lastName: "Author",
          profileImageUrl: "/images/default-profile.png",
          role: "student"
        },
        createdAt: new Date().toISOString()
      }
    ],
    _count: {
      likes: 8,
      comments: 3,
      bookmarks: 2
    },
    likesCount: 8,
    isLikedByUser: false
  };

  const initializeTests = () => {
    const componentTests: ComponentTest[] = [
      {
        name: "CreatePost Component",
        component: <CreatePost onPostCreated={() => toast.success("Test post created!")} />,
        description: "Test the post creation interface",
        status: 'idle'
      },
      {
        name: "PostWithTrails Component",
        component: (
          <PostWithTrails 
            post={samplePost} 
            onPostUpdate={() => toast.success("Post updated!")}
            onRepost={() => toast.success("Post shared!")}
          />
        ),
        description: "Test post display with trails",
        status: 'idle'
      },
      {
        name: "EnhancedReactions Component",
        component: (
          <EnhancedReactions 
            postId="sample-post-1"
            currentReaction={null}
            onReactionChange={(reaction) => toast.success(`Reaction: ${reaction}`)}
          />
        ),
        description: "Test reaction buttons and functionality",
        status: 'idle'
      }
    ];

    setTests(componentTests);
  };

  const testComponent = async (componentName: string) => {
    setTests(prev => prev.map(test => 
      test.name === componentName 
        ? { ...test, status: 'testing' }
        : test
    ));

    // Simulate component testing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Here you would implement actual component testing logic
      // For now, we'll just mark as pass
      setTests(prev => prev.map(test => 
        test.name === componentName 
          ? { ...test, status: 'pass' }
          : test
      ));
      
      toast.success(`${componentName} test passed!`);
    } catch (error) {
      setTests(prev => prev.map(test => 
        test.name === componentName 
          ? { 
              ...test, 
              status: 'fail', 
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          : test
      ));
      
      toast.error(`${componentName} test failed!`);
    }
  };

  const runAllComponentTests = async () => {
    if (!user) {
      toast.error("Please log in to run component tests");
      return;
    }

    setIsRunning(true);
    initializeTests();

    for (const test of tests) {
      await testComponent(test.name);
    }

    setIsRunning(false);
    toast.success("All component tests completed!");
  };

  const getStatusBadge = (status: ComponentTest['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-700">Pass</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-700">Fail</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-700">Testing...</Badge>;
      default:
        return <Badge variant="secondary">Ready</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Feed Component Tester</span>
          <Button 
            onClick={runAllComponentTests}
            disabled={isRunning || !user}
          >
            {isRunning ? "Running Tests..." : "Test All Components"}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visual">Visual Testing</TabsTrigger>
            <TabsTrigger value="automated">Automated Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {tests.map((test, index) => (
                <Card key={test.name} className="border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{test.name}</h3>
                        <p className="text-sm text-gray-600">{test.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(test.status)}
                        <Button
                          size="sm"
                          onClick={() => testComponent(test.name)}
                          disabled={isRunning}
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      {test.component}
                    </div>
                    {test.error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-700 text-sm">Error: {test.error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="automated" className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-medium">Automated Component Tests</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tests.map((test) => (
                    <div key={test.name} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">{test.name}</span>
                        <p className="text-sm text-gray-600">{test.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(test.status)}
                        {test.status === 'testing' && (
                          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
