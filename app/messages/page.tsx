
import { Metadata } from "next";
import ProtectedLayout from "../protected-layout";
import InternalNavbar from "@/components/internal-navbar";
import Footer from "@/components/footer";
import MessagesInterface from "@/components/messages/messages-interface";

export const metadata: Metadata = {
  title: "Messages | PathPiper",
  description: "Connect and communicate with your network on PathPiper",
};

export default function MessagesPage() {
  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
            <MessagesInterface />
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  );
}
