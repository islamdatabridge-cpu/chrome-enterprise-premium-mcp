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

import { describe, test, mock } from 'node:test'
import assert from 'node:assert/strict'

import { verifyBearerToken } from '../../lib/util/credential/bearer_verifier.js'

const AUDIENCE = '123.apps.googleusercontent.com'

describe('verifyBearerToken', () => {
  test('When verify resolves and no lockedSub is set, then it returns ok with principal', async () => {
    const principal = { sub: '111', email: 'alice@example.com' }
    const verify = mock.fn(async () => principal)

    const result = await verifyBearerToken('token', { expectedAudience: AUDIENCE, lockedSub: '', verify })

    assert.deepStrictEqual(result, { ok: true, principal })
    assert.strictEqual(verify.mock.callCount(), 1)
    assert.deepStrictEqual(verify.mock.calls[0].arguments, ['token', { expectedAudience: AUDIENCE }])
  })

  test('When verify resolves and lockedSub matches principal.sub, then it returns ok', async () => {
    const principal = { sub: '111', email: 'alice@example.com' }
    const verify = mock.fn(async () => principal)

    const result = await verifyBearerToken('token', { expectedAudience: AUDIENCE, lockedSub: '111', verify })

    assert.deepStrictEqual(result, { ok: true, principal })
  })

  test('When verify resolves and lockedSub does not match principal.sub, then it returns a 403 result', async () => {
    const principal = { sub: '111', email: 'alice@example.com' }
    const verify = mock.fn(async () => principal)

    const result = await verifyBearerToken('token', { expectedAudience: AUDIENCE, lockedSub: '222', verify })

    assert.strictEqual(result.ok, false)
    assert.strictEqual(result.status, 403)
    assert.strictEqual(result.message, 'Principal not authorized for this deployment')
    assert.deepStrictEqual(result.principal, principal)
  })

  test('When verify rejects, then it returns a 401 result with the original error', async () => {
    const error = new Error('audience mismatch')
    const verify = mock.fn(async () => {
      throw error
    })

    const result = await verifyBearerToken('token', { expectedAudience: AUDIENCE, lockedSub: '', verify })

    assert.strictEqual(result.ok, false)
    assert.strictEqual(result.status, 401)
    assert.strictEqual(result.message, 'Bearer token verification failed')
    assert.strictEqual(result.error, error)
  })

  test('When lockedSub is empty, then sub is not checked', async () => {
    const principal = { sub: '111' }
    const verify = mock.fn(async () => principal)

    const result = await verifyBearerToken('token', { expectedAudience: AUDIENCE, lockedSub: '', verify })

    assert.strictEqual(result.ok, true)
  })
})
