# Chrome Enterprise Premium MCP Server

> [!NOTE]
> This is an officially supported Google product, but it is currently in an
> early stage of development. It is intended as a working example of how to
> build an MCP server that wraps Google Cloud and Workspace APIs and does not
> yet support the full range of features.

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for
[Chrome Enterprise Premium](https://docs.cloud.google.com/chrome-enterprise-premium/docs/overview)
(CEP). CEP extends Chrome's built-in security with Data Loss Prevention (DLP),
real-time threat protection (phishing and malware scanning), and Context-Aware
Access controls. This server exposes CEP's DLP rules, content detectors,
connector policies, browser telemetry, and license management as MCP tools —
letting any MCP-compatible AI agent inspect and configure a Chrome Enterprise
environment.

The codebase also serves as a worked example of wrapping Google Workspace and
Cloud APIs in an MCP server: client abstraction with test doubles, offline CEL
validation, retry logic, structured tool output, and an evaluation harness.

## Important security consideration: Indirect Prompt Injection Risk

When exposing any language model to untrusted data, there's a risk of an
[indirect prompt injection attack](https://en.wikipedia.org/wiki/Prompt_injection).
Agentic tools like Gemini CLI, connected to MCP servers, have access to a wide
array of tools and APIs.

This MCP server grants the agent the ability to read, modify, and delete your
Google Account data, as well as other data shared with you.

- Never use this with untrusted tools
- Never include untrusted inputs into the model context. This includes asking
  Gemini CLI to process mail, documents, or other resources from unverified
  sources.
- Untrusted inputs may contain hidden instructions that could hijack your CLI
  session. Attackers can then use this to modify, steal, or destroy your
  data.
- Always carefully review actions taken by Gemini CLI on your behalf to ensure
  they are correct and align with your intentions.

## Quick Start

```bash
git clone https://github.com/google/chrome-enterprise-premium-mcp.git
cd chrome-enterprise-premium-mcp
npm install
```

### 1. Authenticate with Google Cloud

Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) if you
don't have it, then create
[Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials)
(ADC) with the scopes needed by each API:

```bash
gcloud auth application-default login \
  --scopes="https://www.googleapis.com/auth/chrome.management.policy,https://www.googleapis.com/auth/chrome.management.reports.readonly,https://www.googleapis.com/auth/chrome.management.profiles.readonly,https://www.googleapis.com/auth/admin.reports.audit.readonly,https://www.googleapis.com/auth/admin.directory.orgunit.readonly,https://www.googleapis.com/auth/admin.directory.customer.readonly,https://www.googleapis.com/auth/cloud-identity.policies,https://www.googleapis.com/auth/apps.licensing,https://www.googleapis.com/auth/cloud-platform"
```

These scopes map to the underlying APIs:

| Scope                                 | API                                                                             | Used for                                                       |
| :------------------------------------ | :------------------------------------------------------------------------------ | :------------------------------------------------------------- |
| `chrome.management.policy`            | [Chrome Policy](https://developers.google.com/chrome/policy)                    | Reading/writing connector policies, extension install policies |
| `chrome.management.reports.readonly`  | [Chrome Management](https://developers.google.com/chrome/management)            | Browser version counts, customer profiles                      |
| `chrome.management.profiles.readonly` | [Chrome Management](https://developers.google.com/chrome/management)            | Managed browser profiles                                       |
| `admin.reports.audit.readonly`        | [Admin SDK Reports](https://developers.google.com/admin-sdk/reports)            | Chrome activity logs                                           |
| `admin.directory.orgunit.readonly`    | [Admin SDK Directory](https://developers.google.com/admin-sdk/directory)        | Organizational unit hierarchy                                  |
| `admin.directory.customer.readonly`   | [Admin SDK Directory](https://developers.google.com/admin-sdk/directory)        | Customer ID resolution                                         |
| `cloud-identity.policies`             | [Cloud Identity](https://cloud.google.com/identity/docs)                        | DLP rules and content detectors (CRUD)                         |
| `apps.licensing`                      | [Enterprise License Manager](https://developers.google.com/admin-sdk/licensing) | CEP subscription and per-user license checks                   |
| `cloud-platform`                      | [Service Usage](https://cloud.google.com/service-usage/docs)                    | Checking and enabling required APIs                            |

Then set a quota project (identifies which GCP project's API enablement and
quotas to use):

```bash
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
```

> **Scopes must be provided at login time.** You cannot add scopes to existing
> ADC credentials. If you get "insufficient scopes" errors, delete
> `~/.config/gcloud/application_default_credentials.json` and re-run the login
> command above.
>
> **No per-call charges.** These APIs are included with your Google Workspace /
> Chrome Enterprise Premium license. The quota project is for API enablement and
> rate limiting, not billing. If you skip setting it, you'll see a "quota
> project not set" error on the first API call.

### 2. Enable Required APIs

These APIs must be enabled on your GCP project:

```bash
gcloud services enable \
  admin.googleapis.com \
  chromemanagement.googleapis.com \
  chromepolicy.googleapis.com \
  cloudidentity.googleapis.com \
  licensing.googleapis.com \
  serviceusage.googleapis.com
```

Or enable them from the
[API Library](https://console.cloud.google.com/apis/library) in Cloud Console.

> **Propagation delay:** Newly enabled APIs can take 1–5 minutes to become
> available. The server handles this automatically by retrying
> `PERMISSION_DENIED` errors with exponential backoff. If you see retry messages
> on first run, wait; don't restart.

### 3. Connect Your MCP Client

The server uses **stdio** transport; your MCP client launches it as a child
process. Add the config snippet for your client:

<details>
<summary><strong>Claude Desktop</strong></summary>

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "cep": {
      "command": "npx",
      "args": ["-y", "@google/chrome-enterprise-premium-mcp@latest"],
      "env": { "GCP_STDIO": "true" }
    }
  }
}
```

</details>

<details>
<summary><strong>Claude Code</strong></summary>

Add to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "cep": {
      "command": "npx",
      "args": ["-y", "@google/chrome-enterprise-premium-mcp@latest"],
      "env": { "GCP_STDIO": "true" }
    }
  }
}
```

</details>

<details>
<summary><strong>VS Code</strong></summary>

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "cep": {
      "command": "npx",
      "args": ["-y", "@google/chrome-enterprise-premium-mcp@latest"],
      "env": { "GCP_STDIO": "true" }
    }
  }
}
```

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

Add to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "cep": {
      "command": "npx",
      "args": ["-y", "@google/chrome-enterprise-premium-mcp@latest"],
      "env": { "GCP_STDIO": "true" }
    }
  }
}
```

</details>

> (Optional) If you are running from a local checkout instead of npx, replace the command with `node` and args with the absolute path to `mcp-server.js`. Relative paths may not resolve correctly depending on the client.

### 4. Verify

Restart your MCP client, then ask:

> "What Chrome Enterprise Premium tools do you have access to?"

You should see the agent discover and list the available tools. If tools don't
appear, see [Troubleshooting](#troubleshooting).

## Configuration

For environment variables, stdio vs. HTTP modes, and OAuth setup (including
the current state of the managed OAuth client for CEP), see
[`docs/configuration.md`](docs/configuration.md).

## Prerequisites

| Requirement          | Details                                                                                                                                                                                                                               |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Node.js**          | >= 18.0.0 (`node --version` to check)                                                                                                                                                                                                 |
| **Google Cloud CLI** | [`gcloud`](https://cloud.google.com/sdk/docs/install) installed and on your PATH (`gcloud --version` to check)                                                                                                                        |
| **Google Workspace** | Any edition, plus a [Chrome Enterprise Premium](https://docs.cloud.google.com/chrome-enterprise-premium/docs/overview) license ([60-day free trial available](https://docs.cloud.google.com/chrome-enterprise-premium/docs/overview)) |
| **Admin role**       | Google Workspace Super Admin, or a delegated admin with Chrome Management and DLP permissions                                                                                                                                         |
| **GCP project**      | Linked to your Workspace domain, with required APIs enabled                                                                                                                                                                           |

> **GCP IAM is not enough.** Chrome Management and Admin SDK APIs require a
> Google Workspace admin role _in addition to_ GCP IAM roles. The user must hold
> an admin role in the [Admin Console](https://admin.google.com/) (Super Admin
> or delegated with Chrome Management permissions). Having only GCP IAM
> permissions produces `403 Permission Denied` with no indication that a
> Workspace role is missing.

## Available Tools and Prompts

### Prompts

| Prompt         | Description                                                                            |
| :------------- | :------------------------------------------------------------------------------------- |
| `cep:health`   | Health check of the Chrome Enterprise environment (APIs, DLP, connectors, extensions). |
| `cep:optimize` | Rule optimization and maturity assessment.                                             |
| `cep:expert`   | Manually re-injects the expert persona and rules (useful if the agent loses context).  |

### Tools

The server exposes tools for reading and managing Chrome Enterprise resources:

- **Discovery:** get customer ID, list org units, count browser versions, list
  customer profiles
- **Licensing:** check CEP subscription status, check per-user license
  assignment
- **DLP:** list/create/delete DLP rules, list/create/delete detectors (regex,
  word list, URL list), create default rule sets
- **Connectors:** get connector policy status, enable Chrome Enterprise
  connectors
- **Extensions:** check SEB extension status, install SEB extension
- **Security:** get Chrome activity logs, check and enable required APIs
- **Knowledge:** search the built-in Chrome Enterprise Premium knowledge base

## Architecture

The codebase has three layers: API clients in `lib/api/` (one interface +
real implementation per Google API), MCP tools and prompts in `tools/` and
`prompts/`, and the server entry point in `mcp-server.js`. Integration tests
redirect the real API clients at an in-process Express fake under
`test/helpers/`. For the directory layout, design patterns, and how the test
backends are wired, see [`docs/architecture.md`](docs/architecture.md).

## Development

Run `npm run presubmit` before every PR. It runs unit tests, fake-backend
integration tests, and a smoke test against the in-process fake API server;
no credentials needed. After merge, `npm run postsubmit` re-runs the full
presubmit suite plus a real-API integration pass.

```bash
npm run presubmit               # Required before every PR
npm run postsubmit              # After merge (real API credentials)
npm run test:unit               # Unit tests only
npm run test:integration:fake   # Integration tests against the fake
npm run test:smoke              # Server starts and responds
npm run mcp-inspector           # Browser UI for invoking tools and prompts
npm run lint                    # Check formatting and lint
npm run lint -- --fix           # Auto-fix
npm run format                  # Prettier on everything
```

For evaluations (Gemini agent against fake backend, graded by deterministic
checks and an LLM judge), see [`test/evals/README.md`](test/evals/README.md).
For the test runner layout and how to add a test, see
[`test/README.md`](test/README.md). For contributing, see
[`CONTRIBUTING.md`](CONTRIBUTING.md).

## Troubleshooting

For known issues with auth, permissions, Node.js setup, and MCP client
integration (including the `/mcp` reload tip when CEP tools do not show up
right after restart), see
[`docs/troubleshooting.md`](docs/troubleshooting.md).

## FAQ

For license requirements, Workspace edition, service-account auth,
experimental features, and other recurring questions, see
[`docs/faq.md`](docs/faq.md).

## Reporting Bugs

If something isn't working:

1. In Gemini CLI, run `/bug` to capture session diagnostics. Attach the
   generated file to your issue.
2. Run `npm run presubmit` and include the output; this helps determine whether
   the issue is environmental or a code bug.
3. Describe what you expected vs. what actually happened, including the exact
   error message.

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md)
file for details on how to contribute to this project.

## Legal

- **License:** [Apache License 2.0](LICENSE)
- **Terms of Service:** [Terms of Service](https://policies.google.com/terms)
- **Privacy Policy:** [Privacy Policy](https://policies.google.com/privacy)
- **Security:** [Security Policy](SECURITY.md)
