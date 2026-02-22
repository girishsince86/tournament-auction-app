import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleSupabaseClient } from '@/lib/supabase/public-api';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/public/consent?phone=XXX or ?email=XXX
 * Looks up a TB Women player by phone or email and returns existing consent if any.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceRoleSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 503 });
    }

    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone')?.trim();
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Please provide a phone number or email address' },
        { status: 400 }
      );
    }

    // Look up the player in tournament_registrations for THROWBALL_WOMEN category
    let query = supabase
      .from('tournament_registrations')
      .select('id, first_name, last_name, phone_number, email, registration_category')
      .eq('registration_category', 'THROWBALL_WOMEN');

    if (phone) {
      query = query.eq('phone_number', phone);
    } else if (email) {
      query = query.ilike('email', email);
    }

    const { data: registrations, error: regError } = await query;

    if (regError) {
      console.error('Error looking up registration:', regError);
      return NextResponse.json(
        { error: 'Failed to look up player', details: regError.message },
        { status: 500 }
      );
    }

    if (!registrations || registrations.length === 0) {
      return NextResponse.json(
        { error: 'No TB Open Women player found with this phone number / email. Please check and try again.' },
        { status: 404 }
      );
    }

    const registration = registrations[0];

    // Check if consent already exists
    const { data: existingConsent, error: consentError } = await supabase
      .from('auction_consent')
      .select('*')
      .eq('registration_id', registration.id)
      .maybeSingle();

    if (consentError) {
      console.error('Error looking up consent:', consentError);
      return NextResponse.json(
        { error: 'Failed to look up consent', details: consentError.message },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      player: {
        id: registration.id,
        name: `${registration.first_name} ${registration.last_name}`,
        phone_number: registration.phone_number,
        email: registration.email,
      },
      consent: existingConsent || null,
    });

    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    console.error('Unexpected error in GET /api/public/consent:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/public/consent
 * Body: { phone?: string, email?: string, consent_choice: 'AUCTION_POOL' | 'SPIN_THE_WHEEL' }
 * Validates player exists and upserts consent record.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceRoleSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 503 });
    }

    const body = await request.json();
    const { phone, email, consent_choice } = body;

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Please provide a phone number or email address' },
        { status: 400 }
      );
    }

    if (!consent_choice || !['AUCTION_POOL', 'SPIN_THE_WHEEL'].includes(consent_choice)) {
      return NextResponse.json(
        { error: 'Invalid consent choice. Must be AUCTION_POOL or SPIN_THE_WHEEL' },
        { status: 400 }
      );
    }

    // Look up the player
    let query = supabase
      .from('tournament_registrations')
      .select('id, first_name, last_name, phone_number, email, registration_category')
      .eq('registration_category', 'THROWBALL_WOMEN');

    if (phone) {
      query = query.eq('phone_number', phone.trim());
    } else if (email) {
      query = query.ilike('email', email.trim().toLowerCase());
    }

    const { data: registrations, error: regError } = await query;

    if (regError) {
      console.error('Error looking up registration:', regError);
      return NextResponse.json(
        { error: 'Failed to look up player', details: regError.message },
        { status: 500 }
      );
    }

    if (!registrations || registrations.length === 0) {
      return NextResponse.json(
        { error: 'No TB Open Women player found with this phone number / email.' },
        { status: 404 }
      );
    }

    const registration = registrations[0];
    const playerName = `${registration.first_name} ${registration.last_name}`;

    // Check if consent already exists
    const { data: existingConsent } = await supabase
      .from('auction_consent')
      .select('id')
      .eq('registration_id', registration.id)
      .maybeSingle();

    let consent;
    if (existingConsent) {
      // Update existing consent
      const { data: updated, error: updateError } = await supabase
        .from('auction_consent')
        .update({ consent_choice })
        .eq('id', existingConsent.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating consent:', updateError);
        return NextResponse.json(
          { error: 'Failed to update consent', details: updateError.message },
          { status: 500 }
        );
      }
      consent = updated;
    } else {
      // Insert new consent
      const { data: inserted, error: insertError } = await supabase
        .from('auction_consent')
        .insert({
          registration_id: registration.id,
          player_name: playerName,
          phone_number: registration.phone_number,
          email: registration.email || null,
          consent_choice,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting consent:', insertError);
        return NextResponse.json(
          { error: 'Failed to save consent', details: insertError.message },
          { status: 500 }
        );
      }
      consent = inserted;
    }

    return NextResponse.json({
      success: true,
      player: {
        id: registration.id,
        name: playerName,
        phone_number: registration.phone_number,
        email: registration.email,
      },
      consent,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/public/consent:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
