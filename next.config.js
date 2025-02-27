/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Set all pages to be dynamic by default
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'pbel-volleyball.vercel.app'],
    },
  },
  // Force all pages to be server-side rendered
  output: 'standalone',
  // Disable static optimization
  compiler: {
    styledComponents: true,
  },
  // Force all pages to be server-side rendered
  staticPageGenerationTimeout: 1,
  // Add dynamic export to force dynamic rendering
  env: {
    NEXT_DISABLE_STATIC_GENERATION: 'true',
  },
}

module.exports = nextConfig