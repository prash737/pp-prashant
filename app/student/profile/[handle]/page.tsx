"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import StudentProfile from "@/components/profile/student-profile"

// Performance logging utility
class PerformanceLogger {
  private static instance: PerformanceLogger;
  private logs: Array<{
    timestamp: number;
    event: string;
    duration?: number;
    phase: string;
    details?: any;
  }> = [];
  private startTime: number;
  private phaseStartTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger();
    }
    return PerformanceLogger.instance;
  }

  startLogging() {
    this.startTime = performance.now();
    this.logs = [];
    this.phaseStartTimes.clear();
    this.log('PAGE_LOAD_START', 'INITIALIZATION', { startTime: this.startTime });
  }

  log(event: string, phase: string, details?: any) {
    const timestamp = performance.now();
    this.logs.push({
      timestamp,
      event,
      phase,
      details,
      duration: timestamp - this.startTime
    });
    console.log(`🔄 [${phase}] ${event} - ${(timestamp - this.startTime).toFixed(2)}ms`, details || '');
  }

  startPhase(phaseName: string) {
    const timestamp = performance.now();
    this.phaseStartTimes.set(phaseName, timestamp);
    this.log(`PHASE_START_${phaseName}`, phaseName);
  }

  endPhase(phaseName: string) {
    const timestamp = performance.now();
    const startTime = this.phaseStartTimes.get(phaseName);
    if (startTime) {
      const duration = timestamp - startTime;
      this.log(`PHASE_END_${phaseName}`, phaseName, { phaseDuration: duration });
    }
  }

  async saveLogsToFile() {
    const totalDuration = performance.now() - this.startTime;
    const logData = {
      pageUrl: window.location.href,
      totalLoadTime: totalDuration,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      summary: {
        totalEvents: this.logs.length,
        phases: [...new Set(this.logs.map(log => log.phase))],
        longestOperations: this.logs
          .filter(log => log.duration)
          .sort((a, b) => (b.duration || 0) - (a.duration || 0))
          .slice(0, 10)
      },
      detailedLogs: this.logs
    };

    try {
      // Save to browser's local storage for immediate access
      localStorage.setItem('studentProfilePerformanceLog', JSON.stringify(logData, null, 2));
      
      // Also log to console for immediate viewing
      console.log('📊 COMPLETE PERFORMANCE LOG:', logData);
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-profile-performance-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('💾 Performance log saved to file and localStorage');
    } catch (error) {
      console.error('❌ Failed to save performance log:', error);
    }
  }

  getLogs() {
    return {
      totalDuration: performance.now() - this.startTime,
      logs: this.logs
    };
  }
}

interface StudentData {
  id: string
  profile: {
    firstName: string
    lastName: string
    bio?: string
    location?: string
    profileImageUrl?: string
    userInterests: Array<{
      interest: {
        name: string
        category: { name: string }
      }
    }>
    userSkills: Array<{
      skill: {
        name: string
        category: { name: string }
      }
    }>
  }
  educationHistory: Array<{
    id: string
    institutionName: string
    degree?: string
    fieldOfStudy?: string
    startDate: string
    endDate?: string
    current: boolean
  }>
}

