# Test Result

## Commands

| Command | Result |
| --- | --- |
| Builder `npm test` | passed, 41 tests |
| Builder `npm run check` | passed |
| Validator `npm test` | passed, 18 tests |
| Roller dry-run preview command | passed |
| Roller generate/validate/support command | passed |
| Direct Roller validator support command | passed |

## New Builder Coverage

- approved Roller local-only dry-run fixture previews without writing output
- Roller without explicit approval still fails
- generic paused-tenant override still fails
- mismatched tenant/domain override still fails
- external mutations allowed still fails
- live pages approved still fails
- Search Console approved still fails

## New Validator Coverage

- explicit Roller local-only dry-run approval allows generated paused tenant package references
- live pages approved in generated approval metadata still fails validation

## Existing Safety Coverage Preserved

- secret-like values still fail
- unrelated tenant references still fail
- fake pilot still passes
- external call source scan still passes
