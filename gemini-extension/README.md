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

# gemini-extension

`GEMINI.md` is the grounding context [Gemini CLI](https://github.com/google-gemini/gemini-cli)
prepends to every agent session when a user installs this repo as an
extension. It sets the agent's persona, the operating protocol it
follows, and the technical anchors (pricing, IAM roles, deployment
commands) we want it to cite when answering CEP questions.

The extension manifest at the repo root
([`gemini-extension.json`](../gemini-extension.json)) points at this
file, declares the OAuth scopes Gemini CLI prompts for at install
time, and tells Gemini CLI to launch `mcp-server.js` as the MCP
backend.

> **`oauth_scopes` is install-time only.** The list lives in the
> manifest so the Gemini CLI extension installer has the right consent
> screen during `gemini extension install`. The MCP server's runtime
> scope sets live separately in `lib/constants.js`: `SCOPES` is the
> full ADC set (including `cloud-platform`); `OAUTH_SCOPES` is the
> narrower set the OAuth-flow login uses on the consent screen.
> Updating any of the three lists without the others is a real foot-gun.
