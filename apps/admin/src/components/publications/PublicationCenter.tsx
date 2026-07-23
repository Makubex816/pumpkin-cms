'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PublicationProductClient } from '@/lib/publication-product/client'
import { getPublicationProductFlags } from '@/lib/publication-product/feature-flags'
import type {
  PublicationAction,
  PublicationJobSummary,
  ProductReleaseSummary,
  SuperAdminPublicationCenterSnapshot,
  TenantPublicationArtifactSummary,
  TenantPublicationCenterSnapshot,
  TenantPublicationSummary,
} from '@/lib/publication-product/types'

type LoadState = 'GATED' | 'LOADING' | 'READY' | 'ERROR'

const ACTION_CONFIRMATIONS: Record<PublicationAction, string> = {
  PREVIEW_PLAN: 'PREVIEW PLAN',
  BUILD_CANDIDATE: 'BUILD CANDIDATE',
  PROMOTE: 'PROMOTE PUBLICATION',
  RESUME: 'RESUME JOB',
  ROLLBACK: 'ROLL BACK PUBLICATION',
  REVOKE: 'REVOKE PUBLICATION',
}

export function PublicationCenter() {
  const { token, user, currentTenant, isLoading } = useAuth()
  const flags = useMemo(getPublicationProductFlags, [])
  const [loadState, setLoadState] = useState<LoadState>('GATED')
  const [error, setError] = useState('')
  const [tenantSnapshot, setTenantSnapshot] = useState<TenantPublicationCenterSnapshot | null>(null)
  const [superSnapshot, setSuperSnapshot] = useState<SuperAdminPublicationCenterSnapshot | null>(null)
  const isSuperAdmin = user?.role === 'SuperAdmin'

  useEffect(() => {
    if (!flags.uiEnabled || !token || !currentTenant?.tenantId) {
      setLoadState('GATED')
      setTenantSnapshot(null)
      setSuperSnapshot(null)
      return
    }

    let cancelled = false
    const client = new PublicationProductClient({ apiBaseUrl: flags.apiBaseUrl, token })
    setLoadState('LOADING')
    setError('')

    const request = isSuperAdmin
      ? client.getSuperAdminSnapshot()
      : client.getTenantSnapshot(currentTenant.tenantId)

    request
      .then((snapshot) => {
        if (cancelled) return
        if (isSuperAdmin) {
          setSuperSnapshot(snapshot as SuperAdminPublicationCenterSnapshot)
          setTenantSnapshot(null)
        } else {
          setTenantSnapshot(snapshot as TenantPublicationCenterSnapshot)
          setSuperSnapshot(null)
        }
        setLoadState('READY')
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(reason instanceof Error ? reason.message : 'Publication product data could not be loaded.')
        setLoadState('ERROR')
      })

    return () => {
      cancelled = true
    }
  }, [currentTenant?.tenantId, flags.apiBaseUrl, flags.uiEnabled, isSuperAdmin, token])

  if (isLoading) {
    return <StatusPanel title="Publication Center" detail="Loading the authenticated session…" />
  }

  if (!flags.uiEnabled) {
    return (
      <StatusPanel
        title="Publication Center is feature gated"
        detail="Set the approved publication-product UI flag to expose this fail-closed surface. Customer execution remains separately gated."
      />
    )
  }

  if (!token || !currentTenant) {
    return <StatusPanel title="Publication Center" detail="Log in and select an authorized tenant." />
  }

  if (loadState === 'LOADING') {
    return <StatusPanel title="Publication Center" detail="Loading tenant-scoped publication records…" />
  }

  if (loadState === 'ERROR') {
    return <StatusPanel title="Publication Center unavailable" detail={error} tone="error" />
  }

  const effectiveExecutionEnabled =
    flags.customerExecutionEnabled &&
    (tenantSnapshot?.customerExecutionEnabled === true || superSnapshot?.customerExecutionEnabled === true)

  return (
    <main className="space-y-6" data-publication-product="PUB-30-A01">
      <header className="card">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Product release and tenant publication control
        </p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Publication Center</h1>
        <p className="mt-2 max-w-4xl text-sm text-neutral-600">
          {isSuperAdmin
            ? 'SuperAdmin inventory, release, resumable-job, binding, readiness, and audit visibility.'
            : 'TenantAdmin own-tenant artifact, readiness, history, rollback, and revocation visibility.'}
        </p>
        <div
          className={`mt-4 rounded-lg border p-4 text-sm ${
            effectiveExecutionEnabled
              ? 'border-amber-300 bg-amber-50 text-amber-950'
              : 'border-green-200 bg-green-50 text-green-900'
          }`}
          role="status"
          aria-live="polite"
        >
          {effectiveExecutionEnabled
            ? 'Customer execution is enabled by both server and client gates. Every action still requires typed confirmation and server authorization.'
            : 'Customer execution is disabled. Plans, inventories, compatibility holds, and audit history are read-only.'}
        </div>
      </header>

      {superSnapshot ? (
        <SuperAdminView snapshot={superSnapshot} executionEnabled={effectiveExecutionEnabled} token={token} apiBaseUrl={flags.apiBaseUrl} />
      ) : tenantSnapshot ? (
        <TenantAdminView snapshot={tenantSnapshot} executionEnabled={effectiveExecutionEnabled} token={token} apiBaseUrl={flags.apiBaseUrl} />
      ) : (
        <StatusPanel title="Publication Center" detail="The API returned no authorized publication snapshot." tone="error" />
      )}
    </main>
  )
}

