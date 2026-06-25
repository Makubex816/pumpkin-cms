# V2.8.21 Contact Endpoint 405 Root Cause Result

Result: complete, root cause classified, no local source remediation implemented.

V2.8.21 investigated why the V2.8.20 production POST to `https://iceskatingrinkrentals.com/api/contact` returned 405. The selected V2.8.19H production artifact is a static export. It contains the recovered contact page but no `out/api` directory, no `/api/contact` handler, and no configured static form endpoint URL.

Root cause:

- Static export excluded the Next `/api/contact` route.
- The production artifact did not include a static form endpoint URL.
- The deployable static form function scaffold exists locally for `/api/static-contact`, but it was not deployed or linked in this phase.

No live POST, deploy, Azure mutation, DNS/custom-domain mutation, indexing action, protected config read, or inbox/provider login occurred.
