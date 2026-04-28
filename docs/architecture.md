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

# Architecture

```text
/
├── lib/
│   ├── api/              # Google Cloud and Workspace API clients
│   │   ├── interfaces/   # Abstract client contracts
│   │   └── real_*.js     # Production implementations
│   ├── util/             # Auth, retry, CEL validation, logging, flags
│   └── constants.js      # Centralized configuration
├── prompts/              # MCP prompt definitions
│   ├── definitions/      # Individual prompt implementations
│   └── index.js
├── tools/
│   ├── definitions/      # Individual tool implementations
│   ├── utils/            # Tool-specific utilities
│   └── index.js          # Tool registration entry point
├── test/                 # Unit, integration, and eval tests
└── mcp-server.js         # Server entry point
```

## Key design patterns

- **Client abstraction.** Each Google API has an interface
  (`lib/api/interfaces/`) and a real implementation (`lib/api/real_*.js`).
  Tools program against the interface. For tests, we instantiate the same
  `Real*Client` with a `rootUrl` override and a stub auth client to
  redirect calls at the in-process fake server. See
  [`lib/api/README.md`](../lib/api/README.md) for the full pattern.
- **Structured tool output.** Tools return structured JSON with both
  machine-readable data and human-readable summaries.
- **Retry with backoff.** API calls retry on `PERMISSION_DENIED` (gRPC code 7)
  to handle eventual consistency after enabling APIs.
- **CEL validation.** DLP rule conditions are validated offline against the
  Chrome CEL grammar before submission.

## Test backends

Tests and evals run against two backends, controlled by `CEP_BACKEND`:

- **Fake** (default for presubmit). An in-process Express server,
  `test/helpers/fake-api-server.js`, that mimics all five Google APIs. The
  real client classes are redirected at it via `rootUrl + fakeAuth`. No
  network calls, no credentials needed.
- **Real** (postsubmit). Calls the live Google APIs using your ADC
  credentials. Requires authentication and API enablement.
