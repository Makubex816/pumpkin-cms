# Go/No-Go Criteria

## Recommendation

Conditional go for later Ice full standard backup execution approval.

This is not approval to execute the backup. It means the preflight scope is coherent enough for the owner to decide on a separate real execution prompt.

## Go Criteria For Later Execution

Proceed only if:

- owner explicitly approves real Ice full standard backup execution;
- required env presence checks pass without values printed;
- output path/storage target is approved and ignored from git;
- CMS read/export scope is approved;
- database export mode is approved;
- database artifact encryption handling is approved;
- media inventory/copy/download mode is approved;
- static evidence capture mode is approved;
- standard backup secret exclusion is accepted;
- restore validation remains dry-run/local/sandbox only;
- no Search Console/indexing or live-page publication is included.

## Conditional-Go Items

These must be resolved in the future execution approval:

- exact database export mode;
- exact backup artifact storage location;
- whether media blobs are inventory-only or copied/downloaded;
- whether public endpoint URLs may be recorded as public configuration;
- retention and cleanup window;
- whether external `GET`/`HEAD` evidence checks are allowed.

## No-Go Conditions

Do not proceed if:

- protected config must be read;
- secret values would be printed or written;
- standard backup would include escrow payloads;
- database artifact cannot be encrypted or access-limited;
- CMS writes/imports are requested;
- deployment, DNS, Azure changes, Cloudflare changes, email, Microsoft 365, Search Console, indexing, or live-page publication are included;
- raw input folders or ignored generated artifacts would be staged.

## Current Phase Result

Phase 2F-7 preflight package: yes.

Ready for later Ice full standard backup execution approval decision: yes, conditional.

Ready for real escrow execution: no.
