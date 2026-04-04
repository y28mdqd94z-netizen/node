import { readFileSync, readdirSync } from "fs";
import path from "path";
import { parsePrimitiveYaml } from "./lib/primitive-yaml.mjs";
import { validateSchema } from "./lib/schema-validator.mjs";

const root = process.cwd();
const errors = [];

const primitiveSchema = readJson(
  path.join(root, ".agent-os", "schemas", "primitive-spec.schema.json")
);
const tokenSchema = readJson(
  path.join(root, ".agent-os", "schemas", "token-file.schema.json")
);

validatePrimitiveSpecs(primitiveSchema);
validateTokenFiles(tokenSchema);

if (errors.length) {
  console.error("Validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Validation ok");

function validatePrimitiveSpecs(schema) {
  const primitivesRoot = path.join(
    root,
    ".agent-os",
    "lib",
    "ux-ui-knowledgebase",
    "08_primitives"
  );
  const sections = [
    "01_design-system",
    "02_components",
    "03_patterns",
    "04_shells",
    "05_state",
    "06_accessibility",
    "07_content",
  ];

  sections.forEach((section) => {
    const dir = path.join(primitivesRoot, section);
    const files = listYamlFiles(dir);
    files.forEach((file) => {
      const rel = path.relative(primitivesRoot, file).replace(/\\/g, "/");
      try {
        const data = parsePrimitiveYaml(readFileSync(file, "utf-8"), rel);
        const schemaErrors = validateSchema(schema, data, rel);
        schemaErrors.forEach((error) => errors.push(error));
      } catch (error) {
        errors.push(`${rel}: ${error.message}`);
      }
    });
  });
}

function validateTokenFiles(schema) {
  const tokenRoot = path.join(root, ".agent-os", "tokens");
  const files = [
    "base.json",
    "semantic.json",
    "components.json",
    "aliases.json",
  ];

  const tokenData = {};
  files.forEach((file) => {
    const fullPath = path.join(tokenRoot, file);
    const data = readJson(fullPath);
    tokenData[file] = data;
    const schemaErrors = validateSchema(schema, data, `$tokens.${file}`);
    schemaErrors.forEach((error) => errors.push(error));
  });

  const basePaths = collectTokenPaths(tokenData["base.json"]);
  const semanticPaths = collectTokenPaths(tokenData["semantic.json"]);
  const componentPaths = collectTokenPaths(tokenData["components.json"]);
  const aliasPaths = collectTokenPaths(tokenData["aliases.json"]);

  validateTokenReferences(
    tokenData["base.json"],
    new Set(),
    "base.json",
    { disallowReferences: true }
  );
  validateTokenReferences(
    tokenData["semantic.json"],
    basePaths,
    "semantic.json"
  );
  validateTokenReferences(
    tokenData["components.json"],
    mergeSets(basePaths, semanticPaths),
    "components.json"
  );
  validateTokenReferences(
    tokenData["aliases.json"],
    mergeSets(basePaths, semanticPaths, componentPaths, aliasPaths),
    "aliases.json"
  );
}

function validateTokenReferences(tokenData, allowedPaths, label, options = {}) {
  walkTokenValues(tokenData, (value, tokenPath) => {
    if (typeof value !== "string") return;
    const refMatch = value.match(/^\{([^}]+)\}$/);
    if (!refMatch) return;
    const ref = refMatch[1];
    if (options.disallowReferences) {
      errors.push(`${label}:${tokenPath}: Base tokens must not reference ${ref}.`);
      return;
    }
    if (!allowedPaths.has(ref)) {
      errors.push(`${label}:${tokenPath}: Unknown token reference ${ref}.`);
    }
  });
}

function collectTokenPaths(tokenData) {
  const paths = new Set();
  walkTokenValues(tokenData, (_value, tokenPath) => {
    paths.add(tokenPath);
  });
  return paths;
}

function walkTokenValues(node, fn, prefix = "") {
  if (!isPlainObject(node)) return;
  Object.entries(node).forEach(([key, value]) => {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      walkTokenValues(value, fn, nextPath);
    } else {
      fn(value, nextPath);
    }
  });
}

function listYamlFiles(dir) {
  const entries = [dir];
  const out = [];
  while (entries.length) {
    const current = entries.pop();
    const items = readDir(current);
    items.forEach((entry) => {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        entries.push(full);
      } else if (entry.name.endsWith(".yaml")) {
        out.push(full);
      }
    });
  }
  return out.sort();
}

function readDir(dir) {
  return readdirSync(dir, { withFileTypes: true });
}

function mergeSets(...sets) {
  const merged = new Set();
  sets.forEach((set) => {
    set.forEach((value) => merged.add(value));
  });
  return merged;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
