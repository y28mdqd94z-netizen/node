import { readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const AGENT_OS = path.join(ROOT, ".agent-os");
const SOURCE = path.join(AGENT_OS, "source");
const OUT = path.join(AGENT_OS, "manifests");

const CATEGORIES = [
  "core",
  "skills",
  "workflows",
  "references",
  "anti-patterns",
  "evals",
  "templates",
];

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function rel(p) {
  return path.relative(AGENT_OS, p).replace(/\\/g, "/");
}

function buildLayer(layer) {
  const layerRoot = path.join(SOURCE, layer);
  const manifest = {
    version: "0.1.0",
    generated_at: new Date().toISOString(),
  };

  for (const category of CATEGORIES) {
    const dir = path.join(layerRoot, category);
    const files = listFiles(dir).filter((p) => !p.endsWith(".DS_Store"));
    manifest[category.replace("-", "_")] = files.map(rel).sort();
  }

  return manifest;
}

function writeManifest(name, data) {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  const dest = path.join(OUT, name);
  writeFileSync(dest, JSON.stringify(data, null, 2) + "\n");
}

writeManifest("design-manifest.json", buildLayer("design"));
writeManifest("engineering-manifest.json", buildLayer("engineering"));

console.log("Manifests generated in .agent-os/manifests/");
