"use client";

import { useEffect, useState } from "react";
import StudentProfile from "@/components/profile/student-profile";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setProfileId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!profileId) return;

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🎓 Fetching student data for share profile:", profileId);

        // Fetch all data in parallel (without authentication)
        const [
          profileResponse,
          achievementsResponse,
          goalsResponse,
          circlesResponse,
        ] = await Promise.all([
          fetch(`/api/student/profile/${profileId}`),
          fetch(`/api/student/profile/${profileId}/achievements`),
          fetch(`/api/student/profile/${profileId}/goals`),
          fetch(`/api/student/profile/${profileId}/circles`),
        ]);

        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            setError("Student profile not found");
          } else {
            setError("Failed to load student profile");
          }
          return;
        }

        // Parse all responses
        const [
          profileData,
          achievementsData,
          goalsData,
          circlesData,
        ] = await Promise.all([
          profileResponse.json(),
          achievementsResponse.ok ? achievementsResponse.json() : { achievements: [] },
          goalsResponse.ok ? goalsResponse.json() : { goals: [] },
          circlesResponse.ok ? circlesResponse.json() : { circles: [] },
        ]);

        // Combine all data into comprehensive student object
        const comprehensiveStudentData: StudentData = {
          id: profileData.id,
          firstName: profileData.profile?.firstName || "Student",
          lastName: profileData.profile?.lastName || "",
          profileImageUrl: profileData.profile?.profileImageUrl || "/images/student-profile.png",
          bio: profileData.profile?.bio || "No bio available",
          location: profileData.profile?.location || "Location not specified",
          role: "student",
          socialLinks: profileData.profile?.socialLinks || [],
          // Include the profile object that ProfileHeader expects
          profile: {
            firstName: profileData.profile?.firstName || "Student",
            lastName: profileData.profile?.lastName || "",
            profileImageUrl: profileData.profile?.profileImageUrl || "/images/student-profile.png",
            bio: profileData.profile?.bio || "No bio available",
            tagline: profileData.profile?.tagline || profileData.profile?.bio || "Passionate learner exploring new horizons",
            socialLinks: profileData.profile?.socialLinks || [],
          },
          student: {
            age_group: profileData.ageGroup || "young_adult",
            birthYear: profileData.birthYear,
            birthMonth: profileData.birthMonth,
            gradeLevel: profileData.educationHistory?.[0]?.gradeLevel,
            gpa: profileData.educationHistory?.[0]?.gpa,
            interests: profileData.profile?.userInterests?.map((ui: any) => ui.interest.name) || [],
            skills: profileData.profile?.userSkills?.map((us: any) => us.skill.name) || [],
          },
          educationHistory: profileData.educationHistory || [],
          achievements: achievementsData.achievements || [],
          goals: goalsData.goals || [],
          circles: circlesData.circles || [],
        };

        console.log("✅ Student data loaded for share profile:", {
          name: `${comprehensiveStudentData.firstName} ${comprehensiveStudentData.lastName}`,
          achievements: comprehensiveStudentData.achievements?.length || 0,
          goals: comprehensiveStudentData.goals?.length || 0,
          circles: comprehensiveStudentData.circles?.length || 0,
        });

        setStudentData(comprehensiveStudentData);
      } catch (err) {
        console.error("Error fetching student data for share profile:", err);
        setError("Failed to load student profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <main className="flex-grow flex items-center justify-center pt-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
            <p className="mt-4 text-gray-600">Loading student profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <main className="flex-grow flex items-center justify-center pt-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <main className="flex-grow">
        {studentData && (
          <StudentProfile
            studentData={studentData}
            studentId={profileId!}
            isViewMode={true}
            isShareMode={true}
            onClick={() => {
                const profileUrl = `https://path-piper.replit.app/share-profile/student/profile/${profileId}`;
                navigator.clipboard.writeText(profileUrl).then(() => {
                  alert('Profile link copied to clipboard!');
                }).catch(() => {
                  alert('Failed to copy link');
                });
              }}
          />
        )}
      </main>
    </div>
  );
}