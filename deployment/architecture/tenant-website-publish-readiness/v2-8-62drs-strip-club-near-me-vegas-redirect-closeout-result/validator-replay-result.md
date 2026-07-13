# Validator Replay Result

| Validator | Result |
| --- | --- |
| V1 repaired package validator | valid; 0 errors; 0 warnings |
| C# page-contract project build | passed; 0 errors; 0 warnings |
| Page-contract focused suite | passed; 6 positive/negative checks |
| Redirect semantics focused suite | passed; 7 disposition/cycle checks |
| Vegas semantic replay | failed closed as expected; 2 meaningful blockers |
| Vegas update-operation replay | failed closed as expected; 2 errors; 0 warnings |

The expected failures are gate successes: neither meaningful redirect can be silently dropped or mislabeled as a no-op.
