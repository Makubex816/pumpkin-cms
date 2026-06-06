# Exposure Summary

Generated: 2026-06-06

## What Happened

A prior Azure Function app-setting diagnostic used a parsing pattern that caused the command transcript to emit Function app setting values. This preflight does not repeat or store any values.

## Exposed Storage Setting Names

By setting name only:

| Setting name | Why it matters |
| --- | --- |
| `AzureWebJobsStorage` | Azure Functions runtime storage connection setting |
| `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING` | Function content share storage connection setting |
| `AzureWebJobsDashboard` | legacy dashboard storage connection setting |

## Runtime Storage Determination

`AzureWebJobsStorage` is present. Therefore the exposed storage setting includes the Function runtime storage connection setting.

## Non-Storage Values

The prior parsing issue likely emitted other non-storage app setting values as well. This remediation preflight focuses on the live storage connection exposure because that value category contains storage account key material.

## What Was Not Done

- no setting values printed
- no storage keys listed
- no connection strings printed
- no key rotation
- no app setting changes
- no endpoint redeploy
- no email sending

