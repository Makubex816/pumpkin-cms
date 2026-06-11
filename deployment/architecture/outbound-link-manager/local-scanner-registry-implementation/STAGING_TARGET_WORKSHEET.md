# Staging Target Worksheet

The staging target worksheet stores non-secret target placeholders for the future first scoped staging-provider write.

Allowed values:

- provider type
- environment label
- account/resource reference without secrets
- database/container names
- partition key
- credential reference ID without credential value

Disallowed values:

- keys
- tokens
- cookies
- connection strings
- SAS values
- auth headers
- protected config paths

