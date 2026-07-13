# Tenant Redirect Semantics Standard Result

The durable standard now separates source declaration count from persisted object count and requires one explicit disposition per declaration. It preserves host, scheme, path, query, fragment, case, slash, extension, index-file, canonical, meta-refresh, link, and cycle evidence.

A source route equal to the owning page's current slug is not a canonical no-op unless the normalized redirect target is also that same route and no meaningful behavior differs. Distinct targets remain meaningful. Unsupported meaningful redirects fail closed before mutation.
