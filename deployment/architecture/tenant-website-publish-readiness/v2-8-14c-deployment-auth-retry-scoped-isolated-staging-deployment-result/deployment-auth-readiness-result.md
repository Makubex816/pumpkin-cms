# Deployment Auth Readiness Result

Status: passed.

The required env var was checked by presence only:

```text
SWA_CLI_DEPLOYMENT_TOKEN
```

Results:

| Check | Result |
| --- | --- |
| PowerShell boolean presence | `True` |
| Node boolean presence | `true` |
| Readiness wrapper presence | `presentInCurrentProcess: true` |
| Token value printed | No |
| Token value exported | No |
| Token value listed | No |
| Token value logged | No |
| Token value written to docs | No |
| Protected config read to obtain token | No |

The deployment command used the token only from the process environment and did not pass the token value on the command line.
