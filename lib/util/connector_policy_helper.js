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
 * @file Shared logic for analyzing Chrome Enterprise Premium policy health.
 *
 * Centralizes technical validation of "is it enabled and protective?" vs
 * "does the policy just exist?".
 */

import { EVENT_NAME_MAPPING } from '../constants.js'
import { formatStatus } from './helpers.js'

/**
 * Normalizes an API value to a human-readable string for comparison.
 * @param {any} val - The raw value from the API.
 * @returns {string} The formatted string.
 */
export function humanize(val) {
  if (typeof val === 'boolean') {
    return val ? 'Yes' : 'No'
  }
  if (Array.isArray(val)) {
    return val.map(humanize).join(', ')
  }
  if (typeof val !== 'string') {
    return String(val)
  }
  if (EVENT_NAME_MAPPING[val]) {
    return EVENT_NAME_MAPPING[val]
  }
  return formatStatus(val.replace(/^[A-Z_]+_ENUM_/, '').replace(/^SERVICE_PROVIDER_/, ''))
}

/**
 * Analyzes the health and protection state of a Chrome Enterprise connector policy.
 * @param {string} policyType - The enum key (e.g., 'ON_PRINT', 'ON_SECURITY_EVENT').
 * @param {Array<object>} resolvedPolicies - The raw resolved policies from the API.
 * @param {string} manualUpdateLink - Link to the Admin Console for manual configuration.
 * @returns {object} Analysis result containing isConfigured, isEnabled, and warnings.
 */
