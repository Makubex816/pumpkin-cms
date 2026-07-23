import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ContractError,
  ContractVersion,
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
  assertNoForbiddenData,
  assertSafeIdentifier,
} from './security.mjs';

export const RegistryKind = Object.freeze({
  PRODUCT_RELEASE: 'product-release',
  PUBLICATION_ARTIFACT: 'publication-artifact',
});

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
    this.#authorizeMutation(normalizedActor, record);
    assertNoForbiddenData(record, `${this.#kind} record`);
    const payload = clone(record);
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
    if (predecessorId === successorId) {
      throw new ContractError('supersession_self_reference', 'A record cannot supersede itself.');
    }
    if (predecessor.tenantId !== successor.tenantId) {
      throw new ContractError('supersession_scope_mismatch', 'Supersession must remain in the same tenant scope.');
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
    for (const envelope of body.records ?? []) {
      if (canonicalDigest(envelope.payload) !== envelope.recordDigest) {
        throw new ContractError('registry_record_hash_mismatch', `Registry record ${envelope.recordId} hash is invalid.`);
      }
      this.#records.set(envelope.recordId, immutable(envelope));
    }
    for (const link of body.supersessions ?? []) this.#supersessions.set(link.predecessorId, immutable(link));
    for (const revocation of body.revocations ?? []) this.#revocations.set(revocation.recordId, immutable(revocation));
    this.#events = (body.events ?? []).map((event) => immutable(event));
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
        detail,
      }),
      sequence,
      kind: this.#kind,
      action,
      recordId,
      tenantId: record?.tenantId ?? detail?.tenantId ?? null,
      actorId: actor.actorId,
      actorRole: actor.role,
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
  constructor(document = null) {
    super({
      kind: RegistryKind.PUBLICATION_ARTIFACT,
      idField: 'artifactId',
      tenantField: 'tenantId',
      document,
    });
  }
}

export async function writeRegistryFile(filePath, registry) {
  if (!(registry instanceof ImmutableRegistry)) {
    throw new ContractError('registry_instance_invalid', 'writeRegistryFile requires an ImmutableRegistry.');
  }
  const document = registry.toDocument();
  const resolved = path.resolve(filePath);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  const temporary = `${resolved}.tmp-${process.pid}`;
  await fs.writeFile(temporary, `${stableStringify(document)}\n`, { encoding: 'utf8', flag: 'w' });
  await fs.rename(temporary, resolved);
  return immutable({
    filePath: resolved,
    documentSha256: document.documentSha256,
    recordCount: document.records.length,
  });
}

export async function readRegistryFile(filePath) {
  const parsed = JSON.parse(await fs.readFile(path.resolve(filePath), 'utf8'));
  return ImmutableRegistry.fromDocument(parsed);
}

export class FileBackedImmutableRegistry {
  #filePath;
  #registry;

  constructor(filePath, registry) {
    if (!(registry instanceof ImmutableRegistry)) {
      throw new ContractError('registry_instance_invalid', 'FileBackedImmutableRegistry requires an ImmutableRegistry.');
    }
    this.#filePath = path.resolve(filePath);
    this.#registry = registry;
  }

  static async open(filePath, factory) {
    try {
      const registry = await readRegistryFile(filePath);
      return new FileBackedImmutableRegistry(filePath, registry);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      return new FileBackedImmutableRegistry(filePath, factory());
    }
  }

  get registry() {
    return this.#registry;
  }

  async accept(record, actor) {
    const result = this.#registry.accept(record, actor);
    await this.persist();
    return result;
  }

  async supersede(predecessorId, successorId, actor) {
    const result = this.#registry.supersede(predecessorId, successorId, actor);
    await this.persist();
    return result;
  }

  async revoke(id, actor, reasonCode) {
    const result = this.#registry.revoke(id, actor, reasonCode);
    await this.persist();
    return result;
  }

  persist() {
    return writeRegistryFile(this.#filePath, this.#registry);
  }
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
