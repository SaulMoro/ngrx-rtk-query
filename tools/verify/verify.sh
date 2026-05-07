#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
repo_root="$(cd -- "${script_dir}/../.." >/dev/null 2>&1 && pwd)"

cd "${repo_root}"
source "${repo_root}/tools/verify/_verify-lib.sh"

full=false
format=false
base=""
head="HEAD"

docs_check_required() {
  local base_ref="$1"
  local head_ref="$2"
  local changed_files

  if [[ -n "${base_ref}" ]]; then
    changed_files="$(git -c core.fsmonitor=false diff --name-only "${base_ref}...${head_ref}" || true)"
  else
    changed_files="$(verify_get_worktree_changed_files "${repo_root}" || true)"
  fi

  if [[ -z "${changed_files}" ]]; then
    return 1
  fi

  while IFS= read -r file_path; do
    case "${file_path}" in
      AGENTS.md|CLAUDE.md|CONTRIBUTING.md|README.md|package.json|pnpm-lock.yaml)
        return 0
        ;;
      .githooks/*|.codex/*|.claude/*|.opencode/plugins/*|docs/*|tools/verify/*|packages/ngrx-rtk-query/README.md|packages/ngrx-rtk-query/*/README.md)
        return 0
        ;;
    esac
  done <<< "${changed_files}"

  return 1
}

for arg in "$@"; do
  case "${arg}" in
    --full)
      full=true
      ;;
    --format)
      format=true
      ;;
    --base=*)
      base="${arg#--base=}"
      ;;
    --head=*)
      head="${arg#--head=}"
      ;;
    *)
      echo "Unknown verify option: ${arg}" >&2
      exit 2
      ;;
  esac
done

nx_range_args=()
if [[ -n "${base}" ]]; then
  nx_range_args+=(--base="${base}" --head="${head}")
fi

targets="lint,typecheck"

if [[ "${full}" == true ]]; then
  targets="${targets},test"
fi

pnpm nx affected -t "${targets}" "${nx_range_args[@]}" --outputStyle=static

if docs_check_required "${base}" "${head}"; then
  pnpm docs:check
fi

if [[ "${format}" == true ]]; then
  pnpm exec prettier --check . --ignore-unknown --no-error-on-unmatched-pattern
fi
