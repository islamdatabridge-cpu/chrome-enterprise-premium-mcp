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

# lib

Shared infrastructure for the MCP server.

- [`api/`](./api/): Google Cloud and Workspace API clients. Each domain has
  an interface and a real implementation; integration tests redirect the real
  clients at an in-process fake.
- [`util/`](./util/): auth, retry/backoff, logging, CEL validation, feature
  flags, DLP constants, and other cross-cutting utilities.
- [`knowledge/`](./knowledge/): markdown knowledge-base articles bundled with
  the server and exposed through the `cep:expert` prompt and the search tools.
- `constants.js`: centralized OAuth scopes, API versions, and tag strings used
  across the codebase.
