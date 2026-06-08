# Raw Input Review

## Summary

Two raw `content-review` input folders are present and untracked. They should remain untouched by repo hygiene cleanup.

## Raw Input Folders

| Path | Observed Contents By Path Type | Handling |
| --- | --- | --- |
| `content-review/ice-final-contact-input/` | zip file, extracted folder, PNG image assets, JSON/HTML/MD package files | do not stage, do not delete |
| `content-review/ice-service-areas-input/` | zip file, extracted folder, WebP/PNG assets, JSON/HTML/MD package files | do not stage, do not delete |

## Policy

- Do not stage raw input folders in onboarding docs commits.
- Do not delete raw input folders in this checkpoint.
- Do not inspect private/raw content deeply unless a future content-ingestion task needs it.
- Keep these folders for a separate content-ingestion/review workflow.

## Risk

Raw packages can contain private customer data, images, HTML, form-routing details, or draft content. They must be handled separately from code/docs hygiene.
