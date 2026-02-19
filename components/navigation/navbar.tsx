'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, Search, Settings, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { ROUTES } from '@/lib/constants'

const publicNavItems = [
  { label: 'Discover', href: ROUTES.EVENTS },
]

const organizerNavItems = [
  { label: 'Dashboard', href: ROUTES.ORGANIZER_DASHBOARD },
  { label: 'Events', href: ROUTES.ORGANIZER_EVENTS },
  { label: 'Create Event', href: '/organizer/create-event' },
]

const attendeeNavItems = [
  { label: 'My RSVPs', href: ROUTES.MY_RSVPS },
  { label: 'Tickets', href: '/my-tickets' },
]

const adminNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Events', href: '/admin/events' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push(ROUTES.HOME)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const navItems = isAuthenticated
    ? (user?.role === 'admin'
        ? adminNavItems
        : user?.role === 'organizer'
          ? organizerNavItems
          : attendeeNavItems)
    : publicNavItems

  const unreadCount = notifications.filter((n) => n.status !== 'read').length

  const handleSearchSubmit = () => {
    const q = searchQuery.trim()
    router.push(q ? `${ROUTES.EVENTS}?q=${encodeURIComponent(q)}` : ROUTES.EVENTS)
  }

  const loadNotifications = async () => {
    if (!isAuthenticated) return
    try {
      setIsNotificationsLoading(true)
      const response = await fetch('/api/notifications?limit=8', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load notifications')
      const data = await response.json()
      setNotifications(data?.data?.notifications || [])
    } catch (error) {
      console.error('Failed to load notifications', error)
      setNotifications([])
    } finally {
      setIsNotificationsLoading(false)
    }
  }

  const markNotificationRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: 'PUT' })
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, status: 'read' } : n)),
      )
    } catch (error) {
      console.error('Failed to mark notification as read', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 1L18 5.5V14.5L10 19L2 14.5V5.5L10 1Z" fill="#6d28d9" />
                <path d="M6.5 10L9 12.5L14 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="hidden text-lg font-bold text-foreground sm:inline">
              EventEase
            </span>
          </Link>

          {/* Desktop Navigation — Pill Tabs */}
          <div className="hidden items-center gap-1 rounded-full bg-muted/60 p-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side — Search, Settings, Avatar */}
          <div className="hidden items-center gap-2 md:flex">
            {isLoading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : isAuthenticated && user ? (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                      <Search className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Search events</p>
                      <div className="flex gap-2">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Event name or keyword"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSearchSubmit()
                            }
                          }}
                        />
                        <Button size="sm" onClick={handleSearchSubmit}>Go</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover
                  onOpenChange={(open) => {
                    if (open) void loadNotifications()
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-foreground">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-96 p-2">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">Notifications</p>
                    </div>
                    {isNotificationsLoading ? (
                      <p className="px-2 py-4 text-sm text-muted-foreground">Loading notifications...</p>
                    ) : notifications.length === 0 ? (
                      <p className="px-2 py-4 text-sm text-muted-foreground">No notifications yet.</p>
                    ) : (
                      <div className="max-h-80 space-y-1 overflow-auto">
                        {notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            className={`w-full rounded-md px-2 py-2 text-left hover:bg-muted ${
                              n.status !== 'read' ? 'bg-muted/40' : ''
                            }`}
                            onClick={() => {
                              if (n.status !== 'read') void markNotificationRead(n.id)
                            }}
                          >
                            <p className="text-sm font-medium capitalize">{(n.type || 'notification').replaceAll('_', ' ')}</p>
                            <p className="line-clamp-2 text-xs text-muted-foreground">{n.content || 'You have an update.'}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => router.push(ROUTES.PROFILE)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <div className="mx-1 h-6 w-px bg-border" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 gap-2 rounded-full px-2 hover:bg-muted/60">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                          {getInitials(user.name || user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden text-left lg:block">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.ORGANIZER_DASHBOARD} className="flex items-center gap-2 cursor-pointer">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.MY_RSVPS} className="flex items-center gap-2 cursor-pointer">
                        My RSVPs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.PROFILE} className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {(user.role === 'organizer' || user.role === 'admin') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={ROUTES.ORGANIZER_EVENTS} className="flex items-center gap-2 cursor-pointer">
                            <Settings className="h-4 w-4" />
                            Manage Events
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href={ROUTES.LOGIN}>
                <Button size="sm" className="rounded-full shadow-md shadow-primary/25">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-lg p-2 hover:bg-muted/60 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-border/60 bg-card md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-border/60 pt-3 mt-2">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                        {getInitials(user.name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Link href={ROUTES.PROFILE} className="block" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full gap-2 rounded-xl">
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 rounded-xl text-destructive hover:text-destructive"
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </div>
              ) : (
                <Link href={ROUTES.LOGIN} className="block" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full rounded-xl">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
