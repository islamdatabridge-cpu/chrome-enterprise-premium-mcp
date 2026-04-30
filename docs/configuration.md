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

| Variable                     | Description                                                                                                                                                                                                                                 | Default |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------ |
| `GCP_STDIO`                  | `true` for Stdio (local); `false` for HTTP (remote).                                                                                                                                                                                        | `true`  |
| `PORT`                       | Network port when `GCP_STDIO=false`.                                                                                                                                                                                                        | `0`     |
| `GOOGLE_CLOUD_QUOTA_PROJECT` | GCP project ID for API quotas.                                                                                                                                                                                                              | -       |
| `LOG_LEVEL`                  | Verbosity (`error`, `warn`, `info`, `debug`).                                                                                                                                                                                               | `info`  |
| `CEP_BEARER_AUDIENCE`        | When set in HTTP mode: every inbound request must carry an `Authorization: Bearer <id-token>` whose `aud` claim is in this value (comma-separated for multiple). When unset: ID-token verification is off and a startup warning is printed. | -       |

> [!NOTE]
> When `GCP_STDIO=false` and `PORT` is unset or `0`, the server binds to a
> random available port. The actual port is logged at startup, e.g.
> `Chrome Enterprise Premium MCP server listening on port X`.

## Authenticating to Google APIs

The server authenticates to Google APIs via Application Default Credentials
(ADC), regardless of transport. Set ADC up using the Quick Start in the root
[`README.md`](../README.md). The HTTP transport is unauthenticated at the
network layer; bind it to a trusted interface only.

### Inbound bearer ID-token verification (HTTP mode)

For HTTP-mode deployments behind an OAuth-bearing caller (e.g., Vertex AI
Agent Engine), set `CEP_BEARER_AUDIENCE` to the OAuth client id whose ID
token issuance is allowed for this server. With it set, every inbound
request must carry `Authorization: Bearer <id-token>`, and the token's
`aud` claim is checked against `CEP_BEARER_AUDIENCE`. Failures get 401
ahead of any forward to Google. When `CEP_BEARER_AUDIENCE` is unset, the
check is off and a startup warning is printed.
