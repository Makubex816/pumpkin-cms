# Contact Page Decision Plan

## Current Evidence

`contact` exists, is admin/public readable, published, and sitemap-included. Refreshed page/index scans found 0 mentions of expected recipient ref `roller-rink-leads`.

## Default Action

Adopt the existing `contact` page only after owner review confirms the content, form behavior, and recipient expectations.

## Optional Future Update

A future write may update only owner-approved deltas for:

- contact page copy;
- layout/content blocks;
- form component configuration;
- non-secret recipient reference;
- SEO metadata.

## Form Handling

Do not update contact form recipient fields until:

- the recipient storage location is known;
- owner approves the recipient reference;
- the future write-preflight can verify the exact before-state and after-state;
- email/Microsoft 365 work remains out of scope.

## Fields To Preserve By Default

- slug `contact`;
- route `/contact/`;
- existing page identity;
- tenant identity;
- published state;
- sitemap inclusion;
- no-email delivery posture unless separately approved.

## Abort Conditions

Abort any `contact` update if:

- recipient storage cannot be identified;
- the update would enable live email delivery;
- the update changes Function App settings or Microsoft 365;
- the command cannot limit itself to owner-approved fields.
