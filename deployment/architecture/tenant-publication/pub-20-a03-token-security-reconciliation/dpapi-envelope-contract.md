# DPAPI envelope contract

Envelope format PUMPKIN_DPAPI_ENVELOPE_V1; provider Windows DPAPI; scope CurrentUser; safe metadata reference secure-operator-handoff/platform-publication/pub-20-a03-token-security-reconciliation/dpapi-envelope-target.json; envelope SHA-256 b656a5b823784ca9b1084eabf602d7e930d3297019886030995b8c0fefa406c6.

The envelope itself is outside the repository and outside every distributable package. Decryption is intentionally bound to the same Windows user profile. DPAPI CurrentUser is limited to the same Windows user profile; cross-machine or multi-operator automation requires separate managed-secret-provider authority.
