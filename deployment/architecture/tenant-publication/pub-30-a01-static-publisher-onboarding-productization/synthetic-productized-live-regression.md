# Synthetic productized live regression

Status: `NOT_EXECUTED_SECURITY_GATE`.

The retained entry baseline remains:

- synthetic tenant `pub20-a02-synthetic`;
- publication `pub20-a02-pilot`, active at revision 4;
- exact A02 artifact SHA-256 `227512fe26000e0fa933da51ec41a83e274cbb38b24bf15624de0b142271b4dd`;
- exact A02 manifest SHA-256 `80c9db24ab57d537e11eb86bfadb8d4e58f7cef87bf0c59978617c2224d98e54`;
- one retained synthetic FormEntry;
- safe no-post rollback artifact SHA-256 `33122aab2b9f64567f2d1bf29d175c232f2b3c1715237fe5a49c04c75697e769`;
- safe no-post manifest SHA-256 `46bccba3f29081946d235fcb15b07a73f43703dfde4f41e648cffd27033b4517`.

PUB-30 did not register the baseline or successor release in the live product registry, deploy a productized artifact, issue a form ticket, perform preflight, send a submission/replay/conflict POST, create another FormEntry, revoke/rollback/restore the publication, or run a live no-op planner check.

The full productized sequence remains held for explicit `PLATFORM_SECRET_ROTATION_AND_PARITY_RECOVERY` authority. The future sequence must preserve the A02 predecessor before promotion, stay within a newly explicit bounded submission/deployment budget, prove rollback and restore, preserve noindex, and send no email.

No exactly-one or live lifecycle claim is made by PUB-30-A01.
