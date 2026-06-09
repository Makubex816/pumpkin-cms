# Test Result

Validation run:

```text
npm run check
```

Result:

```text
passed, syntax checks plus 22 Node tests
```

Covered areas:

- valid tenant bundle;
- valid platform bundle;
- validation report outputs;
- failure fixtures;
- checksum tampering;
- escrow payload rejection;
- secret-like value rejection;
- path traversal rejection;
- path safety;
- CLI invalid-bundle non-zero exit;
- no external call/protected config read patterns in core generator sources.
