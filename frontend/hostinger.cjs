const fs = require("node:fs")
const path = require("node:path")

process.env.HOSTNAME ||= "0.0.0.0"

const standaloneDirectory = path.join(__dirname, ".next", "standalone")
const serverFile = path.join(standaloneDirectory, "server.js")

if (!fs.existsSync(serverFile)) {
  console.error("Hostinger standalone server is missing. Run npm run build:hostinger first.")
  process.exit(1)
}

process.chdir(standaloneDirectory)
require(serverFile)
