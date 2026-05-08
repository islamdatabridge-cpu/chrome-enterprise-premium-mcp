---
id: s05
category: system
tags: [api, remediation, prereq]
priority: P1
expected_tools: [check_and_enable_cep_api]
scenario: service-usage-disabled
required_patterns:
  - "Service Usage API"
  - "https://console.cloud.google.com/apis/library/serviceusage.googleapis.com"
  - "project=my-test-project"
---

## Prompt

Check my Google Cloud APIs for project my-test-project.

## Golden Response

Agent should attempt to call `check_and_enable_cep_api`. It should detect a Service Usage API failure and recognize that `serviceusage.googleapis.com` itself is disabled on the project. Since this prerequisite API cannot be automatically enabled, it must provide the exact Cloud Console link:
`https://console.cloud.google.com/apis/library/serviceusage.googleapis.com?project=my-test-project`
and clearly instruct the user to manually enable it in the browser.

## Judge Instructions

Verify that the agent identifies that the prerequisite Service Usage API is disabled. The agent must guide the user to enable it manually and provide the console link including the correct project ID `my-test-project`.
