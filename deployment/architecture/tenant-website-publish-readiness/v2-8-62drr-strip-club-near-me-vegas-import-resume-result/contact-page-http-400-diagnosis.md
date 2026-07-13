# Contact-Page HTTP 400 Diagnosis

Root cause: `contact.formBlock.missing` from the live API's linked `DesignSystemGuard.ValidatePage` contract.

The original contact payload contained only the source-backed `Blog` block. The contact-specific guard requires a visible-form contract represented by a `formBlock` in `ContentData.ContentBlocks`, even though the source HTML already contains the visible form. A linked C# harness reproduced the exact failure:

- Code: `contact.formBlock.missing`
- Message: `Contact pages must include a visible formBlock section.`
- Path: `ContentData.ContentBlocks`
- Warnings: 0

The prior DR evidence retained HTTP 400 but did not retain a complete repo-safe response-header/body capture. The linked source reproduction established the exact validation contract before the only approved retry. Tenant ID, page ID, slug, title, status, serialization size, media values, redirects, and all other supported blocks passed.
