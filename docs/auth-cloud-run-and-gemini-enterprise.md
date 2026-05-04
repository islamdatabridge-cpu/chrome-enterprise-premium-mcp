# Hosting CEP MCP behind Cloud Run + Gemini Enterprise

> **Use OAuth, not service-account + DWD.** OAuth is the recommended
> auth path for new hosted deployments. Reference pattern: the
> [ADK + OAuth + Gemini Enterprise article](https://fmind.medium.com/powering-up-your-agent-in-production-with-adk-oauth-and-gemini-enterprise-a52b0716fcba).
> SA + DWD is the alternative when OAuth is not viable; the SA + DWD
> setup is at the bottom.

## Recommended: OAuth bearer per request

Two pieces:

1. **Vertex AI Agent Engine handles OAuth consent.** Register your
   OAuth client with Agent Engine; the registered redirect URI is
   `https://vertexaisearch.cloud.google.com/oauth-redirect`. Agent
   Engine receives the code, exchanges it for tokens, and forwards the
   user's access token (or ID token) on every tool-call request to
   your MCP server.
2. **The MCP server verifies the inbound bearer.** In HTTP mode, set
   `CEP_BEARER_AUDIENCE` to the OAuth client id you registered. Each
   inbound request's `Authorization: Bearer <id-token>` is checked
   against that audience ahead of any forward to Google. Failures get 401. Setup detail at
   [`configuration.md#authenticating-to-google-apis`](configuration.md#authenticating-to-google-apis).

### Cloud Run setup sketch

```bash
# Deploy the server.
gcloud run deploy cep-mcp \
  --source=. \
  --region=us-central1 \
  --no-allow-unauthenticated \
  --set-env-vars=GCP_STDIO=false,CEP_BEARER_AUDIENCE=<your-oauth-client-id>
```

Register the OAuth client with Vertex AI Agent Engine via the Agent
Engine console or CLI. The exact `create-auth` invocation lives in the
Agent Engine docs; this MCP server needs `client-id`, `client-secret`,
Google's standard `auth-uri` and `token-uri`, plus a scope list. Scope
list: `OAUTH_SCOPES` from `lib/constants.js` (which excludes
`cloud-platform`).

## Alternative: service account with domain-wide delegation

For deployments where Agent Engine is unavailable or OAuth consent is
not viable, SA + DWD is the alternative. Setup is the same as the
[FAQ entry on service accounts](faq.md#can-i-use-a-service-account-instead-of-user-credentials);
on Cloud Run, set `GOOGLE_APPLICATION_CREDENTIALS` to wherever the JSON
key is mounted inside the container.

Caveat: SA + DWD grants the server impersonation rights for any user
in the domain for the granted scopes. That is a broader trust grant
than per-user OAuth. Use OAuth above when feasible.

## Status today

The MCP server's bearer pass-through and ID-token verification are
ready. Vertex AI Agent Engine's `create-auth` API is in private preview
as of the article's publication; production wiring depends on your
access. Until Agent Engine is generally available, the loopback OAuth
flow (`mcp auth login`) is the workstation-only equivalent and is not
a drop-in for hosted deployments.
