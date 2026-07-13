# Pumpkin Tenant Redirect Runtime Resolution Standard V2.8.62DRT

## Precedence

An active resolved TenantRedirect is evaluated before normal page rendering. A redirect that shadows a page is valid only when `pageShadowMode` explicitly records `redirect_precedes_page` and the shadowed page identity is retained.

Inactive and pending records never resolve at runtime.

## Request Flow

1. Exclude Admin, API, preview, framework-internal, and known static asset paths.
2. Load tenant ID, API base URL, and tenant API key from server runtime configuration.
3. Call the tenant-scoped runtime resolve endpoint before rendering a page.
4. Treat `404`, timeout, non-success, malformed JSON, unsafe location, unsupported status, or same-request loop as no match.
5. Redirect only to a single-leading-slash internal location or absolute HTTP(S) location.
6. Use exactly the persisted `301`, `302`, `307`, or `308` status.
7. Preserve incoming query only when configured, after any declared target query and before a fragment.

## Safety

- Never expose the tenant API key to client components or logs.
- Never accept CR/LF in a location.
- Never accept protocol-relative or non-HTTP(S) external locations.
- Never execute uploaded JavaScript to implement redirect behavior.
- Reject cycles before persistence; retain same-request loop suppression as defense in depth.
- Keep legacy route extensions such as `.html`, `.php`, `.asp`, and `.aspx` eligible for redirect lookup.
- Do not let redirect lookup failure prevent the target page from rendering normally.

## Platform Neutrality

Internal route classification must use URI-scheme syntax, not platform-specific file-path behavior. A leading `/` is an internal web route on every host OS. The DRT live proof established this as a required Linux/Windows portability test.

## Deployment Boundary

Starter middleware is locally implemented and tested in DRT. DRT does not authorize starter deployment or appsetting mutation.
