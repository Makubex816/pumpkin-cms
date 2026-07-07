'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, FormInput, Gauge, LogOut, Map, Palette, type LucideIcon } from 'lucide-react';
import type { StarterAdminContext } from '@/lib/admin-auth';
import {
  STARTER_ADMIN_WORKFLOWS,
  type StarterAdminWorkflowId,
} from '@/lib/starter-admin-boundary';

interface AdminShellProps {
  context: StarterAdminContext;
  children: ReactNode;
}

const workflowIcons: Record<StarterAdminWorkflowId, LucideIcon> = {
  dashboard: Gauge,
  pages: FileText,
  'page-map': Map,
  forms: FormInput,
  themes: Palette,
};

const navigation = STARTER_ADMIN_WORKFLOWS.map((workflow) => ({
  ...workflow,
  icon: workflowIcons[workflow.id],
}));

export function AdminShell({ context, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-pumpkin-600 text-sm font-black text-white">
                P
              </span>
              <span>
                <span className="block text-sm font-bold leading-4">{context.siteName}</span>
                <span className="block text-xs text-neutral-500">Tenant-local Admin</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-pumpkin-50 text-pumpkin-700'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{context.user?.role || 'Tenant'}</p>
              <p className="max-w-44 truncate text-sm font-semibold text-neutral-900">
                {context.user?.username || context.tenantId}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-neutral-200 px-3 py-2 md:hidden">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin'
              ? pathname === '/admin'
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                  active ? 'bg-pumpkin-50 text-pumpkin-700' : 'text-neutral-700',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
