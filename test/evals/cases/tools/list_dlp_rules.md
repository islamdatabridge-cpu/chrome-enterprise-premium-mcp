--- CASE ---

id: list_dlp_rules__when_configured_rules_requested_agent_identifies_all
category: discovery
tags:
  - tools
  - dlp
scenario: healthy
expected_tools:
  - list_dlp_rules
priority: P0

## Prompt

Which Chrome DLP rules are currently configured in my organization?

## Golden Response

Your organization has 4 Chrome DLP rules currently configured:
- **Block sensitive file uploads**
- **Watermark confidential documents**
- **Audit pastes to generative AI sites**
- **Warn before uploading PII**

## Judge Instructions

Verify that the agent correctly decides to use `list_dlp_rules` based on the user's request for "configured rules". The agent should accurately list all 4 rules from the environment.

--- CASE ---

id: list_dlp_rules__when_monitoring_actions_queried_agent_discovers_triggers
category: discovery
tags:
  - tools
  - dlp
scenario: healthy
expected_tools:
  - list_dlp_rules
priority: P1

## Prompt

Which browser actions are we currently monitoring for data protection?

## Golden Response

We are currently monitoring the following browser actions using Chrome DLP rules:
- **FILE_UPLOAD** (Block sensitive file uploads, Warn before uploading PII)
- **PRINT** (Watermark confidential documents)
- **WEB_CONTENT_UPLOAD** (Audit pastes to generative AI sites)

## Judge Instructions

The agent must identify the specific browser actions (triggers) being monitored by examining the current DLP rules. It should correctly associate the rules with their respective actions (uploads, printing, pastes).
