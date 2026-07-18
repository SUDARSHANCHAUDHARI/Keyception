import { access, copyFile, mkdir, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const publicFiles = ["index.html", "styles.css", "script.js", "favicon.svg"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await Promise.all(
  publicFiles.map(async (file) => {
    const source = resolve(root, file);
    const destination = resolve(output, file);
    await access(source);
    await copyFile(source, destination);
  }),
);

const outputHtml = await readFile(resolve(output, "index.html"), "utf8");
for (const asset of ["styles.css", "script.js", "favicon.svg"]) {
  if (!outputHtml.includes(asset)) {
    throw new Error(`Production HTML does not reference ${asset}`);
  }
  await access(resolve(output, asset));
}

console.log(`Production build complete: ${publicFiles.length} files written to dist/.`);
