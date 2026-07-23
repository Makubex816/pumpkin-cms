'use client'

import {
  Archive,
  CheckCircle2,
  ClipboardList,
  Database,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  AIRSTRIP_HARD_GATES,
  AIRSTRIP_OPERATOR_EVIDENCE,
  BACKUP_BUNDLE_CHECKLIST,
  BACKUP_EXPORT_SUMMARY,
  BACKUP_LIMITATIONS,
  OPERATOR_COMMAND_REFERENCES,
  RESTORE_DRY_RUN_SUMMARY,
} from '@/lib/onboarding-workflows'

function RestrictedState() {
  return (
    <div className="card bg-amber-50 border-amber-200">
      <h1 className="text-xl font-semibold text-amber-950">Access Restricted</h1>
      <p className="mt-2 text-sm text-amber-800">Only SuperAdmin users can access Backup Manager.</p>
    </div>
  )
}

function StatusPill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'neutral' }) {
  const styles = tone === 'green'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : tone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-neutral-200 bg-neutral-50 text-neutral-700'

  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${styles}`}>
      {children}
    </span>
  )
}

function MetricTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  )
}

function Checklist({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function PathBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-semibold text-neutral-900">{label}</p>
      <p className="mt-2 break-all font-mono text-xs text-neutral-700">{value}</p>
    </div>
  )
}

export default function BackupManagerPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'SuperAdmin'

  if (!isSuperAdmin) {
    return <RestrictedState />
  }

  const backupCommand = OPERATOR_COMMAND_REFERENCES.find((item) => item.label === 'Backup export tool')
  const restoreCommand = OPERATOR_COMMAND_REFERENCES.find((item) => item.label === 'Restore dry-run tool')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
            <Archive className="h-4 w-4" aria-hidden="true" />
            Backup Manager
          </div>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">Back up this tenant.</h1>
          <p className="mt-1 max-w-3xl text-neutral-600">
            Airstrip backup and restore proof is visible here for SuperAdmin review. Current execution is local/operator-assisted; the browser does not run backup jobs or restore tenants.
          </p>
        </div>
        <StatusPill tone="amber">Operator-assisted only</StatusPill>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Backup files" value={BACKUP_EXPORT_SUMMARY.files} />
        <MetricTile label="Checksum entries" value={BACKUP_EXPORT_SUMMARY.checksumEntries} />
        <MetricTile label="Media blobs" value={BACKUP_EXPORT_SUMMARY.mediaBlobs} />
        <MetricTile label="Restore steps" value={RESTORE_DRY_RUN_SUMMARY.restoreOrderSteps} />
      </div>

      <section className="card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Airstrip Backup Proof</h2>
            <p className="mt-1 text-sm text-neutral-600">V2.8.61A full export and V2.8.61B restore dry-run are complete enough for pre-cutover review.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="green">{BACKUP_EXPORT_SUMMARY.phase}: {BACKUP_EXPORT_SUMMARY.status}</StatusPill>
            <StatusPill tone="green">{RESTORE_DRY_RUN_SUMMARY.phase}: {RESTORE_DRY_RUN_SUMMARY.status}</StatusPill>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center gap-2 font-semibold text-neutral-900">
              <Database className="h-4 w-4 text-neutral-500" aria-hidden="true" />
              Export contents
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">Pages</dt><dd className="font-medium">{BACKUP_EXPORT_SUMMARY.pages}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">MediaAsset records</dt><dd className="font-medium">{BACKUP_EXPORT_SUMMARY.mediaAssets}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">Themes</dt><dd className="font-medium">{BACKUP_EXPORT_SUMMARY.themes}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">FormDefinitions</dt><dd className="font-medium">{BACKUP_EXPORT_SUMMARY.formDefinitions}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">DomainBindings</dt><dd className="font-medium">{BACKUP_EXPORT_SUMMARY.domainBindings}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">Runtime GET proof</dt><dd className="font-medium">{BACKUP_EXPORT_SUMMARY.runtimeGetChecks}</dd></div>
            </dl>
          </div>

          <div className="rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center gap-2 font-semibold text-neutral-900">
              <ClipboardList className="h-4 w-4 text-neutral-500" aria-hidden="true" />
              Restore dry-run
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">Checksums validated</dt><dd className="font-medium">{RESTORE_DRY_RUN_SUMMARY.checksumEntriesValidated}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">Media files validated</dt><dd className="font-medium">{RESTORE_DRY_RUN_SUMMARY.mediaFilesValidated}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">Database pages</dt><dd className="font-medium">{RESTORE_DRY_RUN_SUMMARY.pages}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">Restore order steps</dt><dd className="font-medium">{RESTORE_DRY_RUN_SUMMARY.restoreOrderSteps}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-neutral-500">Runtime GET proof</dt><dd className="font-medium">{RESTORE_DRY_RUN_SUMMARY.runtimeGetChecks}</dd></div>
            </dl>
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Documented gap: {RESTORE_DRY_RUN_SUMMARY.documentedGap}
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold text-neutral-900">Complete Backup Bundle Checklist</h2>
        <div className="mt-4">
          <Checklist items={BACKUP_BUNDLE_CHECKLIST} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <PathBlock label="Outside-repo backup evidence" value={AIRSTRIP_OPERATOR_EVIDENCE.backupBundle} />
        <PathBlock label="Outside-repo restore dry-run evidence" value={AIRSTRIP_OPERATOR_EVIDENCE.restoreDryRun} />
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold text-neutral-900">Current Capability vs Future Automation</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-emerald-950">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Available now
            </div>
            <p className="mt-2 text-sm text-emerald-800">Local operator exporter and restore dry-run tools are implemented and proved for Airstrip.</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-amber-950">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Future scope
            </div>
            <ul className="mt-2 space-y-2 text-sm text-amber-800">
              {BACKUP_LIMITATIONS.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold text-neutral-900">Operator References</h2>
        <div className="mt-4 grid gap-3">
          {[backupCommand, restoreCommand].filter(Boolean).map((item) => (
            <div key={item?.label} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-900">{item?.label}</p>
              <code className="mt-2 block break-all text-xs text-neutral-700">{item?.command}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="card border-amber-200 bg-amber-50">
        <h2 className="text-xl font-semibold text-amber-950">Hard Gates Before Custom-Domain Cutover</h2>
        <ul className="mt-4 grid gap-2">
          {AIRSTRIP_HARD_GATES.map((gate) => (
            <li key={gate} className="flex items-start gap-2 text-sm text-amber-900">
              <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{gate}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
