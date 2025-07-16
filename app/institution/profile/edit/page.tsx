
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "../../../protected-layout"
import { getCurrentUserInstitution } from "@/lib/db/institution"
import InstitutionEditForm from "@/components/profile/institution-edit-form"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const metadata: Metadata = {
  title: "Edit Institution Profile | PathPiper",
  description: "Edit your institution profile on PathPiper"
}

export default async function InstitutionProfileEditPage() {
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <InstitutionNavbar />
        <main className="flex-1 pt-16 sm:pt-24">
          <InstitutionEditForm institutionData={institution} />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
