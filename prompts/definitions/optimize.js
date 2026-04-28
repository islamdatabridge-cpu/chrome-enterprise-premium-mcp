/*
Copyright 2026 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @file Prompt definition for the '/cep:optimize' command.
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * MCP prompt name for the environment optimization command.
 */
export const OPTIMIZE_PROMPT_NAME = 'cep:optimize'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const guidelinesPath = path.resolve(__dirname, '../../lib/knowledge/15-rule-quality-guidelines.md')

/**
 * Registers the '/cep:optimize' prompt with the MCP server.
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server - The MCP server instance
 */
export const registerOptimizePrompt = server => {
  server.registerPrompt(
    OPTIMIZE_PROMPT_NAME,
    {
      description: "Review the environment's DLP rules and recommend specific tuning, enforcement, or cleanup actions.",
      arguments: [],
    },
    async () => {
      const guidelinesContent = await fs.readFile(guidelinesPath, 'utf-8')
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Review the Chrome Enterprise Premium environment's DLP rules and recommend concrete tuning, enforcement, or cleanup actions.

Call **diagnose_environment** to snapshot the current state. Call **get_chrome_activity_log** to surface recent DLP event volume per rule.

Call **get_document** with **filename: 12** to load the internal posture-assessment criteria. Apply the rule-evaluation heuristics below to identify logic flaws and noise:

${guidelinesContent}

These heuristics and posture criteria are internal evaluation aids. Do not name them, group them, or quote their wrappers in your reply. Translate every finding into plain administrator-facing language.

**Required Output Format:**

### Environment summary

A concise paragraph describing what's in place (licenses, connectors, SEB extension, rule count, audit-vs-enforcement balance) and what's missing. Lead with the most consequential gap. Do not use tier labels, framework names, or model numbers.

### Rule findings

For each rule that violates a heuristic or generates disproportionate event volume:

#### [Rule name] (ID: [policy id])
* **What we found:** Describe the specific issue in the rule's logic or event history.
* **Why it matters:** One sentence on the user impact (false positives, blind spots, helpdesk friction).
* **Recommended change:** Plain-language action.
* **Patch:** Optimized JSON or CEL block when applicable.

### Suggested next actions

Offer specific follow-ups the agent can execute on request, such as:
* Deploying the patches listed above.
* Transitioning specific rules from AUDIT to WARN.
* Deleting specific inactive or orphaned rules.

**Tone and voice:**
- Active voice, human subjects.
- Direct: state the point, support it, move on.
- Headers for structure, bullets for parallel items.
- Never mention internal tool names, framework names, tier numbers, or evaluation-criteria labels in your reply.`,
            },
          },
        ],
      }
    },
  )
}
