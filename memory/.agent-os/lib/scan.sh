#!/usr/bin/env bash
set -euo pipefail

json_escape() {
  local s="$1"
  s=${s//\\/\\\\}
  s=${s//\"/\\\"}
  s=${s//$'\n'/\\n}
  s=${s//$'\r'/\\r}
  s=${s//$'\t'/\\t}
  printf '%s' "$s"
}

json_array_from_lines() {
  local lines="$1"
  local out="["
  local first=1
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    local esc
    esc=$(json_escape "$line")
    if [[ $first -eq 1 ]]; then
      out+="\"$esc\""
      first=0
    else
      out+=",\"$esc\""
    fi
  done <<< "$lines"
  out+="]"
  printf '%s' "$out"
}

json_object_from_kv_lines() {
  local lines="$1"
  local out="{"
  local first=1
  while IFS=$'\t' read -r key value; do
    [[ -z "$key" ]] && continue
    local esc
    esc=$(json_escape "$key")
    if [[ $first -eq 1 ]]; then
      out+="\"$esc\":$value"
      first=0
    else
      out+=",\"$esc\":$value"
    fi
  done <<< "$lines"
  out+="}"
  printf '%s' "$out"
}

list_files() {
  local root="$1"
  (
    cd "$root"
    if command -v rg >/dev/null 2>&1; then
      rg --files \
        -g '!**/.git/**' \
        -g '!**/node_modules/**' \
        -g '!**/dist/**' \
        -g '!**/build/**' \
        -g '!**/.next/**' \
        -g '!**/vendor/**' \
        -g '!**/target/**' \
        -g '!**/.venv/**' \
        -g '!**/venv/**' \
        -g '!**/coverage/**' \
        -g '!**/.cache/**' \
        -g '!**/.agent-os/**' \
        -g '!**/memory/**' \
        -g '!**/.env' \
        -g '!**/.env.*' \
        -g '!**/*.key' \
        -g '!**/*.pem' \
        -g '!**/*.pfx' \
        -g '!**/*.crt' \
        -g '!**/*.cer'
    else
      find . -type f \
        -not -path './.git/*' \
        -not -path './node_modules/*' \
        -not -path './dist/*' \
        -not -path './build/*' \
        -not -path './.next/*' \
        -not -path './vendor/*' \
        -not -path './target/*' \
        -not -path './.venv/*' \
        -not -path './venv/*' \
        -not -path './coverage/*' \
        -not -path './.cache/*' \
        -not -path './.agent-os/*' \
        -not -path './memory/*' \
        -not -name '.env' \
        -not -name '.env.*' \
        -not -name '*.key' \
        -not -name '*.pem' \
        -not -name '*.pfx' \
        -not -name '*.crt' \
        -not -name '*.cer'
    fi
  ) | sed 's|^\./||'
}

collect_top_level_dirs() {
  local root="$1"
  (
    cd "$root"
    find . -maxdepth 1 -type d
  ) | sed 's|^\./||' | while IFS= read -r d; do
    [[ -z "$d" || "$d" == "." ]] && continue
    case "$d" in
      .git|node_modules|dist|build|.next|vendor|target|.venv|venv|coverage|.cache|.agent-os|memory)
        continue
        ;;
    esac
    printf '%s\n' "$d"
  done
}

detect_frameworks() {
  local root="$1"
  local frameworks=""
  local add_framework
  add_framework() {
    frameworks+="$1"$'\n'
  }

  if [[ -f "$root/next.config.js" || -f "$root/next.config.mjs" || -f "$root/next.config.cjs" ]]; then
    add_framework "next"
  fi
  if [[ -f "$root/nuxt.config.js" || -f "$root/nuxt.config.ts" || -f "$root/nuxt.config.mjs" ]]; then
    add_framework "nuxt"
  fi
  if [[ -f "$root/svelte.config.js" || -f "$root/svelte.config.cjs" || -f "$root/svelte.config.mjs" ]]; then
    add_framework "svelte"
  fi
  if [[ -f "$root/astro.config.mjs" || -f "$root/astro.config.js" || -f "$root/astro.config.ts" ]]; then
    add_framework "astro"
  fi
  if [[ -f "$root/angular.json" ]]; then
    add_framework "angular"
  fi
  if [[ -f "$root/vue.config.js" ]]; then
    add_framework "vue"
  fi
  if [[ -f "$root/vite.config.js" || -f "$root/vite.config.ts" || -f "$root/vite.config.mjs" ]]; then
    add_framework "vite"
  fi
  if [[ -f "$root/remix.config.js" || -f "$root/remix.config.ts" ]]; then
    add_framework "remix"
  fi

  if [[ -f "$root/package.json" ]]; then
    if grep -Eq '"next"' "$root/package.json"; then add_framework "next"; fi
    if grep -Eq '"react"' "$root/package.json"; then add_framework "react"; fi
    if grep -Eq '"vue"' "$root/package.json"; then add_framework "vue"; fi
    if grep -Eq '"svelte"' "$root/package.json"; then add_framework "svelte"; fi
    if grep -Eq '"@angular/core"' "$root/package.json"; then add_framework "angular"; fi
    if grep -Eq '"nuxt"' "$root/package.json"; then add_framework "nuxt"; fi
    if grep -Eq '"astro"' "$root/package.json"; then add_framework "astro"; fi
    if grep -Eq '"express"' "$root/package.json"; then add_framework "express"; fi
    if grep -Eq '"fastify"' "$root/package.json"; then add_framework "fastify"; fi
    if grep -Eq '"koa"' "$root/package.json"; then add_framework "koa"; fi
    if grep -Eq '"hono"' "$root/package.json"; then add_framework "hono"; fi
    if grep -Eq '"solid-js"' "$root/package.json"; then add_framework "solid"; fi
  fi

  for f in "$root/requirements.txt" "$root/pyproject.toml" "$root/Pipfile" "$root/setup.py"; do
    if [[ -f "$f" ]]; then
      if grep -Eiq 'django' "$f"; then add_framework "django"; fi
      if grep -Eiq 'flask' "$f"; then add_framework "flask"; fi
      if grep -Eiq 'fastapi' "$f"; then add_framework "fastapi"; fi
    fi
  done

  printf '%s' "$frameworks" | sed '/^$/d' | sort -u
}

detect_entry_points() {
  local root="$1"
  local entries=""
  local add_entry
  add_entry() {
    entries+="$1"$'\n'
  }

  for p in \
    src/main.tsx src/main.jsx src/main.ts src/main.js \
    src/index.tsx src/index.jsx src/index.ts src/index.js \
    app pages backend server api; do
    if [[ -e "$root/$p" ]]; then
      if [[ -d "$root/$p" ]]; then
        add_entry "$p/"
      else
        add_entry "$p"
      fi
    fi
  done

  for p in manage.py app.py main.py cmd/main.go; do
    if [[ -f "$root/$p" ]]; then
      add_entry "$p"
    fi
  done

  printf '%s' "$entries" | sed '/^$/d'
}

detect_runtimes() {
  local manifests="$1"
  local runtimes=""
  local add_runtime
  add_runtime() {
    runtimes+="$1"$'\n'
  }

  if grep -Eq '(^|/)package\\.json$' <<< "$manifests"; then add_runtime "node"; fi
  if grep -Eq '(^|/)bun\\.lockb$' <<< "$manifests"; then add_runtime "bun"; fi
  if grep -Eq '(^|/)deno\\.json(c)?$' <<< "$manifests"; then add_runtime "deno"; fi
  if grep -Eq '(^|/)(requirements\\.txt|pyproject\\.toml|Pipfile|setup\\.py)$' <<< "$manifests"; then add_runtime "python"; fi
  if grep -Eq '(^|/)go\\.mod$' <<< "$manifests"; then add_runtime "go"; fi
  if grep -Eq '(^|/)Cargo\\.toml$' <<< "$manifests"; then add_runtime "rust"; fi
  if grep -Eq '(^|/)(pom\\.xml|build\\.gradle|build\\.gradle\\.kts)$' <<< "$manifests"; then add_runtime "jvm"; fi
  if grep -Eq '(^|/)Gemfile$' <<< "$manifests"; then add_runtime "ruby"; fi
  if grep -Eq '(^|/)composer\\.json$' <<< "$manifests"; then add_runtime "php"; fi
  if grep -Eq '(^|/)mix\\.exs$' <<< "$manifests"; then add_runtime "elixir"; fi

  printf '%s' "$runtimes" | sed '/^$/d' | sort -u
}

detect_languages_from_counts() {
  local counts="$1"
  local langs=""
  local add_lang
  add_lang() {
    langs+="$1"$'\n'
  }

  while IFS=$'\t' read -r ext _count; do
    case "$ext" in
      js|jsx) add_lang "javascript" ;;
      ts|tsx) add_lang "typescript" ;;
      py) add_lang "python" ;;
      go) add_lang "go" ;;
      rs) add_lang "rust" ;;
      java) add_lang "java" ;;
      kt|kts) add_lang "kotlin" ;;
      cs) add_lang "csharp" ;;
      cpp|cc|cxx|hpp|h) add_lang "cpp" ;;
      c) add_lang "c" ;;
      rb) add_lang "ruby" ;;
      php) add_lang "php" ;;
      ex|exs) add_lang "elixir" ;;
      scala) add_lang "scala" ;;
      swift) add_lang "swift" ;;
      sh|bash) add_lang "shell" ;;
      sql) add_lang "sql" ;;
      html|htm) add_lang "html" ;;
      css|scss|sass|less) add_lang "css" ;;
      md|mdx) add_lang "markdown" ;;
    esac
  done <<< "$counts"

  printf '%s' "$langs" | sed '/^$/d' | sort -u
}

