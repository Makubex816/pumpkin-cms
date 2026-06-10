# Test Result

Command:

```powershell
npm run check
```

Result:

- status: passed
- total tests: 43
- passed: 43
- failed: 0

New rendering tests cover:

- active link renders as active anchor;
- active link includes safe `rel`;
- disabled global link blocks active anchor;
- disabled instance affects only one instance;
- hidden mode hides active link markup;
- plain-text mode preserves text;
- fallback mode uses a safe fallback URL;
- domain-blocked policy overrides active status;
- pending review blocks active anchor by default;
- tenant mismatch validation failure;
- unknown instance validation failure;
- output outside `.tmp` rejection;
- CLI render/validate/inspect commands;
- no external calls or protected config reads.
