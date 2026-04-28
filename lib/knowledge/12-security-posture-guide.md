---
title: CEP Security Posture Assessment Heuristics
articleId: '12'
summary: 'Internal evaluation criteria the agent uses to assess a Chrome Enterprise Premium environment and recommend next steps. Walks through whether the prerequisites (licenses, connectors, SEB extension) are present, whether DLP rules exist, whether they are tuned, and whether they are enforcing. Covers the telemetry dependency (logs require active rules). For agent-internal use only — do not surface labels or framework names to users.'
---

# CEP Security Posture Assessment

These criteria help the agent decide what to recommend after running `diagnose_environment`. They are agent-internal — describe findings to the user in plain language without quoting category names from this article.

## Step 1: Are the prerequisites in place?

Look for missing CEP licenses, unconfigured Content Analysis Connectors, or a missing Secure Enterprise Browser (SEB) extension. If any are missing, recommend:

1.  **Licenses**: Assign CEP licenses to all managed users.
2.  **Connectors**: Enable and configure all Content Analysis Connectors (Upload, Download, Paste, Print, URL Check) at the Root OU.
3.  **SEB extension**: Force-install the Secure Enterprise Browser extension (ID: `ekajlcmdfcigmdbphhifahdfjbkciflj`) so the environment can use advanced features like data masking.

If the prerequisites are missing, the recommendations below do not yet apply — those gaps must close first.

## Step 2: Are there any DLP rules?

If the prerequisites are in place but the environment has zero or very few rules:

1.  **Telemetry dependency**: Security logs for data-centric events (e.g., sensitive-data hits) only populate when a corresponding rule is active. If logs are empty, the absence of rules is the reason.
2.  **Visibility options**:
    - **Broad baseline**: Deploy broad `AUDIT`-mode rules (a "starter pack") for a comprehensive view of high-risk data flows.
    - **Incremental discovery**: For organizations with strict change controls, deploy targeted `AUDIT` rules covering known-sensitive domains or specific high-risk detectors first.
3.  **Data-driven refinement**: Once `AUDIT` logs populate, use `get_chrome_activity_log` to identify patterns and move on to tuning.

## Step 3: Are the existing rules tuned?

If rules exist but are predominantly in `AUDIT` mode:

1.  **Log review**: Analyze audit logs to spot noise or false positives.
2.  **Rule tuning**: Adjust match thresholds, refine URL categories, add destination constraints based on real-world usage.
3.  **Trigger coverage**: Confirm rules cover the relevant triggers (Upload, Paste, Download, Print, URL Check) for the data types in scope.

## Step 4: Are the rules enforcing?

If rules are tuned and high-fidelity:

1.  **Transition to enforcement**: Move stable, high-fidelity rules from `AUDIT` to `WARN` or `BLOCK`.
2.  **Data masking**: Apply hard or light obfuscation for sensitive data inside the browser for specific URLs.
3.  **Continuous audit**: Review `BLOCK` events weekly to keep business continuity in view.
