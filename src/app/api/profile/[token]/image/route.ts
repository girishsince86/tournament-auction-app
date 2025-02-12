import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const filePath = formData.get('filePath') as string
    const originalSize = formData.get('originalSize') as string
    const compressedSize = formData.get('compressedSize') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Log the request details with compression info
    console.log('Processing image upload request:', {
      token: params.token,
      filePath,
      originalSize: originalSize ? `${(parseInt(originalSize) / 1024 / 1024).toFixed(2)}MB` : 'N/A',
      compressedSize: compressedSize ? `${(parseInt(compressedSize) / 1024 / 1024).toFixed(2)}MB` : 'N/A',
      compressionRatio: originalSize && compressedSize 
        ? `${((1 - parseInt(compressedSize) / parseInt(originalSize)) * 100).toFixed(1)}%`
        : 'N/A',
    })

    // Validate token and get player
    const { data: registrationId, error: validationError } = await supabase
      .rpc('validate_profile_token', { token_input: params.token })

    if (validationError) {
      console.error('Token validation error:', validationError)
      return NextResponse.json(
        { error: `Invalid profile link: ${validationError.message}` },
        { status: 404 }
      )
    }

    if (!registrationId) {
      console.error('No registration found for token:', params.token)
      return NextResponse.json(
        { error: 'Profile link has expired or is invalid' },
        { status: 404 }
      )
    }

    console.log('Found registration ID:', registrationId)

    // Create a service role client for storage operations
    const serviceRoleClient = createRouteHandlerClient<Database>(
      { cookies },
      {
        options: {
          global: { headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } }
        }
      }
    )

    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await serviceRoleClient.storage
      .from('tournament-media')
      .upload(filePath, file, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = serviceRoleClient.storage
      .from('tournament-media')
      .getPublicUrl(filePath)

    // Update profile with image URL
    const { data: updateData, error: updateError } = await supabase
      .from('tournament_registrations')
      .update({ profile_image_url: publicUrl })
      .eq('id', registrationId)
      .select()

    if (updateError) {
      console.error('Error updating profile image:', updateError)
      return NextResponse.json(
        { error: `Failed to update profile image: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('Successfully uploaded and updated profile image:', {
      uploadData,
      publicUrl,
      updateData
    })

    return NextResponse.json({ 
      success: true,
      imageUrl: publicUrl,
      data: updateData
    })
  } catch (error) {
    console.error('Error in image upload API:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? `Failed to upload image: ${error.message}`
          : 'Failed to upload image'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Log the request details
    console.log('Processing image deletion request:')
    console.log('Token:', params.token)

    // Get the request body
    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Validate token and get player
    const { data: registrationId, error: validationError } = await supabase
      .rpc('validate_profile_token', { token_input: params.token })

    if (validationError || !registrationId) {
      console.error('Token validation error:', validationError)
      return NextResponse.json(
        { error: validationError?.message || 'Invalid profile token' },
        { status: 404 }
      )
    }

    // Get the current profile image URL
    const { data: player, error: playerError } = await supabase
      .from('tournament_registrations')
      .select('profile_image_url')
      .eq('id', registrationId)
      .single()

    if (playerError || !player?.profile_image_url) {
      console.error('Error fetching player details:', playerError)
      return NextResponse.json(
        { error: playerError?.message || 'No profile image found' },
        { status: 404 }
      )
    }

    // Extract the image path from the URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/public/tournament-media/')
    if (pathParts.length !== 2) {
      console.error('Invalid image URL format:', imageUrl)
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      )
    }

    const imagePath = pathParts[1]
    console.log('Attempting to delete image:', imagePath)

    // Create a service role client for storage operations
    const serviceRoleClient = createRouteHandlerClient<Database>(
      { cookies },
      {
        options: {
          global: { headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } }
        }
      }
    )

    // Delete the image from storage using service role client
    const { error: deleteError } = await serviceRoleClient.storage
      .from('tournament-media')
      .remove([imagePath])

    if (deleteError) {
      console.error('Error deleting image from storage:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete image: ${deleteError.message}` },
        { status: 500 }
      )
    }

    // Update profile to remove image URL
    const { data: updateData, error: updateError } = await supabase
      .from('tournament_registrations')
      .update({ profile_image_url: null })
      .eq('id', registrationId)
      .select()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json(
        { error: `Failed to update profile: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('Successfully deleted profile image:', updateData)
    return NextResponse.json({ 
      success: true,
      data: updateData
    })
  } catch (error) {
    console.error('Error in image deletion API:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? `Failed to delete profile image: ${error.message}`
          : 'Failed to delete profile image'
      },
      { status: 500 }
    )
  }
} 