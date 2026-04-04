import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";
import crypto from "crypto";
import {
  buildPrimitiveManifest,
  buildPrimitiveIndex,
} from "./lib/primitive-manifest.mjs";

const root = process.cwd();
const errors = [];

checkPrimitives();
checkKnowledgebaseIndex();

if (errors.length) {
  console.error("Freshness check failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Freshness check: ok");

function checkPrimitives() {
  const primitivesRoot = path.join(
    root,
    ".agent-os",
    "lib",
    "ux-ui-knowledgebase",
    "08_primitives"
  );
  const manifestPath = path.join(primitivesRoot, "manifest.json");
  const indexPath = path.join(primitivesRoot, "index.json");

  if (!existsSync(manifestPath)) {
    errors.push("Missing primitive manifest.json.");
    return;
  }
  if (!existsSync(indexPath)) {
    errors.push("Missing primitive index.json.");
    return;
  }

  const existingManifest = readJson(manifestPath);
  const existingIndex = readJson(indexPath);

  const expectedManifest = buildPrimitiveManifest(
    primitivesRoot,
    existingManifest
  );
  const { index: expectedIndex, errors: buildErrors } =
    buildPrimitiveIndex(primitivesRoot);

  buildErrors.forEach((error) => errors.push(error));

  const normalizedManifest = {
    ...expectedManifest,
    generated_at: existingManifest.generated_at,
  };

  if (!deepEqual(normalizedManifest, existingManifest)) {
    errors.push(
      "Primitive manifest.json is stale. Run node .agent-os/scripts/build-primitives.mjs."
    );
  }

  if (!deepEqual(expectedIndex, existingIndex)) {
    errors.push(
      "Primitive index.json is stale. Run node .agent-os/scripts/build-primitives.mjs."
    );
  }
}

function checkKnowledgebaseIndex() {
  const kbRoot = path.join(root, ".agent-os", "lib", "ux-ui-knowledgebase");
  const manifestPath = path.join(kbRoot, "manifest.json");
  const indexPath = path.join(root, "memory", "ux_kb_index.json");

  if (!existsSync(manifestPath)) {
    errors.push("Missing knowledgebase manifest.json.");
    return;
  }
  if (!existsSync(indexPath)) {
    errors.push("Missing knowledgebase index (memory/ux_kb_index.json).");
    return;
  }

  const manifest = readJson(manifestPath);
  const index = readJson(indexPath);
  const files = listKbFiles(kbRoot);
  const contentHash = combinedHash(kbRoot, files);

  if (manifest.content_hash !== contentHash) {
    errors.push("Knowledgebase manifest content_hash is stale. Run ./.agent-os/agent kb-update.");
  }
  if (index.content_hash !== contentHash) {
    errors.push("Knowledgebase index content_hash is stale. Run ./.agent-os/agent kb-update.");
  }
  if (manifest.files_indexed !== index.files_indexed) {
    errors.push("Knowledgebase manifest files_indexed mismatch.");
  }
  if (manifest.entries_indexed !== index.entries_indexed) {
    errors.push("Knowledgebase manifest entries_indexed mismatch.");
  }
  if (manifest.index_path && manifest.index_path !== "memory/ux_kb_index.json") {
    errors.push("Knowledgebase manifest index_path mismatch.");
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function listKbFiles(rootDir) {
  const files = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    const dirEntries = readdirSync(dir, { withFileTypes: true });
    dirEntries.forEach((entry) => {
      if (entry.name === ".DS_Store") return;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else {
        const rel = path.relative(rootDir, full);
        if (rel === "manifest.json") return;
        files.push(rel.replace(/\\/g, "/"));
      }
    });
  }
  return files.sort();
}

function combinedHash(rootDir, relFiles) {
  const hash = crypto.createHash("sha256");
  relFiles.forEach((rel) => {
    const filePath = path.join(rootDir, rel);
    hash.update(rel, "utf-8");
    hash.update(Buffer.from([0]));
    hash.update(readFileSync(filePath));
    hash.update(Buffer.from([0]));
  });
  return hash.digest("hex");
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (a && b && typeof a === "object") {
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (!deepEqual(keysA, keysB)) return false;
    return keysA.every((key) => deepEqual(a[key], b[key]));
  }
  return false;
}
