import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yfwormqkewwahqhtmrwh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmd29ybXFrZXd3YWhxaHRtcndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NzM3NTYsImV4cCI6MjA1MzQ0OTc1Nn0.zbCVPN2NBSNjp8OzhNvoY5qZLrqpOjYvDMOoNfL5loQ'
)

async function testStorage() {
  console.log('Testing Supabase storage...')
  
  // List all buckets
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets()
  
  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError)
    return
  }
  
  console.log('Available buckets:', buckets)
  
  // Create a minimal valid JPEG file
  const minimalJPEG = new Uint8Array([
    0xFF, 0xD8, // SOI marker
    0xFF, 0xE0, 0x00, 0x10, // APP0 marker
    0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, // JFIF header
    0xFF, 0xD9  // EOI marker
  ])

  // Test upload to tournament-media bucket
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('tournament-media')
    .upload('test-image.jpg', minimalJPEG, {
      contentType: 'image/jpeg',
      upsert: true
    })
    
  if (uploadError) {
    console.error('Upload error:', uploadError)
    return
  }
  
  console.log('Upload successful:', uploadData)

  // Try to get the public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('tournament-media')
    .getPublicUrl('test-image.jpg')

  console.log('Public URL:', publicUrl)
}

testStorage() 