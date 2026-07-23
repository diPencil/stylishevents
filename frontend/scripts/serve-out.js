import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..", "out")
const port = Number(process.argv[2] || 3002)

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
}

function resolveFile(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0])
  const safePath = path.normalize(cleanPath).replace(/^(\.\.[/\\])+/, "")
  let filePath = path.join(root, safePath)

  if (safePath.endsWith("/") || !path.extname(filePath)) {
    filePath = path.join(filePath, "index.html")
  }

  if (!filePath.startsWith(root)) {
    return null
  }

  return filePath
}

const server = http.createServer((req, res) => {
  const requested = resolveFile(req.url || "/")
  const filePath = requested && fs.existsSync(requested)
    ? requested
    : path.join(root, "404.html")

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404)
      res.end("Not found")
      return
    }

    const ext = path.extname(filePath)
    res.writeHead(filePath.endsWith("404.html") ? 404 : 200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    })
    res.end(content)
  })
})

server.listen(port, () => {
  console.log(`Static export server running at http://localhost:${port}`)
})
