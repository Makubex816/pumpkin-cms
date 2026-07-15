# Canary validation and production cutover proof

- Substrate: isolated temporary Linux B1 App Service; no slot was available, no custom domain or traffic routing was attached.
- Canary deployment: `931030db-d777-48d4-8a37-851af4844266`.
- Candidate SHA-256: `d5d298f00517a2ca32c40a0f3c540cdb3909f1dd47d80e88e94508c3eb6578e6`.
- Canary health: 200.
- Invalid login: 401 in 7.754 seconds.
- SuperAdmin login: 200 in 3.013 seconds.
- TenantAdmin login: 200 in 1.907 seconds.
- Management mutations remained disabled.
- Production deployment `388a7fd1-cb09-4929-a335-bfbf0d6af291`: health 200; both approved logins exceeded the 30-second bound.
- Disabling dual-write restored one SuperAdmin probe at 200 in 18.811 seconds, still outside the desired compatibility envelope.
- Hash-verified rollback deployment: `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86`; SuperAdmin returned 200 in 16.689 seconds, while the bounded TenantAdmin recheck did not complete before the command deadline.
- Canary app and its isolated plan were deleted at closeout.
