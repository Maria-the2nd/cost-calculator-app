/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure scripts are properly loaded
  poweredByHeader: false,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDjcIn9k0AxNkWvL9hRDf4LJcJi17i3LAY',
    BUILD_TIMESTAMP: new Date().toISOString(), // Force rebuild
  },
  // Disable static optimization for pages that use API key
  // This ensures fresh data on each request
  unstable_runtimeJS: true,
}

module.exports = nextConfig 