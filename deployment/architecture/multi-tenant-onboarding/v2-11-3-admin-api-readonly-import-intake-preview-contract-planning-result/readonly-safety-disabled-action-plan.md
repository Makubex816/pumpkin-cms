# Read-Only Safety Disabled Action Plan

All future action controls are disabled in this contract.

Disabled actions:

- execute import;
- resume tenant;
- create tenant;
- write CMS content;
- write provider data;
- deploy/redeploy;
- mutate DNS/custom domains;
- request indexing;
- submit contact form;
- run crawl/outbound checks;
- mutate Azure;
- assign RBAC.

Each disabled action requires:

- id;
- label;
- disabled true;
- reason;
- future gate id.
