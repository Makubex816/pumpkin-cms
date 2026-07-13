# Direct Data Repair Prohibition

No Cosmos, Mongo, storage, or other direct data repair was attempted. No API validation or merge helper was bypassed. No self-loop record was forced into live data.

Direct repair would create split API/data semantics and could be removed by a later normal page update. The next phase must design an explicit redirect or canonical-alias contract instead.
