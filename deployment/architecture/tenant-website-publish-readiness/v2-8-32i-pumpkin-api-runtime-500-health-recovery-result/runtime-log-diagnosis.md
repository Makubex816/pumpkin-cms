# Runtime Log Diagnosis

Azure App Service log settings were public-safe to inspect and showed runtime logging disabled:

- Application logging: `null`
- Filesystem HTTP logs: disabled
- Detailed error messages: disabled
- Failed request tracing: disabled

Temporary diagnostic logging was not enabled in I. The one approved deployment and post-deploy health checks had already been consumed, and enabling runtime logs afterward would have required additional live request generation.

Instead, the corrected artifact was run locally from an extracted no-config directory. That local run reproduced the same health HTTP `500` without appsettings/local/env files. The generated local runtime log showed the sanitized exception shape:

- Exception: `System.ArgumentNullException`
- Message: `Value cannot be null. (Parameter 's')`
- Throw site: `System.Text.Encoding.GetBytes(String s)`
- Source line: `Program.cs` JWT bearer options
- Request path evidence: both `/health` and `/api/health`
- Middleware path: `AuthenticationMiddleware.Invoke`

No secret value was present in the generated local log.
