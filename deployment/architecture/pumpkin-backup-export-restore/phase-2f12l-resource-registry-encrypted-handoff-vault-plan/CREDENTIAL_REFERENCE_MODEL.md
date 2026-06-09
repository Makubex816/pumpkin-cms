# Credential Reference Model

Credential references are committable pointers to required sensitive material. They do not store values.

## Credential Reference Fields

- `credentialRefId`
- `displayName`
- `purpose`
- `requiredFor`
- `resourceIds`
- `tenantKeys`
- `environment`
- `owner`
- `storageLocationCategory`
- `escrowEligible`
- `escrowStatus`
- `rotationRequired`
- `rotationCadence`
- `lastVerifiedAt`
- `cleanupRequiredAfterBuild`
- `nonEscrowReason`
- `notes`

## Storage Location Categories

- `managed-identity`
- `platform-secret-store`
- `operator-local-vault`
- `encrypted-handoff-vault`
- `not-collected`
- `not-required`

## Escrow Defaults

Escrow eligible by default:

- Durable recovery credentials
- Deployment credentials when unavoidable
- Long-lived API credentials when approved

Not escrow eligible by default:

- Session cookies
- Browser tokens
- Short-lived JWTs
- OAuth refresh/session material not intended for recovery handoff
- Credentials that should be regenerated rather than stored

## Rule

The registry records reference identity, purpose, and ownership only. Values must remain absent from committed files.

