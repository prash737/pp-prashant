import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Profile Settings | PathPiper",
  description: "Edit your profile, privacy settings, and preferences",
}

export default function ProfileSettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-8">
            <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

            <p className="text-gray-500 dark:text-gray-400 mb-8">
              This is where you can edit your profile, privacy settings, and preferences. The actual settings page will
              be implemented in a future update.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="font-medium mb-2">Personal Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Edit your name, tagline, profile picture, and banner
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="font-medium mb-2">Skills & Interests</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update your skills, interests, and educational information
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="font-medium mb-2">Privacy Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Control who can see your profile and contact you
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="font-medium mb-2">Circles Management</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create, edit, and manage your circles</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="font-medium mb-2">Projects & Achievements</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add and edit your projects and achievements</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="font-medium mb-2">Learning Path</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize your learning path and goals</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
