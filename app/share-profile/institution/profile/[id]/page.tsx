"use client";

import { useEffect, useState } from "react";
import InstitutionProfile from "@/components/profile/institution-profile";

interface InstitutionData {
  id: string;
  name: string;
  type: string;
  category?: string;
  location: string;
  bio: string;
  logo: string;
  coverImage: string;
  website: string;
  verified: boolean;
  founded?: number | null;
  tagline: string;
  overview?: string;
  mission?: string;
  coreValues?: string[];
  gallery?: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
  programs?: any[];
  faculty?: any[];
  facilities?: any[];
  events?: any[];
  followers?: number;
}

export default function ShareInstitutionProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [institutionData, setInstitutionData] =
    useState<InstitutionData | null>(null);
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

    const fetchInstitutionData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(
          "🏛️ Fetching institution data for share profile:",
          profileId,
        );

        // Fetch all data in parallel (without authentication)
        const [
          profileResponse,
          programsResponse,
          facultyResponse,
          facilitiesResponse,
          eventsResponse,
          galleryResponse,
          followersResponse,
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/institution/public-profile/${profileId}`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/institution/public-programs?institutionId=${profileId}`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/institution/public-faculty?institutionId=${profileId}`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/institution/public-facilities?institutionId=${profileId}`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/institution/public-events?institutionId=${profileId}`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/institution/public-gallery?institutionId=${profileId}`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/institutions/public-followers?institutionId=${profileId}`),
        ]);

        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            setError("Institution profile not found");
          } else {
            setError("Failed to load institution profile");
          }
          return;
        }

        // Parse all responses
        const [
          profileData,
          programsData,
          facultyData,
          facilitiesData,
          eventsData,
          galleryData,
          followersData,
        ] = await Promise.all([
          profileResponse.json(),
          programsResponse.ok ? programsResponse.json() : { programs: [] },
          facultyResponse.ok ? facultyResponse.json() : { faculty: [] },
          facilitiesResponse.ok
            ? facilitiesResponse.json()
            : { facilities: [] },
          eventsResponse.ok ? eventsResponse.json() : { events: [] },
          galleryResponse.ok ? galleryResponse.json() : { gallery: [] },
          followersResponse.ok ? followersResponse.json() : { followers: [] },
        ]);

        // Combine all data into comprehensive institution object
        const comprehensiveInstitutionData: InstitutionData = {
          id: profileData.id,
          name: profileData.name,
          type: profileData.type,
          category: profileData.category,
          location: profileData.location,
          bio: profileData.bio || "",
          logo: profileData.logo || "/images/pathpiper-logo.png",
          coverImage: profileData.coverImage || "/university-classroom.png",
          website: profileData.website || "",
          verified: profileData.verified || false,
          founded: profileData.founded,
          tagline: profileData.tagline || "",
          overview: profileData.overview || "",
          mission: profileData.mission || "",
          coreValues: profileData.coreValues || [],
          gallery:
            galleryData.images && Array.isArray(galleryData.images)
              ? galleryData.images
              : galleryData.gallery && Array.isArray(galleryData.gallery)
                ? galleryData.gallery
                : Array.isArray(galleryData)
                  ? galleryData
                  : Array.isArray(profileData.gallery)
                    ? profileData.gallery
                    : [],
          programs: programsData.programs || [],
          faculty: facultyData.faculty || [],
          facilities: facilitiesData.facilities || [],
          events: eventsData.events || [],
          followers: followersData?.followers?.length || 0,
        };

        console.log("✅ Institution data loaded for share profile:", {
          name: comprehensiveInstitutionData.name,
          programs: comprehensiveInstitutionData.programs?.length || 0,
          faculty: comprehensiveInstitutionData.faculty?.length || 0,
          facilities: comprehensiveInstitutionData.facilities?.length || 0,
          events: comprehensiveInstitutionData.events?.length || 0,
          gallery: comprehensiveInstitutionData.gallery?.length || 0,
          followers: comprehensiveInstitutionData.followers,
        });

        setInstitutionData(comprehensiveInstitutionData);
      } catch (err) {
        console.error("Error fetching institution data for share profile:", err);
        setError("Failed to load institution profile");
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutionData();
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <main className="flex-grow flex items-center justify-center pt-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
            <p className="mt-4 text-gray-600">Loading institution profile...</p>
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
        {institutionData && (
          <InstitutionProfile
            institutionData={institutionData}
            institutionId={profileId!}
            isViewMode={true}
            isShareMode={true}
            onClick={() => {
                const profileUrl = `https://path-piper.replit.app/share-profile/institution/profile/${profileId}`;
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