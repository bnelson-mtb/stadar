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
| `Gemini__ApiKey` | No | Enables the AI event-classification layer. Unset → the layer is fully inert (pre-LLM behavior). |
| `Storage__ConnectionString` | No | Persists classifier verdicts to blob `verdicts/verdicts.json` in `stadarstorage`. Without it (but with a Gemini key) verdicts are memory-only. |
| `ConnectionStrings__Default` | No | Azure SQL connection string. Required **together with** the two `Google__*` vars to enable accounts; see below. |
| `Google__ClientId` / `Google__ClientSecret` | No | Google OAuth client credentials. Required **together with** `ConnectionStrings__Default`. |

Health probe endpoint: `GET /healthz` (returns 200).
The container listens on port **8080** (HTTP; the platform's edge terminates TLS).

### Classifier secrets

Set once on the Container App when deploying the AI classification layer:

```bash
az containerapp secret set -n stadar -g stadar-rg --secrets gemini-api-key=<KEY> storage-conn="<CONNSTRING>"
az containerapp update -n stadar -g stadar-rg --set-env-vars Gemini__ApiKey=secretref:gemini-api-key Storage__ConnectionString=secretref:storage-conn
```

Get the storage connection string with:

```bash
az storage account show-connection-string --name stadarstorage --resource-group stadar-rg --query connectionString -o tsv
```

### Google OAuth (accounts)

The accounts layer is inert unless **both** `ConnectionStrings__Default` and
`Google__ClientId`/`Google__ClientSecret` are set. Anonymous browsing never
touches SQL, so a deployment without these behaves exactly as it did before
accounts existed.

**Database tier: keep it on Basic.** The `stadar` database runs on the Basic
DTU tier (~$4.90/month flat, 2 GB cap; the data is a few tens of MB). It was
originally serverless (`GP_S_Gen5_1`, 60-minute auto-pause), which looked
free but billed the full vCore rate (~$12/day) once the app's traffic kept it
from ever pausing — enough to burn through the student credit and take the
site down for five days in Aug/Sep 2026. If it ever needs more headroom, step
up to Standard S0, not back to serverless. The Azure SQL free offer was
considered and rejected: its ~55 active hours/month is exhausted in about a
week by a database that wakes several times a day.

```bash
az sql db show -n stadar -g stadar-rg -s stadar-sql --query "{sku:sku.name,tier:sku.tier}" -o json
```

**Budget alert.** A subscription-level budget `stadar-monthly` ($25/month)
emails the owner when actual spend passes 50% and 100%, and when the
month-end forecast passes 100%. Normal run rate is ~$10/month (ACR Basic +
SQL Basic), so the 50% alert only fires if something new starts burning.
Inspect or edit it in the portal under Cost Management + Billing → Budgets,
or with:

```bash
az consumption budget list -o table
```

**Every origin the app is served from must be registered with Google before
sign-in works there.** Google matches the `redirect_uri` verbatim against the
OAuth client's allow-list; anything unregistered fails at the consent screen
with `Access blocked … Error 400: redirect_uri_mismatch`, and nothing in the
app logs shows it — the request never reaches the container.

In the [Google Cloud console](https://console.cloud.google.com/apis/credentials)
→ your OAuth 2.0 Client ID → **Authorized redirect URIs**, add one entry per
origin, each ending in the app's callback path `/api/auth/callback`:

| Environment | Authorized redirect URI |
|---|---|
| Local dev | `http://localhost:5068/api/auth/callback` |
| Production (custom domain — the real front door) | `https://stadar.app/api/auth/callback` |
| Production (Container App default hostname) | `https://stadar.politeflower-ad39c306.westus3.azurecontainerapps.io/api/auth/callback` |
| `www` (optional) | `https://www.stadar.app/api/auth/callback` |

Both production entries are needed: the Container App's default hostname keeps
working alongside the custom domain, and either can serve a visitor. `www`
currently 301s to the apex before any OAuth challenge, so it is optional —
register it anyway if you don't want that forwarding to be load-bearing.

Changes take effect within a minute or so. Notes:

- The path comes from `CallbackPath` in `Api/Auth/AccountsStartup.cs`. It is
  **not** the ASP.NET Core default (`/signin-google`), and it is pinned by
  `Login_RedirectUri_UsesForwardedSchemeAndRegisteredCallbackPath` in
  `Api.Tests/AuthEndpointsTests.cs` — if that test has to change, update the
  console first.
- The production entry must be `https`. The container itself listens on plain
  HTTP behind the Container Apps ingress; `UseForwardedHeaders` in
  `Program.cs` restores the original scheme so the emitted `redirect_uri` is
  `https`. Removing that would emit `http` and break sign-in.
- **Every new hostname needs its own entry here.** Binding a custom domain to
  the Container App does not register it with Google — `stadar.app` was bound
  in Aug 2026 and sign-in still failed from it until it was added.
- Google may require the domain under **Authorized domains** on the OAuth
  consent screen (and ownership verification via Search Console) before it
  accepts a redirect URI for it. Apps still in *Testing* publishing status
  generally don't hit this; published apps do.

To verify what the deployed app actually sends without opening a browser:

```bash
curl -sSD - -o /dev/null \
  "https://<host>/api/auth/login" | grep -i '^location:'
```

The `redirect_uri=` parameter in that `Location` header is the exact string
Google compares against the allow-list.

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

**2. Add the GitHub repo secrets** (Settings → Secrets and variables →
Actions). `deploy.yml` passes all of these to the Container App:

| Secret | Value |
|---|---|
| `AZURE_CLIENT_ID` | `appId` printed above |
| `AZURE_TENANT_ID` | tenant id printed above |
| `AZURE_SUBSCRIPTION_ID` | subscription id printed above |
| `TICKETMASTER_API_KEY` | your Ticketmaster Discovery API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client id (accounts) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (accounts) |
| `SQL_CONNECTION_STRING` | Azure SQL connection string (accounts) |

Setting the last three switches accounts **on** in production — which also
means the production redirect URI must already be registered with Google
(see [Google OAuth](#google-oauth-accounts) above), or sign-in fails with
`redirect_uri_mismatch`.

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
