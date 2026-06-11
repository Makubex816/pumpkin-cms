# Runtime QA Evidence Map

Runtime QA remains required before and after the future write.

| Evidence | Current state | Future requirement |
| --- | --- | --- |
| Admin route `/dashboard/outbound-links` | Passed in 2H-21 and revalidated in 2H-23B | Re-run before write reattempt. |
| Provider readiness messaging | Passed | Must show real profile is gated and scoped. |
| No uncontrolled write-call scan | Passed | Must remain passed before write. |
| Protected config pattern scan | Passed | Must remain passed. |
| Post-write provider-state readback UI | Not run for real write | Required after future write. |
| Browser automation | Not required unless tooling exists safely | Use reusable runtime QA pattern without protected config or live writes. |

Runtime QA must not be used as a backdoor for POST/PUT/PATCH/DELETE outside approved gates.

