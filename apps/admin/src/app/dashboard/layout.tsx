'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Boxes,
  Building2,
  FileSearch,
  FileText,
  Globe2,
  Home,
  Image as ImageIcon,
  Link2,
  Mail,
  Map,
  Palette,
  PenLine,
  Rocket,
  UploadCloud,
  Users,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import TenantSelector from '@/components/TenantSelector'

interface NavItem {
  name: string
  href: string
  icon: ReactNode
  roles?: string[]
  exact?: boolean
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />,
  },
  {
    name: 'Pages',
    href: '/dashboard/pages',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    name: 'Leads/Form Entries',
    href: '/dashboard/forms',
    icon: <Mail className="w-5 h-5" />,
  },
  {
    name: 'Form Builder',
    href: '/dashboard/form-builder',
    icon: <PenLine className="w-5 h-5" />,
  },
  {
    name: 'Media',
    href: '/dashboard/media',
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    name: 'Publishing',
    href: '/dashboard/publishing',
    icon: <UploadCloud className="w-5 h-5" />,
  },
  {
    name: 'Outbound Links',
    href: '/dashboard/outbound-links',
    icon: <Link2 className="w-5 h-5" />,
  },
  {
    name: 'Audit Jobs',
    href: '/dashboard/audit-jobs',
    icon: <FileSearch className="w-5 h-5" />,
  },
  {
    name: 'Page Map',
    href: '/dashboard/page-map',
    icon: <Map className="w-5 h-5" />,
  },
  {
    name: 'Themes',
    href: '/dashboard/themes',
    icon: <Palette className="w-5 h-5" />,
  },
  {
    name: 'Onboarding',
    href: '/dashboard/onboarding',
    icon: <Rocket className="w-5 h-5" />,
    roles: ['SuperAdmin'],
    exact: true,
  },
  {
    name: 'Backups',
    href: '/dashboard/onboarding/backups',
    icon: <FileSearch className="w-5 h-5" />,
    roles: ['SuperAdmin'],
  },
  {
    name: 'Packages',
    href: '/dashboard/onboarding/packages',
    icon: <Boxes className="w-5 h-5" />,
    roles: ['SuperAdmin'],
  },
  {
    name: 'Domains',
    href: '/dashboard/onboarding/domains',
    icon: <Globe2 className="w-5 h-5" />,
    roles: ['SuperAdmin'],
  },
  {
    name: 'Users/Admins',
    href: '/dashboard/users',
    icon: <Users className="w-5 h-5" />,
    roles: ['SuperAdmin'],
  },
  {
    name: 'Tenants',
    href: '/dashboard/tenants',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['SuperAdmin'],
  },
  {
    name: 'Icons',
    href: '/dashboard/icons',
    icon: <Boxes className="w-5 h-5" />,
  },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const visibleNavigation = navigation.filter((item) =>
    !item.roles || (user?.role ? item.roles.includes(user.role) : false)
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  {/* Pumpkin Emoji Icon */}
                  <span className="text-4xl leading-none" role="img" aria-label="pumpkin">🎃</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-neutral-900">Pumpkin CMS</span>
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">v1.0</span>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center space-x-1">
                  {visibleNavigation.map((item) => {
                    const isActive = item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : item.exact
                        ? pathname === item.href
                        : pathname === item.href || pathname?.startsWith(`${item.href}/`)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Tenant Selector + User Menu */}
              <div className="flex items-center space-x-4">
                <TenantSelector />
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-neutral-900">{user?.username || 'User'}</p>
                  <p className="text-xs text-neutral-500">{user?.role || 'Role'}</p>
                </div>
                <button
                  onClick={logout}
                  className="btn btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-neutral-200">
            <nav className="px-4 py-2 flex items-center space-x-1 overflow-x-auto">
              {visibleNavigation.map((item) => {
                const isActive = item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname?.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-6 lg:px-8 py-8 w-full">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
