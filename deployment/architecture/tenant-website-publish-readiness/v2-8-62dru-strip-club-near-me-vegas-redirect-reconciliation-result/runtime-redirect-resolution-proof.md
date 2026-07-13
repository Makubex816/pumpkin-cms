# Runtime Redirect Resolution Proof

Runtime proof status: `passed_runtime_key_provisioned_and_redirect_resolution_proved`.

- `/guides/couples-night` resolved HTTP 200 to `/guides/couples-guide-vegas` with 301.
- `/guides/dress-code-what-to-expect` resolved HTTP 200 to `/guides/dress-code` with 301.
- Query preservation resolved to `/guides/couples-guide-vegas?campaign=proof`.
- Target-route resolver fallthrough returned 404 and 404, while both target pages exist in Admin readback.
- Provisioning attempts: 1; secret printed: false.
