# Intake Preview CLI Summary

Preview command:

```powershell
node src/import-package-governance-cli.mjs preview-package .tmp/v2-11-2/ice-carryforward-package
node src/import-package-governance-cli.mjs preview-package .tmp/v2-11-2/roller-paused-package
```

Preview output includes:

- package, tenant, site, and domain identity;
- lifecycle state and import mode;
- route/content/media/form counts and refs;
- Resource Registry and Provider Profile refs;
- Backup Center and Runtime QA refs;
- OLM and Audit Jobs refs;
- no-go conditions;
- rollback plan id;
- validation refs;
- security boundary and redaction policy;
- future import readiness flag;
- explicit `importExecutionPerformed: false`.
