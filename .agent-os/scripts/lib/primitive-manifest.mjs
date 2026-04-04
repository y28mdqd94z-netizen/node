import { readdirSync, readFileSync } from "fs";
import path from "path";
import { parsePrimitiveYaml } from "./primitive-yaml.mjs";

const SECTION_DIRS = {
  meta: "00_meta",
  design_system: "01_design-system",
  components: "02_components",
  patterns: "03_patterns",
  shells: "04_shells",
  state: "05_state",
  accessibility: "06_accessibility",
  content: "07_content",
};

const INDEX_SECTIONS = [
  "design_system",
  "components",
  "patterns",
  "shells",
  "state",
  "accessibility",
  "content",
];

const DEFAULT_AGENT_GUIDES = [
  "../06_agent-application/pattern-selection-guide.md",
  "../06_agent-application/component-selection-guide.md",
  "../06_agent-application/shell-selection-guide.md",
  "../06_agent-application/primitive-composition-recipes.md",
  "../06_agent-application/implementation-mapping.md",
  "../06_agent-application/evaluation-checklists.md",
];

export function buildPrimitiveManifest(primitivesRoot, existingManifest = {}) {
  const manifest = {
    name: existingManifest.name || "primitive-system",
    version: existingManifest.version || "0.1.0",
    generated_at: new Date().toISOString(),
    root:
      existingManifest.root ||
      ".agent-os/lib/ux-ui-knowledgebase/08_primitives",
    taxonomy: existingManifest.taxonomy || "00_meta/taxonomy.yaml",
    schema: existingManifest.schema || "00_meta/primitive-schema.yaml",
    index: existingManifest.index || "index.json",
    agent_guides: existingManifest.agent_guides || DEFAULT_AGENT_GUIDES,
  };

  Object.entries(SECTION_DIRS).forEach(([key, dir]) => {
    const files = listFiles(path.join(primitivesRoot, dir));
    manifest[key] = files.map((file) => normalizePath(primitivesRoot, file));
  });

  return manifest;
}

export function buildPrimitiveIndex(primitivesRoot) {
  const entries = [];
  const errors = [];

  INDEX_SECTIONS.forEach((section) => {
    const dir = SECTION_DIRS[section];
    const files = listFiles(path.join(primitivesRoot, dir))
      .filter((file) => file.endsWith(".yaml"))
      .map((file) => normalizePath(primitivesRoot, file));

    files.forEach((rel) => {
      const absolute = path.join(primitivesRoot, rel);
      try {
        const data = parsePrimitiveYaml(
          readFileSync(absolute, "utf-8"),
          rel
        );
        if (!data.name || !data.id || !data.layer || !data.category) {
          errors.push(
            `${rel}: Missing name/id/layer/category required for index entries.`
          );
          return;
        }
        entries.push({
          path: rel,
          name: data.name,
          id: data.id,
          layer: data.layer,
          category: data.category,
        });
      } catch (error) {
        errors.push(`${rel}: ${error.message}`);
      }
    });
  });

  return { index: { entries }, errors };
}

function listFiles(dir) {
  const out = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.name === ".DS_Store") return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full));
    } else {
      out.push(full);
    }
  });
  return out.sort();
}

function normalizePath(root, filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}
