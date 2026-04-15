#!/usr/bin/env bash
# grove-context.sh — Emit structured grove context for the current working directory.
# Reads ~/.grove/grove.json, identifies the current project/instance by matching
# CWD, and outputs a summary agents can act on.
#
# Usage: grove-context.sh [--cwd <path>]
#   --cwd   Override working directory (default: $PWD)

set -euo pipefail

REGISTRY="${HOME}/.grove/grove.json"
CWD="${PWD}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cwd) CWD="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: grove-context.sh [--cwd <path>]"
      echo ""
      echo "Emit structured grove context for the current working directory."
      echo "Reads ~/.grove/grove.json and identifies your project/instance."
      echo ""
      echo "Options:"
      echo "  --cwd <path>  Override working directory (default: \$PWD)"
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# Resolve symlinks for reliable path matching
CWD=$(cd "$CWD" 2>/dev/null && pwd -P 2>/dev/null || echo "$CWD")

if [[ ! -f "$REGISTRY" ]]; then
  echo "No grove registry found at $REGISTRY"
  echo "Grove is not configured. Run: grove register <path> --port <service:base:offset>"
  exit 0
fi

# Check jq availability
if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required but not installed."
  echo "Fix: brew install jq"
  exit 1
fi

PROJECTS=$(jq -r '.projects | keys[]' "$REGISTRY" 2>/dev/null)

if [[ -z "$PROJECTS" ]]; then
  echo "Grove registry is empty. No projects registered."
  exit 0
fi

# --- Detect current project and instance ---

MATCH_PROJECT=""
MATCH_INSTANCE=""
MATCH_TYPE=""  # "source" | "instance"
MATCH_SLOT=""
MATCH_PATH=""

for proj in $PROJECTS; do
  SOURCE=$(jq -r ".projects[\"$proj\"].source" "$REGISTRY")
  SOURCE_RESOLVED=$(cd "$SOURCE" && pwd -P 2>/dev/null || echo "$SOURCE")

  # Check if CWD is the source or under it
  if [[ "$CWD" == "$SOURCE_RESOLVED" || "$CWD" == "$SOURCE_RESOLVED"/* ]]; then
    MATCH_PROJECT="$proj"
    MATCH_TYPE="source"
    MATCH_PATH="$SOURCE"
    break
  fi

  # Check instances
  INST_COUNT=$(jq -r ".projects[\"$proj\"].instances | length" "$REGISTRY")
  for ((i = 0; i < INST_COUNT; i++)); do
    INST_PATH=$(jq -r ".projects[\"$proj\"].instances[$i].path" "$REGISTRY")
    [[ ! -d "$INST_PATH" ]] && continue
    INST_RESOLVED=$(cd "$INST_PATH" && pwd -P 2>/dev/null || echo "$INST_PATH")

    if [[ "$CWD" == "$INST_RESOLVED" || "$CWD" == "$INST_RESOLVED"/* ]]; then
      MATCH_PROJECT="$proj"
      MATCH_INSTANCE=$(jq -r ".projects[\"$proj\"].instances[$i].name" "$REGISTRY")
      MATCH_SLOT=$(jq -r ".projects[\"$proj\"].instances[$i].slot" "$REGISTRY")
      MATCH_TYPE="instance"
      MATCH_PATH="$INST_PATH"
      break 2
    fi
  done
done

# --- Output ---

echo "=== Grove Context ==="
echo ""

if [[ -z "$MATCH_PROJECT" ]]; then
  echo "Location: not inside a grove-managed project"
  echo ""
  echo "Registered projects:"
  for proj in $PROJECTS; do
    SOURCE=$(jq -r ".projects[\"$proj\"].source" "$REGISTRY")
    INST_COUNT=$(jq -r ".projects[\"$proj\"].instances | length" "$REGISTRY")
    echo "  $proj — $INST_COUNT instance(s) — $SOURCE"
  done
  exit 0
fi

SOURCE=$(jq -r ".projects[\"$MATCH_PROJECT\"].source" "$REGISTRY")

if [[ "$MATCH_TYPE" == "source" ]]; then
  echo "You are in: $MATCH_PROJECT (source)"
  echo "Source path: $SOURCE"
  echo "Role: This is the ORIGINAL project directory. Instances are cloned from here."
else
  echo "You are in: $MATCH_PROJECT/$MATCH_INSTANCE (slot $MATCH_SLOT)"
  echo "Instance path: $MATCH_PATH"
  echo "Source path: $SOURCE"
  echo "Role: This is a PARALLEL INSTANCE. Your ports differ from other instances."
fi

echo ""

# --- Port mapping for current instance ---

PORT_KEYS=$(jq -r ".projects[\"$MATCH_PROJECT\"].ports | keys[]" "$REGISTRY" 2>/dev/null || true)

if [[ -n "$PORT_KEYS" && "$MATCH_TYPE" == "instance" && -n "$MATCH_SLOT" ]]; then
  echo "Your ports (slot $MATCH_SLOT):"
  for svc in $PORT_KEYS; do
    BASE=$(jq -r ".projects[\"$MATCH_PROJECT\"].ports[\"$svc\"].base" "$REGISTRY")
    OFFSET=$(jq -r ".projects[\"$MATCH_PROJECT\"].ports[\"$svc\"].offset" "$REGISTRY")
    PORT=$((BASE + MATCH_SLOT * OFFSET))
    echo "  $svc: $PORT  (base=$BASE, offset=$OFFSET)"
  done
  echo ""
fi

# --- Sibling instances ---

INST_COUNT=$(jq -r ".projects[\"$MATCH_PROJECT\"].instances | length" "$REGISTRY")

if [[ "$INST_COUNT" -eq 0 ]]; then
  echo "No instances planted yet."
else
  echo "All instances of $MATCH_PROJECT:"
  for ((i = 0; i < INST_COUNT; i++)); do
    NAME=$(jq -r ".projects[\"$MATCH_PROJECT\"].instances[$i].name" "$REGISTRY")
    SLOT=$(jq -r ".projects[\"$MATCH_PROJECT\"].instances[$i].slot" "$REGISTRY")
    IPATH=$(jq -r ".projects[\"$MATCH_PROJECT\"].instances[$i].path" "$REGISTRY")

    # Mark current
    MARKER=""
    if [[ "$NAME" == "$MATCH_INSTANCE" ]]; then
      MARKER=" <-- you are here"
    fi

    # Check directory exists
    if [[ ! -d "$IPATH" ]]; then
      echo "  [zombie] $NAME (slot $SLOT) $IPATH"
      continue
    fi

    echo "  $NAME (slot $SLOT) $IPATH$MARKER"

    # Show computed ports
    if [[ -n "$PORT_KEYS" ]]; then
      PORT_LINE="    ports:"
      for svc in $PORT_KEYS; do
        BASE=$(jq -r ".projects[\"$MATCH_PROJECT\"].ports[\"$svc\"].base" "$REGISTRY")
        OFFSET=$(jq -r ".projects[\"$MATCH_PROJECT\"].ports[\"$svc\"].offset" "$REGISTRY")
        PORT=$((BASE + SLOT * OFFSET))
        PORT_LINE="$PORT_LINE $svc=$PORT"
      done
      echo "$PORT_LINE"
    fi
  done
fi

echo ""
echo "Base ports (slot 0 = source):"
for svc in $PORT_KEYS; do
  BASE=$(jq -r ".projects[\"$MATCH_PROJECT\"].ports[\"$svc\"].base" "$REGISTRY")
  echo "  $svc: $BASE"
done
