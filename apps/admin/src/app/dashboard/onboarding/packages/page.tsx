'use client'

import {
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Lock,
  MonitorCheck,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  AIRSTRIP_HARD_GATES,
  AIRSTRIP_OPERATOR_EVIDENCE,
  OPERATOR_COMMAND_REFERENCES,
  PACKAGE_ANALYZER_SUMMARY,
  PACKAGE_COMPILER_SUMMARY,
  PACKAGE_OUTPUT_CHECKLIST,
  PACKAGE_WORKFLOW_STEPS,
} from '@/lib/onboarding-workflows'

function RestrictedState() {
  return (
    <div className="card bg-amber-50 border-amber-200">
      <h1 className="text-xl font-semibold text-amber-950">Access Restricted</h1>
      <p className="mt-2 text-sm text-amber-800">Only SuperAdmin users can access Package Intake.</p>
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

function PathBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-semibold text-neutral-900">{label}</p>
      <p className="mt-2 break-all font-mono text-xs text-neutral-700">{value}</p>
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

export default function PackageIntakePage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'SuperAdmin'

  if (!isSuperAdmin) {
    return <RestrictedState />
  }

  const analyzerCommand = OPERATOR_COMMAND_REFERENCES.find((item) => item.label === 'Package analyzer')
  const compilerCommand = OPERATOR_COMMAND_REFERENCES.find((item) => item.label === 'Package compiler')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
            <PackageCheck className="h-4 w-4" aria-hidden="true" />
            Tenant Onboarding Wizard / Package Intake
          </div>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">Package Intake</h1>
          <p className="mt-1 max-w-3xl text-neutral-600">
            This page shows the operator-assisted path from uploaded frontend ZIP to validated Pumpkin package candidate. Browser upload and package execution are future backend automation, not active controls.
          </p>
        </div>
        <StatusPill tone="amber">No browser package execution</StatusPill>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Routes detected" value={PACKAGE_ANALYZER_SUMMARY.routes} />
        <MetricTile label="Media candidates" value={PACKAGE_ANALYZER_SUMMARY.mediaCandidates} />
        <MetricTile label="Route classes" value={PACKAGE_COMPILER_SUMMARY.routeClassifications} />
        <MetricTile label="Responsive routes" value={PACKAGE_COMPILER_SUMMARY.responsiveRoutes} />
      </div>

      <section className="card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Workflow State</h2>
            <p className="mt-1 text-sm text-neutral-600">Upload to readiness is represented as a guided checklist. This UI does not upload, run, or mutate packages.</p>
          </div>
          <StatusPill tone="green">Analyzer and compiler proof complete</StatusPill>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-7">
          {PACKAGE_WORKFLOW_STEPS.map((step) => (
            <div key={step.label} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-neutral-900">{step.label}</p>
                {step.automatedNow ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-600" aria-label="operator tool available" />
                ) : (
                  <Lock className="h-4 w-4 text-amber-600" aria-label="future or gated step" />
                )}
              </div>
              <p className="mt-2 text-xs text-neutral-600">{step.state}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
            <FileSearch className="h-4 w-4" aria-hidden="true" />
            Analyzer Proof
          </div>
          <h2 className="mt-2 text-xl font-semibold text-neutral-900">{PACKAGE_ANALYZER_SUMMARY.phase}</h2>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">Status</dt><dd className="font-medium">{PACKAGE_ANALYZER_SUMMARY.status}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">Framework</dt><dd className="font-medium">{PACKAGE_ANALYZER_SUMMARY.framework}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">Rendering</dt><dd className="font-medium">{PACKAGE_ANALYZER_SUMMARY.renderingMode}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">Dynamic routes</dt><dd className="font-medium">{PACKAGE_ANALYZER_SUMMARY.dynamicRoutes}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">Form candidates</dt><dd className="font-medium">{PACKAGE_ANALYZER_SUMMARY.formCandidates}</dd></div>
          </dl>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Compiler Proof
          </div>
          <h2 className="mt-2 text-xl font-semibold text-neutral-900">{PACKAGE_COMPILER_SUMMARY.phase}</h2>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">Status</dt><dd className="font-medium">{PACKAGE_COMPILER_SUMMARY.status}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">Package mode</dt><dd className="font-medium">{PACKAGE_COMPILER_SUMMARY.packageMode}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">Validator</dt><dd className="font-medium">{PACKAGE_COMPILER_SUMMARY.validator}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">FormDefinition</dt><dd className="font-medium">{PACKAGE_COMPILER_SUMMARY.formDefinition}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">Page candidates</dt><dd className="font-medium">{PACKAGE_COMPILER_SUMMARY.pageCandidates}</dd></div>
          </dl>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold text-neutral-900">Package Output Checklist</h2>
        <div className="mt-4">
          <Checklist items={PACKAGE_OUTPUT_CHECKLIST} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <PathBlock label="Raw Airstrip ZIP fixture" value={AIRSTRIP_OPERATOR_EVIDENCE.rawAirstripZip} />
        <PathBlock label="Analyzer proof evidence" value={AIRSTRIP_OPERATOR_EVIDENCE.intakeProof} />
        <PathBlock label="Compiled package evidence" value={AIRSTRIP_OPERATOR_EVIDENCE.compiledPackageProof} />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 font-semibold text-amber-950">
            <MonitorCheck className="h-4 w-4" aria-hidden="true" />
            Airstrip benchmark state
          </div>
          <p className="mt-2 text-sm text-amber-800">
            Raw ZIP is the real-world negative fixture. Overlay-passing output is the passing fixture. V2.8.60R and V2.8.60X remain required assets before responsive proof.
          </p>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold text-neutral-900">Operator References</h2>
        <div className="mt-4 grid gap-3">
          {[analyzerCommand, compilerCommand].filter(Boolean).map((item) => (
            <div key={item?.label} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-900">{item?.label}</p>
              <code className="mt-2 block break-all text-xs text-neutral-700">{item?.command}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="card border-emerald-200 bg-emerald-50">
        <h2 className="text-xl font-semibold text-emerald-950">Owner Action Packet Summary</h2>
        <ul className="mt-4 grid gap-2 text-sm text-emerald-900">
          <li>Package can be analyzed and compiled into a validator-clean candidate.</li>
          <li>Owner review remains required for final page copy, legal routes, and reservation form mapping.</li>
          <li>Tenant admin credential handoff is required separately and is not included here.</li>
          <li>Hybrid runtime and responsive proof must pass before any launch path.</li>
        </ul>
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
