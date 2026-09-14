# Immich

High-performance self-hosted photo and video backup solution with AI-powered organization. Features automatic backups from mobile devices, face recognition, object detection, and automatic tagging.

## Requirements

- **Machine learning:** CPU worker; no GPU allocation. The worker is limited to 4 GB RAM and 2 CPUs, in addition to the photo server and database.
- **Dependencies:** PostgreSQL, Redis, and the matching Immich machine-learning worker start with Immich.

For a new bundled PostgreSQL database, `IMMICH_DB_USER`, `IMMICH_DB_NAME` and
`IMMICH_DB_PASSWORD` configure both the application connection and database
initialization. User/database defaults remain `postgres`/`immich`. Set your own
password before first activation. The readiness probe uses the configured role
and database over TCP, so the temporary Unix-socket-only initialization server
does not count as ready. Readiness alone does not prove password authentication.

PostgreSQL initialization variables apply only to an empty data directory.
Changing them does not rename a role/database or rotate a password in existing
`data/immich/postgres`. Keep the original settings for an existing installation,
or perform a separately planned PostgreSQL migration with a verified backup.
Do not delete existing data to apply a configuration change. External databases
selected with `IMMICH_DB_HOST` remain operator-managed.


## Enable / Disable

```bash
ods enable immich
ods disable immich
```

Your data is preserved when disabling. To re-enable later: `ods enable immich`

## Access

- **URL:** `http://localhost:2283`

## First-Time Setup

1. Enable the service: `ods enable immich`
2. Open `http://localhost:2283`
3. Create an admin account on first launch
4. Download the Immich app for iOS or Android and connect to your server

## Machine learning

The bundled CPU worker runs Immich v1.131.3, matching the server. The server's default address, `http://immich-machine-learning:3003`, resolves inside the Compose network; this port is not published to the host. Changing `IMMICH_PORT` only changes the photo application's public port.

The first smart-search or face-detection job downloads its models. Internet access is needed for that download; models persist in `data/immich/model-cache` across container recreation. Uploads can start while the worker loads, but AI jobs need a ready worker and its models. GPU acceleration is not configured by this extension.

For an existing installation, refresh the extension definition and recreate/start Immich with its dependencies. Recreating only the application with `--no-deps` will not start the new worker. An existing custom machine-learning URL in Immich's settings remains authoritative; select the bundled address there if you want to switch back.

Rolling back the extension definition leaves the model cache on disk. Stop and remove only `ods-immich-machine-learning` if it becomes an orphan; keep the cache for reuse. Photo uploads and database volumes are separate from this cache.

## Configuration

| Variable | Description | Default |
|----------|------------|---------|
| `IMMICH_DB_PASSWORD` | PostgreSQL password (auto-generated) | _(required)_ |
