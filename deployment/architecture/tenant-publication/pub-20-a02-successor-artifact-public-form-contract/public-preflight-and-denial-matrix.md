# Public preflight and denial matrix

OPTIONS 204 with no credential allowance; valid 200; wrong origin 404; missing origin 403; unknown publication 404; unknown mapping 404; malformed seed 400; extra property 400; missing ticket 403.

All probes were no-write and noncredentialed. The exact allowed origin succeeded; the syntactically valid wrong origin returned 404 to avoid publication disclosure, and an absent Origin returned 403.
