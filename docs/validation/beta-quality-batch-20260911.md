# Public-beta quality batch: 2026-09-11

Twenty independent PRs target `Osmantic/ODS:public-beta`; no upstream merge or deployment was performed. Each PR contains its production impact, semantic/file overlap search, boundary regressions, and rollback limitations.

## Candidate identity

- Frozen base: `f5f49b7d58c24a5b86b91650890a1b715f64c5a8`.
- All 20 production changes and their original tests: `14137c9a7b2c5f5a5c93190d77e44336e1bc3f78`.
- Final batch head: `62d00a61f48a224908c76b50674dc94b49866391`. Its only change after the full suites is the #4255 procfs test follow-up: treat `ProcessLookupError` during `/proc/<pid>/stat` read as an exited process. Six actual parent-loss process scenarios passed after that change.
- Separate compatibility head including existing #4221 and #3680: `89cbb5073a1848096df06d93dc8232ad09b61c9e`, on `integration/beta-quality-compat-20260911` in the fork. This is a validation specimen, not an extra PR.

| PR | Scope | Candidate head |
|---|---|---|
| [4222](https://github.com/Osmantic/ODS/pull/4222) | fix(beta): resume video wallpapers after interrupted playback | `7923cca0` |
| [4223](https://github.com/Osmantic/ODS/pull/4223) | fix(pixel): bind source clipboard feedback to the current copy | `aa2b37bb` |
| [4224](https://github.com/Osmantic/ODS/pull/4224) | fix(settings): preserve category keyboard selection during refresh | `b6d2a3ce` |
| [4225](https://github.com/Osmantic/ODS/pull/4225) | fix(pixel): reveal and announce keyboard search results | `4c80df7b` |
| [4226](https://github.com/Osmantic/ODS/pull/4226) | feat(preview): publish and inspect named project text files | `38b9b0b3` |
| [4227](https://github.com/Osmantic/ODS/pull/4227) | fix(history): preserve conversation data across partial storage writes | `bdd6f357` |
| [4228](https://github.com/Osmantic/ODS/pull/4228) | fix(beta): keep UUID-dependent actions working over HTTP LAN | `3373899e` |
| [4229](https://github.com/Osmantic/ODS/pull/4229) | fix(advice): reject obsolete provider inspection results | `1da53d3b` |
| [4230](https://github.com/Osmantic/ODS/pull/4230) | fix(dashboard): preserve identity drafts during refresh | `4b790e12` |
| [4231](https://github.com/Osmantic/ODS/pull/4231) | fix(dashboard): preserve newer wallpaper selections during import | `3adcc578` |
| [4232](https://github.com/Osmantic/ODS/pull/4232) | feat(dashboard): search saved prompt names and full text | `3063bef3` |
| [4233](https://github.com/Osmantic/ODS/pull/4233) | feat(pixel): navigate verified source by line and match case | `dc9ca837` |
| [4234](https://github.com/Osmantic/ODS/pull/4234) | feat(pixel): inspect custom preview breakpoints | `5148dc0c` |
| [4236](https://github.com/Osmantic/ODS/pull/4236) | feat(pixel): review local file contents before draft insertion | `317ebd49` |
| [4239](https://github.com/Osmantic/ODS/pull/4239) | fix(dashboard): retain video resources across gallery refreshes | `15fa5a5c` |
| [4242](https://github.com/Osmantic/ODS/pull/4242) | fix(api): close pooled LLM client at application shutdown | `b247e4e5` |
| [4244](https://github.com/Osmantic/ODS/pull/4244) | fix(setup): resolve chat from live inference configuration | `8cae63af` |
| [4249](https://github.com/Osmantic/ODS/pull/4249) | fix(schema): accept declared library extension configuration | `8e2f364d` |
| [4251](https://github.com/Osmantic/ODS/pull/4251) | feat(pixel): wrap long verified source lines for reading | `9e6a0049` |
| [4255](https://github.com/Osmantic/ODS/pull/4255) | feat(pixel): find and navigate messages in the current conversation | `aa661cea` |

## Combined validation

| Boundary / environment | Command or exercise | Receipt |
|---|---|---|
| Entire dashboard, Windows / Node 20 | `npx --yes --package=node@20 node node_modules/vitest/vitest.mjs run --maxWorkers 2` | **934 passed, 105 files** on `14137c9a`; see [log](beta-quality-20260911/dashboard-tests.txt). |
| Dashboard lint and build | `npx eslint src --quiet`; `npm run build` | Both passed; build used local Node 24.14.1 / shipped Vite 7.3.3. |
| Entire dashboard API, Linux / Python 3.11.16 | `python -m pytest tests/ -q` from dashboard-api | **2,709 passed, 1 skipped, 2 warnings** on `14137c9a`; installed production and test requirements. Existing AnyIO deprecation and AsyncMock warning remain. |
| Pixel preview broker, Linux / Python 3.11.16 | Four `test_workspace_preview*.py` files | **34 passed** on `14137c9a`; actual local HTTP server, content hash, MIME and nosniff assertions. |
| Library environment schema | `bash tests/test-validate-env.sh` | **47 checks passed** on #4249; public validator accepts catalog ports and rejects out-of-range DIFY_PORT for the correct reason. |
| Browser behavior | Headless Chromium **148.0.7778.96**, isolated profiles, 390px and 1280px | See [UI receipts](beta-quality-20260911/browser-receipts.json) and [lifecycle receipts](beta-quality-20260911/lifecycle-receipts.json). |

Browser checks used actual components, native dialogs, clipboard, downloaded bytes, sandboxed iframe dimensions, localStorage quota/storage events, IndexedDB and a generated decodable WebM. Network API responses and preview source bytes were local fixtures. These receipts do **not** establish live inference, remote provider, GPU, host-agent, installation or fleet compatibility. Browser runs used `14137c9a` production code.

- Source wrap reduces a 13,395px code line to the available 364px mobile width; copy and verified README download retain the exact 2,043 bytes, including CRLF. Case-sensitive find and logical line navigation were exercised.
- Custom iframe dimensions are actually 1023 by 900 CSS pixels, rotate to 900 by 1023, and retain the same script execution marker. Invalid dimensions cannot apply.
- File contents render inertly and do not enter the draft until explicit insertion. Full-text prompt filtering finds text beyond the 160-character preview. Identity refresh preserves a dirty draft until explicit adoption.
- Current-conversation find uses a real native dialog, pages 60 matches, focuses the selected message, and preserves the unsent draft.
- Real browser quota: 5,061 filler entries exhausted storage; after releasing four entries, the new current record committed while the library write raised `QuotaExceededError`. The old library was still present, while reload and a second tab recovered the newer current record. After freeing space and saving successfully, the public-beta legacy reader saw the new text.
- Real video: WebM decoding and playback passed; focus refresh retained its Blob URL with zero new load events; pause/resume worked; a later Forest selection survived a pending second import.

Reviewed screenshots: [mobile conversation find](beta-quality-20260911/conversation-find-mobile.png), [mobile source wrap](beta-quality-20260911/source-wrap-390.png), [desktop source wrap](beta-quality-20260911/source-wrap-1280.png), [file review](beta-quality-20260911/local-file-review-mobile.png), [prompt search](beta-quality-20260911/prompt-search-mobile.png), [viewport](beta-quality-20260911/custom-viewport.png). The harness renders selected components in a minimal container; it is not a full installed product screenshot.

## Merge order and compatibility

All 20 PRs originate independently from the frozen public-beta base. Suggested review/merge order is the table order; keep #4227 out until independent storage review completes. There is no runtime dependency requiring the batch to land atomically.

- Internal combined merge: only `PixelAdvice.test.jsx` conflicted between #4228 and #4229. Retain both the secure UUID regression and the provider read-order regressions. Production files merged automatically. The combined 934-test run includes both.
- #4223 and #4234 contain the same RemoteProvider test hydration follow-up; retain one identical awaited initial Base URL assertion. This fixes a demonstrated CI race without changing provider production behavior.
- Existing #4221 plus #4232: retain both `query`/filtered items and `isOpen`/transfer lifecycle state in `PixelPromptLibrary.jsx`. On compatibility head, both test files passed: **11 tests**.
- Existing #3680 plus #4244: Git merged setup.py without conflict but dropped `import json`, which the response decoder exception tuple needs. The first compatibility run exposed **3 failures / 77 passes**. Restoring that import produced **86 passing setup/router/live-route tests**. Preserve the import when rebasing or merging #3680; the routing PR itself does not need it. The fix is recorded on the separate compatibility head.
- These receipts establish the specific combined candidates, not arbitrary future merges or all other open PRs. Re-run affected tests after conflict resolution or base changes.

## Negative gates and readiness limits

The full local release gate is **not green**:

- `make lint` and `make smoke` passed.
- `make test` stopped at the unchanged noninteractive-sudo contract: 3 passed / 2 failed under the root WSL environment. Existing #3158 owns this defect; no duplicate PR was created.
- `make bats`: **416 passed / 5 failed**. The failures depend on WSL detection (expected Linux, actual WSL), root rejection in three preflight fixtures, and the non-writable-parent fixture reaching a low-disk warning first (14GB available versus 20GB required). These tests were not silently skipped or rewritten for this batch.
- `make simulate` exited zero but its receipt marks Linux NVIDIA **fail**, with all Linux dry-run evidence flags absent. Three other simulated golden paths passed. Exit zero is not proof of installer readiness.
- No fresh installation, hardware activation, authenticated live inference, Linux desktop browser, macOS browser, or Windows WSL deployment was performed. Shared source coverage is not host coverage.
- #4227 remains **draft** despite passing tests and browser quota/reload/second-tab/successful-save-downgrade probes. Independent human review is still required. Concurrent edits are not transactional; before downgrade, finish a successful save and export important conversations. Interrupted partial-write downgrade without reconciliation is not certified.

CI snapshot is stored with exact per-PR heads in [ci-receipts.json](beta-quality-20260911/ci-receipts.json). #4223's openSUSE job failed while retrieving repository metadata/key and consequently lacked rsync. An upstream rerun request was rejected because the authenticated user lacks repository admin rights. A maintainer rerun is needed; no empty commit was created to disguise this infrastructure failure. #4255's first run exposed an existing procfs read race (fixed in `aa661cea`, six real process tests passed); its Ubuntu package prerequisite job also failed to reach archive.ubuntu.com. Its latest run is tracked in the PR receipt.

## Reproduce browser probes

In a disposable checkout of `62d00a61`, install dashboard dependencies, copy `qa-quality.html` and `qa-quality.jsx` from this evidence directory into the dashboard root, and extract public-beta's `src/lib/pixelConversations.js` as `qa-legacy-conversations.js`, rewriting its `./pixelConversationLabels` import to `/src/lib/pixelConversationLabels`. Start Vite bound to `127.0.0.1:44371`. Install Python Playwright and Chromium, then run the two supplied Python scripts. They create isolated browser contexts and fixtures; they do not use the operator's existing browser profile. Scratch harness files were removed and the owned Vite process stopped after validation.

## Portfolio and scope accounting

At batch start, September creation counts were tang-vu 120 and second place 93 (lead 27), with 451 open tang-vu PRs. After these 20 PRs, the observed counts were 140 and 117 (lead 23), with 471 open. This is an advisory backlog signal; ranking did not waive production reachability or overlap gates. No additional PR was opened for the integration or compatibility reports.
