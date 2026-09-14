# Public-beta: 30-PR integration receipt

Generated 2026-09-14T05:25:54+00:00. This receipt accompanies the 30 public-beta pull requests below.

Code candidate: [a38a38a2303724b2b2a3bfba6324fc40a67154ba](https://github.com/tang-vu/DreamServer/commit/a38a38a2303724b2b2a3bfba6324fc40a67154ba). Upstream base: `d49ad4bbc760be319de7f4c9b9a93b1f18fe3922`. Every candidate SHA below is an ancestor of this integration head. The report commit itself changes documentation only.

## Merge and review guidance

The PRs are independently useful. Shared changes are additive catalog entries and library README rows/counts. Preserve every service ID and its exact entry when reconciling; recompute the library count from manifest directories (43 in this candidate). Do not blindly regenerate the entire catalog and promote unrelated uncataloged services. No production-code conflict required manual resolution.

Suggested order for currently open, non-draft PRs: #4886, #4887, #4888, #4889, #4894, #4896, #4898, #4900, #4903, #4910, #4912, #4914, #4919, #4922, #4924. Existing merged PRs are already represented by the base/ancestry. The shared-file order is a review convenience, not a runtime dependency.

Keep #4909 (Gitea) in draft for independent human review of existing-installation migration. Its exact-head Ubuntu live CI passed, including legacy configuration copy, private repository state and recreation; a cold ext4 initialization on the local WSL host exceeded its health budget. ARM, customized UID layouts, native desktop bind ownership and complete backup restoration remain unqualified. The batch is not a blanket hardware-release qualification.

The integration history records initial catalog/README resolutions, an update to current public-beta, and the reconciled Memos head. The latter shared catalog entries were byte-equivalent as JSON objects; the integration retained the seven additional independent application entries.

## Validation

Host: Linux amd64 under WSL, Docker 29.5.3 / Compose 5.1.4; Python 3.11.16 for API/runtime suites and the pinned LiteLLM environment. Browser fixtures use Playwright 1.62.0 Chromium. Individual PR bodies identify any Python 3.14, platform-contract and hosted Ubuntu coverage.

- **final-integration-api**: passed in 167.08 s. From `ods/extensions/services/dashboard-api`: `pytest -q tests`. 2858 passed, 3 skipped, 2 warnings in 164.30s (0:02:44)
- **final-integration-ui**: passed in 369.55 s. From `ods/extensions/services/dashboard`: `npm test -- --run --maxWorkers=2`. Test Files  134 passed (134); Tests  1069 passed (1069)
- **final-kuma-isolated**: passed in 74.3 s. From `ods`: `env ODS_TEST_UPTIME_KUMA_BROWSER=1 pytest -q tests/test_uptime_kuma_extension.py`. 2 passed in 73.73s (0:01:13)
- **final-integration-scoped**: passed in 4.08 s. From `.`: `Scoped pre-commit and git diff --check`. Scoped hooks passed for 68 changed files
- **final-integration-compose**: passed in 2.35 s. From `ods`: `Compose render of core plus 13 library recipes for CPU/NVIDIA/AMD/Apple`.
- **final-integration-ui-lint**: passed in 52.41 s. From `ods/extensions/services/dashboard`: `npm run lint`. ✖ 597 problems (0 errors, 597 warnings)
- **final-integration-ui-build**: passed in 42.71 s. From `ods/extensions/services/dashboard`: `npm run build`. ✓ built in 41.27s
- **final-integration-schema**: passed in 21.15 s. From `ods`: `bash scripts/validate-manifest-schema.sh`. Summary: 73 total, 73 valid, 0 errors, 5 warnings
- **final-integration-litellm**: passed in 5.45 s. From `ods/extensions/services/litellm`: `env ODS_TEST_LITELLM_PIN=1 pytest -q tests/test_cache_creation_telemetry.py`. 7 passed in 4.26s
- **final-integration-cli-contract**: passed in 0.33 s. From `ods`: `python3 tests/contracts/test-ods-cli-contracts.py`. [PASS] ods-cli static command contract

The combined Compose plans validate service/container identity and published-port uniqueness, not live GPU operation or simultaneous application load. The AMD render reports an unset LITELLM_KEY in this non-secret fixture. The live suite creates isolated services, checks their public boundaries, and cleans up each project; it is not a concurrent capacity benchmark.

### Live service and browser validation

**Combined live suite: 52 passed, 1 failed**, 1024.49 seconds across 15 modules. Uptime Kuma exceeded the unchanged 150-second subprocess deadline while Docker Compose was starting its containers; the failure occurred before browser account/monitor assertions. The same candidate and unchanged test then passed both Kuma cases in the isolated rerun recorded above. This does not erase the negative result: cold startup under the observed WSL I/O contention remains unqualified. No timeout, readiness assertion or production behavior was relaxed. The suite cleaned up its projects after the failure.

The successful combined cases include ntfy/Miniflux/Memos/Linkding private data lifecycles, IT-Tools/CyberChef browser processing, PairDrop consent and transferred bytes, Kiwix content/search, draw.io edit/save/export/reopen, both Gitea fresh/legacy lifecycles, Immich database identity, Baserow runtime settings, verified TLS probes and CLI benchmark JSON. These are fixture-level runtime receipts, not full hardware/fleet certification.

To reproduce the combined suite, install the dependencies declared by the selected tests and their workflow files (including Playwright Chromium and libzim 3.13), then run from `ods/` with Docker available. The opt-in variables below are read directly from these test modules:

```python
import os, re, subprocess
from pathlib import Path
names = [
    "ntfy_extension", "miniflux_extension", "memos_extension",
    "linkding_extension", "it_tools_extension", "uptime_kuma_extension",
    "cyberchef_extension", "pairdrop_extension", "kiwix_extension",
    "drawio_extension", "gitea_rootless_state", "immich_database",
    "baserow_public_url", "tls_endpoint", "cli_benchmark_json",
]
files = [Path("tests") / f"test_{name}.py" for name in names]
env = dict(os.environ)
for path in files:
    for key in re.findall(r"ODS_TEST_[A-Z_]+", path.read_text()):
        env[key] = "1"
subprocess.run(["python", "-m", "pytest", "-q", *map(str, files)],
               env=env, check=True)
```

### Local full gate limitations

`make -k gate` exit status: **2**. The full transcript is retained locally. The failing assertions were:

- FAIL: no-sudo run promoted Docker to sudo
- FAIL: no-sudo run invoked raw sudo
- not ok 115 detect_platform: treats non-gnu Linux OSTYPE values as Linux
- not ok 217 validate_install_path: non-writable parent returns error
- not ok 244 preflight: passes when compose files exist
- not ok 245 preflight: detects existing installation
- not ok 246 preflight: warns about missing optional tools

The 73 commands after the first blocking Makefile fixture were also run individually: 72 passed, 1 failed.

- `bash tests/test-macos-uninstall-launchagents.sh`: exit 1

The remaining macOS plist-removal warning fixture relies on a permission failure that root bypasses. Its test and uninstall producer are unchanged from the exact upstream base. Canonical existing PR [#3160](https://github.com/Osmantic/ODS/pull/3160) injects that failure for root execution; this batch does not open a duplicate.

The original baseline exhibited the no-sudo/root fixture failures and five BATS root/WSL failures. Do not call the local full gate green when those remain. Shell/Python syntax, four platform smoke contracts and installer simulation are reported separately in its transcript. Repository fixture private-key detections in an all-files hook are not replaced by scoped-hook success.

Earlier local attempts encountered missing cached frontend dependencies, timing failures under heavy concurrency and an interrupted WSL session. Dependencies were installed from the lockfile; the final UI run uses two workers. Interrupted runs have no completion receipt and are not counted as passes. No production timing or error policy was weakened to make these runs pass.

## Exact PR candidates and current CI

| # | PR | Candidate SHA | State | CI |
|---:|---|---|---|---|
| 1 | [#4873 fix(downloads): bound cancellation acknowledgements](https://github.com/Osmantic/ODS/pull/4873) | `6d4fa4b0b8955cb910e5c0929a06dba44e252287` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 2 | [#4874 fix(privacy): keep custom published ports aligned with the container listener](https://github.com/Osmantic/ODS/pull/4874) | `9bb4dc9864a5fe7987a15002b36fb8fc172a5628` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 3 | [#4875 feat(settings): protect unsaved configuration on browser reload and close](https://github.com/Osmantic/ODS/pull/4875) | `434e1a589d3742442fe8b34031e4c8ae59faa050` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 4 | [#4876 fix(persona): identify running applications by their manifest containers](https://github.com/Osmantic/ODS/pull/4876) | `cc7f66f1fbbce4db2171d585a2bc15ec428f3cdc` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 5 | [#4877 feat(usage): export daily token activity as CSV](https://github.com/Osmantic/ODS/pull/4877) | `5ddf3d1abd529718fb2ee03a5ba16ce93553ad36` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 6 | [#4878 perf(gpu): coalesce concurrent detail probes and retain the full cache TTL](https://github.com/Osmantic/ODS/pull/4878) | `abb5deaec5ba53ae751e2764a791d6616d549848` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 7 | [#4879 fix(gpu): advance history through telemetry outages](https://github.com/Osmantic/ODS/pull/4879) | `586a6d9c6a539834324782b9befc942017b0c554` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 8 | [#4880 feat(extensions): add authenticated local ntfy notifications](https://github.com/Osmantic/ODS/pull/4880) | `bdb2986ae3ef41ec5490a6cd47938b5c4aa5d4c2` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 9 | [#4881 feat(extensions): add Miniflux feed reading and research API](https://github.com/Osmantic/ODS/pull/4881) | `0a16723a011fd0bd054fff0687ec53a8bcb0d1db` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 10 | [#4882 fix(support): restrict collected logs to the ODS container namespace](https://github.com/Osmantic/ODS/pull/4882) | `73648698eaff6dbbc7271a9610b0dd9e3e5506ba` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 11 | [#4883 feat(healthcheck): inspect first-hop HTTP responses without redirects](https://github.com/Osmantic/ODS/pull/4883) | `4da7c2ae73204193357b4e9cc7dfd36a559c439b` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 12 | [#4884 feat(models): filter Hugging Face artifacts by filename or quantization](https://github.com/Osmantic/ODS/pull/4884) | `bb944c30a63fbcc5b88017f7a868662849ca99af` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 13 | [#4885 fix(models): measure benchmark throughput from the request itself](https://github.com/Osmantic/ODS/pull/4885) | `b28eac2f9d334a249cc9c54c12130bde70848888` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 14 | [#4886 feat(cli): emit JSON chat round-trip benchmark receipts](https://github.com/Osmantic/ODS/pull/4886) | `50ff7ff35cf46988247d0fde384b0d00e7460324` | OPEN | SKIPPED: 4, SUCCESS: 32 |
| 15 | [#4887 feat(extensions): add private Memos notes and workflow API](https://github.com/Osmantic/ODS/pull/4887) | `431d99f63fb10d06ba7cac098605fa6732d85362` | OPEN | QUEUED: 30, SKIPPED: 3, SUCCESS: 2 |
| 16 | [#4888 fix(litellm): retain normalized cache creation usage in telemetry](https://github.com/Osmantic/ODS/pull/4888) | `31d60c2c041b164515843f4f12f36454d29c6112` | OPEN | SKIPPED: 4, SUCCESS: 32 |
| 17 | [#4889 test(cli): align the release contract with remote provider enable](https://github.com/Osmantic/ODS/pull/4889) | `17fb0cc3efd8d15fc934a171422d3cd16ab225a7` | OPEN | SKIPPED: 4, SUCCESS: 32 |
| 18 | [#4891 feat(integrations): download timestamped service snapshots](https://github.com/Osmantic/ODS/pull/4891) | `35294836f6cbf97be5e3e91ea7c8adf0385e6fbd` | MERGED | SKIPPED: 4, SUCCESS: 32 |
| 19 | [#4894 feat(extensions): add private Linkding research bookmarks](https://github.com/Osmantic/ODS/pull/4894) | `2236db8b47546b7fc41b00c8f148da1f91658774` | OPEN | SKIPPED: 4, SUCCESS: 32 |
| 20 | [#4896 feat(resources): expose authenticated kernel pressure snapshots](https://github.com/Osmantic/ODS/pull/4896) | `40786e2bcc49f3a5c4de5d56cc1cee467faf9a7b` | OPEN | SKIPPED: 4, SUCCESS: 32 |
| 21 | [#4898 feat(extensions): add local IT-Tools browser utilities](https://github.com/Osmantic/ODS/pull/4898) | `a5580ea0872c8e0ed3af94ba45f66440dfea44df` | OPEN | SKIPPED: 4, SUCCESS: 32 |
| 22 | [#4900 feat(extensions): add authenticated Uptime Kuma monitoring](https://github.com/Osmantic/ODS/pull/4900) | `8187e87c641f0bb3e667a66d9ba642712d14ddce` | OPEN | SKIPPED: 4, SUCCESS: 32 |
| 23 | [#4903 feat(ops): add verified TLS certificate expiry diagnostic](https://github.com/Osmantic/ODS/pull/4903) | `384b59d952051f3984d66c01afa4632115ba0166` | OPEN | SKIPPED: 4, SUCCESS: 32 |
| 24 | [#4909 fix(gitea): initialize rootless storage and persist instance configuration](https://github.com/Osmantic/ODS/pull/4909) | `262df3f18d77fd4a531bf854ce86a5d5a048e24b` | DRAFT | SKIPPED: 4, SUCCESS: 33 |
| 25 | [#4910 fix(immich): align database identity and TCP readiness](https://github.com/Osmantic/ODS/pull/4910) | `3e8f419b2907004e00463a55fdba2d358ecff24f` | OPEN | SKIPPED: 4, SUCCESS: 33 |
| 26 | [#4912 fix(baserow): derive default public URL from published port](https://github.com/Osmantic/ODS/pull/4912) | `53cf5fa24744ee7febc800f5f96d72431fae9593` | OPEN | SKIPPED: 4, SUCCESS: 33 |
| 27 | [#4914 feat(extensions): add local CyberChef data recipes](https://github.com/Osmantic/ODS/pull/4914) | `746def198e7fc2fd7e16574eee64812da6ef2443` | OPEN | SKIPPED: 4, SUCCESS: 33 |
| 28 | [#4919 feat(extensions): add direct PairDrop browser file transfer](https://github.com/Osmantic/ODS/pull/4919) | `83d3bc826d0edd13b106d549d57f803d061dfdb1` | OPEN | SKIPPED: 4, SUCCESS: 33 |
| 29 | [#4922 feat(extensions): add Kiwix offline knowledge archives](https://github.com/Osmantic/ODS/pull/4922) | `12ce56c44ef1f1a39236e0714dfe125e8db4b4d1` | OPEN | SKIPPED: 4, SUCCESS: 33 |
| 30 | [#4924 feat(extensions): add local draw.io diagram editing](https://github.com/Osmantic/ODS/pull/4924) | `9ddfb0450ece3013a44785f943d12e1b73d99c94` | OPEN | SKIPPED: 4, SUCCESS: 33 |

CI status is an observation at report generation, not a guarantee about later rebases or upstream changes. A queued job has not passed. Individual PR bodies retain focused commands, runtime limits, overlap searches, migration and rollback details.