scan_repo() {
  local root="$1"
  local out="$2"
  local cap="${3:-5000}"
  local tmp="${out}.tmp"

  mkdir -p "$(dirname "$out")"

  local files_all
  files_all=$(list_files "$root")

  local total_files
  total_files=$(printf '%s\n' "$files_all" | sed '/^$/d' | wc -l | tr -d ' ')

  local files_capped
  files_capped=$(printf '%s\n' "$files_all" | sed '/^$/d' | head -n "$cap")

  local truncated=false
  if [[ "$total_files" -gt "$cap" ]]; then
    truncated=true
  fi

  local top_level_dirs
  top_level_dirs=$(collect_top_level_dirs "$root")

  local manifests
  manifests=$(printf '%s\n' "$files_all" | grep -E '(^|/)(package\.json|tsconfig\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|bun\.lockb|requirements\.txt|pyproject\.toml|Pipfile|poetry\.lock|setup\.py|Cargo\.toml|go\.mod|pom\.xml|build\.gradle|build\.gradle\.kts|Gemfile|composer\.json|deno\.json|deno\.jsonc|mix\.exs)$' || true)

  local frameworks
  frameworks=$(detect_frameworks "$root")

  local entry_points
  entry_points=$(detect_entry_points "$root")

  local counts
  counts=$(printf '%s\n' "$files_all" | awk -F/ '{file=$NF; ext="(none)"; if (file ~ /\./) {n=split(file, parts, "."); ext=tolower(parts[n]);} counts[ext]++} END {for (e in counts) printf "%s\t%d\n", e, counts[e];}' | sort)

  local runtimes
  runtimes=$(detect_runtimes "$manifests")

  local languages
  languages=$(detect_languages_from_counts "$counts")

  local excluded_list
  excluded_list=$(cat <<'EOL'
.git/
node_modules/
dist/
build/
.next/
vendor/
target/
.venv/
venv/
coverage/
.cache/
.agent-os/
memory/
.env
.env.*
*.key
*.pem
*.pfx
*.crt
*.cer
EOL
)

  local generated_at
  generated_at=$(date +"%Y-%m-%dT%H:%M:%S%z")

  local json_excluded
  json_excluded=$(json_array_from_lines "$excluded_list")
  local json_top_level_dirs
  json_top_level_dirs=$(json_array_from_lines "$top_level_dirs")
  local json_manifests
  json_manifests=$(json_array_from_lines "$manifests")
  local json_frameworks
  json_frameworks=$(json_array_from_lines "$frameworks")
  local json_entry_points
  json_entry_points=$(json_array_from_lines "$entry_points")
  local json_runtimes
  json_runtimes=$(json_array_from_lines "$runtimes")
  local json_languages
  json_languages=$(json_array_from_lines "$languages")
  local json_files
  json_files=$(json_array_from_lines "$files_capped")
  local json_counts
  json_counts=$(json_object_from_kv_lines "$counts")

  local root_esc
  root_esc=$(json_escape "$root")

  cat <<JSON_EOF > "$tmp"
{
  "generated_at": "${generated_at}",
  "root": "${root_esc}",
  "excluded": ${json_excluded},
  "top_level_dirs": ${json_top_level_dirs},
  "manifests": ${json_manifests},
  "frameworks": ${json_frameworks},
  "entry_points": ${json_entry_points},
  "stack": {
    "runtimes": ${json_runtimes},
    "languages": ${json_languages},
    "frameworks": ${json_frameworks}
  },
  "file_counts_by_ext": ${json_counts},
  "total_files": ${total_files},
  "files": ${json_files},
  "truncated": ${truncated}
}
JSON_EOF

  mv "$tmp" "$out"
}
