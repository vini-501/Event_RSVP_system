'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'

const navItems = [
  {
    label: 'Dashboard',
    href: ROUTES.ORGANIZER_DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: 'Events',
    href: ROUTES.ORGANIZER_EVENTS,
    icon: Calendar,
  },
  {
    label: 'Settings',
    href: '/organizer/settings',
    icon: Settings,
  },
]

export function OrganizerSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:sticky md:top-0 md:flex md:h-screen md:flex-col md:overflow-y-auto">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-sidebar-foreground">
          Organizer Tools
        </h2>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent/20 p-3">
          <p className="text-xs font-medium text-sidebar-foreground">
            Need help?
          </p>
          <p className="mt-1 text-xs text-sidebar-foreground/60">
            Check our documentation for organizer resources.
          </p>
        </div>
      </div>
    </aside>
  )
}