export function analyzeConnectorPolicy(policyType, resolvedPolicies, manualUpdateLink = '') {
  if (!resolvedPolicies || resolvedPolicies.length === 0) {
    return {
      isConfigured: false,
      isEnabled: false,
      warnings: ['Connector is not enabled. You can enable it using the enable_chrome_enterprise_connectors tool.'],
    }
  }

  // Aggregate results across all resolved policies (usually there is only one)
  const results = resolvedPolicies.map(p => {
    const v = p.value?.value || {}
    const warnings = []
    let isEnabled = true

    if (policyType === 'ON_SECURITY_EVENT') {
      const eventCfg = v.reportingConnector?.setting?.eventConfiguration || v.reportingConnector?.eventConfiguration
      const events = eventCfg?.enabledEventNames || []
      const explicitlyEmpty = eventCfg?.explicitlyEmptyEventNames
      const coreEvents = [
        'contentTransferEvent',
        'unscannedFileEvent',
        'dangerousDownloadEvent',
        'sensitiveDataEvent',
        'interstitialEvent',
        'urlFilteringInterstitialEvent',
        'suspiciousUrlEvent',
      ]

      if (!eventCfg) {
        isEnabled = false
        warnings.push('Connector is not enabled. You can enable it using the enable_chrome_enterprise_connectors tool.')
      } else {
        let missingCoreEvents = []
        if (events.length > 0) {
          missingCoreEvents = coreEvents.filter(e => !events.includes(e))
        } else if (explicitlyEmpty) {
          missingCoreEvents = coreEvents
        }

        if (missingCoreEvents.length > 0) {
          const mappedMissing = missingCoreEvents.map(e => EVENT_NAME_MAPPING[e] || e)
          warnings.push(
            `Missing core DLP events: ${mappedMissing.join(', ')}. Update settings manually at ${manualUpdateLink}`,
          )
        }
      }
    } else if (policyType === 'ON_REALTIME_URL_NAVIGATION') {
      const checkEnabled = v.realtimeUrlCheckEnabled
      if (
        checkEnabled === false ||
        checkEnabled === 'REALTIME_URL_CHECK_MODE_ENUM_DISABLED' ||
        checkEnabled === 'ENTERPRISE_REAL_TIME_URL_CHECK_MODE_ENUM_DISABLED' ||
        checkEnabled === 'REALTIME_URL_CHECK_MODE_ENUM_UNSPECIFIED' ||
        checkEnabled === 'ENTERPRISE_REAL_TIME_URL_CHECK_MODE_ENUM_UNSPECIFIED'
      ) {
        isEnabled = false
      }
    } else {
      // Non-Reporting Connectors (Upload, Download, Paste, Print)
      const cfg =
        v.onFileAttachedAnalysisConnectorConfiguration?.fileAttachedConfiguration ||
        v.onFileDownloadedAnalysisConnectorConfiguration?.fileDownloadedConfiguration ||
        v.onBulkTextEntryAnalysisConnectorConfiguration?.bulkTextEntryConfiguration ||
        v.onPrintAnalysisConnectorConfiguration?.printConfigurations?.[0] ||
        v

      const isCEP = cfg.serviceProvider === 'SERVICE_PROVIDER_CHROME_ENTERPRISE_PREMIUM'
      const isNone =
        !cfg.serviceProvider ||
        cfg.serviceProvider === 'SERVICE_PROVIDER_NONE' ||
        cfg.serviceProvider === 'SERVICE_PROVIDER_UNSPECIFIED'

      if (isCEP) {
        if (!cfg.delayDeliveryUntilVerdict && !cfg.delay_delivery_until_verdict) {
          warnings.push(
            `Delay enforcement is disabled. Users are unprotected during content analysis. Update settings manually at ${manualUpdateLink}`,
          )
        }

        // URL Gaps (Malware/Sensitive)
        const checkGaps = (type, onByDefault, patterns) => {
          const humanized = humanize(onByDefault)
          if (humanized === 'No') {
            if (patterns && patterns.length > 0) {
              warnings.push(
                `⚠️ ${type} Analysis is restricted. Scanning is ONLY enabled for specific URL patterns, which may leave your organization vulnerable. Update settings manually at ${manualUpdateLink}`,
              )
            } else {
              warnings.push(
                `⚠️ ${type} Analysis is restricted. Scanning is NOT enabled for all files, which may leave your organization vulnerable. Update settings manually at ${manualUpdateLink}`,
              )
            }
          } else if (patterns && patterns.length > 0) {
            warnings.push(
              `⚠️ ${type} Analysis is restricted. Scanning is DISABLED for specific URL patterns, which may leave your organization vulnerable. Update settings manually at ${manualUpdateLink}`,
            )
          }
        }

        // Need to check specific fields as original code did
        if (cfg.malwareUrlPatterns?.onByDefault !== undefined) {
          checkGaps('Malware', cfg.malwareUrlPatterns.onByDefault, cfg.malwareUrlPatterns.urlPatterns)
        } else if (cfg.malwareOnByDefault !== undefined) {
          checkGaps('Malware', cfg.malwareOnByDefault, cfg.malwareUrlPatterns)
        }

        if (cfg.sensitiveUrlPatterns?.onByDefault !== undefined) {
          checkGaps('Sensitive', cfg.sensitiveUrlPatterns.onByDefault, cfg.sensitiveUrlPatterns.urlPatterns)
        } else if (cfg.sensitiveOnByDefault !== undefined) {
          checkGaps('Sensitive', cfg.sensitiveOnByDefault, cfg.sensitiveUrlPatterns)
        }

        // Fallback for connectors that don't use the new prefixed fields yet
        if (
          cfg.malwareOnByDefault === undefined &&
          cfg.malwareUrlPatterns?.onByDefault === undefined &&
          cfg.sensitiveOnByDefault === undefined &&
          cfg.sensitiveUrlPatterns?.onByDefault === undefined
        ) {
          if (cfg.malwareUrlPatterns?.length > 0 || cfg.sensitiveUrlPatterns?.length > 0) {
            warnings.push(
              `Security posture is limited due to URL allowlisting. Update settings manually at ${manualUpdateLink}`,
            )
          }
        }
      } else if (isNone) {
        isEnabled = false
        warnings.push('Connector is not enabled. You can enable it using the enable_chrome_enterprise_connectors tool.')
      } else {
        const is3p =
          cfg.serviceProvider === 'SERVICE_PROVIDER_SYMANTEC_ENDPOINT_DLP' ||
          cfg.serviceProvider === 'SERVICE_PROVIDER_TRELLIX'
        if (is3p) {
          warnings.push(
            `3rd party provider detected. Integrated CEP features may be bypassed. Update settings manually at ${manualUpdateLink}`,
          )
        }
      }
    }

    return { isEnabled, warnings }
  })

  return {
    isConfigured: true,
    isEnabled: results.some(r => r.isEnabled),
    warnings: Array.from(new Set(results.flatMap(r => r.warnings))),
  }
}
