<!--
Copyright 2026 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Configuration

The server is configured via environment variables. How you set them depends
on which transport mode you are using.

## MCP client (stdio mode)

Add variables to the `env` block of your client's settings file. The client
injects them into the server's environment on startup.

```json
{
  "mcpServers": {
    "cep": {
      "command": "npx",
      "args": ["-y", "@google/chrome-enterprise-premium-mcp@latest"],
      "env": {
        "GCP_STDIO": "true",
        "GOOGLE_CLOUD_QUOTA_PROJECT": "your-project-id"
      }
    }
  }
}
```

## Standalone (HTTP mode)

You can pass variables inline or load them from a `.env` file in your working
directory. See [`.env.example`](../.env.example) for the full set of options.

```bash
PORT=8080 GCP_STDIO=false npx -y @google/chrome-enterprise-premium-mcp@latest
```

## Key variables

| Variable                     | Description                                          | Default |
| :--------------------------- | :--------------------------------------------------- | :------ |
| `GCP_STDIO`                  | `true` for Stdio (local); `false` for HTTP (remote). | `true`  |
| `PORT`                       | Network port when `GCP_STDIO=false`.                 | `0`     |
| `GOOGLE_CLOUD_QUOTA_PROJECT` | GCP project ID for API quotas.                       | -       |
| `LOG_LEVEL`                  | Verbosity (`error`, `warn`, `info`, `debug`).        | `info`  |

> [!NOTE]
> When `GCP_STDIO=false` and `PORT` is unset or `0`, the server binds to a
> random available port. The actual port is logged at startup, e.g.
> `Chrome Enterprise Premium MCP server listening on port X`.

## Authenticating to Google APIs

`lib/util/auth.js#getAuthClient` has three credential sources, in priority
order: bearer header on the request, Application Default Credentials, OAuth
token cache. Pick a setup based on environment.

| Setup                      | Transport | Credential source                              | Setup walkthrough                                                                               |
| :------------------------- | :-------- | :--------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| `gcloud` ADC (recommended) | stdio     | ADC, full scope set including `cloud-platform` | [Quick Start §1](../README.md#1-authenticate-with-google-cloud)                                 |
| OAuth login (workstation)  | stdio     | OAuth token cache, narrow scope set            | [`auth-bring-your-own-oauth-client.md`](auth-bring-your-own-oauth-client.md)                    |
| Bearer pass-through        | HTTP      | per-request `Authorization: Bearer <token>`    | The caller sets the header; the server forwards it to Google verbatim                           |
| Service account + DWD      | stdio     | service account with domain-wide delegation    | [FAQ entry on service accounts](faq.md#can-i-use-a-service-account-instead-of-user-credentials) |

> [!IMPORTANT]
> HTTP-mode default: no network-layer auth. Bind the port to a trusted
> interface only, or set `CEP_BEARER_AUDIENCE` (HTTP mode only) for
> per-request ID-token verification.
