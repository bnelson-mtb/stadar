# Deploying Stadar

The app ships as a **single container**: the .NET API serves the built React
client from `wwwroot`, so there is one URL, no CORS setup, and one thing to
host. The `Dockerfile` at the repo root builds everything.

```
docker build -t stadar .
docker run -p 8080:8080 -e Ticketmaster__ApiKey=<your-key> stadar
```

## Configuration

| Setting | Required | Notes |
|---|---|---|
| `Ticketmaster__ApiKey` | Yes | Ticketmaster Discovery API key. Set as a **secret** env var on the host — never commit it. |
| `Cors__AllowedOrigins__0`, `__1`, … | No | Only needed if the client is hosted on a different origin than the API. |
| `VITE_API_URL` | No | Client **build-time** var. Leave unset for the single-container setup (client uses same-origin requests). |

Health probe endpoint: `GET /healthz` (returns 200).
The container listens on port **8080** (HTTP; the platform's edge terminates TLS).

## Hosting options

### Azure Container Apps (recommended — logos already live in Azure)

One command builds from source (via ACR) and deploys with a public HTTPS URL:

```bash
az login
az containerapp up \
  --name stadar \
  --resource-group stadar-rg \
  --location westus3 \
  --source . \
  --ingress external \
  --target-port 8080 \
  --env-vars Ticketmaster__ApiKey=<your-key>
```

The command prints the public URL (`https://stadar.<hash>.westus3.azurecontainerapps.io`).
Scale-to-zero keeps cost near-free at user-testing traffic levels. Re-run the
same command to deploy updates.

### Render

1. New → Web Service → connect the GitHub repo.
2. Runtime: **Docker** (it finds the root `Dockerfile` automatically).
3. Add env var `Ticketmaster__ApiKey`, and set `PORT` to `8080` if not auto-detected.
4. Set health check path to `/healthz`.

Free tier works for testing (cold starts after idle).

### Fly.io / Railway

Both deploy a root `Dockerfile` directly (`fly launch` / connect repo). Set
`Ticketmaster__ApiKey` as a secret and expose internal port 8080.

## Things to know for user testing

- **Ticketmaster rate limits**: the default Discovery API key allows
  5 requests/second and 5,000 calls/day. The API caches each state's events
  for 5 minutes in memory, so testers mostly hit cache — but a wide burst of
  distinct states or event-detail pages counts against the quota.
- **In-memory cache**: the cache is per-instance; keep the app at 1 replica
  (fine for testing) or expect some duplicate upstream calls.
- **No auth / no database**: saved events and favorites live in each tester's
  browser localStorage. Clearing browser data clears them.
