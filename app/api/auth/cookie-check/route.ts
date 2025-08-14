
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get all cookies from the request
  const allCookies = Array.from(request.cookies.getAll());
  const cookieNames = allCookies.map(c => c.name);
  
  // Mask actual values for security
  const cookieValues: Record<string, string> = {};
  allCookies.forEach(c => {
    cookieValues[c.name] = c.value.substring(0, 3) + '...'; 
  });
  
  return NextResponse.json({
    hasAuthCookies: cookieNames.some(name => 
      name.startsWith('sb-') || 
      name.includes('supabase') || 
      name.includes('auth')
    ),
    cookieCount: allCookies.length,
    cookieNames,
    cookieValues
  });
}
