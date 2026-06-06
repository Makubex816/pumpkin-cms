# Workflow Review Payload Source Diagnosis

Generated: 2026-06-06

## Source Path

The hidden payload came from passing the full CMS `Page` object into the client component tree:

1. `getPageForRender` loaded the CMS-backed page snapshot.
2. `apps/ice-rink-web/src/app/page.tsx` and `apps/ice-rink-web/src/app/[...slug]/page.tsx` passed the full page into `PageRenderer`.
3. `apps/ice-rink-web/src/components/PageRenderer.tsx` is a client component.
4. Next.js serialized the client component props into the generated public HTML hydration payload.

That serialized payload included fields needed by admin/review workflows, not by public page rendering.

## Required For Public Rendering

The full workflow/review payload is not required for public rendering.

The public renderer needs:

- page identity, slug, and tenant id
- public metadata and SEO metadata
- `ContentData.ContentBlocks`
- public form configuration
- form definitions
- limited domain routing values needed by public components
- render mode and static form endpoint

The public renderer does not need:

- `pageQuality`
- `schemaControls`
- `usageStatus`
- `workflow`
- `review`
- `staticPublishing`
- `fulfillment`
- source/import provenance
- draft/editor notes
- deployment hooks
- validator-only warnings

## Admin/Review Classification

The offending fields are admin, workflow, review, validation, or import provenance metadata. They are useful in snapshots and validators but should not be serialized into deployable public HTML.

## CMS Writes

No CMS writes were required. The fix was implemented locally in the public static rendering path.
