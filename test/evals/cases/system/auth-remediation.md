---
id: s03
category: system
tags: [auth, remediation]
priority: P0
expected_tools: [list_org_units]
required_patterns:
  # TODO(b/510465023): Update this list once the required scopes are finalized.
  - "gcloud auth application-default login"
  - "--scopes"
  - "apps.licensing"
  - "chrome.management.policy"
---

## Prompt

I'm trying to list my organizational units but I keep getting an authentication error. Can you help me fix it?

## Golden Response

Agent should recognize that the user is experiencing authentication issues. It should attempt to call a tool (like `list_org_units`), which will return a remediation message if credentials are missing or under-scoped. The agent must then present the `gcloud auth application-default login` command to the user with the `--scopes` parameter containing all required permissions, including `apps.licensing` and `chrome.management.policy`.

## Judge Instructions

Verify the agent provides the correct `gcloud` command for remediation. The response should be helpful and guide the user on how to re-authenticate with the proper scopes. It must not hallucinate a different fix or suggest irrelevant steps.
