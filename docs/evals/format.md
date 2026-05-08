# Eval case format

Each eval case is a JavaScript file at `test/evals/cases/<category>/<id>.eval.js` that default-exports a single object. The category is the parent directory name; there is no `category` field in the case body.

A copyable starter sits at `test/evals/TEMPLATE.eval.js`.

## Minimum

```js
export default {
  id: 'list_dlp_rules__when_no_rules_returned_agent_reports_none',
  scenario: 'no-dlp-rules',
  expectedTools: ['list_dlp_rules'],
  prompt: 'List my configured Chrome DLP rules.',
  goldenResponse: 'No Chrome DLP rules were found in this organization.',
  judgeInstructions: 'The agent must clearly and accurately state that no rules were found.',
}
```

## Fields

### Required

| Field                      | Type   | Notes                                                                                                             |
| -------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| `id`                       | string | Matches `/^[A-Za-z0-9_]+$/`. Unique across the suite. The drift comparator keys on this — do not rename casually. |
| `prompt` _or_ `promptName` | string | The user input. `promptName` fetches a server-defined MCP prompt at runtime instead. Set exactly one.             |
| `goldenResponse`           | string | What a correct response covers. The judge compares semantically, not word-for-word.                               |

### Optional

| Field                       | Type                   | Default                             | Notes                                                                                                       |
| --------------------------- | ---------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `priority`                  | `'P0' \| 'P1' \| 'P2'` | `'P2'`                              | P0 = launch-blocking, P1 = must not be egregiously wrong, P2 = nice to have.                                |
| `tags`                      | `string[]`             | `[]`                                | Filterable with `--tags`.                                                                                   |
| `scenario`                  | string                 | `null`                              | Name of a file in `test/evals/scenarios/`. Replaces fake-server state. Mutually exclusive with `fixtures`.  |
| `fixtures`                  | `string[]`             | `[]`                                | JSON files under `test/evals/fixtures/` to merge into fake-server state.                                    |
| `expectedTools`             | `string[]`             | `[]`                                | Each tool must be called by the agent during the run.                                                       |
| `forbiddenPatterns`         | `string[]`             | `[]`                                | Substring matches by default; prefix with `re:` for regex. Merged with global list from `global.yaml`.      |
| `forbiddenPatternsOverride` | `boolean`              | `false`                             | Replace the global list instead of merging.                                                                 |
| `requiredPatterns`          | `string[]`             | `[]`                                | Strings the response must contain. Use only for canonical values (proper nouns, exact numbers, exact URLs). |
| `judgeInstructions`         | string                 | (default rubric from `global.yaml`) | Per-case rubric override.                                                                                   |
| `experiments`               | object                 | `null`                              | Pin feature-flag values for the run. Example: `{ DELETE_TOOL_ENABLED: false }`.                             |

## Category from directory

Cases live under `test/evals/cases/<category>/`. The loader treats the parent directory name as the category. Adding a new category means adding a new directory; renaming one means moving files. There is no separate registry to update.

The categories currently used:

```
boundary connectors discovery inspection knowledge licensing
mutation prompt security system
```

## Validation

The loader rejects, with a file-level error, any case that:

- has an unknown field
- has a missing or non-string `id`
- has an `id` that doesn't match the pattern
- has neither `prompt` nor `promptName`
- has a missing or empty `goldenResponse`
- sets both `scenario` and a non-empty `fixtures`

Duplicate `id` values across files (markdown or JS) are also a load-time error.

## Multi-line prose

Use template literals for golden responses or rubrics that span paragraphs. There is no escaping concern — newlines, quotes, and Markdown are just characters in a string:

```js
goldenResponse: `Agent should identify that the audit rule is generating
significantly more events than other rules. Multiple users across multiple
days are triggering it. Agent should flag this as a high-noise rule and
recommend either tightening the rule's conditions, switching to a more
targeted URL list, or accepting the volume if monitoring GenAI usage is a
priority.`,
```

## Sharing rubrics across cases

A rubric used by several cases can be a plain JS export:

```js
// test/evals/lib/rubrics/dlp.js
export const dlpEnumerationRubric = `The agent must list every configured
DLP rule by display name. Tool names must not appear. Resource IDs must not
appear.`
```

```js
// test/evals/cases/discovery/list_dlp_rules__all_rules.eval.js
import { dlpEnumerationRubric } from '../../lib/rubrics/dlp.js'

export default {
  id: 'list_dlp_rules__all_rules',
  // ...
  judgeInstructions: dlpEnumerationRubric,
}
```

## File naming

Recommended: filename matches `id`. A case with `id: 'm04'` lives at `test/evals/cases/mutation/m04.eval.js`; a case with a long descriptive id lives at `<id>.eval.js`. Both ID conventions (short codes like `m04` and descriptive snake_case like `list_dlp_rules__no_rules`) are accepted; pick whichever a sibling case in the same directory uses.

## Drift detection and IDs

The CI workflow at `.github/workflows/agent-evals.yml` runs `scripts/eval-diff.js` against `results/eval-baseline.json` on a cron and on manual dispatch. The diff keys on case `id`. When you migrate a case from markdown to JS, preserve the `id` exactly. When you add a new case, the next baseline regeneration picks it up.
