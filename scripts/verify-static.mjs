import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(fileURLToPath(new URL("..", import.meta.url)));
const output = join(project, "dist");
const publicDir = join(project, "public");
const errors = [];

async function filesBelow(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await filesBelow(path));
    else found.push(path);
  }
  return found;
}

async function exists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

const indexPath = join(output, "index.html");
if (!await exists(indexPath)) errors.push("Falta dist/index.html");

const outputFiles = await filesBelow(output);
const publicFiles = await filesBelow(publicDir);
const html = await readFile(indexPath, "utf8");

if (/(?:src|href)=["']\/(?!\/)/i.test(html)) {
  errors.push("dist/index.html contiene una ruta absoluta interna");
}

for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) {
  const reference = match[1];
  if (/^(?:https?:|data:|#)/i.test(reference)) continue;
  const target = resolve(output, reference);
  if (!await exists(target)) errors.push(`Recurso HTML inexistente: ${reference}`);
}

for (const path of outputFiles.filter((file) => file.endsWith(".css"))) {
  const css = await readFile(path, "utf8");
  if (/url\(\s*["']?\/(?!\/)/i.test(css)) {
    errors.push(`${relative(output, path)} contiene una ruta absoluta interna`);
  }
}

for (const source of publicFiles) {
  const destination = join(output, relative(publicDir, source));
  if (!await exists(destination)) {
    errors.push(`No se copió ${relative(publicDir, source)} a dist`);
    continue;
  }
  const [sourceBytes, destinationBytes] = await Promise.all([readFile(source), readFile(destination)]);
  if (!sourceBytes.equals(destinationBytes)) errors.push(`El recurso cambió al compilar: ${relative(publicDir, source)}`);
}

if (!outputFiles.some((file) => /\/assets\/[^/]+\.js$/.test(file))) errors.push("Falta el JavaScript compilado en dist/assets");
if (!outputFiles.some((file) => /\/assets\/[^/]+\.css$/.test(file))) errors.push("Falta el CSS compilado en dist/assets");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Salida estática válida: ${outputFiles.length} archivos, index.html en la raíz y recursos relativos.`);
