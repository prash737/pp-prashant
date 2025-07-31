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
              <Feed />
            </div>

            {/* Right Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold mb-3 opacity-60">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start cursor-default opacity-50"
                      disabled
                    >
                      📚 Study Groups
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start cursor-default opacity-50"
                      disabled
                    >
                      🎯 Goals
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start cursor-default opacity-50"
                      disabled
                    >
                      🏆 Achievements
                    </Button>
                  </div>
                </div>

                {/* Trending Topics */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold mb-3 opacity-60">Trending</h3>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-400 cursor-default">#STEM</div>
                    <div className="text-sm text-gray-400 cursor-default">
                      #CreativeWriting
                    </div>
                    <div className="text-sm text-gray-400 cursor-default">#Coding</div>
                    <div className="text-sm text-gray-400 cursor-default">#ArtProject</div>
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
