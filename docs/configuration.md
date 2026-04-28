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

The server authenticates to Google APIs via Application Default Credentials
(ADC), regardless of transport. Set ADC up using the Quick Start in the root
[`README.md`](../README.md). The HTTP transport is unauthenticated at the
network layer; bind it to a trusted interface only.
