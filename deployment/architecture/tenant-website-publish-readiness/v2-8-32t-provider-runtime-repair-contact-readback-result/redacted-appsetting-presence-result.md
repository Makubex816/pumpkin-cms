# Redacted Appsetting Presence Result

Verification type: boolean-only/redacted.

No raw appsetting values were printed or written.

Subscription lock:

- Subscription ID matched: yes.
- Subscription name: `Azure subscription 1`.
- Operator user: `Contact@iceskatingrinkrentals.com`.

Checked settings:

| Setting | Present | Non-empty | Matches approved secure-file value where applicable |
| --- | --- | --- | --- |
| `Database__Provider` | true | true | true |
| `Database__CosmosDb__ConnectionString` | true | true | true |
| `Database__CosmosDb__DatabaseName` | true | true | true |
| `Jwt__SecretKey` | true | true | true |
| `Jwt__Issuer` | false | false | not applicable |
| `Jwt__Audience` | false | false | not applicable |
| `Jwt__ExpirationMinutes` | false | false | not applicable |

Conclusion:

The provider settings bound in V2.8.32S are active in App Service configuration by name/presence/equality checks. No corrective provider alias was required.

