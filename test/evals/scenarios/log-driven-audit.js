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
 * @file Scenario: all DLP rules are audit-only and activity logs are populated.
 *
 * Combines the audit-only state with specific risky activity logs.
 */

/** @param {object} state - Cloned base state. */
export function mutate(state) {
  // 1. Make all rules audit-only
  for (const key of Object.keys(state.policies)) {
    const setting = state.policies[key].setting
    if (setting?.type === 'settings/rule.dlp' && setting.value?.action) {
      setting.value.action = { chromeAction: { auditOnly: {} } }
      // Give them a distinct name to help the agent identify them in logs
      setting.value.displayName = `🤖 Audit: ${setting.value.displayName}`
    }
  }

  // 2. Add activity logs
  state.activities = [
    {
      kind: 'admin#reports#activity',
      id: { time: '2026-05-01T09:00:00Z', applicationName: 'chrome', customerId: state.defaultCustomerId },
      actor: { email: 'admin@example.com' },
      events: [
        {
          type: 'DLP_EVENT',
          name: 'DLP_AUDIT',
          parameters: [
            { name: 'TRIGGER_TYPE', value: 'FILE_UPLOAD' },
            { name: 'MATCHED_RULE', value: '🤖 Audit: Block sensitive file uploads' },
            { name: 'CONTENT_NAME', value: 'secret_project.pdf' },
            { name: 'URL', value: 'https://personal-dropbox.com/upload' },
          ],
        },
      ],
    },
    {
      kind: 'admin#reports#activity',
      id: { time: '2026-05-01T10:15:00Z', applicationName: 'chrome', customerId: state.defaultCustomerId },
      actor: { email: 'admin@example.com' },
      events: [
        {
          type: 'DLP_EVENT',
          name: 'DLP_AUDIT',
          parameters: [
            { name: 'TRIGGER_TYPE', value: 'FILE_UPLOAD' },
            { name: 'MATCHED_RULE', value: '🤖 Audit: Block sensitive file uploads' },
            { name: 'CONTENT_NAME', value: 'passwords.txt' },
            { name: 'URL', value: 'https://personal-dropbox.com/upload' },
          ],
        },
      ],
    },
  ]

  return state
}
