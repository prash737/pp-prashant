import { Button } from "@/components/ui/button";
import Image from "next/image";
import Feed from "@/components/feed/feed";
import FeedSidebar from "@/components/feed/feed-sidebar";
import InternalNavbar from "@/components/internal-navbar";
import Footer from "@/components/footer";
import { Suspense } from "react";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <InternalNavbar />
      <div className="pt-16 pb-16 sm:pt-24 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
              <FeedSidebar />
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Feed
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Stay updated with the latest posts from your network
                  </p>
                </div>
              </div>
              <Feed />
            </div>

            {/* Right Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      📚 Study Groups
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      🎯 Goals
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      🏆 Achievements
                    </Button>
                  </div>
                </div>

                {/* Trending Topics */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold mb-3">Trending</h3>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">#STEM</div>
                    <div className="text-sm text-gray-600">
                      #CreativeWriting
                    </div>
                    <div className="text-sm text-gray-600">#Coding</div>
                    <div className="text-sm text-gray-600">#ArtProject</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
