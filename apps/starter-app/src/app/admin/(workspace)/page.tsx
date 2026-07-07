import Link from 'next/link';
import { AlertTriangle, CheckCircle2, FileText, FormInput, Gauge, Map, Palette } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getStarterAdminContext } from '@/lib/admin-auth';
import {
  STARTER_ADMIN_WORKFLOWS,
  type StarterAdminWorkflowId,
} from '@/lib/starter-admin-boundary';

const workflowIcons: Record<StarterAdminWorkflowId, typeof Gauge> = {
  dashboard: Gauge,
  pages: FileText,
  'page-map': Map,
  forms: FormInput,
  themes: Palette,
};

const workflowCards = STARTER_ADMIN_WORKFLOWS
  .filter((workflow) => workflow.showOnDashboard)
  .map((workflow) => ({
    title: workflow.name,
    href: workflow.href,
    icon: workflowIcons[workflow.id],
    description: workflow.description,
  }));

export default function StarterAdminDashboardPage() {
  const context = getStarterAdminContext();
  const configured = context.missingConfigKeys.length === 0;

  return (
    <section>
      <AdminPageHeader
        eyebrow="Starter Tenant-local Admin"
        title="Tenant workspace"
        description="Single-tenant administration for this deployed starter app. The workflows here are scoped to the configured tenant and do not expose platform control-plane operations."
      />

      <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          {configured ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" aria-hidden="true" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" aria-hidden="true" />
          )}
          <div>
            <h2 className="text-sm font-bold text-neutral-950">
              {configured ? 'Starter admin is configured' : 'Configuration needs attention'}
            </h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-medium text-neutral-500">Tenant</dt>
                <dd className="mt-1 font-semibold text-neutral-900">{context.tenantId}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">API URL</dt>
                <dd className="mt-1 truncate font-semibold text-neutral-900">{context.apiUrl}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Config source</dt>
                <dd className="mt-1 font-semibold text-neutral-900">{context.configSource}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Signed in as</dt>
                <dd className="mt-1 font-semibold text-neutral-900">{context.user?.email || 'Unknown'}</dd>
              </div>
            </dl>
            {!configured && (
              <p className="mt-3 text-sm text-amber-700">
                Missing: {context.missingConfigKeys.join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {workflowCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition-colors hover:border-pumpkin-300 hover:bg-pumpkin-50"
            >
              <Icon className="h-5 w-5 text-pumpkin-600" aria-hidden="true" />
              <h2 className="mt-4 text-base font-bold text-neutral-950">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
