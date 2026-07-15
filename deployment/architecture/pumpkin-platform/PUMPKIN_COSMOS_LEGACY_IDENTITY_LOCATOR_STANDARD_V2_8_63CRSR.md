# Cosmos legacy identity locator standard

Login email resolution uses a normalized-email query inside the fixed `UserAccounts` partition, validates one locator, and point-reads the legacy user by stored legacy user and tenant identifiers. Backfill is additive. Provider stages are bounded and redact email and credentials. Connection-string/account-key authentication remains authoritative until separately migrated.
