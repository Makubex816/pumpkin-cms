# V2.8.21 Carryforward

V2.8.21 classified the V2.8.20 production contact POST failure as a static export/API packaging issue.

Carryforward facts:

- V2.8.20 sent one approved production POST to `/api/contact`.
- Trace ID: `v2-8-20-live-contact-20260625140126`.
- Result: HTTP 405, empty body, no success flag, no entry ID.
- No production retry occurred.
- V2.8.21 found no `out/api` in the selected static artifact.
- V2.8.21 found `staticFormEndpoint` empty in the selected artifact.
- The deployable static function scaffold targets `/api/static-contact`.
- The scaffold intentionally does not deploy `/api/contact` compatibility.

V2.8.22 used this result to move the public static contact form from the missing Next route dependency to `/api/static-contact`.
