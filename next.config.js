/** @type {import('next').NextConfig} */
const nextConfig = {
  // Change from 'standalone' to undefined to use the default output
  // This will prevent the error with missing client-reference-manifest.js
  
  // Force dynamic rendering for all pages
  experimental: {
    // Allow server actions from specific origins
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost'
      ],
    },
  },
  
  // Set environment variables
  env: {
    NEXT_DISABLE_STATIC_GENERATION: 'true',
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Disable powered by header
  poweredByHeader: false,
  
  // Disable ETag generation
  generateEtags: false,
  
  // Configure headers to disable caching for all pages
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  
  // Force dynamic rendering for all pages
  reactStrictMode: false,
  staticPageGenerationTimeout: 1,
  
  // Use the correct property for dynamic rendering
  images: {
    unoptimized: true,
  },
  
  // Disable static optimization
  optimizeFonts: false,
  
  // Set dynamic rendering for all pages
  trailingSlash: false,
}

module.exports = nextConfig