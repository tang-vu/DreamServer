#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UPDATE_SCRIPT="$ROOT_DIR/ods-update.sh"

fail() { echo "[FAIL] $*"; exit 1; }
pass() { echo "[PASS] $*"; }

command -v jq >/dev/null 2>&1 || fail "jq is required"
[[ -f "$UPDATE_SCRIPT" ]] || fail "ods-update.sh not found"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

INSTALL_DIR="$TMP_DIR/runtime"
BIN_DIR="$TMP_DIR/bin"
CURL_LOG="$TMP_DIR/curl.log"
mkdir -p "$INSTALL_DIR" "$BIN_DIR"
cp "$UPDATE_SCRIPT" "$INSTALL_DIR/ods-update.sh"
chmod +x "$INSTALL_DIR/ods-update.sh"
export CURL_LOG

cat > "$BIN_DIR/curl" <<'SH'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "${CURL_LOG:?}"
case "${CURL_MODE:?}" in
    fail)
        exit 22
        ;;
    missing-tag)
        printf '%s\n' '{"body":"untagged notes"}'
        ;;
    latest)
        printf '%s\n' '{"tag_name":"v9.9.9","body":"Latest release notes"}'
        ;;
    explicit)
        printf '%s\n' '{"tag_name":"v1.2.3","body":"Explicit release notes"}'
        ;;
    *)
        exit 64
        ;;
esac
SH
chmod +x "$BIN_DIR/curl"

assert_single_request() {
    local description="$1"
    local request_count
    request_count=$(wc -l < "$CURL_LOG")
    [[ $request_count -eq 1 ]] || fail "$description made $request_count requests"
}

: > "$CURL_LOG"
failed_fetch_exit=0
CURL_MODE=fail PATH="$BIN_DIR:$PATH" \
    bash "$INSTALL_DIR/ods-update.sh" changelog > "$TMP_DIR/failed-fetch.out" 2>&1 \
    || failed_fetch_exit=$?
[[ $failed_fetch_exit -ne 0 ]] || fail "failed latest-release fetch should return non-zero"
grep -q "Could not fetch latest release notes" "$TMP_DIR/failed-fetch.out" \
    || fail "failed fetch did not explain the error"
assert_single_request "failed latest-release fetch"
pass "failed latest-release fetch stops after one request"

: > "$CURL_LOG"
missing_tag_exit=0
CURL_MODE=missing-tag PATH="$BIN_DIR:$PATH" \
    bash "$INSTALL_DIR/ods-update.sh" changelog > "$TMP_DIR/missing-tag.out" 2>&1 \
    || missing_tag_exit=$?
[[ $missing_tag_exit -ne 0 ]] || fail "missing latest-release tag should return non-zero"
grep -q "did not include a tag" "$TMP_DIR/missing-tag.out" \
    || fail "missing tag did not explain the error"
assert_single_request "missing latest-release tag"
pass "missing latest-release tag stops after one request"

: > "$CURL_LOG"
CURL_MODE=latest PATH="$BIN_DIR:$PATH" \
    bash "$INSTALL_DIR/ods-update.sh" changelog > "$TMP_DIR/latest.out" 2>&1 \
    || { cat "$TMP_DIR/latest.out"; fail "latest changelog should succeed"; }
grep -q "Latest release notes" "$TMP_DIR/latest.out" \
    || fail "latest release body was not displayed"
assert_single_request "successful latest changelog"
pass "latest changelog reuses the fetched release response"

: > "$CURL_LOG"
CURL_MODE=explicit PATH="$BIN_DIR:$PATH" \
    bash "$INSTALL_DIR/ods-update.sh" changelog v1.2.3 > "$TMP_DIR/explicit.out" 2>&1 \
    || { cat "$TMP_DIR/explicit.out"; fail "explicit changelog should succeed"; }
grep -q "Explicit release notes" "$TMP_DIR/explicit.out" \
    || fail "explicit release body was not displayed"
grep -q "/releases/tags/v1.2.3" "$CURL_LOG" \
    || fail "explicit changelog did not request the selected tag"
assert_single_request "explicit changelog"
pass "explicit version lookup remains unchanged"
