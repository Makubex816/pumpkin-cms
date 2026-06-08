# Operator Review Checklist

Use this checklist during the future no-mutation dry run.

## Candidate And Intake

- [ ] Candidate meets first-pilot selection criteria.
- [ ] Owner is identified.
- [ ] Content approver is identified.
- [ ] Form oversight owner is identified.
- [ ] Monitoring owner is identified.
- [ ] Rollback owner is identified.
- [ ] Final indexing owner is identified.
- [ ] Owner acknowledged the forbidden-information list.
- [ ] Intake contains no secrets.
- [ ] Intake contains no private customer data.
- [ ] Intake contains no protected local paths.
- [ ] Roller is confirmed paused unless a later explicit Roller-specific approval exists.

## Answers File

- [ ] Answers file is stored only in a local approved working folder.
- [ ] Answers file contains no secrets.
- [ ] Tenant name and slug are correct.
- [ ] Domain and `www` preference are approved or clearly marked placeholder.
- [ ] Route list matches owner-approved scope.
- [ ] Media entries are approved or clearly marked placeholder.
- [ ] `leadRecipientRef` is present where forms need a lead destination.
- [ ] Legacy `recipientGroup` compatibility is present where required.
- [ ] Legal/privacy status is recorded.
- [ ] Analytics decision is recorded.

## Generated Package

- [ ] Package was generated locally only.
- [ ] No CMS import occurred.
- [ ] No external checks occurred.
- [ ] Required files are present.
- [ ] JSON files parse.
- [ ] Routes are tenant-scoped.
- [ ] Media references resolve within the package model.
- [ ] Form references resolve.
- [ ] SEO fields are reviewable.
- [ ] Owner contacts assign required responsibilities.
- [ ] Approval statuses do not imply final indexing approval.

## Validation And Support Packet

- [ ] Offline validator report exists.
- [ ] Human-readable validation report exists.
- [ ] Support packet exists.
- [ ] No `failed` status remains.
- [ ] No `blocked` status remains.
- [ ] Warnings are explained.
- [ ] Manual-review items are assigned.
- [ ] Support packet redaction is verified.
- [ ] Final indexing hard stop is visible.

## Stop Confirmation

- [ ] No tenant was created.
- [ ] No CMS records were written.
- [ ] No MediaAsset records were written.
- [ ] No Azure, Cloudflare, DNS, deployment, email, Search Console, indexing, or Roller action occurred.
- [ ] Next action requires separate explicit approval.