export default function StudentProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [handle, setHandle] = useState<string | null>(null)
  const [performanceLogger] = useState(() => PerformanceLogger.getInstance())
  const router = useRouter()

  // Start performance logging immediately
  useEffect(() => {
    performanceLogger.startLogging();
    performanceLogger.log('COMPONENT_MOUNT', 'INITIALIZATION');
  }, []);

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      performanceLogger.startPhase('PARAMS_RESOLUTION');
      performanceLogger.log('PARAMS_RESOLUTION_START', 'PARAMS_RESOLUTION');
      
      const startTime = performance.now();
      const resolvedParams = await params;
      const endTime = performance.now();
      
      performanceLogger.log('PARAMS_RESOLVED', 'PARAMS_RESOLUTION', {
        handle: resolvedParams.handle,
        resolutionTime: endTime - startTime
      });
      
      setHandle(resolvedParams.handle);
      performanceLogger.endPhase('PARAMS_RESOLUTION');
    }
    resolveParams()
  }, [params, performanceLogger])

  useEffect(() => {
    performanceLogger.log('MAIN_USEEFFECT_START', 'MAIN_LOGIC', {
      authLoading,
      hasHandle: !!handle,
      hasCurrentUser: !!currentUser
    });

    if (authLoading || !handle) {
      performanceLogger.log('EARLY_RETURN_AUTH_OR_HANDLE', 'MAIN_LOGIC', {
        authLoading,
        handle
      });
      return;
    }

    performanceLogger.startPhase('AUTHENTICATION_CHECKS');

    if (!currentUser) {
      performanceLogger.log('NO_USER_REDIRECT_LOGIN', 'AUTHENTICATION_CHECKS');
      router.push('/login')
      return
    }

    // Redirect non-students to their appropriate profile pages
    if (currentUser.role !== 'student') {
      performanceLogger.log('NON_STUDENT_ROLE_REDIRECT', 'AUTHENTICATION_CHECKS', {
        userRole: currentUser.role
      });
      
      if (currentUser.role === 'mentor') {
        router.push('/mentor/profile')
      } else if (currentUser.role === 'institution') {
        router.push('/institution/profile')
      } else {
        router.push('/feed')
      }
      return
    }

    // Security check: Users can only view their own profile via handle
    // If the handle doesn't match their user ID, redirect to their own profile
    if (handle !== currentUser.id) {
      performanceLogger.log('HANDLE_MISMATCH_REDIRECT', 'AUTHENTICATION_CHECKS', {
        handle,
        userId: currentUser.id
      });
      router.push(`/student/profile/${currentUser.id}`)
      return
    }

    performanceLogger.log('AUTHENTICATION_CHECKS_PASSED', 'AUTHENTICATION_CHECKS', {
      userId: currentUser.id,
      role: currentUser.role
    });
    performanceLogger.endPhase('AUTHENTICATION_CHECKS');

    // Fetch student data - now we know it's the current user's profile
    const fetchStudentData = async () => {
      try {
        performanceLogger.startPhase('DATA_FETCHING');
        performanceLogger.log('FETCH_START', 'DATA_FETCHING', {
          url: `/api/student/profile/${currentUser.id}`
        });

        setLoading(true)
        setError(null)

        const fetchStartTime = performance.now();
        const response = await fetch(`/api/student/profile/${currentUser.id}`, {
          credentials: 'include'
        })
        const fetchEndTime = performance.now();

        performanceLogger.log('FETCH_COMPLETE', 'DATA_FETCHING', {
          status: response.status,
          ok: response.ok,
          fetchDuration: fetchEndTime - fetchStartTime
        });

        if (!response.ok) {
          let errorMessage = 'Failed to load profile';
          if (response.status === 404) {
            errorMessage = 'Profile not found';
          } else if (response.status === 403) {
            errorMessage = 'Access denied';
          }
          
          performanceLogger.log('FETCH_ERROR', 'DATA_FETCHING', {
            status: response.status,
            errorMessage
          });
          
          setError(errorMessage);
          return
        }

        const parseStartTime = performance.now();
        const data = await response.json();
        const parseEndTime = performance.now();

        performanceLogger.log('JSON_PARSE_COMPLETE', 'DATA_FETCHING', {
          parseDuration: parseEndTime - parseStartTime,
          dataKeys: Object.keys(data),
          hasProfile: !!data.profile,
          hasEducationHistory: !!data.educationHistory,
          educationHistoryLength: data.educationHistory?.length || 0
        });

        performanceLogger.log('SET_STUDENT_DATA_START', 'STATE_UPDATES');
        setStudentData(data);
        performanceLogger.log('SET_STUDENT_DATA_COMPLETE', 'STATE_UPDATES');

        performanceLogger.endPhase('DATA_FETCHING');
        
      } catch (err) {
        performanceLogger.log('FETCH_EXCEPTION', 'DATA_FETCHING', {
          error: err instanceof Error ? err.message : 'Unknown error',
          errorStack: err instanceof Error ? err.stack : undefined
        });
        console.error('Error fetching student data:', err)
        setError('Failed to load profile')
      } finally {
        performanceLogger.log('SET_LOADING_FALSE_START', 'STATE_UPDATES');
        setLoading(false);
        performanceLogger.log('SET_LOADING_FALSE_COMPLETE', 'STATE_UPDATES');
        
        // Save performance logs when loading is complete
        setTimeout(() => {
          performanceLogger.log('PAGE_LOAD_COMPLETE', 'FINALIZATION');
          performanceLogger.saveLogsToFile();
        }, 100);
      }
    }

    fetchStudentData()
  }, [handle, currentUser, authLoading, router, performanceLogger])

  if (authLoading || loading) {
    performanceLogger.log('RENDERING_LOADING_STATE', 'RENDERING', {
      authLoading,
      loading
    });
    
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  if (error) {
    performanceLogger.log('RENDERING_ERROR_STATE', 'RENDERING', { error });
    
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => router.push('/student/profile')}
                className="bg-pathpiper-teal text-white px-4 py-2 rounded hover:bg-pathpiper-teal/90"
              >
                Go to My Profile
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  performanceLogger.log('RENDERING_MAIN_CONTENT', 'RENDERING', {
    hasStudentData: !!studentData,
    hasCurrentUser: !!currentUser
  });

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          {studentData && (
            <>
              <StudentProfile
                studentId={currentUser.id}
                currentUser={currentUser}
                studentData={studentData}
                performanceLogger={performanceLogger}
              />
            </>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}