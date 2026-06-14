# Backup Runtime Registry Provider Panel Contract

Panels:

- Backup Center;
- Runtime QA;
- Resource Registry / Provider Profile.

Each panel shows:

- ref count;
- ref ids;
- evidence category;
- current status;
- missing evidence blockers;
- future gate if proof is incomplete.

Data sources:

- `backupEvidenceRefs`;
- `runtimeQaRefs`;
- `resourceRegistryRefs`;
- `providerProfileRefs`.

No panel queries live provider, Azure, storage, or CMS systems.