function TenantAdminView({
  snapshot,
  executionEnabled,
  token,
  apiBaseUrl,
}: {
  snapshot: TenantPublicationCenterSnapshot
  executionEnabled: boolean
  token: string
  apiBaseUrl: string
}) {
  return (
    <>
      <TenantCard tenant={snapshot.tenant} />
      <InventoryCard tenant={snapshot.tenant} />
      <ActionCard
        tenant={snapshot.tenant}
        releases={snapshot.releases}
        artifacts={snapshot.artifacts}
        jobs={snapshot.jobs}
        executionEnabled={executionEnabled}
        token={token}
        apiBaseUrl={apiBaseUrl}
      />
      <ReleaseTable releases={snapshot.releases} />
      <JobTable jobs={snapshot.jobs} />
      <AuditTable tenant={snapshot.tenant} />
    </>
  )
}

function SuperAdminView({
  snapshot,
  executionEnabled,
  token,
  apiBaseUrl,
}: {
  snapshot: SuperAdminPublicationCenterSnapshot
  executionEnabled: boolean
  token: string
  apiBaseUrl: string
}) {
  return (
    <>
      <section className="card">
        <h2 className="text-lg font-semibold text-neutral-900">All-tenant publication inventory</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead>
              <tr>
                <Th>Tenant</Th>
                <Th>Hosting class</Th>
                <Th>State</Th>
                <Th>Release</Th>
                <Th>Noindex</Th>
                <Th>Forms</Th>
                <Th>Compatibility</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {snapshot.tenants.map((tenant) => (
                <tr key={`${tenant.tenantUid}:${tenant.publicationId || 'unassigned'}`}>
                  <Td>{tenant.tenantName} ({tenant.tenantUid})</Td>
                  <Td>{humanize(tenant.hostingClass)}</Td>
                  <Td><StateBadge value={tenant.publicationState} /></Td>
                  <Td>{tenant.releaseId || 'Unassigned'}</Td>
                  <Td>{humanize(tenant.indexingMode)}</Td>
                  <Td>{humanize(tenant.formMode)}</Td>
                  <Td>{tenant.compatibilityHolds.length ? tenant.compatibilityHolds.join('; ') : 'Ready'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ReleaseTable releases={snapshot.releases} />
      <JobTable jobs={snapshot.jobs} />

      <section className="card">
        <h2 className="text-lg font-semibold text-neutral-900">Credential-reference metadata</h2>
        <p className="mt-1 text-sm text-neutral-600">References and protection status only; secret values are rejected by the client.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {snapshot.credentialReferences.map((reference) => (
            <dl key={reference.referenceId} className="rounded-lg border border-neutral-200 p-4 text-sm">
              <Detail label="Reference" value={reference.referenceId} />
              <Detail label="Provider" value={humanize(reference.provider)} />
              <Detail label="Status" value={reference.status} />
              <Detail label="ACL" value={reference.aclStatus || 'Not recorded'} />
              <Detail label="Portability" value={reference.portability || 'Not recorded'} />
            </dl>
          ))}
        </div>
      </section>

      {snapshot.tenants.map((tenant) => (
        <ActionCard
          key={`${tenant.tenantUid}:${tenant.publicationId || 'unassigned'}`}
          tenant={tenant}
          releases={snapshot.releases}
          artifacts={snapshot.artifacts}
          jobs={snapshot.jobs}
          executionEnabled={executionEnabled}
          token={token}
          apiBaseUrl={apiBaseUrl}
          superAdmin
        />
      ))}
    </>
  )
}

function TenantCard({ tenant }: { tenant: TenantPublicationSummary }) {
  return (
    <section className="card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">{tenant.tenantName}</h2>
          <p className="mt-1 text-sm text-neutral-500">{tenant.tenantUid}</p>
        </div>
        <StateBadge value={tenant.publicationState} />
      </div>
      <dl className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Detail label="Hosting class" value={humanize(tenant.hostingClass)} />
        <Detail label="Default hostname" value={tenant.defaultHostname || 'Not provisioned'} />
        <Detail label="Domain/DNS/TLS" value={tenant.domainStage} />
        <Detail label="Indexing" value={humanize(tenant.indexingMode)} />
        <Detail label="Form mode" value={humanize(tenant.formMode)} />
        <Detail label="Form readiness" value={tenant.formReadiness} />
        <Detail label="Release" value={tenant.releaseId || 'Unassigned'} />
        <Detail label="Revision" value={String(tenant.publicationRevision ?? 'Not created')} />
      </dl>
      {tenant.compatibilityHolds.length > 0 && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-950">Compatibility holds</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {tenant.compatibilityHolds.map((hold) => <li key={hold}>{hold}</li>)}
          </ul>
        </div>
      )}
    </section>
  )
}

function InventoryCard({ tenant }: { tenant: TenantPublicationSummary }) {
  const items = [
    ['Routes', tenant.inventories.routes],
    ['Redirects', tenant.inventories.redirects],
    ['Media', tenant.inventories.media],
    ['Forms', tenant.inventories.forms],
  ] as const

  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-neutral-900">Candidate artifact inventory</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-neutral-200 p-4">
            <div className="text-2xl font-bold text-neutral-900">{value}</div>
            <div className="mt-1 text-sm text-neutral-600">{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ActionCard({
  tenant,
  releases,
  artifacts,
  jobs,
  executionEnabled,
  token,
  apiBaseUrl,
  superAdmin = false,
}: {
  tenant: TenantPublicationSummary
  releases: ProductReleaseSummary[]
  artifacts: TenantPublicationArtifactSummary[]
  jobs: PublicationJobSummary[]
  executionEnabled: boolean
  token: string
  apiBaseUrl: string
  superAdmin?: boolean
}) {
  const actions: PublicationAction[] = superAdmin
    ? ['PREVIEW_PLAN', 'BUILD_CANDIDATE', 'PROMOTE', 'RESUME', 'ROLLBACK', 'REVOKE']
    : ['PREVIEW_PLAN', 'BUILD_CANDIDATE', 'ROLLBACK', 'REVOKE']
  const [selected, setSelected] = useState<PublicationAction>('PREVIEW_PLAN')
  const [selectedArtifactId, setSelectedArtifactId] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [result, setResult] = useState('')
  const expected = ACTION_CONFIRMATIONS[selected]
  const scopedReleases = releases.filter(
    (release) =>
      release.tenantUid === tenant.tenantUid &&
      release.publicationId === tenant.publicationId &&
      release.status.toLowerCase() === 'accepted',
  )
  const acceptedReleaseIds = new Set(scopedReleases.map((release) => release.releaseId))
  const scopedArtifacts = artifacts.filter(
    (artifact) =>
      artifact.tenantUid === tenant.tenantUid &&
      artifact.publicationId === tenant.publicationId &&
      acceptedReleaseIds.has(artifact.releaseId) &&
      artifact.immutable === true &&
      ['accepted', 'active'].includes(artifact.status.toLowerCase()),
  )
  const targetArtifact = scopedArtifacts.find((artifact) => artifact.artifactId === selectedArtifactId)
  const targetRelease = scopedReleases.find(
    (release) => release.releaseId === targetArtifact?.releaseId,
  )
  const scopedJobs = jobs.filter(
    (item) =>
      item.tenantUid === tenant.tenantUid &&
      item.publicationId === tenant.publicationId,
  )
  const job = scopedJobs.find((item) => item.jobId === selectedJobId) || null
  const needsJob = selected === 'PROMOTE' || selected === 'RESUME' || selected === 'ROLLBACK'
  const hasCompletePredecessor = Boolean(tenant.releaseId) === Boolean(tenant.artifactId)
  const jobSupportsAction =
    !needsJob ||
    (Boolean(job) &&
      (selected !== 'RESUME' || job?.canResume === true) &&
      (selected !== 'ROLLBACK' || job?.canRollback === true))
  const canTargetAction =
    Boolean(tenant.publicationId) &&
    tenant.publicationRevision !== undefined &&
    jobSupportsAction &&
    (selected !== 'BUILD_CANDIDATE' || hasCompletePredecessor) &&
    (selected !== 'BUILD_CANDIDATE' || Boolean(targetRelease && targetArtifact))
  const permitted =
    selected === 'PREVIEW_PLAN'
      ? confirmation === expected
      : executionEnabled && canTargetAction && confirmation === expected

  async function submit() {
    if (!permitted) return
    if (selected === 'PREVIEW_PLAN') {
      setResult(
        `Read-only plan: ${tenant.inventories.routes} routes, ${tenant.inventories.media} media items, ` +
          `${tenant.inventories.forms} forms; hosting ${humanize(tenant.hostingClass)}; ` +
          `${tenant.compatibilityHolds.length} compatibility hold(s).`,
      )
      setConfirmation('')
      return
    }
    if (!tenant.publicationId || tenant.publicationRevision === undefined) return
    setResult('Submitting authorized action…')
    try {
      const client = new PublicationProductClient({ apiBaseUrl, token })
      const response = await client.runAction({
        action: selected,
        tenantUid: tenant.tenantUid,
        publicationId: tenant.publicationId,
        jobId: job?.jobId,
        releaseId: targetRelease?.releaseId,
        artifactId: targetArtifact?.artifactId,
        rollbackReleaseId:
          selected === 'BUILD_CANDIDATE' && tenant.releaseId && tenant.artifactId
            ? tenant.releaseId
            : undefined,
        rollbackArtifactId:
          selected === 'BUILD_CANDIDATE' && tenant.releaseId && tenant.artifactId
            ? tenant.artifactId
            : undefined,
        expectedRevision: tenant.publicationRevision,
        reason: `typed-confirmation:${expected.toLowerCase().replaceAll(' ', '-')}`,
        idempotencyKey:
          `${tenant.tenantUid}:${tenant.publicationId}:${tenant.publicationRevision}:` +
          `${selected}:${job?.jobId || targetArtifact?.artifactId || 'publication'}`,
      })
      setResult(
        `${response.action} accepted as ${response.state}` +
          `${response.idempotentReplay ? ' (idempotent replay).' : '.'}`,
      )
      setConfirmation('')
    } catch (reason) {
      setResult(reason instanceof Error ? reason.message : 'The action failed closed.')
    }
  }

  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-neutral-900">Authorized lifecycle actions — {tenant.tenantName}</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Execution requires both feature gates, current tenant authorization, a typed confirmation, and server-side idempotency.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(200px,0.5fr)_minmax(220px,0.6fr)_minmax(280px,1fr)_auto] lg:items-end">
        <label className="text-sm font-medium text-neutral-800">
          Action
          <select
            value={selected}
            onChange={(event) => {
              setSelected(event.target.value as PublicationAction)
              setSelectedArtifactId('')
              setSelectedJobId('')
              setConfirmation('')
              setResult('')
            }}
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2"
          >
            {actions.map((action) => <option key={action} value={action}>{humanize(action)}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-neutral-800">
          Scoped target
          <select
            value={
              selected === 'BUILD_CANDIDATE'
                ? selectedArtifactId
                : needsJob
                  ? selectedJobId
                  : ''
            }
            onChange={(event) => {
              if (selected === 'BUILD_CANDIDATE') setSelectedArtifactId(event.target.value)
              if (needsJob) setSelectedJobId(event.target.value)
              setConfirmation('')
              setResult('')
            }}
            disabled={(!needsJob && selected !== 'BUILD_CANDIDATE') || !executionEnabled}
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 disabled:bg-neutral-100"
          >
            <option value="">
              {selected === 'BUILD_CANDIDATE'
                ? 'Select an accepted artifact and release'
                : needsJob
                  ? 'Select a publication job'
                  : 'No target required'}
            </option>
            {selected === 'BUILD_CANDIDATE' &&
              scopedArtifacts.map((artifact) => (
                <option key={artifact.artifactId} value={artifact.artifactId}>
                  {artifact.artifactId} - {artifact.releaseId}
                </option>
              ))}
            {needsJob &&
              scopedJobs.map((item) => (
                <option key={item.jobId} value={item.jobId}>
                  {item.jobId} - {humanize(item.state)}
                </option>
              ))}
          </select>
        </label>
        <label className="text-sm font-medium text-neutral-800">
          Type “{expected}”
          <input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={!executionEnabled && selected !== 'PREVIEW_PLAN'}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 disabled:bg-neutral-100"
          />
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={!permitted}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
      {!executionEnabled && (
        <p className="mt-3 text-sm text-neutral-600">
          Customer execution is disabled for PUB-30. Read-only plan preview remains available.
        </p>
      )}
      {needsJob && !job && (
        <p className="mt-3 text-sm text-amber-800">No resumable job is available for this tenant.</p>
      )}
      {result && <p className="mt-3 text-sm text-neutral-700" role="status" aria-live="polite">{result}</p>}
    </section>
  )
}

function ReleaseTable({ releases }: { releases: ProductReleaseSummary[] }) {
  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-neutral-900">Immutable product releases</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead><tr><Th>Scope</Th><Th>Release</Th><Th>Status</Th><Th>Source commit</Th><Th>Lock hash</Th><Th>Licensing</Th><Th>Supersession</Th></tr></thead>
          <tbody className="divide-y divide-neutral-100">
            {releases.map((release) => (
              <tr key={`${release.tenantUid}:${release.publicationId}:${release.releaseId}`}>
                <Td>{release.tenantUid} / {release.publicationId}</Td>
                <Td>{release.releaseId}</Td>
                <Td><StateBadge value={release.status} /></Td>
                <Td><CodeValue value={release.sourceCommit} /></Td>
                <Td><CodeValue value={release.packageLockSha256} /></Td>
                <Td>{release.licensingStatus}</Td>
                <Td>{release.supersededByReleaseId || 'Current'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function JobTable({ jobs }: { jobs: PublicationJobSummary[] }) {
  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-neutral-900">Resumable publication/onboarding jobs</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead><tr><Th>Job</Th><Th>Tenant / publication</Th><Th>State</Th><Th>Progress</Th><Th>Next step</Th><Th>Resume / rollback</Th></tr></thead>
          <tbody className="divide-y divide-neutral-100">
            {jobs.map((job) => (
              <tr key={`${job.tenantUid}:${job.publicationId}:${job.jobId}`}>
                <Td><CodeValue value={job.jobId} /></Td>
                <Td>{job.tenantUid} / {job.publicationId}</Td>
                <Td><StateBadge value={job.state} /></Td>
                <Td>{job.completedSteps}/{job.totalSteps}</Td>
                <Td>{job.nextStep || 'Complete'}</Td>
                <Td>{job.canResume ? 'Resume' : '—'} / {job.canRollback ? 'Rollback' : '—'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function AuditTable({ tenant }: { tenant: TenantPublicationSummary }) {
  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-neutral-900">Publication audit history</h2>
      <div className="mt-4 space-y-3">
        {tenant.auditEvents.map((event) => (
          <article key={event.eventId} className="rounded-lg border border-neutral-200 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{event.eventType}</strong>
              <time dateTime={event.occurredAt}>{event.occurredAt}</time>
            </div>
            <p className="mt-2 text-neutral-700">{event.detail}</p>
            <p className="mt-1 text-xs text-neutral-500">{event.actorType} · {event.outcome}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function StatusPanel({ title, detail, tone = 'neutral' }: { title: string; detail: string; tone?: 'neutral' | 'error' }) {
  return (
    <div className={`card ${tone === 'error' ? 'border-red-200 bg-red-50 text-red-900' : ''}`} role="status">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm">{detail}</p>
    </div>
  )
}

function StateBadge({ value }: { value: string }) {
  return <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-semibold">{humanize(value)}</span>
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-neutral-900">{value}</dd>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">{children}</th>
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-3 align-top text-neutral-800">{children}</td>
}

function CodeValue({ value }: { value: string }) {
  return <code className="break-all text-xs">{value}</code>
}

function humanize(value: string) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase())
}
