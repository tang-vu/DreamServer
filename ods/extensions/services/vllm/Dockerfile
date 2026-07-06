# vLLM OpenAI-compatible server.
#
# Pin a digest before merge. The upstream `:latest` tag moves and behavior
# changes between releases (docs/VLLM-SETUP.md). This draft leaves the tag
# unpinned on purpose — the exact digest to ship is an open question in the
# extension proposal. Replace with, e.g.:
#
#   FROM vllm/vllm-openai@sha256:<digest>
#
# The upstream image already sets the OpenAI api_server entrypoint, so the
# service `command:` in compose only supplies flags.
FROM vllm/vllm-openai:latest
