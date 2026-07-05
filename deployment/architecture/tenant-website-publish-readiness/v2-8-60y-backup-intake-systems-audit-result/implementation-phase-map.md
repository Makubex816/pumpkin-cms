# Implementation Phase Map

## Phase 1: Backup Contract Refresh

- Add DomainBinding, original package, normalized package, overlays, runtime artifacts, and resource bindings to the backup spec.
- Add secret reference schema.
- Add per-tenant restore checklist generation.

## Phase 2: Backup Manager API/UI Contract

- Design BackupRequest and BackupRun models.
- Design SuperAdmin-only Backup Manager routes.
- Keep execution dry-run/local until later approval.
- No live backup job worker yet.

## Phase 3: Universal Package Compiler Contract

- Define source package quarantine model.
- Define compiler output manifest.
- Define framework detection, route/media/form/theme extraction contracts.
- Define owner action packet schema.

## Phase 4: Local Compiler Prototype

- Build local CLI against copied sample packages.
- Use Airstrip as the first fixture benchmark.
- Generate V1 Pumpkin package and owner action packet.
- No live mutation.

## Phase 5: Admin Wizard Read-Only Prototype

- Add upload/intake status UI backed by fixture/local compiled outputs.
- Show disabled future actions.
- Show plain-language blockers.
- No tenant creation or deploy.

## Phase 6: Controlled Write Preflights

- Approve tenant creation preflight separately.
- Approve media upload separately.
- Approve form creation separately.
- Approve isolated preview separately.
- Approve production deploy separately.
- Keep DNS/indexing as final gates.

## Phase 7: Backup Manager Productionization

- Add queue/worker, retention, durable artifact storage, and notification model.
- Add restore dry-run service.
- Keep live restore as a separate approval.

