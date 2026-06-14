# Electron Consumer Compatibility Plan

Status: future only.

Electron remains unimplemented.

Future Electron consumer should:

- read the same read-only API envelope contract as Admin;
- reject envelopes with `readOnly` not true;
- reject missing or unsupported provider mode;
- reject open write flags;
- display warnings, blockers, next gates, trace IDs, and evidence metadata without mutation actions;
- avoid local credential stores, browser cookies, auth cache reads, or protected config reads;
- support offline fixture mode only if explicitly approved.

Electron should not be implemented until the GET-only Pumpkin API endpoint is approved, built, and validated.

