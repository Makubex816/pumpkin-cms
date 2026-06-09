# Ice Data Seed And Migration Prerequisites

## Purpose

If Cosmos is newly provisioned, it will not prove Ice is backupable until required CMS source data exists in Cosmos and readback verification passes.

## Required Data Domains

- tenant record;
- site record;
- pages;
- routes;
- forms/form definitions;
- SEO metadata;
- redirects;
- theme/navigation;
- MediaAsset metadata;
- publish/import run metadata if applicable;
- user/admin records if applicable and approved.

## Preflight Requirements

- source-of-truth content package identified;
- seed/migration package validated;
- tenant/site scope explicit;
- rollback capture plan exists;
- readback count expectations defined;
- forbidden-field/secret scan passes;
- owner approves CMS/database writes in a later phase.

## Readback Verification

Readback must verify:

- tenant key matches;
- site key matches;
- expected record counts;
- no cross-tenant records;
- required records are queryable by Backup Center export filters.

## Hard Stop

No seed or migration occurs in Phase 2F-12E.
