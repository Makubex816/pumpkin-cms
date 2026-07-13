# Starter Local Redirect Runtime Result

Generic Next.js middleware and a tenant redirect runtime client were added locally.

Behavior:

- loads tenant ID, API URL, and API key only from runtime environment;
- resolves redirects before normal page rendering;
- excludes Admin, API, preview, Next internals, and known static asset paths;
- keeps legacy `.html`, `.htm`, `.php`, `.asp`, and `.aspx` routes eligible for redirect lookup;
- sends the tenant API key only server-side;
- accepts only safe internal or HTTP(S) locations and `301/302/307/308`;
- falls through on no match, API failure, timeout, unsafe response, or same-request loop;
- preserves query behavior supplied by the API.

Focused runtime proof passed old-route redirect, target fall-through, tenant scope, loop rejection, and all four status codes. Type-check passed. Production build completed all 18 routes and middleware; it retained the existing optional `fs` browser-bundle warning from `pumpkin-ts-models` but exited `0`.

No starter deployment or appsetting mutation occurred.
