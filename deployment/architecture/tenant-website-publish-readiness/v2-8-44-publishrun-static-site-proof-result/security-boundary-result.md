# Security Boundary Result

- secureFileRead: true
- protectedConfigReads: 0
- appsettingsMutation: false
- appsettingsListShow: false
- directCosmosMutation: false
- storageKeyRetrieval: false
- sasGeneration: false
- keyVaultSecretRead: false
- contactPost: false
- themeFormWork: false
- mediaUpload: false
- tenantMutation: false
- dnsIndexingMutation: false
- secretValuesPrinted: false
- secretValuesWritten: false
- tokenWritten: false
- gitAddAll: false

SWA deployment tokens were retrieved into memory only, supplied via process environment to the SWA CLI, and not printed or written. The secure file value fields were not copied into this report package.
