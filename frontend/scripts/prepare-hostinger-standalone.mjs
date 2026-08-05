import { access, cp, lstat, mkdir, readdir, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const standaloneDir = path.join(frontendDir, ".next", "standalone")
const serverFile = path.join(standaloneDir, "server.js")
const hostingerDistDir = path.join(frontendDir, "hostinger-dist")
const launcherFile = path.join(frontendDir, "hostinger.cjs")
const publicDir = path.join(frontendDir, "public")
const staticDir = path.join(frontendDir, ".next", "static")

function isEnvironmentFile(name) {
  return name === ".env" || name.startsWith(".env.")
}

async function verifySafeTree(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (isEnvironmentFile(entry.name)) {
      throw new Error(`Refusing to copy environment file: ${path.join(directory, entry.name)}`)
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

await rm(hostingerDistDir, { recursive: true, force: true })
await mkdir(hostingerDistDir, { recursive: true })
await cp(standaloneDir, hostingerDistDir, { recursive: true })

const hostingerStaticDir = path.join(hostingerDistDir, ".next", "static")
await rm(hostingerStaticDir, { recursive: true, force: true })
await mkdir(path.dirname(hostingerStaticDir), { recursive: true })
await cp(staticDir, hostingerStaticDir, { recursive: true })

try {
  await access(publicDir)
  await verifySafeTree(publicDir)
  await cp(publicDir, path.join(hostingerDistDir, "public"), { recursive: true })
} catch (error) {
  if (error?.code !== "ENOENT") throw error
}

await cp(launcherFile, path.join(hostingerDistDir, "hostinger.cjs"))

console.log("Hostinger runtime artifact prepared without environment files.")
