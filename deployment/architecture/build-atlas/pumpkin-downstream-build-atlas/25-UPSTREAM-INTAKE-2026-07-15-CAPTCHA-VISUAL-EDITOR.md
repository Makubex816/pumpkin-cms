# Upstream Intake Assessment — `18b5cea01d23298b95b5945999e66a4aec8d748b`

## Observation

```text
repository: SDI-AI/pumpkin-cms
branch: main
previous head: 785e079269276c177832f9e7186ae44675e76f52
new head: 18b5cea01d23298b95b5945999e66a4aec8d748b
commits ahead: 5
changed paths: 43
qualification: not yet performed
```

## Commit sequence

1. `4157356f977b1ca0d8a2b93cf5b5493c8bf46338` — block identity/serialization updates.
2. `a5e8eb83ed158a084a8384fa7721b92688ac2b23` — starter visual page and navigation editor.
3. `8e2bc1e7a2dc4b8126707c4a0e13448da246ed56` — tenant CAPTCHA and header-logo media support.
4. `d84cef200b4fb53f760a5ab248f2abf0b2ffc422` — deploy ZIP ignore rule.
5. `18b5cea01d23298b95b5945999e66a4aec8d748b` — merge commit.

## Change clusters

### Model and serialization
- `IHtmlBlock` and bases add `id`, `name`, and `enabled`;
- TypeScript equivalents updated;
- a test covers one Hero block round trip.

### Visual content editing
- authenticated interactive preview;
- block insertion and toolbar actions;
- responsive iframe widths;
- page metadata/SEO/relationships;
- visual navigation tree;
- header-logo media picker;
- page/theme save and revalidation paths.

### CAPTCHA
- tenant and form settings;
- public resolution;
- Turnstile server adapter;
- shared widget and form integration;
- form-editor controls;
- required-verification and token non-persistence tests.

## Intake result

`ACCEPT_FOR_IMMUTABLE_SNAPSHOT_AND_CLEANROOM_QUALIFICATION`.

No source integration is authorized by this report. Qualification/extension remains required for all builds, all-block migration, token lifecycle, verification idempotency/telemetry, distributed controls, exact-one persistence, editor concurrency/audit/security, downstream roles, cache readback, and tenant rollout.
