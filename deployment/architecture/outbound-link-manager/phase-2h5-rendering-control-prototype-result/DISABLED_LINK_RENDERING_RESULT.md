# Disabled Link Rendering Result

Disabled global proof:

```powershell
node src/outbound-link-cli.mjs render-fixture --fixture fixtures/render-disabled-global-link.fixture.json --store .tmp/phase-2h5-rendering-control-prototype/local-store-disabled --out .tmp/phase-2h5-rendering-control-prototype/render-disabled-global --overwrite
```

Result:

- validation: passed
- decisions: 1
- active anchors: 0
- blocked or disabled decisions: 1
- disabled global link rendered as `disabled_span`.

Additional automated tests prove:

- disabled instance affects only that instance;
- hidden mode outputs no visible link markup;
- plain-text mode preserves visible text without anchors;
- fallback mode uses a safe configured fallback URL.
