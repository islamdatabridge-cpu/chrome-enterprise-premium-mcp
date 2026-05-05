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

# Bring Your Own OAuth Client

`mcp auth login` uses an OAuth client to obtain a Google access token. The
bundled managed client is not yet provisioned. Until provisioning lands, BYO
is required: set `CEP_OAUTH_CLIENT_ID` and `CEP_OAUTH_CLIENT_SECRET` in your
environment.

Cache file: `~/.config/cep-mcp/tokens.json` (mode 0600). Contents: access
token only; no refresh token. Access-token TTL: about one hour.

## BYO Desktop OAuth client setup

1. In the Google Cloud Console, open APIs & Services → Credentials
   (https://console.cloud.google.com/apis/credentials).
2. Click Create Credentials → OAuth client ID.
3. Application type: Desktop app. Name: anything you like.
4. Click Create. Copy the Client ID and Client secret.
5. Export them:

   ```bash
   export CEP_OAUTH_CLIENT_ID="<your client id>"
   export CEP_OAUTH_CLIENT_SECRET="<your client secret>"
   ```

6. Run `mcp auth login`. Approve consent in the browser.
7. Verify with `mcp auth-status`.

## Headless paste-back path

For CI, SSH sessions, or containers without a browser:

1. The CLI output has two parts: a consent URL on stderr, and a stdin prompt.
2. Open the URL on another machine. Approve consent.
3. The redirect target is `http://127.0.0.1:<port>/?code=...`. That URL is
   unreachable from a remote browser; the page is connection-refused or 404
   (expected).
4. Copy the full URL from the browser address bar. Paste at the CLI prompt.
5. Result: token cache at `~/.config/cep-mcp/tokens.json`.

## Required scopes

Source of truth: `lib/constants.js#SCOPES`. The OAuth consent screen has every
entry. Granted scopes are in the cache; `mcp auth-status` is the readout.

## Token expiry

Access-token TTL: about one hour. The cache has no refresh token, so an
expired token gets a 401 from Google. The remedy is `mcp auth login` again.
