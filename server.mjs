import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("./dist", import.meta.url)));
const port = Number(process.env.PORT || 3000);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function safePath(url = "/") {
  const pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const candidate = resolve(root, normalize(pathname).replace(/^[/\\]+/, ""));
  return candidate === root || candidate.startsWith(`${root}${sep}`) ? candidate : null;
}

createServer(async (request, response) => {
  try {
    let file = safePath(request.url);
    if (!file) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    try {
      const details = await stat(file);
      if (details.isDirectory()) file = join(file, "index.html");
    } catch {
      file = join(root, "index.html");
    }
    const body = await readFile(file);
    const extension = extname(file).toLowerCase();
    const immutable = file.includes(`${sep}assets${sep}`);
    response.writeHead(200, {
      "Content-Type": types[extension] || "application/octet-stream",
      "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-cache"
    });
    response.end(body);
  } catch (error) {
    response.writeHead(500).end("Application failed to serve the compiled site.");
    console.error(error);
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Categorización Dental listening on port ${port}`);
});
