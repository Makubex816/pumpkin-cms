# Remaining Usability Risks

- Non-technical users still have to prepare JSON. The builder is safer, but JSON editing remains the largest usability risk.
- Dry-run preview is summary-only. It does not show line-by-line diffs.
- Validator reports say `2A-3` because the validator package is earlier-phase infrastructure reused by the builder.
- Support packet local paths are helpful for local QA but should be redacted before external sharing.
- Owner contacts and manual approvals are summarized, not emitted as schema-backed package files.
- Media URLs are not externally verified.
- Form delivery is not tested.
- Deployment profile and extension validation remain deferred.
- The CLI prints only the first 8 answer issues.
- Real tenant pilots still need manual owner/operator approval and must not proceed from this offline packet alone.
