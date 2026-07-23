import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ContractError,
  ContractVersion,
  FormMode,
  HostingClass,
  PublicationMode,
  Role,
  assertEnumValue,
} from './contracts.mjs';
import {
  canonicalDigest,
  clone,
  deterministicId,
  immutable,
  stableStringify,
} from './canonical.mjs';
import {
  assertGitCommitSha,
  assertNoForbiddenData,
  assertSafeIdentifier,
  assertSha256,
} from './security.mjs';

export const RegistryKind = Object.freeze({
  PRODUCT_RELEASE: 'product-release',
  PUBLICATION_ARTIFACT: 'publication-artifact',
});

const REGISTRY_IDENTITIES = Object.freeze({
  [RegistryKind.PRODUCT_RELEASE]: Object.freeze({
    idField: 'releaseId',
    tenantField: null,
  }),
  [RegistryKind.PUBLICATION_ARTIFACT]: Object.freeze({
    idField: 'artifactId',
    tenantField: 'tenantId',
  }),
});

const REQUIRED_ACCEPTED_RELEASE_TEST_SUITES = Object.freeze([
  'tenant-publication-product-validation',
  'root-workspace-acceptance',
  'api-publication-provider-parity',
  'admin-publication-ui-acceptance',
  'current-tenant-candidate-determinism',
]);
const ACCEPTED_RELEASE_LICENSE_STATES = new Set([
  'HELD_PENDING_OWNER_LEGAL_REVIEW',
  'OWNER_LEGAL_REVIEW_ACCEPTED',
]);

export class RegistryAuthorizationError extends ContractError {
  constructor(code, message) {
    super(code, message);
    this.name = 'RegistryAuthorizationError';
  }
}

export class ImmutableRegistry {
  #kind;
  #idField;
  #tenantField;
  #records = new Map();
  #supersessions = new Map();
  #revocations = new Map();
  #events = [];

  constructor({ kind, idField, tenantField = null, document = null }) {
    if (!Object.values(RegistryKind).includes(kind)) {
      throw new ContractError('registry_kind_invalid', `Unsupported registry kind: ${kind}`);
    }
    const expectedIdentity = REGISTRY_IDENTITIES[kind];
    if (
      idField !== expectedIdentity.idField ||
      tenantField !== expectedIdentity.tenantField
    ) {
      throw new ContractError(
        'registry_identity_invalid',
        `Registry ${kind} requires ${expectedIdentity.idField}/${expectedIdentity.tenantField ?? 'global'} identity.`,
      );
    }
    this.#kind = kind;
    this.#idField = idField;
    this.#tenantField = tenantField;
    if (document) this.#loadDocument(document);
  }

  get kind() {
    return this.#kind;
  }

