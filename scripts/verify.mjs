import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "README.md",
  "favicon.svg",
  "package.json",
  "LICENSE",
  "AGENTS.md",
  "CHANGELOG.md",
  "SECURITY.md",
  "scripts/build.mjs",
];

await Promise.all(requiredFiles.map((file) => access(resolve(root, file))));

const [html, css, script, readme] = await Promise.all(
  ["index.html", "styles.css", "script.js", "README.md"].map((file) =>
    readFile(resolve(root, file), "utf8"),
  ),
);

function effectiveRootTokens(source) {
  const tokens = {};
  for (const match of source.matchAll(/:root\s*\{([\s\S]*?)\}/g)) {
    for (const declaration of match[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[declaration[1]] = declaration[2].trim();
    }
  }
  return tokens;
}

const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
assert.equal(packageJson.private, true, "package.json must remain private");
assert.equal(packageJson.packageManager, "pnpm@10.28.2", "pnpm version must stay pinned");
assert.ok(packageJson.scripts?.check, "Missing check command");
assert.ok(packageJson.scripts?.build, "Missing production build command");

const htmlRequirements = [
  ['lang="en"', "document language"],
  ['id="keyToken"', "draggable key"],
  ['id="lockTarget"', "lock target"],
  ['id="drawer"', "drawer"],
  ['id="smallDoor"', "smaller door"],
  ['id="soundToggle"', "sound toggle"],
  ['id="resetButton"', "reset button"],
  ['aria-live="polite"', "live status"],
  ['http-equiv="Content-Security-Policy"', "Content Security Policy"],
  ["You have unlocked<br />another problem.", "final reveal"],
];

for (const [token, label] of htmlRequirements) {
  assert.ok(html.includes(token), `Missing ${label} in index.html`);
}

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "index.html contains duplicate IDs");
assert.equal((html.match(/class="stage-index"/g) || []).length, 3, "Expected exactly three puzzle stages");

const anomalyIds = [
  "lock-moves",
  "key-bends",
  "door-shifts",
  "lock-rejects",
  "key-duplicates",
  "door-rotates",
  "key-self-unlocks",
  "thief-steals",
];

for (const id of anomalyIds) {
  assert.ok(script.includes(`id: "${id}"`), `Missing anomaly: ${id}`);
  assert.ok(css.includes(`event-${id}`), `Missing anomaly styling: ${id}`);
}

assert.match(script, /pointerdown/, "Pointer drag support is missing");
assert.match(script, /getBoundingClientRect/, "Collision detection is missing");
assert.match(script, /AudioContext/, "Generated Web Audio is missing");
assert.match(script, /ANOMALIES_PER_DROP\s*=\s*\[1, 1, 2, 1, 1, 2\]/, "Anomaly schedule is incomplete");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "Reduced-motion support is missing");
assert.match(css, /@media \(max-width:/, "Responsive styles are missing");
assert.match(readme, /## Puzzle flow/, "README puzzle flow is missing");

const tokens = effectiveRootTokens(css);
for (const [name, expected] of Object.entries({
  "--ink": "#15152a",
  "--paper": "#fff5df",
  "--coral": "#ff5d5d",
  "--blue": "#4f7cff",
  "--brass": "#ffd166",
  "--mint": "#58d6a9",
  "--lilac": "#b695ff",
})) {
  assert.equal(tokens[name]?.toLowerCase(), expected, `${name} must resolve to ${expected}`);
}
assert.match(css, /--display:\s*Impact/, "Display typography must use the condensed family stack");
assert.match(css, /--body:\s*"Arial Rounded MT Bold"/, "Body typography must use the rounded family stack");
assert.match(css, /body\s*\{[\s\S]*min-width:\s*0;[\s\S]*overflow-x:\s*clip;[\s\S]*overflow-y:\s*auto;/, "Body must preserve vertical scroll and no positive minimum width");
assert.match(css, /html\s*\{[\s\S]*min-width:\s*0;/, "HTML must not impose a positive minimum width");
assert.match(css, /button:focus-visible,[\s\S]*outline:\s*4px solid var\(--blue\)/, "Focus must use TinyChaos blue");
assert.match(css, /\.utility-button\s*\{[\s\S]*border:\s*3px solid var\(--ink\)[\s\S]*box-shadow:\s*3px 3px 0 var\(--ink\)/, "Utility controls need heavy ink outlines and solid offsets");
assert.match(html, /href="https:\/\/sudarshanchaudhari\.github\.io\/TinyChaos\/"/, "TinyChaos gallery link is required");
assert.match(html, /Keyception · by Sudarshan Chaudhari/, "Author attribution is required");

const localReferences = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)]
  .map((match) => match[1])
  .filter((reference) => !reference.includes(":") && !reference.startsWith("/"));

await Promise.all(localReferences.map((reference) => access(resolve(root, reference))));

console.log(`Keyception verification passed (${requiredFiles.length} project files checked).`);
