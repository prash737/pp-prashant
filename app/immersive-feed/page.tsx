
import ProtectedLayout from "../protected-layout"
import DesktopImmersiveFeed from "@/components/feed/desktop-immersive-feed"

export default function ImmersiveFeedPage() {
  return (
    <ProtectedLayout>
      <div className="flex-grow">
        <DesktopImmersiveFeed />
      </div>
    </ProtectedLayout>
  )
}
