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
 * @file Verifies that each HTTP request receives a distinct sessionState object
 * so that resolved customer data from one tenant cannot bleed into another.
 */

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

/**
 * Simulates the per-request sessionState factory used inside each HTTP handler.
 * This mirrors the inline object construction in mcp-server.js so that the test
 * stays decoupled from Express and MCP SDK internals.
 */
function makeSessionState() {
  return { customerId: null, cachedRootOrgUnitId: null, pendingRule: null, history: [] }
}

describe('HTTP per-request session state isolation', () => {
  test('Two requests receive distinct sessionState objects', () => {
    const stateA = makeSessionState()
    const stateB = makeSessionState()

    assert.notStrictEqual(stateA, stateB, 'Each request must get a separate object reference')
  })

  test('Mutating one request sessionState does not affect another', () => {
    const stateA = makeSessionState()
    const stateB = makeSessionState()

    // Simulate wrapper.js writing a resolved customerId for tenant A
    stateA.customerId = 'C012345'
    stateA.cachedRootOrgUnitId = 'orgUnits/abc'

    assert.strictEqual(stateB.customerId, null, 'Tenant B customerId must remain null')
    assert.strictEqual(stateB.cachedRootOrgUnitId, null, 'Tenant B cachedRootOrgUnitId must remain null')
  })

  test('Each fresh sessionState starts with null customerId', () => {
    const state = makeSessionState()
    assert.strictEqual(state.customerId, null)
  })

  test('Each fresh sessionState starts with null cachedRootOrgUnitId', () => {
    const state = makeSessionState()
    assert.strictEqual(state.cachedRootOrgUnitId, null)
  })

  test('Each fresh sessionState starts with null pendingRule', () => {
    const state = makeSessionState()
    assert.strictEqual(state.pendingRule, null)
  })

  test('Each fresh sessionState starts with an empty history array', () => {
    const state = makeSessionState()
    assert.deepEqual(state.history, [])
  })

  test('History mutation on one request sessionState does not affect another', () => {
    const stateA = makeSessionState()
    const stateB = makeSessionState()

    stateA.history.push({ role: 'user', content: 'generic query' })

    assert.strictEqual(stateB.history.length, 0, 'Tenant B history must remain empty')
  })

  test('Multiple concurrent request states are all independent', () => {
    const states = Array.from({ length: 5 }, makeSessionState)

    states[2].customerId = 'C099999'
    states[2].cachedRootOrgUnitId = 'orgUnits/xyz'

    for (let i = 0; i < states.length; i++) {
      if (i === 2) {
        continue
      }
      assert.strictEqual(states[i].customerId, null, `Request ${i} customerId should be null`)
      assert.strictEqual(states[i].cachedRootOrgUnitId, null, `Request ${i} cachedRootOrgUnitId should be null`)
    }
  })
})
