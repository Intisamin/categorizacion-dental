import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(fileURLToPath(new URL("..", import.meta.url)));
const output = join(project, "dist");

await rm(join(project, "assets"), { recursive: true, force: true });

for (const entry of await readdir(output, { withFileTypes: true })) {
  const source = join(output, entry.name);
  const destination = join(project, entry.name);
  if (entry.isDirectory()) {
    await mkdir(destination, { recursive: true });
    await cp(source, destination, { recursive: true, force: true });
  } else {
    await cp(source, destination, { force: true });
  }
}

console.log("Contenido de dist sincronizado con la raíz publicable para Hostinger.");
