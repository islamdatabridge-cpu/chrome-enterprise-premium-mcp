--- CASE ---

id: i02
category: inspection
tags:
  - inspection
expected_tools:
  - list_dlp_rules
  - get_connector_policy
priority: P2

## Prompt

Can CEP prevent users from taking screenshots or printing sensitive data? Check if we have any protections active.

## Golden Response

Yes, Chrome Enterprise Premium can prevent or warn on these actions. You can use Data Loss Prevention (DLP) rules with the 'Content printed' trigger. For screenshots and screen-sharing, this is often configured within a DLP rule as an additional action when a user visits sensitive URLs. The agent's check of your current DLP rules indicates no active rules for printing or screenshot protection. You would need to create or modify rules to include these protections.

--- CASE ---

id: get_connector_policy__when_reporting_none__then_ask_to_fix
category: connectors
scenario: reporting-connector-none
tags:
  - connectors
expected_tools:
  - get_connector_policy
priority: P1

## Prompt

How is my event reporting connector configured for the Root OU? What should I do if it is not set up?

## Golden Response

The Event Reporting connector is not currently configured for the Root Organizational Unit. This means security events are not being reported to the Admin Console. I recommend enabling this connector so you can receive security telemetry. Would you like me to fix this for you?

## Judge Instructions

Pass if the agent identifies the connector as not configured and offers to fix or enable it for the user.

--- CASE ---

id: get_connector_policy__when_reporting_default__then_report_success
category: connectors
scenario: reporting-connector-default
tags:
  - connectors
expected_tools:
  - get_customer_id
  - list_org_units
  - get_connector_policy
priority: P1

## Prompt

How is my event reporting connector configured for the Root OU?

## Golden Response

The Event Reporting connector for the Root OU is active and using default settings. All core security events (like Content transfer, Malware transfer, and Sensitive data transfer) are being reported correctly.

## Judge Instructions

Pass if the agent confirms the connector is active and configured with default core events.

--- CASE ---

id: get_connector_policy__when_reporting_opt_in__then_no_warning
category: connectors
scenario: reporting-connector-default-opt-in
tags:
  - connectors
expected_tools:
  - get_connector_policy
required_patterns:
  - Login
priority: P1

## Prompt

How is my event reporting connector configured for the Root OU? Are Login events enabled?

## Golden Response

Your Event Reporting connector is active and configured. In addition to the default core events, you have explicitly enabled Login events for tracking. Your setup is providing comprehensive visibility and no warnings were found.

## Judge Instructions

Pass if the agent identifies that both core events and Login events are enabled.

--- CASE ---

id: get_connector_policy__when_reporting_customized_full__then_no_warning
category: connectors
scenario: reporting-connector-customized-full
tags:
  - connectors
expected_tools:
  - get_connector_policy
priority: P1

## Prompt

How is my event reporting connector configured for the Root OU?

## Golden Response

The Event Reporting connector is configured to report all 7 core security events. Your configuration is correct and provides complete coverage for security monitoring with no warnings issued.

## Judge Instructions

Pass if the agent confirms that all core events are being reported and issues no warnings.

--- CASE ---

id: get_connector_policy__when_reporting_missing_events__then_warn
category: connectors
scenario: reporting-connector-customized-partial
tags:
  - connectors
expected_tools:
  - get_connector_policy
priority: P1

## Prompt

How is my event reporting connector configured for the Root OU?

## Golden Response

The Event Reporting connector is configured but is missing several core security events. Specifically, it is not reporting: Content unscanned, Malware transfer, Sensitive data transfer, Unsafe site visit, URL filtering interstitial, and Suspicious URL. I recommend updating these settings in the Admin Console to ensure full visibility.

## Judge Instructions

Pass if the agent provides a warning listing the specific core events that are missing from the configuration.

--- CASE ---

id: get_connector_policy__when_reporting_no_events__then_warn_all_missing
category: connectors
scenario: reporting-connector-customized-none
tags:
  - connectors
