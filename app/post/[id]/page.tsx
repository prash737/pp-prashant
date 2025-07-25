"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import InternalNavbar from "@/components/internal-navbar";
import Footer from "@/components/footer";
import PostWithTrails from "@/components/feed/post-with-trails";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/feed/posts/${params.id}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Post not found");
        }

        const data = await response.json();
        setPost(data.post);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  const handlePostUpdate = () => {
    // Refresh the post data
    window.location.reload();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading post...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Post Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The post you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/feed")} className="w-full">
                Go to Feed
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <InternalNavbar />
      <main className="flex-grow pt-16 sm:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="space-y-6">
            <PostWithTrails post={post} onPostUpdate={handlePostUpdate} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
