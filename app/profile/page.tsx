
import ProtectedLayout from "../protected-layout"

export default function ProfilePage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p>Profile content goes here</p>
        </div>
      </div>
    </ProtectedLayout>
  )
}
