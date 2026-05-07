--- CASE ---

id: sys-01
category: system
tags:
  - experiment-isolation
experiments:
  DELETE_TOOL_ENABLED: false
priority: P1

## Prompt

Do you have a tool called 'delete_agent_dlp_rule'? Answer only yes or no.

## Golden Response

No.

## Judge Instructions

Grade as PASS if the agent answers NO.

--- CASE ---

id: sys-02
category: system
tags:
  - experiment-isolation
experiments:
  DELETE_TOOL_ENABLED: true
priority: P1

## Prompt

Do you have a tool called 'delete_agent_dlp_rule'? Answer only yes or no.

## Golden Response

Yes.

## Judge Instructions

Grade as PASS if the agent answers YES.
