# Successful login security audit standard V2.8.63BR

A successful login must verify the existing credential first, update legacy and new safe login metadata, and emit exactly one `identity_login_dual_write` audit keyed by the request correlation ID. Profile reads and authorization checks must not emit login audits. Failed login must emit no successful-login audit and update neither last-login field. Audit evidence excludes credentials, tokens, IP addresses, and user agents.
