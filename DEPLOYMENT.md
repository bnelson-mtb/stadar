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

> **Student-subscription note:** ACR Tasks (Azure's server-side image builds,
> what `az containerapp up --source .` uses) are disabled on Azure for
> Students. Images must be built locally (or on the GitHub Actions runner)
> with Docker and pushed to the registry. The subscription's region policy
> also restricts new resources to specific regions — `westus3` is allowed.

Current resources (resource group `stadar-rg`):

| Resource | Name |
|---|---|
| Container App | `stadar` (env `stadar-env`, westus3) |
| Container Registry | `ca759b5dd5aeacr.azurecr.io` (Basic) |

First deploy / manual deploy with local Docker:

```bash
az login
az acr login --name ca759b5dd5aeacr
docker build -t ca759b5dd5aeacr.azurecr.io/stadar:latest .
docker push ca759b5dd5aeacr.azurecr.io/stadar:latest
az containerapp up \
  --name stadar \
  --resource-group stadar-rg \
  --location westus3 \
  --image ca759b5dd5aeacr.azurecr.io/stadar:latest \
  --ingress external \
  --target-port 8080 \
  --env-vars Ticketmaster__ApiKey=<your-key>
```

The command prints the public URL (`https://stadar.<hash>.westus3.azurecontainerapps.io`).
Scale-to-zero keeps cost near-free at user-testing traffic levels. Day to day
you shouldn't need this — CI deploys on every push to `main` (next section).

## Continuous deployment (GitHub Actions)

`.github/workflows/deploy.yml` runs on every push to `main`: it runs the API
tests and client build, then builds the Docker image **on the runner**,
pushes it to the registry, and points the Container App at the new image
(tagged with the commit SHA, so rollback = redeploy an older tag). One-time
setup:

**1. Create the Entra app that GitHub Actions logs in as** (OIDC federated
credential — no stored password, nothing to rotate):

```bash
APP_ID=$(az ad app create --display-name stadar-deploy --query appId -o tsv)
az ad sp create --id $APP_ID
SUB_ID=$(az account show --query id -o tsv)
az role assignment create --assignee $APP_ID --role Contributor \
  --scope /subscriptions/$SUB_ID/resourceGroups/stadar-rg
az ad app federated-credential create --id $APP_ID --parameters '{
  "name": "stadar-github-main",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:bnelson-mtb/stadar:ref:refs/heads/main",
  "audiences": ["api://AzureADTokenExchange"]
}'
echo "AZURE_CLIENT_ID=$APP_ID"; echo "AZURE_TENANT_ID=$(az account show --query tenantId -o tsv)"; echo "AZURE_SUBSCRIPTION_ID=$SUB_ID"
```

Run this **after** the first manual deploy, so the resource group and
registry already exist (the first deploy also registers the `Microsoft.App`,
`Microsoft.OperationalInsights`, and `Microsoft.ContainerRegistry` resource
providers, which needs subscription-level rights CI doesn't have).

**2. Add four GitHub repo secrets** (Settings → Secrets and variables →
Actions):

| Secret | Value |
|---|---|
| `AZURE_CLIENT_ID` | `appId` printed above |
| `AZURE_TENANT_ID` | tenant id printed above |
| `AZURE_SUBSCRIPTION_ID` | subscription id printed above |
| `TICKETMASTER_API_KEY` | your Ticketmaster Discovery API key |

**3. Merge to `main`.** Every push to `main` now tests and deploys; the
workflow can also be run manually from the Actions tab (workflow_dispatch).

## What it costs

At user-testing traffic on the consumption plan (numbers are ballpark, check
the Azure pricing page for current rates):

| Item | Monthly cost |
|---|---|
| Container Apps compute | **~$0** with scale-to-zero — the free grant (180K vCPU-s, 360K GiB-s, 2M requests/mo) covers light traffic. Roughly **$5–8** if you set `--min-replicas 1` to avoid cold starts. |
| Azure Container Registry (Basic) | **~$5** — `ca759b5dd5aeacr`, stores the images; this is the main fixed cost. |
| Log Analytics | ~$0 (first 5 GB/mo free) |
| Blob storage (logos) | pennies — already running |
| Ticketmaster Discovery API | $0 (free tier, 5,000 calls/day) |

**Total: roughly $5/month** with scale-to-zero (cold start of a few seconds
after idle), or **~$10–13/month** always-warm. GitHub Actions is free at this
usage on public repos and well within the 2,000 free minutes/mo on private ones.

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
