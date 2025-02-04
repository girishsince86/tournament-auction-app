import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify admin access
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.email?.endsWith('@pbel.in')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const registration = await request.json();
    console.log('Received update request for registration:', params.id);
    console.log('Update payload:', registration);

    // First update the registration
    const { error: updateError } = await supabase
      .from('tournament_registrations')
      .update({
        first_name: registration.first_name,
        last_name: registration.last_name,
        phone_number: registration.phone_number,
        flat_number: registration.flat_number,
        registration_category: registration.registration_category,
        skill_level: registration.skill_level,
        last_played_date: registration.last_played_date,
        tshirt_size: registration.tshirt_size,
        playing_positions: registration.playing_positions,
        is_verified: registration.is_verified,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating registration:', updateError);
      return new NextResponse(updateError.message, { status: 500 });
    }

    console.log('Update successful, fetching updated registration');

    // Then fetch the updated registration
    const { data: updatedRegistration, error: fetchError } = await supabase
      .from('tournament_registrations')
      .select()
      .eq('id', params.id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated registration:', fetchError);
      return new NextResponse(fetchError.message, { status: 500 });
    }

    if (!updatedRegistration) {
      return new NextResponse('Registration not found', { status: 404 });
    }

    console.log('Sending updated registration:', updatedRegistration);
    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error('Error in update registration API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify admin access
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.email?.endsWith('@pbel.in')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Deleting registration:', params.id);

    // First verify the registration exists
    const { data: registration, error: fetchError } = await supabase
      .from('tournament_registrations')
      .select()
      .eq('id', params.id)
      .single();

    if (fetchError) {
      console.error('Error fetching registration:', fetchError);
      return new NextResponse(fetchError.message, { status: 500 });
    }

    if (!registration) {
      return new NextResponse('Registration not found', { status: 404 });
    }

    // Then delete the registration
    const { error: deleteError } = await supabase
      .from('tournament_registrations')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting registration:', deleteError);
      return new NextResponse(deleteError.message, { status: 500 });
    }

    console.log('Successfully deleted registration:', params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in delete registration API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 