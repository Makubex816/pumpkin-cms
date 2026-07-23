# Security, CORS, and abuse controls

Exact active-publication Origin is enforced with Vary: Origin. Wildcard credentialed CORS is absent. Publication validation, bounded ticket TTL, rate limits, 24 KiB request cap, payload and field bounds, strict JSON, cancellation, honeypot, consent, correlation, and safe errors are active.

CAPTCHA remains held. No ticket, signing key, deployment token, stack trace, or reusable tenant credential is logged or packaged.
