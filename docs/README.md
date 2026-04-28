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

# docs

Reference documentation for operating and extending the Chrome Enterprise
Premium MCP server. The root [`README.md`](../README.md) covers installation
and connecting an MCP client; these docs cover what you need after the server
is running.

- [`configuration.md`](./configuration.md): environment variables and
  stdio vs. HTTP transport.
- [`troubleshooting.md`](./troubleshooting.md): auth, permissions, Node.js,
  and MCP client integration issues with fixes.
- [`architecture.md`](./architecture.md): code layout, client abstraction,
  retry behavior, CEL validation.
- [`faq.md`](./faq.md): license requirements, service accounts, experimental
  features, and other recurring questions.

For contributing changes, see [`../CONTRIBUTING.md`](../CONTRIBUTING.md). For
the test infrastructure, see [`../test/README.md`](../test/README.md).
