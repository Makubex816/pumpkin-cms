# Runtime QA Harness Architecture

The V2.6.1 harness lives at:

- `deployment/architecture/runtime-qa/platform-runtime-qa-harness/`

Core files:

- `src/runtime-qa-cli.mjs`
- `src/runtime-qa-runner.mjs`
- `src/runtime-qa-validator.mjs`
- `src/safe-paths.mjs`
- `src/secret-scan.mjs`
- `fixtures/runtime-qa-registry.v2-6-1.fixture.json`
- `test/runtime-qa.test.mjs`

The harness pattern is registry-driven. Future modules should provide a fixture that declares checked routes, checked APIs, source evidence refs, provider modes, marker checks, source scan roots, and local evidence output.

The default path is local/offline. Browser automation can be layered on by future modules, but local source/route/contract validation must continue to work without protected config or live writes.
