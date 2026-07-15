# Pumpkin universal identity login dual-write acceptance V2.8.63BR report

Final status: `complete_identity_foundation_login_dualwrite_audit_proven_ready_for_63c`.

V2.8.63B carryforward commit `f413ffe7` preserved 4 tenants, 5 accounts, 5 memberships, 4 contact settings, plan `1624103eb98ee1e81c1873a4e231b3e1`, run `identity-backfill-1624103eb98ee1e8`, zero conflicts, and 9/9 dual-read matches.

Approved credentials were available without exposing values. SuperAdmin safe ID `20f25237fae9c5a98d96ad540ddf2a46` authenticated with request `0HNN29DKCR741:00000002`, creating audit `login-0HNN29DKCR741:00000002`. Vegas TenantAdmin safe ID `1e18b881fe26d09bc97874dadb6196c8` authenticated with request `0HNN29DKCR741:00000003`, creating audit `login-0HNN29DKCR741:00000003`.

Legacy and new last-login timestamps advanced for both identities. Password fingerprints, login emails, roles, membership IDs/counts, tenant slugs, contacts, notification references, and FormEntry count remained unchanged. Vegas own-tenant Forms access returned 200; Party Pros and Ice returned 403. Dual-read remained 9/9 and dual-write readback became 2 writes/2 audits.

No runtime source deployment was required. API `68a06426-d5d5-463e-9134-2df2c7d857a2` and Admin `97a3ab62-8a5f-4248-b2be-2006cb09eafc` remain active. API, Admin, starter, Ice, Party Pros, and Vegas checks returned 200. Airstrip public runtime was not requested. No DNS, TLS, CMS, form, media, contact, membership, password, email, or indexing mutation occurred.

Source commit: `3f5b7fe4 Add safe identity login acceptance readback`. API/Admin deployment attempt count: zero.

Exact-path commit instruction: stage only this report, the three V2.8.63BR durable standards, the V2.8.63BR result package, and the V2.8.63B report status update; run cached diff/secret/local-path checks; commit with `Document V2.8.63BR login dual-write acceptance`; verify staging is empty.
