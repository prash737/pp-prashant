
interface AuthCache {
  [token: string]: {
    user: any;
    timestamp: number;
    expiresAt: number;
  }
}

const authCache: AuthCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(authCache).forEach(token => {
    if (authCache[token].expiresAt < now) {
      delete authCache[token];
    }
  });
}, CLEANUP_INTERVAL);

export async function getCachedAuth(token: string, supabase: any) {
  const now = Date.now();
  
  // Check cache first
  if (authCache[token] && authCache[token].expiresAt > now) {
    console.log('🚀 Using cached auth for token:', token.substring(0, 20) + '...');
    return authCache[token].user;
  }

  // Cache miss - verify with Supabase
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Cache the result
    authCache[token] = {
      user,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    };

    console.log('🔄 Cached new auth for token:', token.substring(0, 20) + '...');
    return user;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function clearAuthCache(token?: string) {
  if (token) {
    delete authCache[token];
  } else {
    Object.keys(authCache).forEach(key => delete authCache[key]);
  }
}
