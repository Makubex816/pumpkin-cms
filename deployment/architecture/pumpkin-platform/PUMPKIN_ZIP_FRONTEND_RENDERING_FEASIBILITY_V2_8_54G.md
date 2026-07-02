# Pumpkin ZIP Frontend Rendering Feasibility V2.8.54G

Status: feasibility_plan_only

Exact rendering cannot be assumed. It depends on package shape.

Feasibility decisions:

- Self-contained static artifact: can likely be rendered exactly through static passthrough if assets and routes are complete.
- Next/Vite/React source: requires isolated dependency and build proof before rendering confidence.
- CMS export: can be mapped into Pumpkin if schema-compatible.
- Design-only or asset-only package: requires reconstruction and will not be exact without additional source.

Implementation options:

- Static passthrough: best visual fidelity, lower CMS editability.
- Pumpkin conversion: best CMS control, higher visual drift.
- Hybrid: static shell plus Pumpkin-managed forms/media, medium complexity.

Future proof must include local preview, asset integrity, route coverage, form/contact behavior, screenshot comparison, and secret/protected-path guards.

