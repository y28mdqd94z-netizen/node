import { existsSync, readFileSync } from "fs";
import path from "path";

const args = parseArgs(process.argv.slice(2));

const command = args["--command"] || "";
const title = args["--title"] || "";
const riskLevel = (args["--risk-level"] || "low").toLowerCase();
const configPath = args["--config"] || path.join(process.cwd(), ".agent-os", "orchestrator", "routing.yaml");
const repoMapPath = args["--repo-map"] || path.join(process.cwd(), "memory", "repo_map.json");
const agentsOverrideRaw = args["--agents"] || "";
const skillsOverrideRaw = args["--skills"] || "";

if (!command) {
  console.error("Missing --command");
  process.exit(2);
}

if (!existsSync(configPath)) {
  console.error(`Routing config not found: ${configPath}`);
  process.exit(2);
}

let config;
try {
  config = JSON.parse(readFileSync(configPath, "utf-8"));
} catch (error) {
  console.error(`Failed to parse routing config: ${error.message}`);
  process.exit(2);
}

const repoStack = readRepoStack(repoMapPath);
const context = {
  command,
  title: title || "",
  titleLower: (title || "").toLowerCase(),
  riskLevel,
  stack: repoStack,
};

const defaults = (config.defaults && config.defaults[command]) || { agents: [], skills: [] };
let agents = normalizeList(defaults.agents);
let skills = normalizeList(defaults.skills);

const matchedRules = [];
const rules = Array.isArray(config.rules) ? config.rules : [];
for (const rule of rules) {
  if (!rule || !rule.when) continue;
  if (!matchesRule(rule.when, context)) continue;
  matchedRules.push(rule.id || "(unnamed)");
  agents = applyActions(agents, rule.add_agents, rule.remove_agents);
  skills = applyActions(skills, rule.add_skills, rule.remove_skills);
}

agents = applyOverride(agents, agentsOverrideRaw);
skills = applyOverride(skills, skillsOverrideRaw);

const agentsOut = agents.length ? agents.join(", ") : "none";
const skillsOut = skills.length ? skills.join(", ") : "none";
const rulesOut = matchedRules.length ? matchedRules.join(", ") : "none";

console.log(`agents=${agentsOut}`);
console.log(`skills=${skillsOut}`);
console.log(`rules=${rulesOut}`);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const value = argv[i + 1];
    if (value && !value.startsWith("--")) {
      out[arg] = value;
      i += 1;
    } else {
      out[arg] = "";
    }
  }
  return out;
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function matchesRule(when, context) {
  if (when.command) {
    const commands = normalizeList(when.command);
    if (!commands.includes(context.command)) return false;
  }

  if (when.risk_level) {
    const levels = normalizeList(when.risk_level).map((lvl) => lvl.toLowerCase());
    if (!levels.includes(context.riskLevel)) return false;
  }

  if (when.title_keywords) {
    const keywords = normalizeList(when.title_keywords).map((kw) => kw.toLowerCase());
    const hit = keywords.some((kw) => context.titleLower.includes(kw));
    if (!hit) return false;
  }

  if (when.stack) {
    const stack = when.stack || {};
    if (!stackMatches(stack.runtimes, context.stack.runtimes)) return false;
    if (!stackMatches(stack.languages, context.stack.languages)) return false;
    if (!stackMatches(stack.frameworks, context.stack.frameworks)) return false;
  }

  return true;
}

function stackMatches(ruleValues, contextValues) {
  const required = normalizeList(ruleValues);
  if (required.length === 0) return true;
  const available = normalizeList(contextValues);
  return required.some((item) => available.includes(item));
}

function applyActions(list, addItems, removeItems) {
  let out = Array.isArray(list) ? [...list] : [];
  const additions = normalizeList(addItems);
  const removals = normalizeList(removeItems);
  additions.forEach((item) => {
    if (!out.includes(item)) out.push(item);
  });
  if (removals.length) {
    out = out.filter((item) => !removals.includes(item));
  }
  return out;
}

function applyOverride(list, overrideRaw) {
  if (!overrideRaw) return list;
  const tokens = overrideRaw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!tokens.length) return list;

  const hasOperators = tokens.some((token) => token.startsWith("+") || token.startsWith("-"));
  if (!hasOperators) {
    if (tokens.includes("none")) return [];
    return tokens;
  }

  let out = Array.isArray(list) ? [...list] : [];
  tokens.forEach((token) => {
    if (token.startsWith("+")) {
      const item = token.slice(1).trim();
      if (item && !out.includes(item)) out.push(item);
      return;
    }
    if (token.startsWith("-")) {
      const item = token.slice(1).trim();
      if (!item) return;
      out = out.filter((value) => value !== item);
      return;
    }
    if (token) {
      if (!out.includes(token)) out.push(token);
    }
  });
  return out;
}

function readRepoStack(repoMapPath) {
  if (!existsSync(repoMapPath)) {
    return { runtimes: [], languages: [], frameworks: [] };
  }
  try {
    const data = JSON.parse(readFileSync(repoMapPath, "utf-8"));
    const stack = data.stack || {};
    return {
      runtimes: normalizeList(stack.runtimes),
      languages: normalizeList(stack.languages),
      frameworks: normalizeList(stack.frameworks),
    };
  } catch {
    return { runtimes: [], languages: [], frameworks: [] };
  }
}
