# RBAC And Identity Plan

V2.3.1 does not assign RBAC and does not resolve a live identity. This plan defines the least-privilege decision path for a future approved phase.

## Identity Options

| Option | Use | First-write fit | Notes |
| --- | --- | --- | --- |
| Operator Azure CLI session | Human-approved first scoped staging write | yes, if already logged in and profile gates pass | No token export, no device-code login inside automation. |
| User-assigned managed identity | Repeatable app/provider execution | yes after creation and role assignment | Preferred for durable staging app workflows. |
| Service principal | Automated pipeline execution | possible future | Must use secret references only, never committed values. |

## Candidate Role Boundaries

| Scope | Candidate access | Purpose |
| --- | --- | --- |
| Staging Cosmos account or database | Cosmos NoSQL data-plane read/write/delete limited to approved OLM containers | First scoped write, readback, rollback |
| Staging storage evidence containers | Blob read/write for evidence only | Backup Center and runtime QA evidence |
| Staging Key Vault | Secret reference access only for approved future app identity | No secret value reads in planning docs |
| Resource group read | Metadata read | Resource Registry refresh |

## Hard Stops

- Do not use account keys, `listKeys`, connection strings, or SAS.
- Do not assign RBAC in documentation-only phases.
- Do not grant production scopes for OLM staging writes.
- Do not persist Azure tokens, cookies, auth headers, refresh tokens, or session JWTs.
- Do not proceed with first-write execution if RBAC propagation or readback capability is unverified.

