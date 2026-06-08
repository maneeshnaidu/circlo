'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Send,
  BarChart3,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type PlanTier = 'DEMO' | 'STARTER' | 'GROWTH' | 'ENTERPRISE'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Suppliers', href: '/suppliers', icon: Building2 },
  { label: 'Campaigns', href: '/campaigns', icon: Send },
  { label: 'Scores', href: '/scores', icon: BarChart3 },
  { label: 'Reports', href: '/reports', icon: FileText },
]

const PLAN_COLOURS: Record<PlanTier, string> = {
  DEMO: 'bg-gray-100 text-gray-600',
  STARTER: 'bg-blue-100 text-blue-700',
  GROWTH: 'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-emerald-100 text-emerald-700',
}

interface Props {
  user: { firstName: string; lastName: string; email: string; role: string }
  organisation: { name: string; planTier: PlanTier }
}

export function AppSidebar({ user, organisation }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color: '#1D9E75' }}>circlo</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`)
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={href}>
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/settings')}>
                  <Link href="/settings/organisation">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 space-y-3">
        <div className="px-1">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_COLOURS[organisation.planTier]}`}
          >
            {organisation.planTier}
          </span>
        </div>

        <div className="flex items-center gap-3 px-1">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
