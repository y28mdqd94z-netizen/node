export function parsePrimitiveYaml(text, source = "<inline>") {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const result = {};
  let currentKey = null;
  let currentMode = null; // "list" | "map"

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    const trimmed = line.trim();

    if (indent === 0) {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) {
        throw new Error(`${source}:${i + 1}: Expected key:value pair.`);
      }
      const key = line.slice(0, colonIndex).trim();
      const rawValue = line.slice(colonIndex + 1).trim();
      if (!key) {
        throw new Error(`${source}:${i + 1}: Empty key.`);
      }
      if (rawValue === "") {
        currentKey = key;
        currentMode = null;
      } else {
        result[key] = parseScalar(rawValue);
        currentKey = null;
        currentMode = null;
      }
      continue;
    }

    if (indent === 2 && currentKey) {
      if (trimmed.startsWith("- ")) {
        if (!currentMode) {
          result[currentKey] = [];
          currentMode = "list";
        }
        if (currentMode !== "list") {
          throw new Error(`${source}:${i + 1}: Mixed list/map for ${currentKey}.`);
        }
        result[currentKey].push(parseScalar(trimmed.slice(2)));
        continue;
      }

      const colonIndex = trimmed.indexOf(":");
      if (colonIndex === -1) {
        throw new Error(`${source}:${i + 1}: Expected nested key:value under ${currentKey}.`);
      }
      const subKey = trimmed.slice(0, colonIndex).trim();
      const rawValue = trimmed.slice(colonIndex + 1).trim();
      if (!subKey) {
        throw new Error(`${source}:${i + 1}: Empty nested key under ${currentKey}.`);
      }
      if (!currentMode) {
        result[currentKey] = {};
        currentMode = "map";
      }
      if (currentMode !== "map") {
        throw new Error(`${source}:${i + 1}: Mixed list/map for ${currentKey}.`);
      }
      result[currentKey][subKey] = parseScalar(rawValue);
      continue;
    }

    throw new Error(`${source}:${i + 1}: Unsupported indentation.`);
  }

  return result;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
