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
      const startTime = Date.now();
      console.log('⏱️ [SHARE-STUDENT-PROFILE] Fetching profile data...');

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/student/profile-data?studentId=${profileId}`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'max-age=300', // 5 minute cache
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Profile not found');
          } else if (response.status === 403) {
            setError('Access denied');
          } else {
            setError('Failed to load profile');
          }
          return;
        }

        const data = await response.json();
        setStudentData(data);

        console.log(`✅ [SHARE-STUDENT-PROFILE] Profile loaded in ${Date.now() - startTime}ms`);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load profile');
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
                const profileUrl = `https://pathpiper.com/share-profile/student/profile/${profileId}`;
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