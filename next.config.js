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
    FORCE_REBUILD_ID: `rebuild-${Date.now()}`, // Unique rebuild ID
  },
  // Disable static optimization for pages that use API key
  // This ensures fresh data on each request
  unstable_runtimeJS: true,
  // Disable caching to ensure fresh builds
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
}

// Log information to verify build
console.log('Next.js build starting with configuration:', JSON.stringify({
  ...nextConfig,
  env: {
    ...nextConfig.env,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: nextConfig.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'REDACTED' : 'NOT_SET',
  }
}, null, 2));

module.exports = nextConfig 