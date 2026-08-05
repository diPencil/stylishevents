import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js"

/** @type {(phase: string) => import('next').NextConfig} */
const nextConfig = (phase) => ({
  ...(phase === PHASE_DEVELOPMENT_SERVER
    ? { distDir: ".next-dev" }
    : {}),
  output: "standalone",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
})

export default nextConfig