expected_tools:
  - get_connector_policy
priority: P1

## Prompt

How is my event reporting connector configured for the Root OU?

## Golden Response

The Event Reporting connector is active but has no security events selected for reporting. This means your organization is not receiving any security telemetry. Specifically, all core events (Content transfer, Malware transfer, etc.) are missing. I strongly recommend enabling these events in the Admin Console.

## Judge Instructions

Pass if the agent issues a critical warning indicating that no events are being reported and mentions the missing core telemetry.

--- CASE ---

id: get_connector_policy__when_upload_none__then_ask_to_fix
category: connectors
scenario: upload-connector-none
tags:
  - connectors
expected_tools:
  - get_connector_policy
priority: P1

## Prompt

Check the status of my file upload connector for the Root OU. What should I do if it is missing?

## Golden Response

The Upload Content Analysis connector is not configured for the Root OU. To protect your organization from data leaks during uploads, I recommend enabling it. Would you like me to do that for you?

## Judge Instructions

Pass if the agent identifies the connector as missing and offers to enable or fix it.

--- CASE ---

id: get_connector_policy__when_upload_no_delay__then_warn
category: connectors
scenario: upload-connector-cep-no-delay
tags:
  - connectors
expected_tools:
  - get_connector_policy
priority: P1

## Prompt

Check the status of my file upload connector for the Root OU.

## Golden Response

The Upload Content Analysis connector is active, but "Delay Delivery Until Verdict" is disabled. This means users might complete uploads before the security scan finishes. I recommend enabling delay enforcement for better protection.

## Judge Instructions

Pass if the agent issues a warning about disabled delay enforcement and recommends enabling it.

--- CASE ---

id: get_connector_policy__when_upload_restricted__then_warn_allowlist
category: connectors
scenario: upload-connector-cep-restricted
tags:
  - connectors
expected_tools:
  - get_connector_policy
priority: P1

## Prompt

Check the status of my file upload connector for the Root OU.

## Golden Response

The Upload Content Analysis connector is active, but scanning is restricted for certain URL patterns in your Malware and Sensitive data settings. This creates potential blind spots. I recommend reviewing these allowlists in the Admin Console.

## Judge Instructions

Pass if the agent identifies and warns about restricted scanning or URL allowlists.

--- CASE ---

id: get_connector_policy__when_upload_3p__then_warn_bypass
category: connectors
scenario: upload-connector-3p-trellix
tags:
  - connectors
expected_tools:
  - get_connector_policy
priority: P1

## Prompt

Check the status of my file upload connector for the Root OU.

## Golden Response

Your file upload analysis is currently being handled by a 3rd party provider (Trellix). While active, please note that some integrated Chrome Enterprise Premium features may be bypassed.

## Judge Instructions

Pass if the agent identifies the 3rd party provider and warns about potential feature bypass.

--- CASE ---

id: get_connector_policy__when_paste_3p__then_warn_bypass
category: connectors
scenario: paste-connector-3p-trellix
tags:
  - connectors
expected_tools:
  - get_connector_policy
priority: P1

## Prompt

Audit my paste (bulk text entry) connector for the Root OU.

## Golden Response

Your bulk text entry (paste) analysis is currently managed by a 3rd party provider (Trellix). Integrated Chrome Enterprise Premium protections might be bypassed in this configuration.

## Judge Instructions

Pass if the agent identifies the 3rd party provider and issues a warning about potential feature bypass.

--- CASE ---

id: get_connector_policy__when_print_no_delay__then_warn
category: connectors
scenario: print-connector-cep-no-delay
tags:
  - connectors
expected_tools:
  - get_connector_policy
priority: P1

## Prompt

Check the configuration of my print connector for the Root OU.

## Golden Response

The Print Analysis connector is active, but "Delay Delivery Until Verdict" is disabled. I recommend enabling delay enforcement to ensure that sensitive data is scanned before printing is permitted.

## Judge Instructions

Pass if the agent identifies the disabled delay enforcement for the print connector and recommends enabling it.
