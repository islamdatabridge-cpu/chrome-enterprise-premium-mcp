---
summary: 'Guide for configuring timeout deadlines (evaluation time limit) for Data Loss Prevention (DLP) and malware scans, including the paste action. Covers UI navigation paths, Admin privileges required, and background scan behavior. Keywords: Configurable timeouts, evaluation time limit, deep scanning protection settings, scan deadline, paste deadline.'
title: 'Configurable Timeout Deadlines for Deep Scanning'
articleId: 16
url: 'https://support.google.com/chrome/a/answer/16493390?hl=en'
---

As an administrator with the Chrome Enterprise Security Services privilege and a Chrome Enterprise Premium subscription, you can set a timeout deadline for Data Loss Prevention (DLP) and malware scans, which includes the paste action, in the Google Admin console.

To set a timeout deadline:

1. Sign in to the Google Admin console with an administrator account.
2. Navigate to Menu > Apps > Additional Google Services.
3. Click Chrome Enterprise Security Services.
4. Click Deep scanning protection settings.
5. Click Edit.
6. For the evaluation time limit for file upload, download, print, or ChromeOS file transfer action, enter a time limit in seconds (e.g., 8.5).

This configurable deadline allows you to control how long users wait for scans before the action is allowed to proceed, with the scan continuing in the background. The General Availability (GA) UI for this feature includes support for malware, DLP, and paste deadline.
