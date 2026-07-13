# Redirect Normalization And Cycle Validation

Canonical internal paths:

- use one leading slash;
- collapse empty separators and remove trailing slash except root;
- preserve route segments;
- lowercase and percent-encode canonical segments;
- reject query/fragment on a source;
- reject control characters, dot segments, encoded separators, protocol-relative values, and URI schemes.

Internal targets may carry a meaningful query and client fragment. Incoming query strings are appended only when `preserveQueryString` is true. External targets require explicit `targetKind: external`, absolute HTTP(S), a host, and no embedded credentials.

The active graph combines page-owned and TenantRedirect edges. Validation rejects direct self-loops, two-node cycles, and longer cycles before persistence. The backup restore contract independently rejects self-loops and cycles.

The first deployed build used `Uri.TryCreate(..., Absolute)` while checking internal paths. On Linux that API interpreted `/guides/...` as an absolute file URI, causing both live payloads to fail. Local source now uses an RFC-style scheme-prefix check, retains explicit `//` rejection, and has a source-contract assertion preventing regression. The fix is not live in DRT.
