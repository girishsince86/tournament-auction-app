const QRCode = require('qrcode')
const fs = require('fs/promises')
const path = require('path')
const { createCanvas, loadImage } = require('canvas')

const REGISTRATION_URL = 'https://tournament-auction-app.vercel.app/tournaments/register'

async function generateQRCode() {
  try {
    // Create the public directory if it doesn't exist
    const publicDir = path.join(process.cwd(), 'public')
    await fs.mkdir(publicDir, { recursive: true })

    // Create a canvas
    const canvas = createCanvas(1000, 1000)
    const ctx = canvas.getContext('2d')

    // Generate QR code on canvas
    await QRCode.toCanvas(canvas, REGISTRATION_URL, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      width: 1000
    })

    // Load and draw the logo
    const logo = await loadImage('public/pbel-volleyball-logo.png')
    const logoSize = canvas.width * 0.2 // Logo will be 20% of QR code size
    const logoX = (canvas.width - logoSize) / 2
    const logoY = (canvas.height - logoSize) / 2
    
    // Create a circular clip for the logo
    ctx.save()
    ctx.beginPath()
    ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    
    // Draw the logo
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
    ctx.restore()

    // Save the final QR code
    const buffer = canvas.toBuffer('image/png')
    const qrPath = path.join(publicDir, 'registration-qr.png')
    await fs.writeFile(qrPath, buffer)

    console.log('QR Code with logo generated successfully!')
    console.log('QR Code saved to:', qrPath)
    console.log('\nRegistration URL:', REGISTRATION_URL)
  } catch (error) {
    console.error('Error generating QR code:', error)
  }
}

generateQRCode() 