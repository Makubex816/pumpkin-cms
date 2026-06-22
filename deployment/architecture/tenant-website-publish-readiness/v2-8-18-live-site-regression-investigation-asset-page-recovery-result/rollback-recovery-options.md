# Rollback Recovery Options

## Option R1: Roll Back To A Proven Older Static Artifact

Use only if an older image-heavy deployable artifact is located with:

- full route set
- image files or image URLs
- artifact hash
- source commit or package reference
- owner approval
- isolated staging proof
- rollback plan

Current blocker: no older image-heavy artifact was found in this phase.

## Option R2: Restore From Backup Center Or Prior Host Export

Use if Backup Center, old host, or storage export contains the old customer-facing static site.

Required checks:

- inventory files and images
- verify no secrets/protected config
- rebuild/normalize asset paths
- serve only on isolated staging first
- obtain owner visual/content approval

Current blocker: backup/prior-host artifact was not available in the approved evidence set.

## Option R3: Production SWA Artifact Rollback

Not recommended without a known-good artifact and explicit production-bound approval. Azure metadata inspected in this phase did not expose deployable artifact contents or rollback packages.

