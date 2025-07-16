
import { NextRequest, NextResponse } from 'next/server';
import { createClient, User } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('Password reset request received');
    
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    console.log('Processing password reset for email:', email);

    // Check if user exists in Supabase Auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    let userExists = false;
    let userProfile = null;

    if (!listError && authUsers?.users) {
      const authUser = authUsers.users.find((user: User) => user.email === email);
      if (authUser) {
        userExists = true;
        // Get the user's profile for the name
        userProfile = await prisma.profile.findUnique({
          where: { id: authUser.id }
        });
        console.log('User found in Supabase Auth');
      }
    }

    // Always return success to prevent email enumeration attacks
    // But only send email if user actually exists
    if (userExists) {
      console.log('User found, sending reset email via Supabase');
      
      // Generate password reset link using Supabase - let Supabase handle the email
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://pathpiper.replit.app/reset-password`,
        options: {
          // Set session to last 30 minutes (1800 seconds)
          sessionDuration: 1800
        }
      });

      if (error) {
        console.error('Supabase password reset error:', error);
        // Still return success to prevent email enumeration
      } else {
        console.log('Supabase reset email sent successfully');
      }
    } else {
      console.log('User not found, but returning success for security');
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, you will receive password reset instructions.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
