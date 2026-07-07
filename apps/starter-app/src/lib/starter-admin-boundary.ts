export const STARTER_ADMIN_CLASSIFICATION = 'tenant_site_local_admin_surface';

export const STARTER_PLATFORM_ADMIN_SOURCE_OF_TRUTH = 'standalone_pumpkin_admin_ui';

export const STARTER_ADMIN_WORKFLOWS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/admin',
    showOnDashboard: false,
    description: 'Review this starter deployment and its configured tenant binding.',
  },
  {
    id: 'pages',
    name: 'Pages',
    href: '/admin/pages',
    showOnDashboard: true,
    description: 'Edit pages and blocks for the configured tenant site.',
  },
  {
    id: 'page-map',
    name: 'Page Map',
    href: '/admin/page-map',
    showOnDashboard: true,
    description: 'Review the configured tenant site page map.',
  },
  {
    id: 'forms',
    name: 'Forms',
    href: '/admin/forms',
    showOnDashboard: true,
    description: 'Build tenant form schemas, field layout, submit behavior, and validation.',
  },
  {
    id: 'themes',
    name: 'Themes',
    href: '/admin/themes',
    showOnDashboard: true,
    description: 'Manage runtime themes and tokens for this tenant site.',
  },
] as const;

export type StarterAdminWorkflowId = typeof STARTER_ADMIN_WORKFLOWS[number]['id'];

export const STARTER_ADMIN_DENIED_PLATFORM_CONTROLS = [
  'backup-manager',
  'package-intake',
  'domain-manager',
  'users-admins-platform-management',
  'hardcopy-recovery',
  'resource-management',
  'cross-tenant-controls',
] as const;

export function isStarterAdminWorkflowHref(href: string) {
  return STARTER_ADMIN_WORKFLOWS.some((workflow) => workflow.href === href);
}
