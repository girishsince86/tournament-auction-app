import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { email, password } = await request.json();

    if (!email.endsWith('@pbel.in')) {
      return new NextResponse('Invalid admin email domain', { status: 400 });
    }

    // First, sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
      },
    });

    if (signUpError) {
      console.error('Error creating admin user:', signUpError);
      return new NextResponse(signUpError.message, { status: 500 });
    }

    // In development, auto-verify the email
    if (process.env.NODE_ENV === 'development' && signUpData.user) {
      const { data: verifyData, error: verifyError } = await supabase.rpc('confirm_user', {
        user_id: signUpData.user.id,
        token: signUpData.user.confirmation_sent_at,
      });

      if (verifyError) {
        console.error('Error verifying email:', verifyError);
        // Continue anyway as the user was created
      } else {
        console.log('Email auto-verified in development');
      }
    }

    return NextResponse.json({
      message: process.env.NODE_ENV === 'development' 
        ? 'Admin user created and auto-verified successfully'
        : 'Admin user created successfully. Please check your email to confirm your account.',
      user: signUpData.user
    });
  } catch (error) {
    console.error('Error in create admin API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 