# Gap Findings

## Gap 1: Lead Recipient Ref Is Answers-Only

The fake-pilot answers include:

```json
"leadRecipientRef": "example-event-leads"
```

The generated `forms.json` does not include that field because the current validator schema for forms disallows additional properties and does not define a recipient-ref field.

Recommendation: add a schema-approved recipient reference field in a future schema/generator phase before real tenant pilots require reference-only form routing.

## Gap 2: Dry-Run Is Summary-Only

Dry-run reports create/overwrite/unchanged counts and package summaries, but does not export a line-by-line diff.

Recommendation: add a diff artifact before real tenant pilot execution.

## Gap 3: Support Reports Include Local Absolute Paths

Local paths are helpful for repository evidence but should be redacted before external ticketing.

Recommendation: add a `--redact-local-paths` or external-ticket export mode before support packets are shared outside the repo.

## Gap 4: Owner Approval Statuses Are Not Structured Package Files

Owner contacts and manual approvals are validated in answers and summarized in README/support text, but not emitted as schema-backed package JSON.

Recommendation: add schema-backed owner/contact/approval files only after validator discovery allows those files.

## Gap 5: External Reality Is Not Checked

Media URLs, DNS, deployment profile behavior, form delivery, Search Console, and indexing are not externally checked by design.

Recommendation: keep external checks outside the builder and require separate owner/operator approvals before any real tenant pilot execution.
