"""Cross-PR contracts for the quality40 integration candidate only."""

import json

from test_enabled_dependency_subtrees import disable_search, installation  # noqa: F401


def test_confirmed_missing_leaf_failure_blocks_both_target_states(test_client, installation):
    bundled, start = installation
    disable_search(test_client, start)
    intermediate = (bundled / "hermes/compose.yaml").read_bytes()
    start.side_effect = lambda action, service: service != "searxng"

    response = test_client.post(
        "/api/extensions/hermes-proxy/enable?auto_enable_deps=true",
        headers=test_client.auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["failed_services"] == ["searxng", "hermes-proxy"]
    assert response.json()["restart_required"] is True
    start.assert_called_once_with("start", "searxng")
    assert (bundled / "hermes/compose.yaml").read_bytes() == intermediate
    assert (bundled / "hermes-proxy/compose.yaml").is_file()
    for service in ("searxng", "hermes-proxy"):
        receipt = json.loads((bundled.parent / "extension-progress" / f"{service}.json").read_text())
        assert receipt["status"] == "error"
