# Next Quota Approval Polling Plan

Date: 2026-06-27

## Purpose

The next phase should determine whether the submitted East US quota request has been approved.

## Scope

Polling should be read-only.

Approved shape for a future polling-only phase:

- Set active Azure subscription to `ff887def-fd83-4a19-9298-13d4b1687873`.
- Verify active subscription with `az account show`.
- Read only public-safe quota-ticket env values.
- Read only the public-safe quota-ticket summary file if still present.
- Query the support ticket by known ticket name if available.
- Record whether approval is confirmed, denied, still pending, or not confirmable.

## Hard Stops

The polling phase must not:

- Create Azure resources.
- Update Azure resources.
- Delete Azure resources.
- Retry the App Service plan.
- Create the Web App.
- Deploy ZIP artifacts.
- List, show, or set app settings.
- Read protected config.
- Query secrets.
- Generate connection strings or SAS values.
- Send contact POSTs.
- Mutate DNS or custom domains.
- Run Search Console or indexing actions.

## Exit Criteria

If quota approval is not confirmed, keep V2.8.32D retry blocked.

If quota approval is confirmed, stop and request explicit V2.8.32D retry approval before any deployment work.
