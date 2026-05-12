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
  id: 'k36',
  priority: 'P2',
  tags: ['evidence-locker', 'paste'],
  requiredPatterns: ['Evidence Locker'],
  prompt: 'Can I use Evidence Locker to log pasted text or with a URL filtering rule?',
  goldenResponse:
    'Evidence Locker is a Chrome Enterprise Premium feature used to capture and inspect files triggering security alerts by saving them to a GCS bucket. It works with DLP rules for File Uploads, File Downloads, and Printing. However, Evidence Locker cannot be used with standard URL filtering rules as they do not scan content, and it is explicitly not supported for content pasted actions to avoid storing sensitive data like accidentally pasted passwords.',
}
