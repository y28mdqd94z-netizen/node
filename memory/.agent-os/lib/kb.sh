#!/usr/bin/env bash
set -euo pipefail

kb_update() {
  local repo_root="$1"
  local kb_root="$2"
  local index_out="$3"
  local manifest_path="$4"

  mkdir -p "$(dirname "$index_out")"

  local py
  if command -v python3 >/dev/null 2>&1; then
    py="python3"
  elif command -v python >/dev/null 2>&1; then
    py="python"
  else
    printf 'python is required to update the knowledgebase index\n' >&2
    return 1
  fi

  "$py" - "$repo_root" "$kb_root" "$index_out" "$manifest_path" <<'PY'
import sys, os, json, re, hashlib, datetime

repo_root = sys.argv[1]
kb_root = sys.argv[2]
index_out = sys.argv[3]
manifest_path = sys.argv[4]

def now_ts():
    return datetime.datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M:%S%z")

def slugify(text):
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = text.strip("-")
    return text or "entry"

def strip_quotes(s):
    s = s.strip()
    if len(s) >= 2 and ((s[0] == '"' and s[-1] == '"') or (s[0] == "'" and s[-1] == "'")):
        s = s[1:-1]
    return s.strip()

def detect_category(rel_path):
    parts = rel_path.split(os.sep)
    if not parts:
        return "unknown"
    folder = parts[0]
    if folder.startswith("01_"):
        return "foundations"
    if folder.startswith("02_"):
        return "design-evaluation"
    if folder.startswith("03_"):
        return "patterns"
    if folder.startswith("04_"):
        return "components"
    if folder.startswith("05_"):
        return "design-system"
    if folder.startswith("06_"):
        return "agent-application"
    if folder.startswith("07_"):
        return "references"
    return "unknown"

def collect_files(root):
    files = []
    for dirpath, _dirnames, filenames in os.walk(root):
        for name in filenames:
            if name == ".DS_Store":
                continue
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, root)
            if rel == "manifest.json":
                continue
            files.append(rel)
    files.sort()
    return files

def file_hash(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def combined_hash(root, rel_files):
    h = hashlib.sha256()
    for rel in rel_files:
        path = os.path.join(root, rel)
        h.update(rel.encode("utf-8"))
        h.update(b"\0")
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        h.update(b"\0")
    return h.hexdigest()

def parse_yaml_entries(text, rel_path):
    entries = []
    # Try PyYAML if available
    try:
        import yaml  # type: ignore
        data = yaml.safe_load(text)

        def collect(node, parent_key=None):
            if isinstance(node, dict):
                # If this dict looks like a canonical entry, capture it
                node_id = node.get("id")
                title = node.get("title") or node.get("name")
                if node_id or title:
                    entries.append({
                        "id": str(node_id) if node_id else None,
                        "title": str(title) if title else None,
                    })
                for k, v in node.items():
                    collect(v, k)
            elif isinstance(node, list):
                for item in node:
                    collect(item, parent_key)

        # Capture top-level keys with title fields
        if isinstance(data, dict):
            for k, v in data.items():
                if isinstance(v, dict):
                    title = v.get("title") or v.get("name")
                    if title:
                        entries.append({"id": str(k), "title": str(title)})
                collect(v, k)
        else:
            collect(data, None)
        return entries
    except Exception:
        pass

    # Fallback: regex-based parsing for id/title pairs and top-level keys.
    lines = text.splitlines()
    for i, line in enumerate(lines):
        m = re.match(r"^\s*-\s*id:\s*(.+)$", line)
        if m:
            entry_id = strip_quotes(m.group(1))
            title = None
            for j in range(i + 1, min(i + 6, len(lines))):
                m2 = re.match(r"^\s*title:\s*(.+)$", lines[j])
                if m2:
                    title = strip_quotes(m2.group(1))
                    break
            entries.append({"id": entry_id, "title": title})

    for i, line in enumerate(lines):
        m = re.match(r"^([A-Za-z0-9_\\-]+):\\s*$", line)
        if m:
            entry_id = m.group(1)
            title = None
            for j in range(i + 1, min(i + 20, len(lines))):
                if re.match(r"^[A-Za-z0-9_\\-]+:\\s*$", lines[j]):
                    break
                m2 = re.match(r"^\\s*title:\\s*(.+)$", lines[j])
                if m2:
                    title = strip_quotes(m2.group(1))
                    break
            if title:
                entries.append({"id": entry_id, "title": title})

    return entries

def parse_markdown_headings(text):
    entries = []
    for line in text.splitlines():
        if not line.startswith("#"):
            continue
        m = re.match(r"^(#+)\\s+(.*)$", line)
        if not m:
            continue
        level = len(m.group(1))
        title = m.group(2).strip()
        if not title:
            continue
        entries.append({"id": slugify(title), "title": title, "level": level})
    return entries

files = collect_files(kb_root)
content_hash = combined_hash(kb_root, files)

entries = []
files_meta = []
for rel in files:
    path = os.path.join(kb_root, rel)
    ext = os.path.splitext(rel)[1].lower()
    category = detect_category(rel)
    files_meta.append({
        "path": rel.replace(os.sep, "/"),
        "type": ext.lstrip("."),
        "category": category,
    })

    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except Exception:
        continue

    if ext in (".yaml", ".yml"):
        parsed = parse_yaml_entries(text, rel)
        for item in parsed:
            entry_id = item.get("id")
            title = item.get("title")
            if not entry_id and title:
                entry_id = slugify(title)
            if not entry_id and not title:
                continue
            entries.append({
                "id": entry_id,
                "title": title or entry_id,
                "file": rel.replace(os.sep, "/"),
                "category": category,
                "source": "yaml",
            })
    elif ext in (".md", ".markdown"):
        parsed = parse_markdown_headings(text)
        for item in parsed:
            entries.append({
                "id": item["id"],
                "title": item["title"],
                "file": rel.replace(os.sep, "/"),
                "category": category,
                "source": "markdown",
                "level": item["level"],
            })

seen = set()
unique_entries = []
for entry in entries:
    key = (entry.get("id"), entry.get("file"))
    if key in seen:
        continue
    seen.add(key)
    unique_entries.append(entry)

index = {
    "generated_at": now_ts(),
    "root": kb_root,
    "content_hash": content_hash,
    "files_indexed": len(files),
    "entries_indexed": len(unique_entries),
    "files": files_meta,
    "entries": unique_entries,
}

os.makedirs(os.path.dirname(index_out), exist_ok=True)
with open(index_out, "w", encoding="utf-8") as f:
    json.dump(index, f, ensure_ascii=False, indent=2)

manifest = {}
if os.path.exists(manifest_path):
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    except Exception:
        manifest = {}

manifest["updated_at"] = datetime.datetime.now().date().isoformat()
manifest["files_indexed"] = len(files)
manifest["entries_indexed"] = len(unique_entries)
manifest["content_hash"] = content_hash
try:
    manifest["index_path"] = os.path.relpath(index_out, repo_root).replace(os.sep, "/")
except Exception:
    manifest["index_path"] = index_out

os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
PY
}

