import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function validateImage(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_SIZE_BYTES) {
    return { isValid: false, error: 'Image must be less than 5MB' }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, and WebP are allowed' }
  }
  return { isValid: true }
}

/**
 * Public (no auth) upload for registration profile photo.
 * Uses team-owner-images bucket (registration-uploads/ prefix) to avoid a separate bucket.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const validation = validateImage(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = ['jpeg', 'jpg', 'png', 'webp'].includes(ext) ? ext : 'jpg'
    const path = `registration-uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('team-owner-images')
      .upload(path, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Registration image upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const { data: { publicUrl } } = supabase.storage
      .from('team-owner-images')
      .getPublicUrl(uploadData.path)

    const secureUrl = publicUrl.replace('http://', 'https://')

    return NextResponse.json({
      imageUrl: secureUrl,
      path: uploadData.path,
    })
  } catch (err) {
    console.error('Registration upload error:', err)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
