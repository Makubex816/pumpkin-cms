# Phase 2A Validator Implementation Plan

Generated: 2026-06-07

## Scope

This package defines the exact implementation plan for the multi-tenant intake/import validation engine.

Planning only. No validator source code, CLI commands, tenant records, CMS writes, MediaAsset writes, Azure changes, Cloudflare changes, DNS changes, deployment, Function setting changes, email/Microsoft 365 work, Search Console/indexing action, protected config reads, or Roller work are included.

## Phase 2A Build Target

The future implementation should provide an offline validation engine that:

- discovers a tenant intake/import package on disk
- parses package JSON files
- loads versioned schemas
- validates each JSON file against its schema
- runs cross-file validation
- applies URL safety rules
- normalizes gate statuses
- writes `validation-report.json`
- writes `VALIDATION_REPORT.md`
- exits with deterministic pass/fail status

## Source Inputs

- Phase 1 architecture package
- QA audit package
- import package schemas and templates
- validator design docs
- CLI and wizard design docs
- deployment profile registry design

