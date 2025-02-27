import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types/supabase'

// Validation function for image files
function validateImage(file: File): { isValid: boolean; error?: string } {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size must be less than 5MB' }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' }
  }

  return { isValid: true }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const filePath = formData.get('filePath') as string

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file path
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Validate image
    const validation = validateImage(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Create a service role client for storage operations
    const serviceRoleClient = createRouteHandlerClient<Database>(
      { cookies },
      {
        options: {
          global: { headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } }
        }
      }
    )

    // Upload file to Supabase Storage with service role
    const { data: uploadData, error: uploadError } = await serviceRoleClient.storage
      .from('team-owner-images')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get the public URL using the same service role client
    const { data: { publicUrl } } = serviceRoleClient.storage
      .from('team-owner-images')
      .getPublicUrl(uploadData.path)

    // Ensure URL is in the correct format
    const secureUrl = publicUrl.replace('http://', 'https://')

    // Check if profile exists before trying to update it
    const { data: existingProfile } = await supabase
      .from('team_owner_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    // Only update profile if it exists
    if (existingProfile) {
      const { error: updateError } = await supabase
        .from('team_owner_profiles')
        .update({ 
          profile_image_url: secureUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        // Don't return error here as the image was uploaded successfully
        // Just log the error and continue
      }
    }

    console.log('Successfully uploaded image:', {
      path: uploadData.path,
      url: secureUrl
    })

    return NextResponse.json({ 
      data: {
        imageUrl: secureUrl,
        path: uploadData.path
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the request body
    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Extract the image path from the URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/team-owner-images/')
    if (pathParts.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      )
    }

    const imagePath = pathParts[1]

    // Create a service role client for storage operations
    const serviceRoleClient = createRouteHandlerClient<Database>(
      { cookies },
      {
        options: {
          global: { headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } }
        }
      }
    )

    // Delete the image from storage
    const { error: deleteError } = await serviceRoleClient.storage
      .from('team-owner-images')
      .remove([imagePath])

    if (deleteError) {
      console.error('Storage deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      )
    }

    // Check if profile exists before trying to update it
    const { data: existingProfile } = await supabase
      .from('team_owner_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    // Only update profile if it exists
    if (existingProfile) {
      const { error: updateError } = await supabase
        .from('team_owner_profiles')
        .update({ 
          profile_image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        // Don't return error here as the image was deleted successfully
        // Just log the error and continue
      }
    }

    return NextResponse.json({ 
      data: { success: true }
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 