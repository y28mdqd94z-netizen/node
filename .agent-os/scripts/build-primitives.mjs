import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import {
  buildPrimitiveManifest,
  buildPrimitiveIndex,
} from "./lib/primitive-manifest.mjs";

const root = process.cwd();
const primitivesRoot = path.join(
  root,
  ".agent-os",
  "lib",
  "ux-ui-knowledgebase",
  "08_primitives"
);
const manifestPath = path.join(primitivesRoot, "manifest.json");
const indexPath = path.join(primitivesRoot, "index.json");

const existingManifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf-8"))
  : {};

const manifest = buildPrimitiveManifest(primitivesRoot, existingManifest);
const { index, errors } = buildPrimitiveIndex(primitivesRoot);

if (errors.length) {
  console.error("Primitive index build failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n");

console.log("Primitive manifest/index generated.");
