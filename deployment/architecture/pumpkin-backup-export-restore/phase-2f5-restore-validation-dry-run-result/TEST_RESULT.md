# Test Result

Validation run:

```text
npm run check
```

Result:

```text
passed, syntax checks plus 30 Node tests
```

Covered areas:

- valid tenant backup restore-plan;
- valid platform backup restore-plan;
- invalid backup rejection;
- checksum tamper rejection;
- escrow payload rejection;
- restore output path safety;
- JSON and Markdown restore reports;
- inventory count comparison;
- generated report secret-like value scan;
- no external call/protected config read patterns in local generator/restore sources.
