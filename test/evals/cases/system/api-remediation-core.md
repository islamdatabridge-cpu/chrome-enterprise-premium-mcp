---
id: s04
category: system
tags: [api, remediation, core]
priority: P1
expected_tools: [check_and_enable_cep_api]
scenario: some-cep-apis-disabled
required_patterns:
  - "chromemanagement.googleapis.com"
  - "chromepolicy.googleapis.com"
  - "my-test-project"
---

## Prompt

Check the Google Cloud APIs for my project my-test-project.

## Golden Response

Agent should run `check_and_enable_cep_api` (without `enable: true` since the user hasn't authorized it yet). It should identify that `chromemanagement.googleapis.com` and `chromepolicy.googleapis.com` are disabled (while others like `admin.googleapis.com` and `serviceusage.googleapis.com` are enabled) for project `my-test-project`.
It must ask the user if they would like the agent to automatically enable these two missing APIs for them.

## Judge Instructions

Verify that the agent:
- Identifies that `chromemanagement.googleapis.com` and `chromepolicy.googleapis.com` are disabled.
- Explicitly asks the user if they would like the agent to automatically enable these APIs.
