import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import FormData from 'form-data'

// Test token - will be set dynamically
let TEST_TOKEN = ''
const API_URL = 'http://localhost:3000'

async function testProfileImageUpload() {
  console.log('Testing profile image upload API...')

  try {
    // First get the player ID using the token
    const response = await fetch(`${API_URL}/api/profile/${TEST_TOKEN}`)
    const { player } = await response.json()
    
    if (!player?.id) {
      throw new Error('Could not get player ID from token')
    }

    // Create a minimal valid JPEG file
    const minimalJPEG = Buffer.from([
      0xFF, 0xD8, // SOI marker
      0xFF, 0xE0, 0x00, 0x10, // APP0 marker
      0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, // JFIF header
      0xFF, 0xD9  // EOI marker
    ])

    // Generate filePath similar to UI
    const filePath = `profile-images/${player.id}-${Date.now()}.jpg`

    // Create FormData
    const formData = new FormData()
    formData.append('file', minimalJPEG, {
      filename: 'test-profile.jpg',
      contentType: 'image/jpeg'
    })
    formData.append('filePath', filePath)
    formData.append('originalSize', String(minimalJPEG.length))
    formData.append('compressedSize', String(minimalJPEG.length))

    console.log('Sending request to:', `${API_URL}/api/profile/${TEST_TOKEN}/image`)
    console.log('FormData contents:', {
      filePath,
      originalSize: minimalJPEG.length,
      compressedSize: minimalJPEG.length
    })
    
    // Make the API request
    const uploadResponse = await fetch(`${API_URL}/api/profile/${TEST_TOKEN}/image`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    })

    const responseText = await uploadResponse.text()
    console.log('Raw response:', responseText)
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Invalid JSON response: ${responseText}`)
    }
    
    if (!uploadResponse.ok) {
      throw new Error(data.error || 'Failed to upload image')
    }

    console.log('API Response:', {
      status: uploadResponse.status,
      data
    })

    // Test if we can access the uploaded image
    if (data.imageUrl) {
      const imageResponse = await fetch(data.imageUrl)
      console.log('Image accessibility test:', {
        status: imageResponse.status,
        contentType: imageResponse.headers.get('content-type'),
        size: imageResponse.headers.get('content-length')
      })
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

// First get a valid token from the database
const supabase = createClient(
  'https://yfwormqkewwahqhtmrwh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmd29ybXFrZXd3YWhxaHRtcndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NzM3NTYsImV4cCI6MjA1MzQ0OTc1Nn0.zbCVPN2NBSNjp8OzhNvoY5qZLrqpOjYvDMOoNfL5loQ'
)

async function getTestToken() {
  // Get a test registration that has a valid profile token
  const { data: registration, error } = await supabase
    .from('tournament_registrations')
    .select('profile_token')
    .eq('registration_category', 'VOLLEYBALL_OPEN_MEN')
    .not('profile_token', 'is', null)
    .limit(1)
    .single()

  if (error) {
    throw new Error(`Failed to get test token: ${error.message}`)
  }

  if (!registration?.profile_token) {
    throw new Error('No valid profile token found')
  }

  return registration.profile_token
}

// Run the tests
async function runTests() {
  try {
    const token = await getTestToken()
    console.log('Using test token:', token)
    TEST_TOKEN = token
    await testProfileImageUpload()
  } catch (error) {
    console.error('Failed to run tests:', error)
  }
}

runTests() 