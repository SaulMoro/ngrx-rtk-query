#!/usr/bin/env bash
# Agent Stop hook shared by Claude Code, Codex, and OpenCode.
#
# Delegates to tools/verify/verify.sh.
# Silent on success. On failure, prints focused output and exits 2 so the
# harness can re-engage the agent.

set -uo pipefail

REPO_ROOT="$(cd "${BASH_SOURCE[0]%/*}/../.." && pwd)"
source "$REPO_ROOT/tools/verify/_verify-lib.sh"

STATE_DIR="${TMPDIR:-/tmp}/ngrx-rtk-query-verify-on-stop"
MAX_STOP_OUTPUT_CHARS="${VERIFY_ON_STOP_MAX_OUTPUT_CHARS:-8000}"

if [[ ! "$MAX_STOP_OUTPUT_CHARS" =~ ^[0-9]+$ ]]; then
  MAX_STOP_OUTPUT_CHARS=8000
fi

REPO_KEY="$(verify_hash_string "$REPO_ROOT" "$REPO_ROOT")"
STATE_FILE="$STATE_DIR/$REPO_KEY.signature"

get_worktree_signature() {
  local file
  local file_signature
  local files
  local signature_input=''

  if ! files="$(verify_get_worktree_changed_files "$REPO_ROOT" 2>/dev/null)"; then
    return 1
  fi

  if [[ -z "$files" ]]; then
    printf '%s\n' clean
    return
  fi

  while IFS= read -r file; do
    file_signature="$(get_file_signature "$file")" || return 1
    signature_input+="$file_signature"$'\n'
  done <<< "$files"

  printf '%s' "$signature_input" | sort | verify_hash_stdin "$REPO_ROOT"
}

get_file_signature() {
  local file="$1"
  local absolute_file="$REPO_ROOT/$file"
  local blob_hash
  local mode

  if [[ ! -e "$absolute_file" && ! -L "$absolute_file" ]]; then
    printf '%s:missing\n' "$file"
    return 0
  fi

  if [[ -L "$absolute_file" ]]; then
    mode='120000'
    blob_hash="$(readlink "$absolute_file" | verify_hash_stdin "$REPO_ROOT")" || return 1
  elif [[ -f "$absolute_file" ]]; then
    if [[ -x "$absolute_file" ]]; then
      mode='100755'
    else
      mode='100644'
    fi

    blob_hash="$(git -C "$REPO_ROOT" hash-object --path="$file" -- "$absolute_file")" || return 1
  else
    return 1
  fi

  printf '%s:%s:%s\n' "$file" "$mode" "$blob_hash"
}

get_failure_id() {
  local worktree_signature="$1"

  printf '%s:%s\n' "$REPO_KEY" "$worktree_signature" | verify_hash_stdin "$REPO_ROOT"
}

store_worktree_result() {
  local result="$1"
  local worktree_signature="$2"

  if ! mkdir -p "$STATE_DIR" 2>/dev/null; then
    return 0
  fi

  { printf '%s:%s\n' "$result" "$worktree_signature" > "$STATE_FILE"; } 2>/dev/null || true
}

has_worktree_signature=0

if worktree_signature="$(get_worktree_signature)"; then
  has_worktree_signature=1
else
  worktree_signature='unknown'
fi

if [[ "$has_worktree_signature" -eq 1 ]] && [[ -f "$STATE_FILE" ]]; then
  previous_signature="$(cat "$STATE_FILE")"

  if [[ "$previous_signature" == "success:$worktree_signature" || "$previous_signature" == "failure:$worktree_signature" ]]; then
    exit 0
  fi
fi

if verify_output=$("$REPO_ROOT"/tools/verify/verify.sh 2>&1); then
  if [[ "$has_worktree_signature" -eq 1 ]]; then
    store_worktree_result 'success' "$worktree_signature"
  fi

  exit 0
else
  verify_status=$?
fi

if [[ -z "$verify_output" ]]; then
  verify_output='Verification failed. Run tools/verify/verify.sh for details.'
fi

if [[ "$verify_status" -eq 1 ]] && [[ "$has_worktree_signature" -eq 1 ]]; then
  store_worktree_result 'failure' "$worktree_signature"
  failure_id="$(get_failure_id "$worktree_signature")"

  {
    printf '%s\n' 'Verification failed after your previous response.'
    printf '%s\n' 'Fix the issues below, then continue until verification passes.'
    printf '%s\n\n' 'Do not ask for confirmation unless you are blocked.'
    verify_truncate_output "$verify_output" "$MAX_STOP_OUTPUT_CHARS"
    printf '\n%s%s\n' 'VERIFY_FAILURE_ID=' "$failure_id"
  } >&2

  exit 2
fi

{
  printf '%s\n\n' 'Automatic verification could not run after your previous response.'
  verify_truncate_output "$verify_output" "$MAX_STOP_OUTPUT_CHARS"
} >&2

exit 2
