const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
// Use 0.0.0.0 for Vercel deployment
const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

// Initialize Next.js
const app = next({ 
  dev, 
  hostname, 
  port,
  // Disable static generation
  conf: {
    env: {
      NEXT_DISABLE_STATIC_GENERATION: 'true'
    }
  }
})
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    console.log(`> Next.js app is preparing to start on port ${port}`)
    
    createServer(async (req, res) => {
      try {
        // Parse the URL
        const parsedUrl = parse(req.url, true)
        
        // Force dynamic rendering by setting cache control headers
        res.setHeader('Cache-Control', 'no-store, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')
        
        // Let Next.js handle the request
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('Internal Server Error')
      }
    })
    .once('error', (err) => {
      console.error('Server error:', err)
      process.exit(1)
    })
    .listen(port, (err) => {
      if (err) {
        console.error('Failed to start server:', err)
        process.exit(1)
      }
      console.log(`> Ready on http://${hostname === '0.0.0.0' ? 'localhost' : hostname}:${port}`)
    })
  })
  .catch((err) => {
    console.error('Failed to prepare Next.js app:', err)
    process.exit(1)
  }) 