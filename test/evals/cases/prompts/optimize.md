--- CASE ---

id: pr08
category: prompt
tags:
  - prompt
  - rule-state
scenario: no-dlp-rules
prompt_name: 'cep:optimize'
expected_tools:
  - diagnose_environment
  - get_chrome_activity_log
priority: P2

## Prompt

(Fetched from MCP server at runtime via prompt_name: cep:optimize)

## Golden Response

Agent should report that the environment has no DLP rules in place and that no enforcement is active. Agent should recommend starting with audit-mode rules to gain visibility before turning on warn or block actions.

## Judge Instructions

The agent MUST identify that there are no DLP rules and explain that the environment has no DLP coverage. If the agent reports any existing DLP rules, grade as FAIL (the scenario removes them all). Recommending a phased rollout (audit first, then warn, then block) shows strong understanding. The agent should NOT label this state with internal taxonomy like "Tier 0", "early stage", or "low maturity" — describe it in plain language. Using such labels is a soft FAIL.

--- CASE ---

id: pr09
category: prompt
tags:
  - prompt
  - rule-state
scenario: audit-only-rules
prompt_name: 'cep:optimize'
expected_tools:
  - diagnose_environment
  - get_chrome_activity_log
priority: P2

## Prompt

(Fetched from MCP server at runtime via prompt_name: cep:optimize)

## Golden Response

Agent should report that all 4 DLP rules are in audit-only mode — the environment is logging events but not enforcing. Agent should recommend progressing high-confidence rules from audit to warn so the policies start having user-visible effect.

## Judge Instructions

The agent MUST identify that all rules are audit-only and recommend progression to warn or block for high-confidence rules. If the agent says rules are already enforcing, grade as FAIL. The agent should NOT use internal taxonomy ("Tier 1", "early monitoring stage", "maturity model") — describe the state in plain language. Using such labels is a soft FAIL.

--- CASE ---

id: pr10
category: prompt
tags:
  - prompt
  - rule-state
scenario: healthy
prompt_name: 'cep:optimize'
expected_tools:
  - diagnose_environment
  - get_chrome_activity_log
priority: P2

## Prompt

(Fetched from MCP server at runtime via prompt_name: cep:optimize)

## Golden Response

Agent should report 4 active DLP rules across multiple OUs covering a mix of block, watermark, audit, and warn actions, with activity logs showing events being generated. Agent may recommend further refinements but should acknowledge that the deployment is solid.

## Judge Instructions

The agent MUST identify that multiple rules with different action types are active and producing events. If the agent says there are no rules or that nothing is enforcing, grade as FAIL. The agent should NOT use internal taxonomy ("Tier 3", "advanced maturity"). Plain descriptions like "rules in mixed enforcement modes are firing" are correct. Using internal labels is a soft FAIL.

--- CASE ---

id: pr11
category: prompt
tags:
  - prompt
  - rule-state
scenario: overly-broad-block-rule
prompt_name: 'cep:optimize'
expected_tools:
  - diagnose_environment
  - get_chrome_activity_log
priority: P2

## Prompt

(Fetched from MCP server at runtime via prompt_name: cep:optimize)

## Golden Response

Agent should report that multiple rules exist but one ("Block all sensitive content") has overly broad triggers (all 5 event types) and a match-all condition. The deployment has coverage but the rule quality needs work — the broad rule is a noise and false-positive risk that should be narrowed.

## Judge Instructions

The agent MUST identify the overly broad block rule and explain why its scope is a problem. Simply counting rules and saying everything looks good is FAIL. The agent should note that broad catch-all rules need refinement. Internal taxonomy ("intermediate maturity", "Tier 2") is a soft FAIL — describe the issue with the specific rule in plain language.

--- CASE ---

id: pr12
category: prompt
tags:
  - prompt
  - noise
scenario: healthy
prompt_name: 'cep:optimize'
expected_tools:
  - diagnose_environment
  - get_chrome_activity_log
priority: P2

## Prompt

(Fetched from MCP server at runtime via prompt_name: cep:optimize)

## Golden Response

Agent should analyze DLP rules and activity logs to assess noise levels. The activity log shows 3 events: one block, one warn, one audit, each from a different rule. With a small number of events spread across multiple rules, there is no obvious high-noise rule. Agent should report current noise levels and recommend continued monitoring.

## Judge Instructions

The agent MUST examine both DLP rules and activity logs. If the agent fails to fetch the activity log entirely, grade as FAIL. If the agent fetches the log and provides an optimization assessment (even if it focuses more on rule configuration than specific low event counts), it is acceptable and should PASS.

--- CASE ---

id: pr13
category: prompt
tags:
  - prompt
  - noise
scenario: high-noise-rule
prompt_name: 'cep:optimize'
expected_tools:
  - diagnose_environment
  - get_chrome_activity_log
priority: P2

## Prompt

(Fetched from MCP server at runtime via prompt_name: cep:optimize)

## Golden Response

Agent should identify that the "Audit pastes to generative AI sites" rule is generating significantly more events than other rules (24 events vs 1 from the block rule). Multiple users across multiple days are triggering it. Agent should flag this as a high-noise rule and recommend either tightening the rule's conditions, switching to a more targeted URL list, or accepting the volume if monitoring GenAI usage is a priority.

## Judge Instructions

The agent MUST identify the audit rule as the highest-noise rule by analyzing the event log. If the agent reports all rules as equally noisy or fails to correlate events to specific rules, grade as FAIL. Exact numerical event counts are not strictly required as long as the rule is correctly identified as the primary source of noise. Concrete recommendations for reducing noise (narrowing conditions, refining URL matching, or accepting noise with justification) are required for PASS.

--- CASE ---

id: pr14
category: prompt
tags:
  - prompt
  - noise
scenario: overly-broad-block-rule
prompt_name: 'cep:optimize'
expected_tools:
  - diagnose_environment
  - get_chrome_activity_log
priority: P2

## Prompt

(Fetched from MCP server at runtime via prompt_name: cep:optimize)

## Golden Response

Agent should analyze DLP rules and activity logs. The "Block all sensitive content" rule matches all content across all 5 trigger types, which is a recipe for high noise and user friction. Even if current event volume is low, the agent should flag this rule's configuration as a noise risk due to its overly broad conditions and recommend narrowing triggers and tightening the content condition.

## Judge Instructions

The agent MUST identify the overly broad block rule as a potential noise source based on its configuration (all triggers, match-all condition), even if current event counts are modest. Simply reporting event counts without analyzing rule configuration quality is insufficient. Recommending specific narrowing actions counts as a strong PASS.
