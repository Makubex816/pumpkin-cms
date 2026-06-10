# Active Link Rendering Result

Proof command:

```powershell
node src/outbound-link-cli.mjs render-fixture --fixture fixtures/render-active-links.fixture.json --store .tmp/phase-2h5-rendering-control-prototype/local-store-merged --out .tmp/phase-2h5-rendering-control-prototype/render-active --overwrite
```

Result:

- validation: passed
- decisions: 5
- active anchors: 5
- blocked or disabled decisions: 0
- active anchors include `rel="noopener noreferrer"`
- active anchors use `target="_blank"` by default.
