# Pumpkin identity migration conflict and rollback standard V2.8.63B

Ambiguous identities must never be automatically merged. Per-identity conflicts are held while non-conflicted records proceed. Rollback disables dual-write, dual-read, and foundation flags, retains conflict/run mappings, deactivates additive records when needed, and restores Tenant, User, and FormDefinition in that order from the restricted backup. Production additive records are not deleted merely to test rollback.
