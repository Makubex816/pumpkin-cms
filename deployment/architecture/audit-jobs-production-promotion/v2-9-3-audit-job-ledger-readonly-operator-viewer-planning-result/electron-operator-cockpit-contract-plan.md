# Electron Operator Cockpit Contract Plan

Status: future boundary required.

## Proposed Future Contract

A future Electron operator cockpit may render the same viewer model for local operator inspection.

## Required Constraints

- Read local, sanitized viewer data only.
- Do not perform deployment, indexing, crawling, form submission, provider write, CMS write, Azure mutation, or protected config read.
- Do not store secrets.
- Do not expose write-capable buttons without a separate explicit approval.

## Not Approved In V2.9.3

No Electron runtime was created or changed in this phase.
