import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js"

/** @type {(phase: string) => import('next').NextConfig} */
const nextConfig = (phase) => ({
  distDir: process.env.NEXT_DIST_DIR || (phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next-build"),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
})

export default nextConfig
