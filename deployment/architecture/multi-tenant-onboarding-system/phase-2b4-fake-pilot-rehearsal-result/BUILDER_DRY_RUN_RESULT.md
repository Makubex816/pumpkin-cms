# Builder Dry-Run Result

Command:

```powershell
node src/builder-cli.mjs --answers fixtures/fake-pilot-example-event-rentals.answers.json --out .tmp/fake-pilot-example-event-rentals --dry-run --validate --support-packet
```

Result:

- status: passed
- stage: dry-run
- files planned: 13
- files written: 0
- create: 13
- overwrite: 0
- unchanged: 0
- diff mode: summary-only
- validation: skipped in dry-run mode

Preview summary:

- pages: `home /`, `contact /contact/`, `service-areas /service-areas/`
- approved routes: `/`, `/contact/`, `/service-areas/`
- media refs: `hero-event-rink`, `service-area-map`
- form refs: `contact-form`

Validator command previewed:

```powershell
node ../validator-implementation/src/cli.mjs --package .tmp/fake-pilot-example-event-rentals --out .tmp/fake-pilot-example-event-rentals --support-packet
```

Warnings:

- No validator warnings were produced because validation is skipped during dry-run.
- Dry-run remains summary-only; full file diff output is not implemented.
