import QRCode from 'qrcode'
import fs from 'fs/promises'
import path from 'path'

const REGISTRATION_URL = 'https://tournament-auction-qagw2kqxv-girishsince86s-projects.vercel.app/tournaments/register'

async function generateQRCode() {
  try {
    // Create the public directory if it doesn't exist
    const publicDir = path.join(process.cwd(), 'public')
    await fs.mkdir(publicDir, { recursive: true })

    // Generate QR code
    const qrPath = path.join(publicDir, 'registration-qr.png')
    await QRCode.toFile(qrPath, REGISTRATION_URL, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 1000,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })

    console.log('QR Code generated successfully!')
    console.log('QR Code saved to:', qrPath)
    console.log('\nRegistration URL:', REGISTRATION_URL)
  } catch (error) {
    console.error('Error generating QR code:', error)
  }
}

generateQRCode() 