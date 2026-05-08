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

import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGlobalConfig, loadEvalsFromFile, loadAllEvals, loadEvalAsCodeFromFile } from '../evals/lib/loader.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const evalsDir = path.resolve(__dirname, '..', 'evals')

describe('Eval Loader', () => {
  describe('loadGlobalConfig', () => {
    test('When global config is loaded, then it includes forbidden patterns from global.yaml', () => {
      const config = loadGlobalConfig(evalsDir)
      assert.ok(Array.isArray(config.forbiddenPatterns))
      assert.ok(config.forbiddenPatterns.length > 0, 'should have forbidden patterns')
      assert.ok(
        config.forbiddenPatterns.includes('google.workspace.chrome.file.v1.upload'),
        'should include trigger API strings',
      )
    })

    test('When global config is loaded, then it includes a non-empty default judge rubric', () => {
      const config = loadGlobalConfig(evalsDir)
      assert.ok(typeof config.defaultJudgeRubric === 'string')
      assert.ok(config.defaultJudgeRubric.length > 0)
    })
  })

  describe('loadEvalsFromFile', () => {
    test('When a markdown eval file with multiple cases is parsed, then it returns all cases', () => {
      const config = loadGlobalConfig(evalsDir)
      const evalFile = path.join(evalsDir, 'cases', 'docs', '0-agent-capabilities.md')
      const evals = loadEvalsFromFile(evalFile, config)

      assert.ok(evals.length >= 3, 'should find multiple eval cases in consolidated file')
      const k01 = evals.find(e => e.id === 'k01')
      assert.ok(k01)
      assert.strictEqual(k01.id, 'k01')
      assert.strictEqual(k01.category, 'knowledge')
      assert.deepStrictEqual(k01.tags, ['overview'])
      assert.ok(k01.prompt.includes('What is Chrome Enterprise Premium'))
      assert.ok(k01.goldenResponse.includes('Chrome Enterprise Premium (CEP)'))
    })

    test('When evals are loaded from file, then they inherit global forbidden patterns', () => {
      const config = loadGlobalConfig(evalsDir)
      const evalFile = path.join(evalsDir, 'cases', 'docs', '0-agent-capabilities.md')
      const evals = loadEvalsFromFile(evalFile, config)
      const k01 = evals.find(e => e.id === 'k01')

      // Should include global patterns
      assert.ok(k01.forbiddenPatterns.includes('google.workspace.chrome.file.v1.upload'))
    })

    test('When evals are loaded from file, then it extracts required_patterns from frontmatter', () => {
      const config = loadGlobalConfig(evalsDir)
      const evalFile = path.join(evalsDir, 'cases', 'docs', '1-product-and-licensing.md')
      const evals = loadEvalsFromFile(evalFile, config)
      const k03 = evals.find(e => e.id === 'k03')

      assert.ok(k03.requiredPatterns.includes('$6'))
    })
  })

  describe('loadAllEvals', () => {
    test('When all evals are loaded, then it finds cases with all required fields', async () => {
      const evals = await loadAllEvals({ dir: evalsDir })
      assert.ok(evals.length > 0, 'should find eval cases')
      // Each eval should have required fields
      for (const e of evals) {
        assert.ok(e.id, `eval missing id`)
        assert.ok(e.category, `eval ${e.id} missing category`)
        assert.ok(e.prompt, `eval ${e.id} missing prompt`)
      }
    })

    test('When filtered by category, then it returns only matching eval cases', async () => {
      const evals = await loadAllEvals({ dir: evalsDir, category: 'knowledge' })
      assert.ok(evals.length > 0)
      for (const e of evals) {
        assert.strictEqual(e.category, 'knowledge')
      }
    })

    test('When filtered by multiple categories, then it returns cases from any of those categories', async () => {
      const evals = await loadAllEvals({ dir: evalsDir, category: 'inspection,mutation' })
      assert.ok(evals.length > 0)
      for (const e of evals) {
        assert.ok(['inspection', 'mutation'].includes(e.category))
      }
    })

    test('When filtered by tags, then it returns cases matching those tags', async () => {
      const evals = await loadAllEvals({ dir: evalsDir, tags: ['overview'] })
      assert.ok(evals.length > 0)
      for (const e of evals) {
        assert.ok(e.tags.some(t => t.toLowerCase() === 'overview'))
      }
    })

    test('When filtered by ID, then it returns only the case with that specific ID', async () => {
      const evals = await loadAllEvals({ dir: evalsDir, ids: ['k01'] })
      assert.strictEqual(evals.length, 1)
      assert.strictEqual(evals[0].id, 'k01')
    })

    test('When results are returned, then they are sorted by ID using numeric ordering', async () => {
      const evals = await loadAllEvals({ dir: evalsDir, category: 'knowledge' })
      for (let i = 1; i < evals.length; i++) {
        const cmp = evals[i - 1].id.localeCompare(evals[i].id, undefined, { numeric: true })
        assert.ok(cmp <= 0, `${evals[i - 1].id} should come before ${evals[i].id}`)
      }
    })
  })

  describe('loadEvalAsCodeFromFile', () => {
    function writeTmpEval(content) {
      const file = path.join(os.tmpdir(), `eval-as-code-${Date.now()}-${Math.random()}.eval.js`)
      fs.writeFileSync(file, content, 'utf8')
      return file
    }

    test('When a valid .eval.js case is loaded, then it returns an EvalCase with category from directory', async () => {
      const config = loadGlobalConfig(evalsDir)
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-cat-'))
      const catDir = path.join(tmpDir, 'discovery')
      fs.mkdirSync(catDir)
      const file = path.join(catDir, 'sample.eval.js')
      fs.writeFileSync(
        file,
        `export default {
          id: 'sample_case',
          priority: 'P1',
          tags: ['demo'],
          scenario: 'healthy',
          expectedTools: ['list_dlp_rules'],
          prompt: 'hello',
          goldenResponse: 'world',
          judgeInstructions: 'must say world',
        }`,
        'utf8',
      )
      try {
        const c = await loadEvalAsCodeFromFile(file, config)
        assert.strictEqual(c.id, 'sample_case')
        assert.strictEqual(c.category, 'discovery')
        assert.strictEqual(c.priority, 'P1')
        assert.deepStrictEqual(c.expectedTools, ['list_dlp_rules'])
        assert.strictEqual(c.prompt, 'hello')
        assert.strictEqual(c.goldenResponse, 'world')
        assert.ok(c.forbiddenPatterns.length > 0, 'global forbidden patterns merged in')
      } finally {
        fs.rmSync(tmpDir, { recursive: true })
      }
    })

    test('When a .eval.js case has an unknown field, then loading throws', async () => {
      const config = loadGlobalConfig(evalsDir)
      const file = writeTmpEval(`export default { id: 'bad', prompt: 'p', goldenResponse: 'g', bogusField: 1 }`)
      try {
        await assert.rejects(
          () => loadEvalAsCodeFromFile(file, config),
          err => err.message.includes("unknown field 'bogusField'"),
        )
      } finally {
        fs.unlinkSync(file)
      }
    })

    test('When a .eval.js case has an invalid id, then loading throws', async () => {
      const config = loadGlobalConfig(evalsDir)
      const file = writeTmpEval(`export default { id: 'has spaces', prompt: 'p', goldenResponse: 'g' }`)
      try {
        await assert.rejects(
          () => loadEvalAsCodeFromFile(file, config),
          err => err.message.includes("id 'has spaces'"),
        )
      } finally {
        fs.unlinkSync(file)
      }
    })

    test('When a .eval.js case omits both prompt and promptName, then loading throws', async () => {
      const config = loadGlobalConfig(evalsDir)
      const file = writeTmpEval(`export default { id: 'noprompt', goldenResponse: 'g' }`)
      try {
        await assert.rejects(
          () => loadEvalAsCodeFromFile(file, config),
          err => err.message.includes("'prompt' or 'promptName'"),
        )
      } finally {
        fs.unlinkSync(file)
      }
    })

    test('When a .eval.js case sets both fixtures and scenario, then loading throws', async () => {
      const config = loadGlobalConfig(evalsDir)
      const file = writeTmpEval(
        `export default {
          id: 'mutex',
          scenario: 's',
          fixtures: ['f.json'],
          prompt: 'p',
          goldenResponse: 'g',
        }`,
      )
      try {
        await assert.rejects(
          () => loadEvalAsCodeFromFile(file, config),
          err => err.message.includes('mutually exclusive'),
        )
      } finally {
        fs.unlinkSync(file)
      }
    })
  })

  describe('mutual exclusion of fixtures and scenario', () => {
    test('When a case sets both fixtures and scenario, then loading throws a clear error', () => {
      const config = loadGlobalConfig(evalsDir)
      const content = [
        'id: mutex-test',
        'scenario: some-scenario',
        'fixtures:',
        '  - some-fixture.json',
        '',
        '## Prompt',
        '',
        'test prompt',
      ].join('\n')
      const tmpFile = path.join(os.tmpdir(), `eval-mutex-test-${Date.now()}.md`)
      fs.writeFileSync(tmpFile, content, 'utf8')
      try {
        assert.throws(
          () => loadEvalsFromFile(tmpFile, config),
          err =>
            err.message.includes('mutex-test') &&
            err.message.includes('fixtures:') &&
            err.message.includes('scenario:'),
        )
      } finally {
        fs.unlinkSync(tmpFile)
      }
    })
  })
})
