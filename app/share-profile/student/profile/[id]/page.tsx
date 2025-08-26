"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCachedPublicProfileData, fetchAndCachePublicProfileData } from "@/hooks/use-auth";
import StudentProfile from "@/components/profile/student-profile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
  role: string;
  socialLinks?: Array<{
    id: string;
    platform: string;
    url: string;
  }>;
  profile?: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    bio?: string;
    tagline?: string;
    socialLinks?: Array<{
      id: string;
      platform: string;
      url: string;
    }>;
    userInterests?: Array<{ interest: { name: string } }>;
    userSkills?: Array<{ skill: { name: string } }>;
  };
  student?: {
    age_group?: string;
    birthYear?: string;
    birthMonth?: string;
    gradeLevel?: string;
    gpa?: string;
    interests?: string[];
    skills?: string[];
  };
  educationHistory?: any[];
  achievements?: any[];
  goals?: any[];
  circles?: any[];
}

export default function ShareStudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const router = useRouter();

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setProfileId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  // Get cached data immediately
  useEffect(() => {
    if (!profileId) return;

    const cachedData = getCachedPublicProfileData(profileId);
    if (cachedData) {
      console.log('🚀 Immediate render with cached share profile data for user:', profileId);
      setStudentData(cachedData);
    }
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;

    const cachedData = getCachedPublicProfileData(profileId);

    console.log('🔥 Starting priority fetch for share profile...');

    // Always fetch fresh data in background
    const fetchFreshData = async () => {
      try {
        setLoading(!cachedData); // Only show loading if we don't have cached data

        const freshData = await fetchAndCachePublicProfileData(profileId);

        if (freshData) {
          console.log('✅ Fresh share profile data fetched and cached');
          setStudentData(freshData);
        } else {
          throw new Error('Failed to fetch fresh share profile data');
        }

      } catch (err) {
        console.error('❌ Error fetching fresh share profile data:', err);
        // Only set error if we don't have cached data to fall back on
        if (!cachedData) {
          if (err instanceof Response) {
            if (err.status === 404) {
              setError('Profile not found');
            } else if (err.status === 403) {
              setError('Access denied');
            } else {
              setError('Failed to load profile');
            }
          } else {
            setError('Failed to load profile');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFreshData();
  }, [profileId]);

  const handleGoBack = () => {
    router.back();
  };

  // Create static structure for immediate display
  const staticStudentStructure = {
    id: profileId || "",
    profile: {
      firstName: "Loading...",
      lastName: "",
      profileImageUrl: "/images/student-profile.png",
      bio: "Loading profile information...",
      tagline: "Loading...",
      userInterests: [],
      userSkills: [],
      skills: [],
      socialLinks: []
    },
    educationHistory: [{
      id: "temp",
      institutionName: "Loading...",
      gradeLevel: "Student",
      isCurrent: true,
      is_current: true
    }],
    connections: [],
    achievements: [],
    connectionCounts: {
      total: 0,
      students: 0,
      mentors: 0,
      institutions: 0
    },
    circles: [],
    connectionRequestsSent: [],
    connectionRequestsReceived: [],
    circleInvitations: []
  };

  // Use cached data, fetched data, or static structure for immediate rendering
  const displayData = studentData || staticStudentStructure;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <main className="flex-grow">
        <div className="container mx-auto px-4 max-w-7xl pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <StudentProfile
          studentId={profileId!}
          studentData={displayData}
          isShareMode={true}
          showStaticStructure={!studentData} // Show static structure if no real data yet
          onGoBack={handleGoBack}
        />
      </main>
    </div>
  );
}