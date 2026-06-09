# Database Backup Options

## Option A: Azure SQL Automatic Backup Evidence

Use when the owner accepts provider-managed backup evidence as an interim baseline.

Pros:

- lowest handling risk;
- no portable database artifact downloaded;
- can document backup policy, retention, last successful backup status, and restore point objective if approved.

Cons:

- does not create a portable artifact;
- may not satisfy full tenant portability;
- still requires approved Azure evidence access.

Production restore proof impact: improves audit evidence, but does not fully close portable restore proof.

## Option B: Azure SQL BACPAC Export To Approved Private Storage

Use when the owner approves a portable export artifact.

Pros:

- creates a portable database artifact;
- integrates cleanly into manifest/checksum/restore validation;
- can be encrypted/access-limited in private backup storage.

Cons:

- requires explicit Azure SQL/export approval;
- may require storage target creation or use of an existing private container;
- artifact is highly sensitive and must not enter Git or broad local folders.

Production restore proof impact: recommended for completing database artifact proof if storage/encryption boundaries are ready.

## Option C: `sqlpackage` Local Export To Ignored Output

Use when a safe DB connection method and local tooling are explicitly approved.

Pros:

- produces a portable artifact directly under ignored local output;
- avoids control-plane export job if Azure CLI export is not desired;
- can be followed by local encryption and checksum generation.

Cons:

- requires a database connection value from process env or approved secret broker;
- can be slower and more failure-prone on large databases;
- local artifact handling risk is higher.

Production restore proof impact: acceptable only if connection handling, encryption, and output cleanup are explicitly approved.

## Option D: Azure CLI Database Export Job

Use when Azure CLI login state and storage target are approved.

Pros:

- uses platform-supported export flow;
- can write directly to private storage;
- avoids printing connection strings.

Cons:

- still performs an Azure action;
- may require storage keys/SAS or managed identity permissions;
- must be carefully bounded to avoid changing unrelated resources.

Production restore proof impact: acceptable if the export artifact is checksummed, access-limited, and later restore-validated.

## Option E: No Direct DB Artifact

Use when env/tooling is not ready or approval is not broad enough.

Pros:

- avoids sensitive artifact handling.

Cons:

- production restore proof remains blocked.

Production restore proof impact: no-go for complete restore readiness.

## Recommendation

Recommended next path:

1. If the owner wants the safest incremental step, approve Azure SQL automatic backup evidence collection only.
2. If the owner wants to close production restore proof, approve a portable BACPAC/export artifact with encryption, private storage or ignored local output, checksums, manifest integration, and sandbox restore validation planning.

