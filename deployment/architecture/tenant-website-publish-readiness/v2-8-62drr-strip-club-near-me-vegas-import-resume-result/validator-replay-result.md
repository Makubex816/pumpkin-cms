# Validator Replay Result

| Replay | Result |
| --- | --- |
| Repaired V1 package validator | valid; 0 errors; 0 warnings |
| 43-page create contract | valid; 43 / 43; 0 errors; 0 warnings |
| Remaining create contract | valid; 26 / 26; 0 errors; 0 warnings |
| Contact original fixture | rejected with `contact.formBlock.missing` |
| Duplicate page ID fixture | rejected |
| Unsupported block fixture | rejected |
| Unknown canonical form reference fixture | rejected |
| Pending redirect update operation | rejected as expected; 2 errors; 0 warnings |

The validator project builds with 0 warnings and 0 errors. Its focused regression runner passes all positive and negative cases, including the newly captured redirect-update contract.
