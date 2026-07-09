# Gitignore Candidates

Status: recommendations only; `.gitignore` was not modified.

Candidate rules:

```gitignore
# Local content/package review artifacts
content-review/

# Browser/proof runner outputs
test-results/
```

Already ignored or effectively generated:

- `.tmp/`
- `node_modules/`
- `.next/`
- `bin/`
- `obj/`

Do not add a broad `dist/` rule without package policy review because `packages/pumpkin-ts-models/dist` currently has tracked modified files.