  accept(record, actor) {
    const normalizedActor = normalizeActor(actor);
    assertNoForbiddenData(record, `${this.#kind} record`);
    const payload = normalizeRegistryPayload(this.#kind, record);
    this.#authorizeMutation(normalizedActor, payload);
    if (this.#kind === RegistryKind.PUBLICATION_ARTIFACT) {
      this.#assertPublicationArtifactReferences(payload);
    }
    const id = assertSafeIdentifier(payload[this.#idField], `${this.#kind}.${this.#idField}`);
    const tenantId = this.#tenantField
      ? assertSafeIdentifier(payload[this.#tenantField], `${this.#kind}.${this.#tenantField}`, { backend: true })
      : null;
    const recordDigest = canonicalDigest(payload);
    const existing = this.#records.get(id);
    if (existing) {
      if (existing.recordDigest !== recordDigest) {
        throw new ContractError('immutable_record_conflict', `${this.#kind} ${id} already exists with different immutable content.`);
      }
      return immutable({ status: 'idempotent_replay', record: this.#project(existing, normalizedActor) });
    }

    const envelope = immutable({
      recordId: id,
      tenantId,
      recordDigest,
      acceptedBy: normalizedActor.actorId,
      acceptedRole: normalizedActor.role,
      payload,
    });
    this.#records.set(id, envelope);
    this.#appendEvent('record_accepted', id, normalizedActor, {
      recordDigest,
      tenantId,
    });
    return immutable({ status: 'accepted', record: this.#project(envelope, normalizedActor) });
  }

  read(id, actor) {
    const normalizedActor = normalizeActor(actor);
    const record = this.#records.get(id);
    if (!record) return null;
    this.#authorizeRead(normalizedActor, record);
    return this.#project(record, normalizedActor);
  }

  list(actor, filters = {}) {
    const normalizedActor = normalizeActor(actor);
    const requestedTenant = filters.tenantId ? String(filters.tenantId).toLowerCase() : null;
    if (
      requestedTenant &&
      normalizedActor.role !== Role.SuperAdmin &&
      requestedTenant !== normalizedActor.tenantId
    ) {
      throw new RegistryAuthorizationError('cross_tenant_forbidden', 'TenantAdmin cannot list another tenant registry scope.');
    }

    return [...this.#records.values()]
      .filter((record) => this.#canRead(normalizedActor, record))
      .filter((record) => !requestedTenant || record.tenantId === requestedTenant)
      .filter((record) => !filters.releaseId || record.payload.releaseId === filters.releaseId)
      .filter((record) => !filters.state || this.#derivedState(record.recordId) === filters.state)
      .sort((left, right) => left.recordId.localeCompare(right.recordId, 'en'))
      .map((record) => this.#project(record, normalizedActor));
  }

  supersede(predecessorId, successorId, actor) {
    const normalizedActor = normalizeActor(actor);
    const predecessor = this.#requireRecord(predecessorId);
    const successor = this.#requireRecord(successorId);
    this.#authorizeMutation(normalizedActor, predecessor.payload);
    this.#authorizeMutation(normalizedActor, successor.payload);
    if (predecessorId === successorId) {
      throw new ContractError('supersession_self_reference', 'A record cannot supersede itself.');
    }
    if (predecessor.tenantId !== successor.tenantId) {
      throw new ContractError('supersession_scope_mismatch', 'Supersession must remain in the same tenant scope.');
    }
    if (
      this.#kind === RegistryKind.PUBLICATION_ARTIFACT &&
      (
        predecessor.payload.tenantUid !== successor.payload.tenantUid ||
        predecessor.payload.publicationId !==
          successor.payload.publicationId ||
        successor.payload.predecessorArtifactId !== predecessorId ||
        successor.payload.predecessorPublicationId !==
          predecessor.payload.publicationId ||
        successor.payload.predecessorArtifactSha256 !==
          predecessor.payload.packageSha256
      )
    ) {
      throw new ContractError(
        'supersession_lineage_mismatch',
        'Publication-artifact supersession must follow the exact tenant/publication predecessor lineage.',
      );
    }
    if (this.#revocations.has(predecessorId) || this.#revocations.has(successorId)) {
      throw new ContractError(
        'supersession_revoked_record',
        'Revoked records cannot participate in a new supersession.',
      );
    }
    if (this.#supersessions.has(successorId)) {
      throw new ContractError(
        'supersession_successor_not_active',
        'A successor must be an active registry record.',
      );
    }
    const existing = this.#supersessions.get(predecessorId);
    if (existing) {
      if (existing.successorId !== successorId) {
        throw new ContractError('supersession_conflict', `${predecessorId} is already superseded by ${existing.successorId}.`);
      }
      return immutable({ status: 'idempotent_replay', predecessor: this.#project(predecessor, normalizedActor) });
    }
    const link = immutable({
      predecessorId,
      successorId,
      linkId: deterministicId('supersession', { kind: this.#kind, predecessorId, successorId }),
    });
    this.#supersessions.set(predecessorId, link);
    this.#appendEvent('record_superseded', predecessorId, normalizedActor, link);
    return immutable({ status: 'superseded', predecessor: this.#project(predecessor, normalizedActor) });
  }

  revoke(id, actor, reasonCode) {
    const normalizedActor = normalizeActor(actor);
    const record = this.#requireRecord(id);
    this.#authorizeMutation(normalizedActor, record.payload);
    const reason = assertSafeIdentifier(reasonCode, 'revoke reasonCode');
    const existing = this.#revocations.get(id);
    if (existing) {
      if (existing.reasonCode !== reason) {
        throw new ContractError('revocation_conflict', `${id} is already revoked for a different reason.`);
      }
      return immutable({ status: 'idempotent_replay', record: this.#project(record, normalizedActor) });
    }
    const revocation = immutable({
      revocationId: deterministicId('revocation', { kind: this.#kind, id, reason }),
      recordId: id,
      reasonCode: reason,
    });
    this.#revocations.set(id, revocation);
    this.#appendEvent('record_revoked', id, normalizedActor, revocation);
    return immutable({ status: 'revoked', record: this.#project(record, normalizedActor) });
  }

  events(actor, { tenantId = null } = {}) {
    const normalizedActor = normalizeActor(actor);
    return this.#events
      .filter((event) => {
        const record = this.#records.get(event.recordId);
        return record && this.#canRead(normalizedActor, record);
      })
      .filter((event) => !tenantId || event.tenantId === tenantId)
      .map((event) => immutable(event));
  }

  toDocument() {
    const body = {
      schemaVersion: ContractVersion.registry,
      kind: this.#kind,
      idField: this.#idField,
      tenantField: this.#tenantField,
      records: [...this.#records.values()]
        .map((record) => clone(record))
        .sort((left, right) => left.recordId.localeCompare(right.recordId, 'en')),
      supersessions: [...this.#supersessions.values()]
        .map((link) => clone(link))
        .sort((left, right) => left.predecessorId.localeCompare(right.predecessorId, 'en')),
      revocations: [...this.#revocations.values()]
        .map((item) => clone(item))
        .sort((left, right) => left.recordId.localeCompare(right.recordId, 'en')),
      events: this.#events.map((event) => clone(event)),
      valuesIncluded: false,
    };
    return immutable({ ...body, documentSha256: canonicalDigest(body) });
  }

  static fromDocument(document) {
    return new ImmutableRegistry({
      kind: document?.kind,
      idField: document?.idField,
      tenantField: document?.tenantField ?? null,
      document,
    });
  }

  #loadDocument(document) {
    if (document.schemaVersion !== ContractVersion.registry) {
      throw new ContractError('registry_schema_invalid', `Registry schema must be ${ContractVersion.registry}.`);
    }
    if (document.kind !== this.#kind || document.idField !== this.#idField || (document.tenantField ?? null) !== this.#tenantField) {
      throw new ContractError('registry_identity_mismatch', 'Registry document identity does not match the requested registry.');
    }
    const { documentSha256, ...body } = clone(document);
    if (canonicalDigest(body) !== documentSha256) {
      throw new ContractError('registry_hash_mismatch', 'Registry document hash does not match its immutable content.');
    }
    assertNoForbiddenData(body, 'registry document');
    assertExactObjectKeys(
      body,
      [
        'schemaVersion',
        'kind',
        'idField',
        'tenantField',
        'records',
        'supersessions',
        'revocations',
        'events',
        'valuesIncluded',
      ],
      'registry document',
    );
    if (
      !Array.isArray(body.records) ||
      !Array.isArray(body.supersessions) ||
      !Array.isArray(body.revocations) ||
      !Array.isArray(body.events) ||
      body.valuesIncluded !== false
    ) {
      throw new ContractError(
        'registry_document_shape_invalid',
        'Registry document collections and valuesIncluded boundary are invalid.',
      );
    }
    for (const envelope of body.records) {
      if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
        throw new ContractError('registry_record_invalid', 'Registry record envelope is invalid.');
      }
      assertExactObjectKeys(
        envelope,
        [
          'recordId',
          'tenantId',
          'recordDigest',
          'acceptedBy',
          'acceptedRole',
          'payload',
        ],
        'registry record envelope',
      );
      const recordId = assertSafeIdentifier(
        envelope.recordId,
        `registry record.${this.#idField}`,
      );
      const payloadId = assertSafeIdentifier(
        envelope.payload?.[this.#idField],
        `registry payload.${this.#idField}`,
      );
      if (recordId !== payloadId) {
        throw new ContractError(
          'registry_record_identity_mismatch',
          `Registry envelope ${recordId} does not match payload identity ${payloadId}.`,
        );
      }
      const normalizedPayload = normalizeRegistryPayload(
        this.#kind,
        envelope.payload,
      );
      if (
        canonicalDigest(normalizedPayload) !==
        canonicalDigest(envelope.payload)
      ) {
        throw new ContractError(
          'registry_record_payload_invalid',
          `Registry payload ${recordId} is not canonically normalized.`,
        );
      }
      let tenantId = null;
      if (this.#tenantField) {
        tenantId = assertSafeIdentifier(
          envelope.tenantId,
          `registry record.${this.#tenantField}`,
          { backend: true },
        );
        const payloadTenantId = assertSafeIdentifier(
          envelope.payload?.[this.#tenantField],
          `registry payload.${this.#tenantField}`,
          { backend: true },
        );
        if (tenantId !== payloadTenantId) {
          throw new ContractError(
            'registry_record_tenant_mismatch',
            `Registry envelope ${recordId} tenant does not match its payload.`,
          );
        }
      } else if (envelope.tenantId !== null) {
        throw new ContractError(
          'registry_record_tenant_unexpected',
          'Global registry records must have a null tenant scope.',
        );
      }
      if (this.#records.has(recordId)) {
        throw new ContractError(
          'registry_record_duplicate',
          `Registry document contains duplicate record ${recordId}.`,
        );
      }
      if (canonicalDigest(envelope.payload) !== envelope.recordDigest) {
        throw new ContractError('registry_record_hash_mismatch', `Registry record ${recordId} hash is invalid.`);
      }
      assertSafeIdentifier(envelope.acceptedBy, 'registry record.acceptedBy');
      assertEnumValue(Role, envelope.acceptedRole, 'registry record.acceptedRole');
      if (
        this.#kind === RegistryKind.PRODUCT_RELEASE &&
        envelope.acceptedRole !== Role.SuperAdmin
      ) {
        throw new ContractError(
          'registry_record_authority_invalid',
          'Product-release records require SuperAdmin acceptance authority.',
        );
      }
      this.#records.set(recordId, immutable({ ...envelope, tenantId }));
    }
    if (this.#kind === RegistryKind.PUBLICATION_ARTIFACT) {
      for (const record of this.#records.values()) {
        this.#assertPublicationArtifactReferences(record.payload);
      }
    }
    for (const link of body.supersessions) {
      assertExactObjectKeys(
        link,
        ['predecessorId', 'successorId', 'linkId'],
        'registry supersession',
      );
      const predecessorId = assertSafeIdentifier(
        link?.predecessorId,
        'registry supersession.predecessorId',
      );
      const successorId = assertSafeIdentifier(
        link?.successorId,
        'registry supersession.successorId',
      );
      if (predecessorId === successorId) {
        throw new ContractError(
          'registry_supersession_self_reference',
          'Registry document contains a self-supersession.',
        );
      }
      const predecessor = this.#records.get(predecessorId);
      const successor = this.#records.get(successorId);
      if (!predecessor || !successor) {
        throw new ContractError(
          'registry_supersession_target_missing',
          'Registry supersession references a missing record.',
        );
      }
      if (predecessor.tenantId !== successor.tenantId) {
        throw new ContractError(
          'registry_supersession_scope_mismatch',
          'Registry supersession crosses tenant scope.',
        );
      }
      if (
        this.#kind === RegistryKind.PUBLICATION_ARTIFACT &&
        (
          predecessor.payload.tenantUid !== successor.payload.tenantUid ||
          predecessor.payload.publicationId !==
            successor.payload.publicationId ||
          successor.payload.predecessorArtifactId !== predecessorId ||
          successor.payload.predecessorPublicationId !==
            predecessor.payload.publicationId ||
          successor.payload.predecessorArtifactSha256 !==
            predecessor.payload.packageSha256
        )
      ) {
        throw new ContractError(
          'registry_supersession_lineage_mismatch',
          'Registry supersession violates publication lineage.',
        );
      }
      const expectedLinkId = deterministicId('supersession', {
        kind: this.#kind,
        predecessorId,
        successorId,
      });
      if (link.linkId !== expectedLinkId) {
        throw new ContractError(
          'registry_supersession_identity_invalid',
          'Registry supersession identity is invalid.',
        );
      }
      if (this.#supersessions.has(predecessorId)) {
        throw new ContractError(
          'registry_supersession_duplicate',
          `Registry document contains duplicate supersession for ${predecessorId}.`,
        );
      }
      this.#supersessions.set(predecessorId, immutable(link));
    }
    for (const revocation of body.revocations) {
      assertExactObjectKeys(
        revocation,
        ['revocationId', 'recordId', 'reasonCode'],
        'registry revocation',
      );
      const recordId = assertSafeIdentifier(
        revocation?.recordId,
        'registry revocation.recordId',
      );
      const reasonCode = assertSafeIdentifier(
        revocation?.reasonCode,
        'registry revocation.reasonCode',
      );
      if (!this.#records.has(recordId)) {
        throw new ContractError(
          'registry_revocation_target_missing',
          'Registry revocation references a missing record.',
        );
      }
      const expectedRevocationId = deterministicId('revocation', {
        kind: this.#kind,
        id: recordId,
        reason: reasonCode,
      });
      if (revocation.revocationId !== expectedRevocationId) {
        throw new ContractError(
          'registry_revocation_identity_invalid',
          'Registry revocation identity is invalid.',
        );
      }
      if (this.#revocations.has(recordId)) {
        throw new ContractError(
          'registry_revocation_duplicate',
          `Registry document contains duplicate revocation for ${recordId}.`,
        );
      }
      this.#revocations.set(recordId, immutable(revocation));
    }
    for (const startId of this.#supersessions.keys()) {
      const visited = new Set([startId]);
      let currentId = startId;
      while (this.#supersessions.has(currentId)) {
        currentId = this.#supersessions.get(currentId).successorId;
        if (visited.has(currentId)) {
          throw new ContractError(
            'registry_state_graph_invalid',
            'Registry supersession graph contains a cycle.',
          );
        }
        visited.add(currentId);
      }
    }
    const acceptedEvents = new Set();
    const supersessionEvents = new Set();
    const revocationEvents = new Set();
    const acceptedSoFar = new Set();
    const supersededSoFar = new Map();
    const revokedSoFar = new Set();
    this.#events = body.events.map((event, index) => {
      assertExactObjectKeys(
        event,
        [
          'eventId',
          'sequence',
          'kind',
          'action',
          'recordId',
          'tenantId',
          'actorId',
          'actorRole',
          'actorTenantId',
          'detail',
        ],
        'registry event',
      );
      const sequence = index + 1;
      if (event?.sequence !== sequence || event.kind !== this.#kind) {
        throw new ContractError(
          'registry_event_sequence_invalid',
          'Registry event sequence or kind is invalid.',
        );
      }
      const recordId = assertSafeIdentifier(
        event.recordId,
        'registry event.recordId',
      );
      const record = this.#records.get(recordId);
      if (!record || event.tenantId !== record.tenantId) {
        throw new ContractError(
          'registry_event_scope_invalid',
          'Registry event record or tenant scope is invalid.',
        );
      }
      const action = assertSafeIdentifier(
        event.action,
        'registry event.action',
      );
      assertSafeIdentifier(event.actorId, 'registry event.actorId');
      assertEnumValue(Role, event.actorRole, 'registry event.actorRole');
      const actorTenantId =
        event.actorRole === Role.TenantAdmin
          ? assertSafeIdentifier(
              event.actorTenantId,
              'registry event.actorTenantId',
              { backend: true },
            ).toLowerCase()
          : null;
      if (
        (event.actorRole === Role.TenantAdmin &&
          actorTenantId !== record.tenantId) ||
        (event.actorRole === Role.SuperAdmin &&
          event.actorTenantId !== null)
      ) {
        throw new ContractError(
          'registry_event_actor_scope_invalid',
          'Registry event actor tenant does not authorize the record scope.',
        );
      }
      if (
        this.#kind === RegistryKind.PRODUCT_RELEASE &&
        event.actorRole !== Role.SuperAdmin
      ) {
        throw new ContractError(
          'registry_event_authority_invalid',
          'Product-release state events require SuperAdmin authority.',
        );
      }
      if (action === 'record_accepted') {
        assertExactObjectKeys(
          event.detail,
          ['recordDigest', 'tenantId'],
          'registry acceptance event detail',
        );
        const artifactReferencesUnavailable =
          this.#kind === RegistryKind.PUBLICATION_ARTIFACT &&
          (
            (
              record.payload.predecessorArtifactId !== null &&
              !acceptedSoFar.has(
                record.payload.predecessorArtifactId,
              )
            ) ||
            (
              record.payload.rollbackArtifactId !== null &&
              !acceptedSoFar.has(record.payload.rollbackArtifactId)
            )
          );
        if (
          acceptedEvents.has(recordId) ||
          acceptedSoFar.has(recordId) ||
          artifactReferencesUnavailable ||
          event.detail.recordDigest !== record.recordDigest ||
          event.detail.tenantId !== record.tenantId ||
          event.actorId !== record.acceptedBy ||
          event.actorRole !== record.acceptedRole
        ) {
          throw new ContractError(
            'registry_acceptance_event_invalid',
            'Registry acceptance event does not match its immutable record envelope.',
          );
        }
        acceptedEvents.add(recordId);
        acceptedSoFar.add(recordId);
      } else if (action === 'record_superseded') {
        const link = this.#supersessions.get(recordId);
        assertExactObjectKeys(
          event.detail,
          ['predecessorId', 'successorId', 'linkId'],
          'registry supersession event detail',
        );
        if (
          !link ||
          supersessionEvents.has(recordId) ||
          !acceptedSoFar.has(link.predecessorId) ||
          !acceptedSoFar.has(link.successorId) ||
          revokedSoFar.has(link.predecessorId) ||
          revokedSoFar.has(link.successorId) ||
          supersededSoFar.has(link.predecessorId) ||
          supersededSoFar.has(link.successorId) ||
          canonicalDigest(event.detail) !== canonicalDigest(link)
        ) {
          throw new ContractError(
            'registry_supersession_event_invalid',
            'Registry supersession event does not match a unique state link.',
          );
        }
        supersessionEvents.add(recordId);
        supersededSoFar.set(link.predecessorId, link.successorId);
      } else if (action === 'record_revoked') {
        const revocation = this.#revocations.get(recordId);
        assertExactObjectKeys(
          event.detail,
          ['revocationId', 'recordId', 'reasonCode'],
          'registry revocation event detail',
        );
        if (
          !revocation ||
          revocationEvents.has(recordId) ||
          !acceptedSoFar.has(recordId) ||
          revokedSoFar.has(recordId) ||
          canonicalDigest(event.detail) !== canonicalDigest(revocation)
        ) {
          throw new ContractError(
            'registry_revocation_event_invalid',
            'Registry revocation event does not match a unique state record.',
          );
        }
        revocationEvents.add(recordId);
        revokedSoFar.add(recordId);
      } else {
        throw new ContractError(
          'registry_event_action_invalid',
          'Registry document contains an unsupported state event action.',
        );
      }
      const expectedEventId = deterministicId('registry-event', {
        kind: this.#kind,
        sequence,
        action: event.action,
        recordId,
        tenantId: event.tenantId,
        actorId: event.actorId,
        actorRole: event.actorRole,
        actorTenantId: event.actorTenantId,
        detail: event.detail,
      });
      if (event.eventId !== expectedEventId) {
        throw new ContractError(
          'registry_event_identity_invalid',
          'Registry event identity is invalid.',
        );
      }
      return immutable(event);
    });
    if (
      [...this.#records.keys()].some((recordId) => !acceptedEvents.has(recordId)) ||
      [...this.#supersessions.keys()].some(
        (recordId) => !supersessionEvents.has(recordId),
      ) ||
      [...this.#revocations.keys()].some(
        (recordId) => !revocationEvents.has(recordId),
      )
    ) {
      throw new ContractError(
        'registry_state_event_missing',
        'Every record and state link requires one matching immutable event.',
      );
    }
  }

  #project(record, actor) {
    this.#authorizeRead(actor, record);
    return immutable({
      ...clone(record.payload),
      registryMetadata: {
        recordDigest: record.recordDigest,
        state: this.#derivedState(record.recordId),
        supersededBy: this.#supersessions.get(record.recordId)?.successorId ?? null,
        revocation: this.#revocations.get(record.recordId) ?? null,
      },
    });
  }

  #derivedState(id) {
    if (this.#revocations.has(id)) return 'REVOKED';
    if (this.#supersessions.has(id)) return 'SUPERSEDED';
    return 'ACCEPTED';
  }

  #appendEvent(action, recordId, actor, detail) {
    const record = this.#records.get(recordId);
    const sequence = this.#events.length + 1;
    const event = immutable({
      eventId: deterministicId('registry-event', {
        kind: this.#kind,
        sequence,
        action,
        recordId,
        tenantId: record?.tenantId ?? detail?.tenantId ?? null,
        actorId: actor.actorId,
        actorRole: actor.role,
        actorTenantId: actor.role === Role.TenantAdmin ? actor.tenantId : null,
        detail,
      }),
      sequence,
      kind: this.#kind,
      action,
      recordId,
      tenantId: record?.tenantId ?? detail?.tenantId ?? null,
      actorId: actor.actorId,
      actorRole: actor.role,
      actorTenantId: actor.role === Role.TenantAdmin ? actor.tenantId : null,
      detail: clone(detail),
    });
    this.#events.push(event);
  }

  #requireRecord(id) {
    const record = this.#records.get(id);
    if (!record) throw new ContractError('registry_record_missing', `${this.#kind} record was not found: ${id}`);
    return record;
  }

  #authorizeMutation(actor, record) {
    if (this.#kind === RegistryKind.PRODUCT_RELEASE) {
      if (actor.role !== Role.SuperAdmin) {
        throw new RegistryAuthorizationError('superadmin_required', 'Only SuperAdmin can mutate product releases.');
      }
      return;
    }
    if (actor.role === Role.SuperAdmin) return;
    const tenantId = record?.[this.#tenantField];
    if (!tenantId || String(tenantId).toLowerCase() !== actor.tenantId) {
      throw new RegistryAuthorizationError('cross_tenant_forbidden', 'TenantAdmin mutation is restricted to its own tenant.');
    }
  }

  #authorizeRead(actor, record) {
    if (!this.#canRead(actor, record)) {
      throw new RegistryAuthorizationError('cross_tenant_forbidden', 'Registry read is outside the actor tenant scope.');
    }
  }

  #canRead(actor, record) {
    if (actor.role === Role.SuperAdmin) return true;
    return Boolean(this.#tenantField && record.tenantId && record.tenantId === actor.tenantId);
  }

  #assertPublicationArtifactReferences(payload) {
    if (payload.predecessorArtifactId !== null) {
      const predecessor = this.#records.get(
        payload.predecessorArtifactId,
      );
      if (!predecessor) {
        throw new ContractError(
          'registry_predecessor_missing',
          'A publication-artifact predecessor must already exist in the registry.',
        );
      }
      if (
        predecessor.tenantId !== payload.tenantId ||
        predecessor.payload.tenantUid !== payload.tenantUid ||
        predecessor.payload.publicationId !== payload.publicationId ||
        payload.predecessorPublicationId !==
          predecessor.payload.publicationId ||
        payload.predecessorArtifactSha256 !==
          predecessor.payload.packageSha256
      ) {
        throw new ContractError(
          'registry_predecessor_lineage_mismatch',
          'Publication-artifact predecessor identity does not match the registered lineage.',
        );
      }
    }

    if (payload.rollbackArtifactId !== null) {
      const rollback = this.#records.get(payload.rollbackArtifactId);
      if (!rollback) {
        throw new ContractError(
          'registry_rollback_missing',
          'A publication-artifact rollback target must already exist in the registry.',
        );
      }
      if (
        rollback.tenantId !== payload.tenantId ||
        rollback.payload.tenantUid !== payload.tenantUid ||
        rollback.payload.publicationId !== payload.publicationId
      ) {
        throw new ContractError(
          'registry_rollback_lineage_mismatch',
          'Publication-artifact rollback target must remain in the same tenant/publication lineage.',
        );
      }
    }
  }
}

export class ProductReleaseRegistry extends ImmutableRegistry {
  constructor(document = null) {
    super({
      kind: RegistryKind.PRODUCT_RELEASE,
      idField: 'releaseId',
      tenantField: null,
      document,
    });
  }
}

export class PublicationArtifactRegistry extends ImmutableRegistry {
  #productReleaseRegistry;

  constructor({
    document = null,
    productReleaseRegistry,
  } = {}) {
    if (!(productReleaseRegistry instanceof ProductReleaseRegistry)) {
      throw new ContractError(
        'product_release_registry_required',
        'Publication-artifact acceptance requires the authoritative ProductReleaseRegistry.',
      );
    }
    super({
      kind: RegistryKind.PUBLICATION_ARTIFACT,
      idField: 'artifactId',
      tenantField: 'tenantId',
      document,
    });
    this.#productReleaseRegistry = productReleaseRegistry;
  }

  accept(record, actor) {
    const releaseId = assertSafeIdentifier(
      record?.releaseId,
      'publication-artifact.releaseId',
    );
    const release = this.#productReleaseRegistry.read(
      releaseId,
      {
        role: Role.SuperAdmin,
        actorId: 'publication-artifact-release-gate',
      },
    );
    if (release === null) {
      throw new ContractError(
        'product_release_missing',
        'Publication artifact references a product release that is not registered.',
      );
    }
    if (release.registryMetadata.state !== 'ACCEPTED') {
      throw new ContractError(
        'product_release_not_accepted',
        'Publication artifact requires a product release whose current registry state is ACCEPTED.',
      );
    }
    return super.accept(record, actor);
  }
}

export async function readRegistryFile(filePath) {
  const snapshot = await readRegistrySnapshot(path.resolve(filePath));
  return ImmutableRegistry.fromDocument(snapshot.document);
}

const FILE_BACKED_CONSTRUCTOR_TOKEN = Symbol('FileBackedImmutableRegistry');

export class FileBackedImmutableRegistry {
  #filePath;
  #document;
  #baseRevision;
  #factory;

  constructor(
    constructorToken,
    filePath,
    document,
    baseRevision,
    factory,
  ) {
    if (constructorToken !== FILE_BACKED_CONSTRUCTOR_TOKEN) {
      throw new ContractError(
        'registry_constructor_private',
        'FileBackedImmutableRegistry instances must be opened through FileBackedImmutableRegistry.open().',
      );
    }
    this.#filePath = path.resolve(filePath);
    this.#factory = factory;
    this.#document = immutable(document);
    this.#baseRevision = baseRevision;
  }

  static async open(filePath, factory) {
    const resolved = path.resolve(filePath);
    if (typeof factory !== 'function') {
      throw new ContractError(
        'registry_factory_invalid',
        'A registry factory that can reopen immutable snapshots is required.',
      );
    }
    const existing = await readRegistrySnapshot(resolved, {
      allowMissing: true,
    });
    if (existing) {
      const registry = instantiateRegistryFactory(
        factory,
        existing.document,
      );
      return new FileBackedImmutableRegistry(
        FILE_BACKED_CONSTRUCTOR_TOKEN,
        resolved,
        registry.toDocument(),
        existing.revision,
        factory,
      );
    }
    const registry = instantiateRegistryFactory(factory, null);
    return new FileBackedImmutableRegistry(
      FILE_BACKED_CONSTRUCTOR_TOKEN,
      resolved,
      registry.toDocument(),
      null,
      factory,
    );
  }

  get registry() {
    return createReadOnlyRegistryView(
      this.#document,
      this.#factory,
    );
  }

  get kind() {
    return this.#document.kind;
  }

  read(id, actor) {
    return registryFromSnapshot(
      this.#document,
      this.#factory,
    ).read(id, actor);
  }

  list(actor, filters = {}) {
    return registryFromSnapshot(
      this.#document,
      this.#factory,
    ).list(actor, filters);
  }

  events(actor, filters = {}) {
    return registryFromSnapshot(
      this.#document,
      this.#factory,
    ).events(actor, filters);
  }

  toDocument() {
    return immutable(this.#document);
  }

  async accept(record, actor) {
    return this.#transact((candidate) => candidate.accept(record, actor));
  }

  async supersede(predecessorId, successorId, actor) {
    return this.#transact((candidate) =>
      candidate.supersede(predecessorId, successorId, actor),
    );
  }

  async revoke(id, actor, reasonCode) {
    return this.#transact((candidate) =>
      candidate.revoke(id, actor, reasonCode),
    );
  }

  persist() {
    return this.#transact(() => null);
  }

  async #transact(mutation) {
    const lockPath = `${this.#filePath}.lock`;
    await fs.mkdir(path.dirname(this.#filePath), { recursive: true });
    let lockHandle;
    let ownsLock = false;
    try {
      try {
        lockHandle = await fs.open(lockPath, 'wx', 0o600);
        ownsLock = true;
      } catch (error) {
        if (error?.code === 'EEXIST') {
          throw new ContractError(
            'registry_revision_conflict',
            'Registry persistence is already locked by another writer.',
          );
        }
        throw error;
      }
      const currentSnapshot = await readRegistrySnapshot(
        this.#filePath,
        { allowMissing: true },
      );
      if (!registrySnapshotMatchesRevision(
        currentSnapshot,
        this.#baseRevision,
      )) {
        throw new ContractError(
          'registry_revision_conflict',
          'Registry file changed after this instance was opened.',
        );
      }
      const candidate = registryFromSnapshot(
        this.#document,
        this.#factory,
      );
      const result = mutation(candidate);
      const document = candidate.toDocument();
      let committed = currentSnapshot;
      if (
        !committed ||
        committed.document.documentSha256 !== document.documentSha256
      ) {
        await replaceRegistryFileDurably(
          this.#filePath,
          document,
          currentSnapshot?.revision ?? null,
        );
        committed = await readRegistrySnapshot(this.#filePath);
        if (
          committed.document.documentSha256 !== document.documentSha256
        ) {
          throw new ContractError(
            'registry_durable_commit_mismatch',
            'The durable registry file does not match the candidate commit.',
          );
        }
      }
      this.#document = committed.document;
      this.#baseRevision = committed.revision;
      return result === null
        ? immutable({
            filePath: this.#filePath,
            documentSha256: document.documentSha256,
            recordCount: document.records.length,
          })
        : result;
    } finally {
      if (lockHandle) await lockHandle.close();
      if (ownsLock) {
        await fs.unlink(lockPath).catch((error) => {
          if (error?.code !== 'ENOENT') throw error;
        });
      }
    }
  }
}

function instantiateRegistryFactory(factory, document) {
  const registry = factory(document);
  if (!(registry instanceof ImmutableRegistry)) {
    throw new ContractError(
      'registry_instance_invalid',
      'The registry factory must return an ImmutableRegistry.',
    );
  }
  if (
    document !== null &&
    registry.toDocument().documentSha256 !==
      document.documentSha256
  ) {
    throw new ContractError(
      'registry_factory_snapshot_mismatch',
      'The registry factory did not reopen the exact immutable snapshot.',
    );
  }
  return registry;
}

function registryFromSnapshot(document, factory = null) {
  return factory
    ? instantiateRegistryFactory(factory, document)
    : ImmutableRegistry.fromDocument(document);
}

function createReadOnlyRegistryView(document, factory = null) {
  const snapshot = immutable(document);
  return Object.freeze({
    kind: snapshot.kind,
    read(id, actor) {
      return registryFromSnapshot(snapshot, factory).read(
        id,
        actor,
      );
    },
    list(actor, filters = {}) {
      return registryFromSnapshot(snapshot, factory).list(
        actor,
        filters,
      );
    },
    events(actor, filters = {}) {
      return registryFromSnapshot(snapshot, factory).events(
        actor,
        filters,
      );
    },
    toDocument() {
      return immutable(snapshot);
    },
  });
}

async function readRegistrySnapshot(
  filePath,
  { allowMissing = false } = {},
) {
  const resolved = path.resolve(filePath);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let before;
    try {
      before = await fs.lstat(resolved, { bigint: true });
    } catch (error) {
      if (allowMissing && error?.code === 'ENOENT') return null;
      throw error;
    }
    if (!before.isFile() || before.isSymbolicLink()) {
      throw new ContractError(
        'registry_file_type_invalid',
        'A registry path must resolve to a regular, non-symbolic-link file.',
      );
    }

    let raw;
    let after;
    try {
      raw = await fs.readFile(resolved, 'utf8');
      after = await fs.lstat(resolved, { bigint: true });
    } catch (error) {
      if (error?.code === 'ENOENT' && attempt < 3) continue;
      throw error;
    }
    if (!after.isFile() || after.isSymbolicLink()) {
      throw new ContractError(
        'registry_file_type_invalid',
        'A registry path must resolve to a regular, non-symbolic-link file.',
      );
    }
    if (!fileStatsEqual(before, after)) continue;

    const registry = ImmutableRegistry.fromDocument(JSON.parse(raw));
    const document = registry.toDocument();
    return {
      document,
      revision: registryRevision(document, after),
    };
  }
  throw new ContractError(
    'registry_revision_unstable',
    'The registry file changed while it was being opened.',
  );
}

function registryRevision(document, stats) {
  return Object.freeze({
    documentSha256: document.documentSha256,
    device: String(stats.dev),
    inode: String(stats.ino),
    mode: String(stats.mode),
    size: String(stats.size),
    modifiedNanoseconds: String(stats.mtimeNs),
    changedNanoseconds: String(stats.ctimeNs),
  });
}

function registrySnapshotMatchesRevision(snapshot, revision) {
  if (snapshot === null || revision === null) {
    return snapshot === revision;
  }
  return (
    snapshot.revision.documentSha256 === revision.documentSha256 &&
    snapshot.revision.device === revision.device &&
    snapshot.revision.inode === revision.inode &&
    snapshot.revision.mode === revision.mode &&
    snapshot.revision.size === revision.size &&
    snapshot.revision.modifiedNanoseconds ===
      revision.modifiedNanoseconds &&
    snapshot.revision.changedNanoseconds ===
      revision.changedNanoseconds
  );
}

function fileStatsEqual(left, right) {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.size === right.size &&
    left.mtimeNs === right.mtimeNs &&
    left.ctimeNs === right.ctimeNs
  );
}

async function replaceRegistryFileDurably(
  filePath,
  document,
  expectedRevision,
) {
  const resolved = path.resolve(filePath);
  const directory = path.dirname(resolved);
  const { fileHandle, temporaryPath } =
    await openUnpredictableTemporaryFile(resolved);
  let handle = fileHandle;
  let renamed = false;
  try {
    await handle.writeFile(`${stableStringify(document)}\n`, {
      encoding: 'utf8',
    });
    await handle.sync();
    await handle.close();
    handle = null;
    const currentSnapshot = await readRegistrySnapshot(resolved, {
      allowMissing: true,
    });
    if (!registrySnapshotMatchesRevision(
      currentSnapshot,
      expectedRevision,
    )) {
      throw new ContractError(
        'registry_revision_conflict',
        'Registry file changed while the durable candidate was being prepared.',
      );
    }
    await fs.rename(temporaryPath, resolved);
    renamed = true;
    await syncDirectoryWhereSupported(directory);
  } finally {
    if (handle) await handle.close().catch(() => {});
    if (!renamed) {
      await fs.unlink(temporaryPath).catch((error) => {
        if (error?.code !== 'ENOENT') throw error;
      });
    }
  }
}

async function openUnpredictableTemporaryFile(filePath) {
  const directory = path.dirname(filePath);
  const basename = path.basename(filePath);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const nonce = randomBytes(18).toString('hex');
    const temporaryPath = path.join(
      directory,
      `.${basename}.${nonce}.tmp`,
    );
    try {
      const fileHandle = await fs.open(
        temporaryPath,
        'wx',
        0o600,
      );
      return { fileHandle, temporaryPath };
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
    }
  }
  throw new ContractError(
    'registry_temporary_file_collision',
    'Could not allocate an exclusive registry temporary file.',
  );
}

async function syncDirectoryWhereSupported(directory) {
  let handle;
  try {
    handle = await fs.open(directory, 'r');
    await handle.sync();
  } catch (error) {
    if (!directorySyncUnsupported(error)) throw error;
  } finally {
    if (handle) await handle.close();
  }
}

function directorySyncUnsupported(error) {
  if (['EINVAL', 'ENOTSUP', 'EOPNOTSUPP'].includes(error?.code)) {
    return true;
  }
  return (
    process.platform === 'win32' &&
    ['EACCES', 'EBADF', 'EISDIR', 'EPERM'].includes(error?.code)
  );
}

function normalizeRegistryPayload(kind, rawRecord) {
  if (kind === RegistryKind.PRODUCT_RELEASE) {
    assertExactObjectKeys(
      rawRecord,
      [
        'releaseId',
        'version',
        'sourceCommit',
        'lockfileSha256',
        'packageVersions',
        'testEvidence',
        'licenseStatus',
        'starterArtifactSha256',
        'starterImageDigest',
        'state',
      ],
      'product-release payload',
    );
    if (
      rawRecord.state !== 'ACCEPTED' ||
      typeof rawRecord.version !== 'string' ||
      rawRecord.version.length < 1 ||
      rawRecord.version.length > 64 ||
      !ACCEPTED_RELEASE_LICENSE_STATES.has(rawRecord.licenseStatus)
    ) {
      throw new ContractError(
        'registry_record_payload_invalid',
        'Product-release payload status or bounded text is invalid.',
      );
    }
    const packageVersions = normalizeRegistryStringMap(
      rawRecord.packageVersions,
      'product-release.packageVersions',
    );
    if (Object.keys(packageVersions).length < 1) {
      throw new ContractError(
        'registry_record_payload_invalid',
        'Product-release packageVersions must not be empty.',
      );
    }
    return immutable({
      releaseId: assertSafeIdentifier(
        rawRecord.releaseId,
        'product-release.releaseId',
      ),
      version: rawRecord.version,
      sourceCommit: assertGitCommitSha(
        rawRecord.sourceCommit,
        'product-release.sourceCommit',
      ),
      lockfileSha256: assertSha256(
        rawRecord.lockfileSha256,
        'product-release.lockfileSha256',
      ),
      packageVersions,
      testEvidence: normalizeReleaseTestEvidence(
        rawRecord.testEvidence,
      ),
      licenseStatus: rawRecord.licenseStatus,
      starterArtifactSha256: assertSha256(
        rawRecord.starterArtifactSha256,
        'product-release.starterArtifactSha256',
      ),
      starterImageDigest: assertSha256Digest(
        rawRecord.starterImageDigest,
        'product-release.starterImageDigest',
      ),
      state: 'ACCEPTED',
    });
  }
  if (kind === RegistryKind.PUBLICATION_ARTIFACT) {
    assertExactObjectKeys(
      rawRecord,
      [
        'artifactId',
        'tenantId',
        'tenantUid',
        'publicationId',
        'snapshotId',
        'releaseId',
        'sourceSnapshotSha256',
        'packageSha256',
        'manifestSha256',
        'hostingClass',
        'publicationMode',
        'formMode',
        'routeInventorySha256',
        'mediaInventorySha256',
        'formInventorySha256',
        'fileInventorySha256',
        'predecessorArtifactId',
        'predecessorPublicationId',
        'predecessorArtifactSha256',
        'rollbackArtifactId',
      ],
      'publication-artifact payload',
    );
    const predecessorArtifactId =
      rawRecord.predecessorArtifactId === null
        ? null
        : assertSafeIdentifier(
            rawRecord.predecessorArtifactId,
            'publication-artifact.predecessorArtifactId',
          );
    const predecessorPublicationId =
      rawRecord.predecessorPublicationId === null
        ? null
        : assertSafeIdentifier(
            rawRecord.predecessorPublicationId,
            'publication-artifact.predecessorPublicationId',
            { backend: true },
          );
    const predecessorArtifactSha256 =
      rawRecord.predecessorArtifactSha256 === null
        ? null
        : assertSha256(
            rawRecord.predecessorArtifactSha256,
            'publication-artifact.predecessorArtifactSha256',
          );
    const rollbackArtifactId =
      rawRecord.rollbackArtifactId === null
        ? null
        : assertSafeIdentifier(
            rawRecord.rollbackArtifactId,
            'publication-artifact.rollbackArtifactId',
          );
    if (
      predecessorArtifactId === null
        ? (
            predecessorPublicationId !== null ||
            predecessorArtifactSha256 !== null ||
            rollbackArtifactId !== null
          )
        : (
            predecessorPublicationId === null ||
            predecessorArtifactSha256 === null ||
            rollbackArtifactId === null
          )
    ) {
      throw new ContractError(
        'registry_rollback_identity_invalid',
        'Publication-artifact predecessor and rollback identity fields must be either entirely absent or entirely bound.',
      );
    }
    return immutable({
      artifactId: assertSafeIdentifier(
        rawRecord.artifactId,
        'publication-artifact.artifactId',
      ),
      tenantId: assertSafeIdentifier(
        rawRecord.tenantId,
        'publication-artifact.tenantId',
        { backend: true },
      ).toLowerCase(),
      tenantUid: assertSafeIdentifier(
        rawRecord.tenantUid,
        'publication-artifact.tenantUid',
      ).toLowerCase(),
      publicationId: assertSafeIdentifier(
        rawRecord.publicationId,
        'publication-artifact.publicationId',
        { backend: true },
      ),
      snapshotId: assertSafeIdentifier(
        rawRecord.snapshotId,
        'publication-artifact.snapshotId',
      ),
      releaseId: assertSafeIdentifier(
        rawRecord.releaseId,
        'publication-artifact.releaseId',
      ),
      sourceSnapshotSha256: assertSha256(
        rawRecord.sourceSnapshotSha256,
        'publication-artifact.sourceSnapshotSha256',
      ),
      packageSha256: assertSha256(
        rawRecord.packageSha256,
        'publication-artifact.packageSha256',
      ),
      manifestSha256: assertSha256(
        rawRecord.manifestSha256,
        'publication-artifact.manifestSha256',
      ),
      hostingClass: assertEnumValue(
        HostingClass,
        rawRecord.hostingClass,
        'publication-artifact.hostingClass',
      ),
      publicationMode: assertEnumValue(
        PublicationMode,
        rawRecord.publicationMode,
        'publication-artifact.publicationMode',
      ),
      formMode: assertEnumValue(
        FormMode,
        rawRecord.formMode,
        'publication-artifact.formMode',
      ),
      routeInventorySha256: assertSha256(
        rawRecord.routeInventorySha256,
        'publication-artifact.routeInventorySha256',
      ),
      mediaInventorySha256: assertSha256(
        rawRecord.mediaInventorySha256,
        'publication-artifact.mediaInventorySha256',
      ),
      formInventorySha256: assertSha256(
        rawRecord.formInventorySha256,
        'publication-artifact.formInventorySha256',
      ),
      fileInventorySha256: assertSha256(
        rawRecord.fileInventorySha256,
        'publication-artifact.fileInventorySha256',
      ),
      predecessorArtifactId,
      predecessorPublicationId,
      predecessorArtifactSha256,
      rollbackArtifactId,
    });
  }
  throw new ContractError(
    'registry_kind_invalid',
    'Registry payload kind is unsupported.',
  );
}

function normalizeReleaseTestEvidence(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 64) {
    throw new ContractError(
      'registry_test_evidence_invalid',
      'Product-release testEvidence must contain between 1 and 64 records.',
    );
  }
  const suiteIds = new Set();
  const evidence = value.map((item) => {
    assertExactObjectKeys(
      item,
      ['suiteId', 'status', 'evidenceSha256'],
      'product-release test-evidence record',
    );
    const suiteId = assertSafeIdentifier(
      item.suiteId,
      'product-release testEvidence.suiteId',
    );
    if (suiteIds.has(suiteId)) {
      throw new ContractError(
        'registry_test_evidence_duplicate',
        `Product-release testEvidence contains duplicate suite ${suiteId}.`,
      );
    }
    suiteIds.add(suiteId);
    const status = assertSafeIdentifier(
      item.status,
      'product-release testEvidence.status',
    );
    if (status !== 'PASSED') {
      throw new ContractError(
        'registry_release_not_qualified',
        `Accepted product release evidence ${suiteId} must have status PASSED.`,
      );
    }
    return {
      suiteId,
      status,
      evidenceSha256: assertSha256(
        item.evidenceSha256,
        'product-release testEvidence.evidenceSha256',
      ),
    };
  });
  evidence.sort((left, right) =>
    left.suiteId.localeCompare(right.suiteId, 'en'));
  for (const requiredSuiteId of REQUIRED_ACCEPTED_RELEASE_TEST_SUITES) {
    if (!suiteIds.has(requiredSuiteId)) {
      throw new ContractError(
        'registry_release_not_qualified',
        `Accepted product release is missing mandatory passing suite ${requiredSuiteId}.`,
      );
    }
  }
  return immutable(evidence);
}

function assertSha256Digest(value, label) {
  if (
    typeof value !== 'string' ||
    !/^sha256:[0-9a-f]{64}$/.test(value)
  ) {
    throw new ContractError(
      'sha256_digest_invalid',
      `${label} must be a lowercase sha256:<64-hex> digest.`,
    );
  }
  return value;
}

function normalizeRegistryStringMap(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ContractError(
      'registry_record_payload_invalid',
      `${label} must be an object.`,
    );
  }
  return immutable(
    Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right, 'en'))
        .map(([key, child]) => {
          const normalizedKey = assertSafeIdentifier(key, `${label} key`);
          if (
            typeof child !== 'string' ||
            child.length < 1 ||
            child.length > 128
          ) {
            throw new ContractError(
              'registry_record_payload_invalid',
              `${label}.${normalizedKey} must be bounded text.`,
            );
          }
          return [normalizedKey, child];
        }),
    ),
  );
}

function normalizeActor(actor = {}) {
  const role = assertEnumValue(Role, actor.role, 'actor.role');
  const actorId = assertSafeIdentifier(actor.actorId, 'actor.actorId');
  let tenantId = null;
  if (role === Role.TenantAdmin) {
    tenantId = assertSafeIdentifier(actor.tenantId, 'actor.tenantId', { backend: true }).toLowerCase();
  } else if (actor.tenantId) {
    tenantId = assertSafeIdentifier(actor.tenantId, 'actor.tenantId', { backend: true }).toLowerCase();
  }
  return immutable({ role, actorId, tenantId });
}

function assertExactObjectKeys(value, expectedKeys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ContractError(
      'registry_document_shape_invalid',
      `${label} must be an object.`,
    );
  }
  const expected = new Set(expectedKeys);
  const actual = Object.keys(value);
  if (
    actual.length !== expected.size ||
    actual.some((key) => !expected.has(key))
  ) {
    throw new ContractError(
      'registry_document_shape_invalid',
      `${label} fields are invalid.`,
    );
  }
}
