---
title: 'DLP Rule Evaluation Heuristics'
summary: 'Internal evaluation criteria the agent uses to identify logic flaws and noise in Chrome Enterprise Premium DLP rule JSON. Covers context blindness (missing destination vectors), false negatives from broad file-type exclusions, root-OU over-scoping, low match thresholds that cause false positives, missing compound logic, mixed triggers, disproportionate actions, audit-first deployment, and orphaned rules. For agent-internal use only — do not surface heuristic names or category labels to users.'
articleId: 15
---

# DLP Rule Evaluation Heuristics

These heuristics help the agent inspect DLP rule JSON and recommend specific tuning, enforcement, or cleanup actions. They are agent-internal — translate every finding into plain administrator-facing language. Do not name a heuristic, number it, or group it under any taxonomy in your reply to the user.

## Steering rules

1. **Logic over intent.** Ignore `displayName`. Evaluate the explicit CEL operators (`AND`, `OR`, `NOT`), the `triggers` array, and the `action` fields.
2. **Limit assumptions.** Flag only issues supported by the raw JSON payload provided.
3. **Generate corrected payloads.** For every rule that matches a heuristic below, produce a corrected, valid JSON or CEL snippet that implements the recommended change.

## Heuristics

### Context blindness

If `trigger` is `WEB_CONTENT_UPLOAD` or `URL_NAVIGATION` but the CEL `condition` lacks a destination vector (e.g., no `url_navigation.destination.domain` or `google.workspace.chrome.url.category` restriction), the rule is a noisy "catch-all".
**Recommended change:** Inject CEL constraints restricting matches to high-risk egress channels — unmanaged cloud uploads, personal webmail, etc.

### Broad file-type exclusion

If the CEL condition contains broad file-type exclusions (e.g., `!file.name.endsWith('.docx')` or `!file.type.contains('excel')`), it creates large blind spots.
**Recommended change:** Remove the broad format exclusion. Use a higher match threshold or targeted recipient boundaries instead.

### Root-OU targeting without device signals

Policies applied to the Root OU without Context-Aware Access (CAA) device signals (e.g., ignoring `device.managed == true`) over-scope the deployment.
**Recommended change:** Require explicit inclusion groups or CAA binding before applying broad enforcement.

### Threshold sensitivity

If the payload contains a detector for broad numerical patterns (SSN, credit-card) with a `minimum_match_count` or threshold of 1, it produces large volumes of false positives.
**Recommended change:** Increase the instance threshold so the rule targets bulk exfiltration rather than incidental matches.

### Missing compound logic

If an identifier rule lacks proximity or compound logic, it triggers on random numbers. High-fidelity rules need a multi-part compound condition.
**Recommended change:** Output a corrected boolean `AND` block in CEL that chains the primary pattern with a secondary dictionary match (e.g., requiring keywords like "Visa" or "Invoice" within 10–50 terms).

### Mixed triggers in a single rule

If the `triggers` array combines unrelated actions (e.g., `[FILE_UPLOAD, FILE_DOWNLOAD, PRINT, CLIPBOARD_COPY]`), precise tuning is impossible.
**Recommended change:** Split the rule. Output distinct JSON payloads, one specific action mapped to one specific data type per rule.

### Disproportionate action for the scope

If `action == 'BLOCK'` on a rule with broad scope or low threshold, it generates immediate helpdesk traffic.
**Recommended change:** Downgrade `action` to `WARN`. Inject user override / justification parameters into the JSON payload to turn friction into an educational event.

### Audit-first not respected

A new rule that bypasses `AUDIT` mode prevents the establishment of a baseline.
**Recommended change:** Default new and untested rules to `AUDIT` mode.

### Orphaned state

`state == 'INACTIVE'` rules and rules missing `target_resources` bindings accumulate as technical debt.
**Recommended change:** Flag inactive rules for deletion. Flag rules with missing targets so they can be scoped explicitly.

## Output format (per rule)

For every rule the heuristics flag:

1. Rule name and ID.
2. **What we found:** The specific issue, mapped back to the rule's JSON. Do not name the heuristic in your reply.
3. **Recommended change:** Plain-language action.
4. **Patch:** Corrected JSON or CEL block establishing proper compound conditions, thresholds, destination vectors, or override actions.

## Reporting constraints

- Do not use internal tool names or heuristic names in your output. Translate findings into administrator-facing language.
- Use standard straight quotes inside JSON/CEL code blocks.
