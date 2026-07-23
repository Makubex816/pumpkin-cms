# Public form API contract

Anonymous routes are POST /api/public/publications/{publicationId}/forms/{formMappingId}/preflight and /submit.

Submit verifies ticket, origin, publication, release, mapping, form definition, field contract, consent, honeypot, sizes, timeout, correlation, and idempotency, then uses the universal FormEntry store. Errors are structured and do not disclose cross-tenant existence.

API deployment dfb07dc2-f47f-465b-a9c7-8b3bcd9de130 used publish archive SHA-256 8ab45e037c8d120c1486498893dc50bc2b8db9ed389fd8862ea47b227fcd9277 in 1 material attempt; both instances succeeded and none failed.
