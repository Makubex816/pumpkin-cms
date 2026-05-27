# Pumpkin .NET Page Contract Tool

This tool is the canonical gate for CMS-ready, import-candidate, production-bound, and generated page JSON.

Review-only JSON may be edited by humans, but any page moving toward CMS import, static package source, production creation, or future bulk location generation must deserialize through the .NET `Page` and block classes, validate through the API guard, and round-trip through .NET serialization.

## Commands

```powershell
dotnet run --project tools\dotnet-page-contract\Pumpkin.PageContractTool.csproj -- validate-package --path content-review\ice-launch-phase8c10-import-candidate
dotnet run --project tools\dotnet-page-contract\Pumpkin.PageContractTool.csproj -- validate-page --path content-review\ice-launch-phase8c10-import-candidate\ice-contact.import-candidate.json
node tools\dotnet-page-contract\validate-contract-alignment.mjs
```

## What It Checks

- Page JSON deserializes into `pumpkin-net-models` `Page`.
- Known block types deserialize through `HtmlBlockFactory`.
- Known block content is hydrated into the matching .NET content class.
- API design/form/media/navigation guards run without blocking errors.
- Page JSON round-trips semantically through `.NET Page -> JSON -> .NET Page`.
- Inline/default form definitions deserialize as .NET `FormDefinition`.
- Theme design-system recommendations deserialize as .NET `ThemeDesignSystem`.
- Media requirement metadata is reported as readiness blockers where unresolved.
- Future state-city generation policy is recorded without creating pages.

The tool exits non-zero on blocking contract errors. Warnings are allowed for review/import metadata and unresolved business/media work, but warnings do not make a package CMS-import-ready.

## Readiness States

- `review-only`: may be human-edited and may contain reviewer metadata.
- `import-candidate`: must pass this .NET contract tool before CMS preflight.
- `CMS-ready`: must pass this .NET contract tool, TypeScript validation, media/form/design validation, human approval, and admin import/export preflight.
- `production-bound`: must also pass static validators, staging validators, and launch governance checks.

Do not generate production-bound page JSON by string concatenation, TypeScript-only object assembly, or loose manual shapes that bypass this gate.
