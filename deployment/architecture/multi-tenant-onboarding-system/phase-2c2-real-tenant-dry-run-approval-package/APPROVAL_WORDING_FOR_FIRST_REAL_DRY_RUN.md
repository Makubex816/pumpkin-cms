# Approval Wording For First Real Dry Run

Use exact approval wording when the user is ready to authorize the first real tenant dry run.

Do not use these prompts until the candidate worksheet, user-facing intake checklist, no-secrets agreement, required information worksheet, and owner review are complete.

## Approval To Use Non-Secret Candidate Data In Local Answers

```text
Approve using the approved non-secret business/domain intake for <tenant display name>/<tenant slug> to prepare a local answers JSON file only at <answers path>. Do not generate a package yet. No tenant creation, no CMS/Azure/Cloudflare/DNS/deployment/email/Search Console/indexing actions, no external checks, no protected config access, no secrets, and Roller remains paused.
```

## Approval To Generate First Real Tenant Package Locally

```text
Approve generating the first real tenant import package candidate locally only for <tenant display name>/<tenant slug> from the approved non-secret answers file at <answers path>, writing output only to <local output path>. No tenant creation, no CMS/Azure/Cloudflare/DNS/deployment/email/Search Console/indexing actions, no external checks, no protected config access, no secrets, and Roller remains paused.
```

## Approval To Run Validator And Support Packet

```text
Approve running the offline validator and exporting a redacted support packet for the local import package candidate at <local package path> only. No tenant creation, no CMS/Azure/Cloudflare/DNS/deployment/email/Search Console/indexing actions, no external checks, no protected config access, no secrets, and Roller remains paused.
```

## Preferred Combined Approval For First Dry Run

```text
Approve Phase 2C-3 first real tenant no-mutation dry run only for <tenant display name>/<tenant slug>: use the approved non-secret intake at <intake path>, prepare a local answers JSON file, run the builder dry-run preview, generate a local import package candidate at <local output path>, run the offline validator, export a redacted support packet and operator handoff, review with the owner, and document gaps. No real tenant creation, no CMS/Azure/Cloudflare/DNS/deployment/email/Search Console/indexing actions, no external checks, no protected config access, no secrets, and Roller remains paused.
```

## Required Fill-Ins

| Placeholder | Required Meaning |
| --- | --- |
| `<tenant display name>` | Public business name approved for local dry-run use. |
| `<tenant slug>` | Proposed local tenant slug. |
| `<intake path>` | Local path to approved non-secret intake. |
| `<answers path>` | Local path to future non-secret answers JSON file. |
| `<local output path>` | Local ignored output folder for generated candidate package. |
| `<local package path>` | Local generated candidate package folder. |

## Approval Must Exclude

The approval must explicitly exclude CMS writes, MediaAsset writes, Azure, Cloudflare, DNS, deployment, Function App settings, email, Microsoft 365, Search Console, indexing, external checks, protected config, secrets, and Roller work.
