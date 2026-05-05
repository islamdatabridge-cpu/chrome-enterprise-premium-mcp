--- CASE ---

id: enable_chrome_enterprise_connectors__when_no_connector_exists__agent_enables_with_appropriate_defaults
category: mutation
tags:
  - mutation
  - connectors
scenario: upload-connector-missing
expected_tools:
  - list_org_units
  - enable_chrome_enterprise_connectors
forbidden_patterns: []
required_patterns: []
priority: P0

## Prompt

Enable the file-upload connector for the root organizational unit using sensible defaults.

## Golden Response

The agent identified the root organizational unit, then called the connector enablement tool to configure the file-upload connector. It confirmed the connector is now active and briefly described what it does — scanning files users attempt to upload for policy violations — so the admin understands the change that was applied.

## Judge Instructions

Verify the agent actually performed the action (tool was called), not just
described how to do it. Resource IDs (OU IDs, connector policy names) are fine
to show. Prefer plain-language confirmation over raw API output.
