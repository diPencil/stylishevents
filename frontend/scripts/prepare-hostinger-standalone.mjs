import { access, cp, lstat, mkdir, readdir, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const standaloneDir = path.join(frontendDir, ".next", "standalone")
const serverFile = path.join(standaloneDir, "server.js")
const launcherFile = path.join(frontendDir, "hostinger.cjs")
const standaloneLauncherFile = path.join(standaloneDir, "hostinger.cjs")

const copies = [
  [path.join(frontendDir, "public"), path.join(standaloneDir, "public")],
  [path.join(frontendDir, ".next", "static"), path.join(standaloneDir, ".next", "static")],
]

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

for (const [source, destination] of copies) {
  await verifySafeTree(source)
  await rm(destination, { recursive: true, force: true })
  await mkdir(path.dirname(destination), { recursive: true })
  await cp(source, destination, { recursive: true, errorOnExist: false })
}

await cp(launcherFile, standaloneLauncherFile, { force: true })

console.log("Hostinger standalone bundle prepared without environment files.")
