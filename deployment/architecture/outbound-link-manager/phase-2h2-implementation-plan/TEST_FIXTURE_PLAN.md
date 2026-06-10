# Test Fixture Plan

Phase 2H-3 should add fixtures before broad scanner logic.

## Required Fixtures

- page with no links;
- page with one outbound link;
- page with duplicate URLs across multiple fields;
- same URL across multiple pages;
- Markdown rich text link;
- HTML anchor in trusted rich text;
- navigation outbound link;
- footer/social outbound link;
- tenant bundle with outbound links;
- import package with unreviewed domain;
- disabled global link;
- disabled specific instance;
- blocked domain;
- stale instance;
- invalid scheme such as `mailto:` or `javascript:`;
- URL with fragment;
- URL with default port;
- URL with query string.

## Expected Outputs

- registry file;
- instance file;
- policy file;
- scan run file;
- validation report;
- stale instance report.

## Negative Tests

- missing tenant id;
- missing site id;
- instance references unknown link;
- unsupported status;
- unsafe location path;
- URL with embedded credentials;
- output path outside `.tmp`.
