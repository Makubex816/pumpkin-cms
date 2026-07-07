# Secret Section Inclusion Booleans

Raw values are not present in this repo package.

| Secret or credential section | Included in outside hardcopy |
| --- | --- |
| Current SuperAdmin credential from V2.8.60WC | true |
| V2.8.47 original SuperAdmin hardcopy preserved as superseded audit source | true |
| Airstrip TenantAdmin credential from V2.8.57 | true |
| Airstrip tenant API key from V2.8.57 | true |
| Airstrip static-contact API key from V2.8.57 | true |
| App Service appsettings | true |
| App Service connection strings | true, zero configured connection-string entries observed |
| App Service publishing profiles | true |
| Static Web App secrets | true |
| Cosmos keys | true |
| Cosmos connection strings | true |
| Storage keys | true |
| Storage connection strings | true |
| Key Vault secret values | false, RBAC inaccessible |
| Returned bearer token from login | false, used in memory only |
