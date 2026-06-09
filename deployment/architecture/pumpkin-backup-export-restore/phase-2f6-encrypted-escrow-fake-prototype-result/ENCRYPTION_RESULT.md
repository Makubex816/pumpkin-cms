# Encryption Result

The fake escrow prototype uses Node built-in crypto:

- content encryption: `AES-256-GCM`;
- key wrapping: `RSA-OAEP-256`;
- recipient key source: generated at runtime;
- private key persistence: `not-written`;
- generated payload: `encrypted-payload.bin`;
- generated metadata: `escrow-manifest.json` and `recipient-metadata.json`.

The runner verifies an in-memory round trip before writing reports. Private keys are not written.
