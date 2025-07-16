import { InternalNavbar } from "@/components/internal-navbar"
import { ExplorePage } from "@/components/explore/explore-page"

export default function Explore() {
  return (
    <main className="min-h-screen bg-gray-50">
      <InternalNavbar />
      <div className="pt-16 pb-20 md:pb-10">
        <ExplorePage />
      </div>
    </main>
  )
}
