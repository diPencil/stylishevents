import { access, cp, lstat, mkdir, readdir, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const standaloneDir = path.join(frontendDir, ".next", "standalone")
const serverFile = path.join(standaloneDir, "server.js")
const hostingerDir = path.join(frontendDir, "hostinger-dist")
const launcherFile = path.join(frontendDir, "hostinger.cjs")
const publicDir = path.join(frontendDir, "public")
const staticDir = path.join(frontendDir, ".next", "static")

function isEnvironmentFile(name) {
  return name === ".env" || name.startsWith(".env.")
}

function isSensitiveFile(name) {
  const normalizedName = name.toLowerCase()
  return (
    isEnvironmentFile(name) ||
    normalizedName === ".npmrc" ||
    normalizedName === "credentials.json" ||
    normalizedName === "service-account.json" ||
    normalizedName === "id_rsa" ||
    normalizedName === "id_ed25519" ||
    normalizedName.endsWith(".pem") ||
    normalizedName.endsWith(".key")
  )
}

async function verifySafeTree(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (isSensitiveFile(entry.name)) {
      throw new Error(`Refusing to include sensitive file: ${path.join(directory, entry.name)}`)
    }

    const entryPath = path.join(directory, entry.name)
    const stats = await lstat(entryPath)
    if (stats.isSymbolicLink()) {
      throw new Error(`Refusing to copy symbolic link: ${entryPath}`)
    }
    if (stats.isDirectory()) await verifySafeTree(entryPath)
  }
}

await access(serverFile)
await access(launcherFile)
await verifySafeTree(standaloneDir)
await verifySafeTree(staticDir)

await rm(hostingerDir, { recursive: true, force: true })
await mkdir(hostingerDir, { recursive: true })
await cp(standaloneDir, hostingerDir, { recursive: true })

const hostingerStaticDir = path.join(hostingerDir, ".next", "static")
await mkdir(path.dirname(hostingerStaticDir), { recursive: true })
await cp(staticDir, hostingerStaticDir, { recursive: true })

try {
  await access(publicDir)
  await verifySafeTree(publicDir)
  const hostingerPublicDir = path.join(hostingerDir, "public")
  await cp(publicDir, hostingerPublicDir, { recursive: true })
} catch (error) {
  if (error?.code !== "ENOENT") throw error
}

const hostingerLauncherFile = path.join(hostingerDir, "hostinger.cjs")
const hostingerServerFile = path.join(hostingerDir, "server.js")

await cp(launcherFile, hostingerLauncherFile)
await access(hostingerServerFile)
await access(hostingerLauncherFile)
await verifySafeTree(hostingerDir)

console.log("Hostinger runtime artifact prepared in hostinger-dist without sensitive files.")
