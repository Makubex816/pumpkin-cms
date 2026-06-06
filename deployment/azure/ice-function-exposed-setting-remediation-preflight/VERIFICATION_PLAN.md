# Verification Plan

Generated: 2026-06-06

## Pre-Change Verification

- `git status --short`
- Azure account safe fields only
- Function App name/resource group/state only
- Function setting names only
- storage account metadata only

## Post-Change Verification For Future Execution

After approved rotation/update:

- Function App state is `Running`
- function list includes `static-contact`
- setting names still include:
  - `AzureWebJobsStorage`
  - `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING`
  - `AzureWebJobsDashboard`
- Graph delivery setting names remain absent unless separately approved
- dry-run/no-email mode remains active unless separately approved
- `/api/static-contact` accepts a safe dry-run payload
- no real email is sent
- no setting values, keys, or connection strings are printed

## Current Preflight Verification

Completed in this preflight:

- local endpoint package `npm run check`: passed
- local endpoint package `npm test`: passed
- Function App exists and is running
- storage account exists and is available
- Function setting names were listed without values

