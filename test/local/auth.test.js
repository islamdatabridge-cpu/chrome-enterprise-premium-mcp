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

import assert from 'node:assert/strict'
import { describe, test, mock } from 'node:test'
import esmock from 'esmock'

describe('Auth', () => {
  test('When an auth token is provided, then it returns an OAuth2 client', async () => {
    const { getAuthClient } = await esmock('../../lib/util/auth.js', {
      'google-auth-library': {
        OAuth2Client: class {
          setCredentials() {}
        },
      },
    })
    const client = await getAuthClient([], 'test-token')
    assert.ok(client)
  })

  test('When no auth token is provided, then it returns a GoogleAuth client', async () => {
    const { getAuthClient } = await esmock('../../lib/util/auth.js', {
      'google-auth-library': {
        GoogleAuth: class {
          async getClient() {
            return {}
          }
        },
      },
    })
    const client = await getAuthClient([])
    assert.ok(client)
  })

  test('When ADC credentials are valid, then ensureADCCredentials returns true', async () => {
    // Mock console.log/error to suppress output during test
    const consoleLogMock = mock.method(console, 'log', () => {})
    const consoleErrorMock = mock.method(console, 'error', () => {})

    const { ensureADCCredentials } = await esmock('../../lib/util/auth.js', {
      'google-auth-library': {
        GoogleAuth: class {
          async getClient() {
            return {
              getAccessToken: async () => ({ token: 'mock-token' }),
            }
          }
        },
      },
    })

    const result = await ensureADCCredentials()
    assert.strictEqual(result, true)

    // Restore console mocks
    consoleLogMock.mock.restore()
    consoleErrorMock.mock.restore()
  })

  test('When ADC credentials are missing or invalid, then ensureADCCredentials returns false', async () => {
    // Mock console.log/error to suppress output during test
    const consoleLogMock = mock.method(console, 'log', () => {})
    const consoleErrorMock = mock.method(console, 'error', () => {})

    const { ensureADCCredentials } = await esmock('../../lib/util/auth.js', {
      'google-auth-library': {
        GoogleAuth: class {
          async getClient() {
            throw new Error('No ADC found')
          }
        },
      },
    })

    const result = await ensureADCCredentials()
    assert.strictEqual(result, false)

    // Restore console mocks
    consoleLogMock.mock.restore()
    consoleErrorMock.mock.restore()
  })

  describe('getAuthErrorMessage', () => {
    test('When a project with the required API enabled is found, then it is suggested', async () => {
      const mockExecFile = mock.fn((cmd, args, opts, cb) => {
        let stdout = ''
        if (cmd === 'gcloud' && args.includes('--version')) {
          stdout = 'Google Cloud SDK'
        } else if (cmd === 'gcloud' && args.includes('config') && args.includes('get-value')) {
          stdout = '(unset)\n'
        } else if (
          cmd === 'gcloud' &&
          args.includes('projects') &&
          args.includes('list') &&
          args.includes('--limit=10')
        ) {
          stdout = 'proj-1\nproj-2\nproj-3\n'
        } else if (cmd === 'gcloud' && args.includes('services') && args.includes('list')) {
          const projectIndex = args.indexOf('--project') + 1
          const projectId = args[projectIndex]
          if (projectId === 'proj-2') {
            stdout = 'admin.googleapis.com\n'
          }
        }
        cb(null, stdout, '')
      })

      const { getAuthErrorMessage } = await esmock('../../lib/util/auth-error.js', {
        'node:child_process': {
          execFile: mockExecFile,
        },
      })

      const error = new Error('The admin.googleapis.com API requires a quota project, which is not set by default.')
      const message = await getAuthErrorMessage(error)

      assert.match(message, /We found a potential quota project "proj-2"/)
      assert.match(message, /gcloud auth application-default set-quota-project proj-2/)
    })

    test('When no project has the API enabled, then it falls back to the most recent project', async () => {
      const mockExecFile = mock.fn((cmd, args, opts, cb) => {
        let stdout = ''
        if (cmd === 'gcloud' && args.includes('--version')) {
          stdout = 'Google Cloud SDK'
        } else if (cmd === 'gcloud' && args.includes('config') && args.includes('get-value')) {
          stdout = '(unset)\n'
        } else if (
          cmd === 'gcloud' &&
          args.includes('projects') &&
          args.includes('list') &&
          args.includes('--limit=10')
        ) {
          stdout = 'proj-1\nproj-2\n'
        }
        cb(null, stdout, '')
      })

      const { getAuthErrorMessage } = await esmock('../../lib/util/auth-error.js', {
        'node:child_process': {
          execFile: mockExecFile,
        },
      })

      const error = new Error('The admin.googleapis.com API requires a quota project, which is not set by default.')
      const message = await getAuthErrorMessage(error)

      assert.match(message, /We found a potential quota project "proj-1"/) // Fallback to first (most recent)
    })

    test('When no projects are found at all, then it falls back to a generic console URL message', async () => {
      const mockExecFile = mock.fn((cmd, args, opts, cb) => {
        let stdout = ''
        if (cmd === 'gcloud' && args.includes('--version')) {
          stdout = 'Google Cloud SDK'
        } else if (cmd === 'gcloud' && args.includes('config') && args.includes('get-value')) {
          stdout = '(unset)\n'
        }
        cb(null, stdout, '')
      })

      const { getAuthErrorMessage } = await esmock('../../lib/util/auth-error.js', {
        'node:child_process': {
          execFile: mockExecFile,
        },
      })

      const error = new Error('The admin.googleapis.com API requires a quota project, which is not set by default.')
      const message = await getAuthErrorMessage(error)

      assert.match(message, /Google Cloud Console/)
      assert.match(message, /console\.cloud\.google\.com\/cloud-resource-manager/)
      assert.doesNotMatch(message, /gcloud projects list/)
    })

    test('When a project is already configured in gcloud, then it uses that project directly', async () => {
      const mockExecFile = mock.fn((cmd, args, opts, cb) => {
        let stdout = ''
        if (cmd === 'gcloud' && args.includes('--version')) {
          stdout = 'Google Cloud SDK'
        } else if (cmd === 'gcloud' && args.includes('config') && args.includes('get-value')) {
          stdout = 'configured-project\n'
        }
        cb(null, stdout, '')
      })

      const { getAuthErrorMessage } = await esmock('../../lib/util/auth-error.js', {
        'node:child_process': {
          execFile: mockExecFile,
        },
      })

      const error = new Error('The admin.googleapis.com API requires a quota project, which is not set by default.')
      const message = await getAuthErrorMessage(error)

      assert.match(message, /We found a potential quota project "configured-project"/)
      assert.match(message, /gcloud auth application-default set-quota-project configured-project/)
    })
  })
})
