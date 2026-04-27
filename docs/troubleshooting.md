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

# Troubleshooting

## Authentication

### "Could not load the default credentials"

ADC is not configured. Run the login command from the
[Quick Start](../README.md#1-authenticate-with-google-cloud). Verify
credentials exist afterward:

```bash
cat ~/.config/gcloud/application_default_credentials.json
```

If the file does not exist, login did not complete (check for a browser popup
you may have missed).

### "Request had insufficient authentication scopes"

We created credentials without the required scopes, usually because
`gcloud auth application-default login` was run without `--scopes`. The
default scope (`cloud-platform`) does not cover Workspace APIs like Admin SDK
or Chrome Management. Delete and re-create credentials:

```bash
rm ~/.config/gcloud/application_default_credentials.json
```

Then re-run the full login command from the
[Quick Start](../README.md#1-authenticate-with-google-cloud). You cannot add
scopes to existing ADC credentials.

### "API requires a quota project, which is not set by default"

Google needs to know which project's API quotas and enablement to use. This
error appears on the first API call, not at login:

```bash
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
```

If you are unsure which project to use, run `gcloud projects list` and pick
the one linked to your Workspace domain.

### "invalid_grant" or "Token has been revoked"

Cached credentials are stale. Common causes: password change, admin revoked
access, MFA re-enrollment, or token expired after seven days of inactivity.
Delete `~/.config/gcloud/application_default_credentials.json` and
re-authenticate.

### `gcloud` is installed but `gcloud auth` fails with "command not found"

Your shell can find `gcloud` but not the auth component. Run
`gcloud components install` or reinstall the Cloud SDK. On macOS with
Homebrew, `brew install google-cloud-sdk` sometimes does not add auth
components; use the
[official installer](https://cloud.google.com/sdk/docs/install) instead.

## Permissions

### "The caller does not have permission" (403)

This is almost always one of three things:

1. **API not enabled.** Run the `gcloud services enable` command from the
   [Quick Start](../README.md#2-enable-required-apis). Most common cause on
   first setup.
2. **Missing Workspace admin role.** Chrome and Admin SDK APIs require a
   Google Workspace admin role (Super Admin or delegated) configured in the
   [Admin Console](https://admin.google.com/) > Account > Admin roles. GCP
   IAM roles alone are not sufficient for Workspace APIs.
3. **Missing GCP IAM role.** The user needs roles on the GCP project itself
   (e.g., `roles/browser.admin`, `roles/serviceusage.serviceUsageAdmin`).

### "PERMISSION_DENIED" followed by retries

Normal on first run. The server retries `PERMISSION_DENIED` (gRPC code 7) up
to seven times with exponential backoff; the first retry waits 15 seconds.
This handles propagation delay after enabling APIs. If retries exhaust, the
permission issue is real; check the three items above.

## Node.js

### "Cannot find module" or "ERR_MODULE_NOT_FOUND"

Dependencies are missing. Run `npm install` from the project root.

### "ExperimentalWarning: ... is an experimental feature"

Harmless. Some Node.js features used by dependencies emit warnings on older
Node versions. Upgrade to Node 20+ to suppress, or ignore them; they do not
affect functionality.

### Wrong Node version

The server requires Node >= 18. Check with `node --version`. If you use
[nvm](https://github.com/nvm-sh/nvm), make sure you have run `nvm use 18` (or
higher) in the project directory. MCP clients launch `node` as a subprocess —
they use whatever `node` is on the system PATH, which may differ from your
shell's `nvm`-managed version.

## MCP client integration

### Tools do not appear in the client

1. **Restart the client** after editing its config file; most clients do not
   hot-reload MCP config.
2. **Run the client's MCP-reload command.** In Gemini CLI, type `/mcp` and
   reload. Some clients pick up new tool registrations only after an explicit
   reload, even after a restart.
3. **Use absolute paths.** The `args` path in your config must be absolute.
   Relative paths resolve from the client's working directory, which is
   unpredictable.
4. **Check `node` visibility.** GUI apps (Claude Desktop, VS Code) may not
   inherit your shell PATH. Try the full path to node:
   `"command": "/usr/local/bin/node"` (find yours with `which node`).
5. **Test manually.** Run
   `npx -y @google/chrome-enterprise-premium-mcp@latest` in a terminal. You
   should see
   `[mcp] Chrome Enterprise Premium MCP server stdio transport connected` on
   stderr. If you see errors, fix those first.

### Server starts but immediately exits

Check stderr output. Common causes: missing `.env` values the server expects,
or a port conflict if you accidentally ran in HTTP mode (`GCP_STDIO=false`).
