# vLLM extension (draft, opt-in)

High-concurrency, OpenAI-compatible inference for **NVIDIA** hosts. This is an
**optional** backend that runs *alongside* the default `llama-server`, not as a
replacement — route to whichever fits the workload.

> **Status:** draft for discussion. See the proposal issue and
> [`docs/VLLM-SETUP.md`](../../../docs/VLLM-SETUP.md), which this extension
> packages into a first-class service.

## When to enable it

Enable vLLM when **all** of these hold (per `docs/VLLM-SETUP.md`):

- You serve **many concurrent** users/agents (roughly >10–15), where continuous
  batching wins — not single-user latency.
- You have a **high-end NVIDIA** GPU (24 GB+ VRAM) with headroom for a generous
  KV cache.
- You are **not** swapping models frequently (vLLM holds one model resident;
  reloads take 60–120 s).

Stay on `llama-server` for single-user, frequent model switching, VRAM-tight
setups, or any AMD / Apple Silicon / CPU host — vLLM is CUDA-first.

## Enable / disable

Disabled by default: only `compose.yaml.disabled` ships, so the compose resolver
never auto-starts it. To turn it on, enable it from the dashboard Extensions
page (or rename `compose.yaml.disabled` → `compose.yaml` and re-resolve the
stack). Disable by reversing that.

## Configuration (`.env`)

Defaults are the load-tested values from `docs/VLLM-SETUP.md`:

| Variable | Default | Purpose |
|---|---|---|
| `VLLM_PORT` | `8001` | Host port (container listens on 8000). |
| `VLLM_MODEL` | `/models` | Model dir/file under the mounted `./data/models`. |
| `VLLM_SERVED_MODEL_NAME` | `local-model` | Name clients pass as `model`. |
| `VLLM_MAX_MODEL_LEN` | `65536` | Per-slot KV allocation. Biggest tuning lever — pick the shortest context that covers your real workload. |
| `VLLM_GPU_MEMORY_UTILIZATION` | `0.92` | Leaves ~8% VRAM for the CUDA runtime/driver. |
| `VLLM_MAX_NUM_BATCHED_TOKENS` | `8192` | Chunked-prefill chunk size. |
| `VLLM_MAX_NUM_SEQS` | `256` | Concurrent request ceiling. |
| `VLLM_TENSOR_PARALLEL_SIZE` | `1` | GPUs to shard each layer across. |
| `VLLM_GPU_COUNT` | `1` | GPUs reserved for the container. |

## Gotchas

- **Warm-up:** `/health` returns 503 for ~90–120 s while weights load and CUDA
  graphs warm up. The healthcheck `start_period` is 180 s to cover this.
- **Qwen3 think-mode:** Qwen3 chat templates emit `<think>…</think>` blocks by
  default. Consumers that don't strip them (a UI/agent) should set
  `chat_template_kwargs.enable_thinking = false` per request.
- **Routing seam:** Perplexica already talks to an OpenAI-compatible base via
  `LLM_API_URL`, so it can be pointed at `http://ods-vllm:8000/v1` on the
  stack network. See `docs/VLLM-SETUP.md` → "Existing ODS integration".
