#!/usr/bin/env bash
# Shared helpers for tools/verify/verify.sh and tools/verify/verify-on-stop.sh.
# Source this file; do not execute it. Each caller owns its own `set` flags.

if [[ -n "${_VERIFY_LIB_LOADED:-}" ]]; then
  return 0
fi
_VERIFY_LIB_LOADED=1

verify_hash_stdin() {
  local repo_root="$1"

  git -C "$repo_root" hash-object --stdin
}

verify_hash_string() {
  local repo_root="$1"
  local value="$2"

  printf '%s' "$value" | verify_hash_stdin "$repo_root"
}

verify_get_worktree_changed_files() {
  local repo_root="$1"
  local diff_base

  if git -C "$repo_root" rev-parse --verify HEAD >/dev/null 2>&1; then
    diff_base='HEAD'
  else
    diff_base="$(git -C "$repo_root" hash-object -t tree /dev/null)" || return 1
  fi

  {
    git -C "$repo_root" -c core.fsmonitor=false diff --name-only "$diff_base" --
    git -C "$repo_root" -c core.fsmonitor=false diff --cached --name-only --
    git -C "$repo_root" -c core.fsmonitor=false ls-files --others --exclude-standard
  } | sed '/^$/d' | sort -u
}

verify_strip_ansi() {
  perl -pe 's/\e\[[0-9;?]*[ -\/]*[@-~]//g'
}

verify_truncate_output() {
  local output="$1"
  local max_chars="${2:-8000}"

  if (( ${#output} <= max_chars )); then
    printf '%s\n' "$output"
    return
  fi

  local half=$((max_chars / 2))
  printf '%s\n' "${output:0:half}"
  printf '\n... output truncated to %s chars ...\n\n' "$max_chars"
  printf '%s\n' "${output: -half}"
}
