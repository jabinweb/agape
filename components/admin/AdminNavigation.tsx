'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSystemSettings } from '@/context/settings-context'
import { 
  Users, 
  Mic, 
  Calendar, 
  MessageSquare, 
  ShoppingBag, 
  DollarSign,
  Settings,
  Home,
  Newspaper,
  BookOpen,
  Heart,
  BarChart3,
  Mail, 
  Files, 
  ChevronLeft, 
  ChevronRight, 
  Package,
  ChevronDown,
  ChevronUp,
  Store,
  CreditCard,
  X,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface MenuItem {
  href: string
  label: string
  icon: any
  badge?: number
}

interface MenuGroup {
  label: string
  icon: any
  items: MenuItem[]
  defaultExpanded?: boolean
}

const adminMenuGroups: MenuGroup[] = [
  {
    label: 'Dashboard',
    icon: Home,
    items: [
      { href: '/admin', label: 'Overview', icon: Home }
    ],
    defaultExpanded: true
  },
  {
    label: 'Content',
    icon: MessageSquare,
    items: [
      { href: '/admin/blog', label: 'Blog', icon: MessageSquare },
      { href: '/admin/files', label: 'Files', icon: Files }
    ],
    defaultExpanded: true
  },
  {
    label: 'Shop',
    icon: Store,
    items: [
      { href: '/admin/shop/products', label: 'Products', icon: Package },
      { href: '/admin/shop/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/admin/shop/categories', label: 'Categories', icon: Package },
      { href: '/admin/shop/inventory', label: 'Inventory', icon: Package },
    ],
    defaultExpanded: false
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    items: [
      { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
      { href: '/admin/analytics/engagement', label: 'Engagement', icon: BarChart3 }
    ],
    defaultExpanded: false
  },
  {
    label: 'Settings',
    icon: Settings,
    items: [
      { href: '/admin/settings', label: 'General', icon: Settings },
      { href: '/admin/settings/permissions', label: 'Permissions', icon: Users },
      { href: '/admin/settings/system', label: 'System', icon: Settings }
    ],
    defaultExpanded: false
  }
]

interface AdminNavigationProps {
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
}

export function AdminNavigation({ isMobileMenuOpen, setIsMobileMenuOpen }: AdminNavigationProps) {
  const pathname = usePathname()
  const { storeName } = useSystemSettings()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Initialize expanded groups after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    setExpandedGroups(
      new Set(adminMenuGroups.filter(group => group.defaultExpanded).map(group => group.label))
    )
  }, [])

  const toggleGroup = (groupLabel: string) => {
    if (collapsed) return
    
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupLabel)) {
      newExpanded.delete(groupLabel)
    } else {
      newExpanded.add(groupLabel)
    }
    setExpandedGroups(newExpanded)
  }

  const isGroupActive = (group: MenuGroup) => {
    return group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  }

  const isItemActive = (item: MenuItem) => {
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const handleMobileMenuClose = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }

  // Mobile overlay
  if (isMobileMenuOpen !== undefined) {
    return (
      <>
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={handleMobileMenuClose}
          />
        )}

        {/* Mobile Navigation */}
        <nav className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden w-80 border-r border-gray-200 dark:border-gray-800",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{storeName || 'My Store'} Admin</h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Art Gallery Management</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMobileMenuClose}
                  className="h-8 w-8 p-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {adminMenuGroups.map((group) => {
                  const isActive = isGroupActive(group)
                  const isExpanded = expandedGroups.has(group.label)
                  
                  return (
                    <div key={group.label} className="space-y-1">
                      {/* Group Header */}
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className={cn(
                          'flex items-center justify-between w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                          isActive 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800' 
                            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <group.icon className={cn(
                            "h-5 w-5 flex-shrink-0",
                            isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-400"
                          )} />
                          <span className="truncate">{group.label}</span>
                        </div>
                        {group.items.length > 1 && (
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className={cn(
                                "h-4 w-4",
                                isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                              )} />
                            ) : (
                              <ChevronDown className={cn(
                                "h-4 w-4",
                                isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                              )} />
                            )}
                          </div>
                        )}
                      </button>

                      {/* Group Items */}
                      {isExpanded && (
                        <div className="ml-4 space-y-1">
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={handleMobileMenuClose}
                              className={cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors w-full',
                                isItemActive(item)
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-l-2 border-blue-500 dark:border-blue-400' 
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                              )}
                            >
                              <item.icon className={cn(
                                "h-4 w-4 flex-shrink-0",
                                isItemActive(item) ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                              )} />
                              <span className="truncate">{item.label}</span>
                              {item.badge && (
                                <span className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs px-2 py-0.5 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </nav>
      </>
    )
  }

  // Desktop Navigation (existing code with lg:flex added)
  return (
    <TooltipProvider>
      <nav className={cn(
        "shadow-sm border-r h-screen max-h-screen transition-all duration-300 ease-in-out flex-col hidden lg:flex bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className={cn(
            "flex items-center transition-all duration-300",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{storeName || 'My Store'} Admin</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">Art Gallery Management</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 p-0 flex-shrink-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          <div className="space-y-1">
            {adminMenuGroups.map((group) => {
              const isActive = isGroupActive(group)
              const isExpanded = expandedGroups.has(group.label)
              
              if (collapsed) {
                return (
                  <div key={group.label} className="space-y-1">
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'flex items-center justify-center w-full h-10 rounded-lg transition-colors cursor-pointer',
                            isActive 
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800' 
                              : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                          )}
                        >
                          <group.icon className="h-5 w-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{group.label}</div>
                          {group.items.map(item => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "block px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-300",
                                isItemActive(item) ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" : ""
                              )}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )
              }

              return (
                <div key={group.label} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800' 
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <group.icon className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-400"
                      )} />
                      <span className="truncate">{group.label}</span>
                    </div>
                    {group.items.length > 1 && (
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className={cn(
                            "h-3 w-3",
                            isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                          )} />
                        ) : (
                          <ChevronDown className={cn(
                            "h-3 w-3",
                            isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                          )} />
                        )}
                      </div>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-4 space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors w-full',
                            isItemActive(item)
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-l-2 border-blue-500 dark:border-blue-400' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                          )}
                        >
                          <item.icon className={cn(
                            "h-3 w-3 flex-shrink-0",
                            isItemActive(item) ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                          )} />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </nav>
    </TooltipProvider>
  )
}

export function MobileAdminHeader({ onMenuClick, storeName }: { onMenuClick: () => void; storeName?: string }) {
  return (
    <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-gray-900/90">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="h-10 w-10 p-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{storeName || 'My Store'} Admin</h1>
        </div>
      </div>
      
      {/* Optional: Add user menu or other header actions */}
      <div className="flex items-center space-x-2">
        {/* You can add user avatar, notifications, etc. here */}
      </div>
    </header>
  )
}
