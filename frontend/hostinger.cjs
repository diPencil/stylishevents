const fs = require("node:fs")
const path = require("node:path")

process.env.HOSTNAME ||= "0.0.0.0"

const candidates = [
  path.join(__dirname, "server.js"),
  path.join(__dirname, ".next", "standalone", "server.js"),
]

const serverFile = candidates.find((candidate) => fs.existsSync(candidate))

if (!serverFile) {
  console.error("Hostinger standalone server artifact is missing.")
  process.exit(1)
}

process.chdir(path.dirname(serverFile))
require(serverFile)
