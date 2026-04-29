--- CASE ---

id: m01
category: mutation
tags:
  - mutation
expected_tools:
  - list_org_units
  - create_chrome_dlp_rule
forbidden_patterns: []
required_patterns: []
priority: P0

## Prompt

Create a DLP rule that warns users when they try to upload files containing credit card numbers. Apply it to the root organizational unit.

## Golden Response

Agent should identify the root OU, then create a DLP rule with warn action for file upload trigger with a content condition for credit card patterns. Should confirm the rule was created successfully. Resource IDs (policy names, OU IDs) are fine to show.

## Judge Instructions

Verify the agent actually performed the action (tool was called), not just
described how to do it. Resource IDs (policy names, OU IDs) are fine to show.
Prefer plain-language confirmation over raw API output.

--- CASE ---

id: m02
category: mutation
tags:
  - mutation
expected_tools:
  - list_org_units
  - create_chrome_dlp_rule
forbidden_patterns: []
required_patterns: []
priority: P0

## Prompt

I want to silently monitor when users navigate to social media sites. Set up an audit-only DLP rule on the root OU.

## Golden Response

Agent should identify root OU, then create a DLP rule with audit action for URL navigation trigger targeting social media categories. Should confirm creation and explain that audit mode logs events without notifying users.

## Judge Instructions

Verify the agent actually performed the action (tool was called), not just
described how to do it. Resource IDs (policy names, OU IDs) are fine to show.
Prefer plain-language confirmation over raw API output.
