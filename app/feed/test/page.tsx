
import { Metadata } from "next";
import ComprehensiveFeedTest from "@/components/feed/comprehensive-feed-test";

export const metadata: Metadata = {
  title: "Feed Testing Suite | PathPiper",
  description: "Comprehensive testing for PathPiper feed functionality",
};

export default function FeedTestPage() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Feed System Testing
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive testing suite for all feed components and functionality
        </p>
      </div>
      
      <ComprehensiveFeedTest />
    </div>
  );
}
