# Public beta compatibility receipt — 2026-09-15

This is a synthetic integration review artifact for 40 independent PRs targeting
`Osmantic/ODS:public-beta`. It is not an upstream merge, deployment, or approval.
All 40 PRs are open and Ready for review at the audit snapshot below. Independent
human review and the per-PR live gates remain required.

- Tested production integration: [`a72e15781e4f41c3bd81f3b7f27f5b0fc5503a63`](https://github.com/tang-vu/DreamServer/commit/a72e15781e4f41c3bd81f3b7f27f5b0fc5503a63).
- Comparison base: `33155fb5c4a99242b6fa8eb6e2d9b108c869e3cc`. The integration includes every exact candidate in the table.
- Host: WSL Ubuntu Linux/amd64, Docker Desktop 29.5.3, Docker Compose 5.1.4,
  Python 3.11.16. UI tests use jsdom; this is not a native browser or hardware fleet qualification.
- GitHub check snapshot: `2026-09-15T08:28:06.7269998+00:00`. Current status can change after this receipt.
- Branch: `integration/beta-quality40-20260915`. Documentation added after the tested code head does not change the tested production tree.

## Combined validation

| Boundary / command | Result | What the evidence proves |
| --- | --- | --- |
| Dashboard API: `python -m pytest tests/ -q --tb=short` | 2,997 passed; 3 skipped; 2 warnings; 167.77 seconds | Combined HTTP, persistence and host-adapter fixture contracts, including shared-file resolutions. |
| Dashboard: `npm run lint`, `npm run build`, `npm test -- --maxWorkers=2` | Lint/build passed; 1,134 tests in 146 files passed; tests 216.86 seconds | Combined React behavior and production compilation; not a browser save dialog or live hardware data. |
| All 23 changed `ods/tests/test_*.py` files, `python -m pytest ... -q --tb=short` | 247 passed; 28 opt-in skips; 186.40 seconds | Rendered extension plans, public-boundary fixtures and offline contract tests. Native lifecycle evidence is separate below and in each PR. |
| Every command in the Makefile `test` target, each executed even after a failure | 84 of 87 suites passed | Includes the repository-wide BIND_ADDRESS sweep. Three failing suites also fail at the unchanged base on this host. |
| `make smoke` | Four platform-selection paths passed on the final code head | Selection and fixture contracts; not four native hardware executions. |
| `make simulate` | Wrapper exit 0; artifact 3/4 golden paths passed | Linux NVIDIA dry-run exits 1 at the root-user guard. The exact base reproduces the same artifact failure. This is not a full simulation pass. |
| `make bats` on the initial all-40 integration and unchanged base | 416 of 421 passed on both; same five named failures | Root/WSL limitations reproduced. Binding follow-ups change recipe publication/docs/tests only; BATS was not repeated after those follow-ups. |
| Repository-wide pre-commit hooks | Gitleaks, large-file and ShellCheck passed; private-key hook flags two existing test-marker files | All touched-file hooks passed. Full hooks are not reported green. Marker findings were reproduced on the unchanged base. |

The full `make gate` is **not green**: it stops at two existing no-sudo installer
assertions. Running the remaining Makefile suites separately exposes rather than
hides additional failures. The three baseline-failing suites are:

1. `tests/contracts/test-installer-contracts.sh`: two no-sudo Docker selection
   assertions, matching the existing #3158 defect.
2. `tests/contracts/test-amd-lemonade-contracts.sh`: 64 pass, one Windows
   PowerShell ROOT_DIR environment-handoff failure under this WSL interop session.
3. `tests/test-macos-uninstall-launchagents.sh`: the read-only plist unlink
   warning fixture does not model permission denial when the test runs as root.

The five identical baseline BATS failures are non-GNU OSTYPE/WSL platform
detection, a non-writable-parent fixture under root, and three root-preflight
fixtures. Full private-key scanning flags pre-existing marker strings in
`ods/tests/contracts/test-remote-provider-egress-policy.py` and
`ods/extensions/services/dashboard-api/tests/test_host_agent.py`; their matching
marker lines and the hook failure were checked at the base. No tests were weakened
or excluded to manufacture a green gate.

**Simulation receipt correction:** the initial report treated the wrapper's zero
exit as a pass. Inspection of `artifacts/installer-sim/summary.json` and
`golden-paths.json` shows Linux NVIDIA failed before capability/preflight signals
because the installer refuses root. Running `make simulate` at the unchanged
base produced the same 3/4 result and Linux exit 1. This explicit artifact result
supersedes earlier simulation-pass wording; no successful Linux installation is
claimed. The wrapper's failure-propagation behavior is outside these 40 scopes.

## Binding regression found during integration

The full Makefile audit caught ten late recipes publishing literal loopback ports
instead of respecting the existing ODS LAN opt-in. A 40-case regression produced
20 failures and 20 controls before fixing those same PRs. Each now uses
`${BIND_ADDRESS:-127.0.0.1}`, preserving loopback by default and native application
authentication/host/origin rules. The unset, explicit loopback, wildcard and
specific-interface cases assert rendered Docker publication and unchanged target
ports, credentials and storage. All ten changed-file hook suites and the existing
repository sweep pass. No additional PR was opened for these follow-ups.

Every affected recipe was then rerun against its real pinned native image at its
final candidate SHA. Tests use isolated loopback ports and unique test-owned data:

| PR | Native lifecycle suite at final candidate | Result |
| --- | --- | --- |
| [#5150](https://github.com/Osmantic/ODS/pull/5150) | `ODS_TEST_MAILPIT=1 python -m pytest tests/test_mailpit.py -q --tb=short` | 21 passed, 43.64 s |
| [#5153](https://github.com/Osmantic/ODS/pull/5153) | `ODS_TEST_MLFLOW=1 python -m pytest tests/test_mlflow.py -q --tb=short` | 22 passed, 111.02 s |
| [#5155](https://github.com/Osmantic/ODS/pull/5155) | `ODS_TEST_SILVERBULLET=1 python -m pytest tests/test_silverbullet.py -q --tb=short` | 19 passed, 99.33 s |
| [#5160](https://github.com/Osmantic/ODS/pull/5160) | `ODS_TEST_COUCHDB=1 python -m pytest tests/test_couchdb.py -q --tb=short` | 19 passed, 103.84 s |
| [#5165](https://github.com/Osmantic/ODS/pull/5165) | `ODS_TEST_PREFECT=1 python -m pytest tests/test_prefect.py -q --tb=short` | 13 passed, 130.06 s |
| [#5166](https://github.com/Osmantic/ODS/pull/5166) | `ODS_TEST_FILEBROWSER=1 python -m pytest tests/test_filebrowser.py -q --tb=short` | 13 passed, 71.03 s |
| [#5167](https://github.com/Osmantic/ODS/pull/5167) | `ODS_TEST_OPENOBSERVE=1 python -m pytest tests/test_openobserve.py -q --tb=short` | 11 passed, 84.56 s |
| [#5168](https://github.com/Osmantic/ODS/pull/5168) | `ODS_TEST_READECK=1 python -m pytest tests/test_readeck.py -q --tb=short` | 17 passed, 260.99 s |
| [#5169](https://github.com/Osmantic/ODS/pull/5169) | `ODS_TEST_POCKETBASE=1 python -m pytest tests/test_pocketbase.py -q --tb=short` | 18 passed, 197.61 s |
| [#5170](https://github.com/Osmantic/ODS/pull/5170) | `ODS_TEST_GATUS=1 python -m pytest tests/test_gatus.py -q --tb=short` | 13 passed, 127.17 s |

These exercise application-specific ingestion/CRUD, native authentication and
denial, persistent state after recreation, and documented rotation/recovery
boundaries as detailed in the linked PRs. The other recipe and defect live probes
are recorded at their own candidate SHAs in those PRs. Skipped opt-in tests in the
combined run are not represented as native passes. Remote browser/TLS deployment,
arm64 execution, native Windows/macOS activation, complete ODS fresh/update/doctor
flows, sustained load and crash consistency remain unqualified unless a specific
PR explicitly records such a probe. Rendered LAN publication does not qualify
native host allowlists, TLS, or cross-origin browser access.

## Merge order and reconciliation

Use the numbered order below as the reproducible batch order. Most candidates are
independent; every recipe adds to the shared environment/schema/catalog files.
Preserve all existing entries and all 18 new service IDs when resolving conflicts.
The final catalog has 81 unique entries, compared with 63 at the base. A wholesale
catalog regeneration can add an unrelated builtin discrepancy; do not replace the
reviewed additive union blindly.

- **#5058 before #5060:** keep the failed-dependency guard ahead of the
  already-enabled-target path and preserve the `failed_services` receipt for a
  failed target start. Merge resolution `1ab7dde4` plus integration-only regression
  commit `cfe464ba040dc5d794d4b384dc04bfbbbecf323e` exercises the authenticated HTTP
  path with an enabled intermediate, failed missing leaf and both target states.
- **#5079 before #5086:** retain the batched NetworkManager query and pass
  `_nmcli_env()` to it; retain the locale assertions with all-device response
  fixtures. Combined network suites passed 372 tests at
  `d77c6bf45cd4469baf37dcbc88f49b6f371c796e`; final API testing includes this union.
- **#5069 before #5125** when integrating the expanded resource inventory and its
  JSON export consumer. Both are included in final API/UI testing.
- **#5080 with existing #4946:** separate pair head
  [3b38c3078eb114ff04f8816c907843752e38bbc4](https://github.com/tang-vu/DreamServer/commit/3b38c3078eb114ff04f8816c907843752e38bbc4)
  preserves Paperless DNS and database credentials; two health and four password
  render cases passed. This does not qualify a full Paperless runtime.
- **#5085 with existing #4910:** separate pair head
  [19eff7a336517df7dae23604657030ca14b133a0](https://github.com/tang-vu/DreamServer/commit/19eff7a336517df7dae23604657030ca14b133a0)
  preserves ML dependency/cache and database migration guidance; two ML render
  and three database render cases passed. Native ML was tested on #5085, not
  repeated on this pair head.
- **#5125 with existing #3062 at 071ca9393646cac4a07434c7fc276f11183b84ed:** separate
  pair head [d84896e8cc18ca70f18b46a1a6d8bf365a84e93c](https://github.com/tang-vu/DreamServer/commit/d84896e8cc18ca70f18b46a1a6d8bf365a84e93c)
  retains both failed-refresh state and polling guard release in catch/finally.
  Both PRs' page regressions passed. This pair is separate from the 40-PR head.

Review and carry these resolutions when individually merging; merely squashing
each PR and resolving shared files mechanically does not reproduce this tree.
No upstream PR was merged or rewritten as part of this validation.

## Late overlap comparison

The preimplementation all-state semantic/file searches are recorded in each PR.
Two later submissions now overlap the same service directories and catalog IDs:

| Earlier candidate | Later candidate inspected | Comparison and decision |
| --- | --- | --- |
| [Phoenix #5092](https://github.com/Osmantic/ODS/pull/5092), `ba874b16293423178c83ca01610d0045e3d0e2da` | [#5161](https://github.com/Osmantic/ODS/pull/5161), `97ccefe615322d9a65d1d913115097c8b4d0229b` | Keep #5092 for review. It pins Phoenix 20.11.0 by digest, explicitly enables native authentication with initial admin credentials, integrates environment schema/example, and actually tests REST/OTLP ingestion, authentication denial, persisted traces after recreation and API-key revocation. #5161 uses version-7.40.0, sets a signing secret without an explicit auth-enable flag in its Compose definition, and adds gRPC publication plus a setup script. Its opt-in function runs only `docker compose config` with a missing secret; it never starts Phoenix. Therefore its reported guard is not live authentication, collection or persistence evidence. The extra gRPC protocol and credential generation are separate, unqualified scope, not evidence warranting replacing the tested HTTP recipe. |
| [Mailpit #5150](https://github.com/Osmantic/ODS/pull/5150), `77bbc374150ae0943a9455f76fe302c34e367749` | [#5163](https://github.com/Osmantic/ODS/pull/5163), `876dea8b46f407889b9c7f3303fad7483c022192` | Keep #5150 for review. It pins Mailpit 1.31.1 by digest, separates inbox and SMTP credentials, explicitly configures SQLite/retention, includes the authenticated install/config-sync boundary, and has real SMTP/MIME/attachment, anonymous-denial, recreation and credential-rotation evidence. #5163 uses v1.22.4 with `MP_SMTP_AUTH_ACCEPT_ANY=1`, no inbox credentials, and an opt-in function that only renders Compose. Its persistence claim is not exercised by that test. Both honor BIND_ADDRESS; the later recipe does not supply an independent tested behavior to port into this authenticated inbox. |

Both later PRs belong to another contributor. Neither was closed or modified.
The comparison is based on inspected diffs and test bodies at these exact SHAs,
not creation order or an unexecuted claim that the other images fail at runtime.
Both later generated catalogs also add the unrelated `pixel-inference` entry;
the reviewed batch preserves the base catalog and adds only its 18 new service IDs.
Do not merge both implementations of either service. Maintainers must select a
canonical recipe or explicitly reconcile the contract before merging.

## Review status and rollback

Ready means reviewers can act on the PR. It does not waive independent review,
declared live gates, conflicts, or maintenance decisions. In particular #5152's
RVC authenticated-mode contract requires a disable-first transition and human
review; its CPU/image probe is not a GPU voice conversion qualification.

The #5120 `linux-smoke` job has inconsistent GitHub metadata: its status remains
`IN_PROGRESS` while its conclusion is `SUCCESS`, its completion timestamp is
2026-09-15T02:18:49Z, and its parent workflow completed successfully. See the
[exact job](https://github.com/Osmantic/ODS/actions/runs/34920680978/job/104227907887).
This is recorded as stale check metadata, not a running test or a completely
green rollup. No empty commit, cancellation or artificial rerun was used to
refresh it. Other actual pending/failing checks, if any at the snapshot, are
listed in the machine-readable receipt and must finish before merge decisions.

No service is activated on a user installation by this integration branch.
Operators enabling recipes must preserve the documented credential and native
data ownership contracts. Before upgrades, stop the relevant service and back
up its complete data directory and private configuration. Restore the previous
pinned image with a compatible pre-migration backup; do not assume downgrading a
live database is safe. Reverting a recipe definition does not delete its data.
Behavior-only API/UI changes retain their documented rollback paths and do not
introduce a shared schema migration. Per-service exceptions, recovery procedures
and remaining live gates are in each PR and README.

## Exact candidate inventory

The PR links contain each concrete production path, root cause or new service
contract, semantic/file overlap search, boundary regression, focused commands,
negative evidence and platform limits. The adjacent JSON records check metadata,
combined command outcomes and the exact candidate inventory without runtime
credentials or raw container logs.

| Order | PR and behavior | Exact candidate SHA |
| --- | --- | --- |
| 1 | [#5058: fix(extensions): validate dependency subtrees before enable and start](https://github.com/Osmantic/ODS/pull/5058) | `90b69d30142f802729925989edf0ede096aeffdb` |
| 2 | [#5060: fix(extensions): block dependent starts after prerequisite failures](https://github.com/Osmantic/ODS/pull/5060) | `51bdc7c6beb02bd9f6006d00027fc00ab80c4fcd` |
| 3 | [#5062: fix(dashboard): review and retry failed template installations](https://github.com/Osmantic/ODS/pull/5062) | `a0c3bdd56bbd1ae8a49890b0966927978aadbfce` |
| 4 | [#5063: fix(extensions): retain rollback after a failed live-tree rename](https://github.com/Osmantic/ODS/pull/5063) | `91ec8436cbb4c86039c85836e4087244a6ece0c4` |
| 5 | [#5065: fix(dashboard): honor extension update confirmation states](https://github.com/Osmantic/ODS/pull/5065) | `f8a0586be811217a46ef4034ed64bf6d9fd04033` |
| 6 | [#5067: fix(dashboard): serialize manual and automatic console log reads](https://github.com/Osmantic/ODS/pull/5067) | `e817094717f77b486acf4833691afe4e0505c899` |
| 7 | [#5069: fix(resources): expose measured auxiliary containers](https://github.com/Osmantic/ODS/pull/5069) | `3579e4b4c0852eeb16d31bad5a24531e944c1c72` |
| 8 | [#5073: fix(host-agent): observe declared custom container identities](https://github.com/Osmantic/ODS/pull/5073) | `6fc3070d6fa6da97d788732d5fde61a3d6782df5` |
| 9 | [#5074: fix(network): retain connected state across duplicate Wi-Fi SSIDs](https://github.com/Osmantic/ODS/pull/5074) | `7a409e87d1fe5f0e0bd47d6fd933d6c3789256d0` |
| 10 | [#5076: fix(host-agent): preserve both container log streams](https://github.com/Osmantic/ODS/pull/5076) | `3b2870f7feeaa3164a8ce1558646d066385e304e` |
| 11 | [#5079: fix(network): stabilize nmcli output across host languages](https://github.com/Osmantic/ODS/pull/5079) | `0a86d94af739b95dcca6efc48c1d58891cc717f7` |
| 12 | [#5080: fix(paperless): expose the declared internal health hostname](https://github.com/Osmantic/ODS/pull/5080) | `6415ca8a6c9940c8cfd7f3a489dbeec6000252f9` |
| 13 | [#5085: fix(immich): start and persist the matching CPU machine-learning worker](https://github.com/Osmantic/ODS/pull/5085) | `f31363a5d71b212f2c8ece123523c45676a44708` |
| 14 | [#5086: fix(network): bound status queries and await complete host operations](https://github.com/Osmantic/ODS/pull/5086) | `915cb13d22af166648ca64ca9302a78ec4859f44` |
| 15 | [#5092: feat(extensions): add authenticated local Phoenix trace workspace](https://github.com/Osmantic/ODS/pull/5092) | `ba874b16293423178c83ca01610d0045e3d0e2da` |
| 16 | [#5093: feat(extensions): add authenticated VictoriaMetrics history](https://github.com/Osmantic/ODS/pull/5093) | `006c2b63b863f00b2c7a05f8096e403560e80f1d` |
| 17 | [#5094: feat(extensions): add scoped Kopia encrypted snapshots](https://github.com/Osmantic/ODS/pull/5094) | `1b7729628838aff9c9df36ad104e673c39db9b56` |
| 18 | [#5096: fix(label-studio): restrict local files to the dataset mount](https://github.com/Osmantic/ODS/pull/5096) | `efaa1330bd0aab07f8917223cd8b0f4361fa8f6f` |
| 19 | [#5117: feat(extensions): add authenticated Neo4j Bolt graph store](https://github.com/Osmantic/ODS/pull/5117) | `3e87b89fdf15628b7697bfe4afe3c5c080a1d289` |
| 20 | [#5118: fix(settings): enforce declared scalar environment constraints](https://github.com/Osmantic/ODS/pull/5118) | `cbce73d89624df238fe4f130432e28a00031def7` |
| 21 | [#5119: feat(extensions): add a local marimo notebook workspace](https://github.com/Osmantic/ODS/pull/5119) | `c26d70610ecee8cd3346608ec32155bb656eb7cd` |
| 22 | [#5120: fix(weaviate): disable implicit vendor telemetry](https://github.com/Osmantic/ODS/pull/5120) | `3ce514deb1823dec0176ed2c20c5c4c1ac09726d` |
| 23 | [#5122: feat(extensions): add persistent local Grafana dashboards](https://github.com/Osmantic/ODS/pull/5122) | `35a6837b393a4a58fc96b2c4ae24c436d9d0e0c7` |
| 24 | [#5123: fix(extensions): preserve env line boundaries during credential setup](https://github.com/Osmantic/ODS/pull/5123) | `fa72aa20cb4fdf354e8e67de7dc32cd93c87fa5e` |
| 25 | [#5124: fix(privacy): report verified shield runtime configuration](https://github.com/Osmantic/ODS/pull/5124) | `50a48a64d4fd8525437450e3dfc3322eb74a1d7a` |
| 26 | [#5125: feat(dashboard): export received service resource snapshots](https://github.com/Osmantic/ODS/pull/5125) | `8dfd45017825e03728d58a9a39d6e9d8e3f3a72e` |
| 27 | [#5129: fix(library): align XTTS and InvokeAI HTTP health contracts](https://github.com/Osmantic/ODS/pull/5129) | `fbec833bc0f5b432d9e934093eb102315d7fc1b5` |
| 28 | [#5135: feat(library): add authenticated VictoriaLogs log history](https://github.com/Osmantic/ODS/pull/5135) | `84b41c9254e447505bb829db4817b7d44686918c` |
| 29 | [#5145: feat(extensions): add authenticated local CalDAV and CardDAV storage](https://github.com/Osmantic/ODS/pull/5145) | `7eee44c48087f676404baa25d1cfa4ae27dbcc9a` |
| 30 | [#5150: feat(extensions): add authenticated local SMTP capture and email preview](https://github.com/Osmantic/ODS/pull/5150) | `77bbc374150ae0943a9455f76fe302c34e367749` |
| 31 | [#5152: fix(rvc): refuse unsupported API-key authentication settings](https://github.com/Osmantic/ODS/pull/5152) | `b7cf0d7f2ae65f1aa77a6988d46d1c240e2c8ac1` |
| 32 | [#5153: feat(extensions): add authenticated local MLflow experiment tracking](https://github.com/Osmantic/ODS/pull/5153) | `5aafde91357ba36951c761d1d1ce3cea0b1976f1` |
| 33 | [#5155: feat(extensions): add private SilverBullet Markdown workspace](https://github.com/Osmantic/ODS/pull/5155) | `768672004c3d0f40191a07129226a565839b127b` |
| 34 | [#5160: feat(extensions): add authenticated single-node CouchDB](https://github.com/Osmantic/ODS/pull/5160) | `945785e5af852164f57745d87adfb114e4f0b403` |
| 35 | [#5165: feat(extensions): add authenticated local Prefect flow server](https://github.com/Osmantic/ODS/pull/5165) | `7d9e2dd0a2a46540ffc20613713bd9e9c339348a` |
| 36 | [#5166: feat(extensions): add authenticated local File Browser workspace](https://github.com/Osmantic/ODS/pull/5166) | `9a9eec08d78cfe335fccaf8338723d62e2ecfe15` |
| 37 | [#5167: feat(extensions): add local OpenObserve log metric and trace search](https://github.com/Osmantic/ODS/pull/5167) | `9e52b8d57220c32916806a8ac874491e5259fbc9` |
| 38 | [#5168: feat(extensions): add authenticated Readeck reading library](https://github.com/Osmantic/ODS/pull/5168) | `8ac1032cfc258e9b30b8160a9aeddc1a2a7ece5c` |
| 39 | [#5169: feat(extensions): add pinned PocketBase application backend](https://github.com/Osmantic/ODS/pull/5169) | `f5782fdcd32e111b07d0160c5c18e000eed0d75e` |
| 40 | [#5170: feat(extensions): add native Gatus service history](https://github.com/Osmantic/ODS/pull/5170) | `86c3aaee423020c82d3dff87a79a9a7bf95d1b21` |
