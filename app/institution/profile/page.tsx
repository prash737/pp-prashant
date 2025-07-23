import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import InstitutionProfile from "@/components/profile/institution-profile"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "../../protected-layout"
import { getCurrentUserInstitution } from "@/lib/db/institution"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata(): Promise<Metadata> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return {
        title: "Institution Profile | PathPiper",
        description: "Institution profile on PathPiper"
      }
    }

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return {
        title: "Institution Profile | PathPiper", 
        description: "Institution profile on PathPiper"
      }
    }

    const institution = await getCurrentUserInstitution(user.id)

    return {
      title: `${institution?.name || 'Institution'} | PathPiper`,
      description: `${institution?.name || 'Institution'} profile on PathPiper - Connecting students with educational opportunities`,
    }
  } catch (error) {
    return {
      title: "Institution Profile | PathPiper",
      description: "Institution profile on PathPiper"
    }
  }
}

export default async function InstitutionProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value

  if (!token) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser(token)

  if (!user) {
    redirect('/login')
  }

  const institution = await getCurrentUserInstitution(user.id)

  if (!institution) {
    redirect('/institution-onboarding')
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-white">
        <InstitutionNavbar />
        <main className="pt-16 sm:pt-24">
          <InstitutionProfile institutionData={institution} institutionId={institution.id} />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}