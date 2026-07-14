# Apex And WWW HTTPS Proof

Both names resolve to `20.118.48.17`, but neither is HTTPS-ready.

For both apex and WWW, a TLS handshake presented `*.azurewebsites.net`, failed hostname validation with `ERR_TLS_CERT_ALTNAME_INVALID`, and a diagnostic GET returned Azure's unbound-host HTTP 404. Plain HTTP also returned the unbound-host 404 with no redirect.

No insecure result is classified as launch success. The diagnostic bypassed certificate validation only to record the downstream status and did not submit data or follow redirects.
