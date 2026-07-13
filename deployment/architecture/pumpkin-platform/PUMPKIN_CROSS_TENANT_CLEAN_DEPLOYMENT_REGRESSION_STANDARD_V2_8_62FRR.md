# Cross-Tenant Clean Deployment Regression Standard V2.8.62FRR

A clean deployment to a shared tenant host requires proof for every active tenant, not only the tenant that motivated the change.

Required proof includes source manifest completeness, extracted ZIP completeness, local standalone behavior, each tenant's full committed browser suite, host routing, theme assets, forms mode, media dependencies, redirects, responsive behavior, and prohibited-request guards.

The deployment count is fixed before mutation. After the deployment, rerun the complete shared runtime inventory and tenant-specific browser suites. A failure in any tenant makes the shared deployment partial and prohibits an unapproved retry.

Static external links may be counted without being followed. POST, credential, storage key, appsetting, CMS, DNS, TLS, and tenant-data boundaries remain independent approvals.
