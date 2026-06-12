/** @type {import('next').NextConfig} */

// When BUILD_TARGET=mobile we produce a fully static bundle (out/) that ships
// inside the native app. The normal Vercel web build keeps SSR/middleware/API
// routes and is unaffected.
const isMobile = process.env.BUILD_TARGET === "mobile"

const nextConfig = {
  ...(isMobile ? { output: "export" } : {}),
  images: {
    // Static export can't use the Next image optimizer.
    unoptimized: isMobile,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
