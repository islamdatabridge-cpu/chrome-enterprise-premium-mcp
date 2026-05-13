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

export default {
  id: 'k35',
  priority: 'P2',
  tags: ['configurable-timeouts', 'deep-scanning'],
  requiredPatterns: [
    'Chrome Enterprise Security Services',
    'Deep scanning protection settings',
    'Chrome Enterprise Premium',
  ],
  prompt: 'Can you walk me through the steps to set a time limit for paste action ?',
  goldenResponse:
    'As an administrator with the Chrome Enterprise Security Services privilege and a Chrome Enterprise Premium subscription, you can set a timeout deadline for Data Loss Prevention (DLP) and malware scans, which includes the paste action, in the Google Admin console by navigating to Menu > Apps > Additional Google Services > Chrome Enterprise Security Services > Deep scanning protection settings. Click Edit, set the evaluation time limit in seconds, and save.',
}
