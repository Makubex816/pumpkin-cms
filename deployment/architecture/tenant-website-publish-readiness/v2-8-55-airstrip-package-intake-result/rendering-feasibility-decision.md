# Rendering Feasibility Decision

Decision: `hybrid`

Reasoning:

- The archive contains a Next.js source app, not a ready static artifact.
- No static HTML files or app-level `out/` export were detected.
- Next config metadata did not indicate static export.
- Exact visual rendering is probably feasible only after a future isolated source-build proof.
- Pumpkin live onboarding still requires conversion into the tenant package contract.

Mode assessment:

| mode | decision |
| --- | --- |
| `static_passthrough` | Not ready; no static HTML/export artifact detected. |
| `source_build` | Likely needed for visual proof, but not run in V2.8.55. |
| `pumpkin_conversion` | Required before tenant creation. |
| `hybrid` | Selected: source-build proof plus Pumpkin conversion. |
| `unsupported_needs_owner_clarification` | Not selected, but several owner decisions are required. |

Future proof:

- Isolated extract/build outside package source.
- Public secret scan before install/build.
- Dependency install only in ignored workspace after explicit approval.
- Local route screenshot proof.
- No deployment until later approval.

