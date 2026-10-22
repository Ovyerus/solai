#!/bin/sh
set -eu

: "${WISP_HANDLE:?Set WISP_HANDLE to the AT Protocol account that owns the Solai site}"
: "${WISPCTL_APP_PASSWORD:?Set WISPCTL_APP_PASSWORD to a dedicated AT Protocol app password}"

exec pnpm dlx wispctl@2.1.2 deploy --path ./dist --site solai --yes "$@" -- "$WISP_HANDLE"
