--- CASE ---

id: sec-log-01
category: security
tags:
  - security
  - posture
  - logs
scenario: maturity-step-3-tuning
expected_tools:
  - diagnose_environment
  - get_document
  - get_chrome_activity_log
priority: P1

## Prompt

I've set up some baseline audit rules. What should my next steps be to improve our security posture?

## Golden Response

The agent should first perform a diagnostic check and consult the security posture heuristics (document 12).
It should then analyze the Chrome activity logs and notice the recurring sensitive file uploads to `personal-dropbox.com`.
The recommendation should include tightening the existing audit rules or creating a new rule to `WARN` or `BLOCK` (as per Step 3 or 4 of the posture guide) specifically for high-risk domains like Dropbox, since they are already appearing in the audit logs with sensitive content names like 'secret_project.pdf' and 'passwords.txt'.

## Judge Instructions

Grade as PASS if the agent:
1. Calls 'diagnose_environment' and 'get_document' for document 12.
2. Calls 'get_chrome_activity_log' to anchor its recommendations.
3. Specifically mentions the activity related to 'personal-dropbox.com' or the sensitive files ('secret_project.pdf', 'passwords.txt') found in the logs.
4. Suggests moving from 'AUDIT' to 'WARN' or 'BLOCK' for these specific risky data flows as a next step.
Fail if the agent ignores the activity logs or provides generic advice not anchored in the provided log data.

--- CASE ---

id: sec-log-02
category: security
tags:
  - security
  - posture
  - logs
scenario: maturity-step-3-tuning
expected_tools:
  - diagnose_environment
  - get_document
  - get_chrome_activity_log
priority: P1

## Prompt

Run a security assessment of my environment and tell me if any of my existing rules need tuning.

## Golden Response

The agent should analyze the activity logs and correlate them with the active rules.
It should identify that the 'Baseline Audit Rule' (or specifically '🤖 Audit: Block sensitive file uploads') is picking up sensitive uploads to Dropbox.
As per Step 3 of the posture guide, it should recommend tuning this rule or adding destination-specific constraints to reduce noise or increase protection (e.g. promoting the action to WARN for that specific destination).

## Judge Instructions

Grade as PASS if the agent:
1. Uses the activity log to identify a "noisy" or "firing" rule.
2. Correlates the logs with 'personal-dropbox.com'.
3. Recommends a specific tuning action (like tightening match thresholds or refining URL categories) or an enforcement escalation for that pattern.
Fail if the agent doesn't use the logs to justify its tuning recommendation.
