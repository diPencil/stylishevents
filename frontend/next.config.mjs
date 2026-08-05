import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js"
import path from "node:path"
import { fileURLToPath } from "node:url"

const frontendDir = path.dirname(fileURLToPath(import.meta.url))

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
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": frontendDir,
    }
    return config
  },
})

export default nextConfig
