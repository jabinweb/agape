'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useSystemSettings } from '@/context/settings-context'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard,
  User,
  Users,
  Heart,
  Calendar,
  ShoppingBag,
  Paintbrush,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  MessageCircle,
  LogOut,
  ExternalLink,
  Palette,
  ImageIcon,
  CreditCard,
  History
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarItem {
  title: string
  href: string
  icon: React.ElementType
  children?: SidebarItem[]
}

interface DashboardSidebarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export function DashboardSidebar({ isMobileOpen, setIsMobileOpen }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { storeName } = useSystemSettings()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Fix hydration by ensuring client-side only rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  const sidebarItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'My Profile',
      href: '/dashboard/profile',
      icon: User,
      children: [
        { title: 'Personal Info', href: '/dashboard/profile', icon: User },
        { title: 'Settings', href: '/dashboard/settings', icon: Settings },
      ]
    },
    {
      title: 'My Art Collection',
      href: '/dashboard/collection',
      icon: Palette,
      children: [
        { title: 'Purchased Art', href: '/dashboard/collection', icon: ImageIcon },
        { title: 'Favorites', href: '/dashboard/favorites', icon: Heart },
      ]
    },
    {
      title: 'Orders',
      href: '/dashboard/orders',
      icon: ShoppingBag,
      children: [
        { title: 'Current Orders', href: '/dashboard/orders', icon: CreditCard },
        { title: 'Order History', href: '/dashboard/order-history', icon: History },
      ]
    },
    {
      title: 'Commission Requests',
      href: '/dashboard/commissions',
      icon: Paintbrush,
    },
  ]

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const hasActiveChild = (children?: SidebarItem[]) => {
    if (!children) return false
    return children.some(child => isActive(child.href))
  }

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    setIsMobileOpen(false)
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="hidden lg:flex bg-white/80 dark:bg-black border-r border-gray-200 dark:border-gray-800 h-full w-64 flex-shrink-0">
        <div className="p-6">
          <div className="mb-8 flex items-center gap-3">
            <Palette className="h-8 w-8 text-primary drop-shadow-lg" />
            <div>
              <h2 className="font-inter text-xl font-extrabold gradient-text drop-shadow-lg">{storeName || 'My Store'}</h2>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Art Collector Portal</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Palette className="h-8 w-8 text-primary drop-shadow-lg" />
            <div>
              <h2 className="font-inter text-xl font-extrabold gradient-text drop-shadow-lg">{storeName || 'My Store'}</h2>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Art Collector Portal</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isItemActive = isActive(item.href)
            const hasActiveChildren = hasActiveChild(item.children)
            const isExpanded = expandedItems.includes(item.title)
            const shouldExpand = isExpanded || hasActiveChildren

            return (
              <div key={item.title} className="relative">
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex-1',
                      isItemActive || hasActiveChildren
                        ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700 shadow-sm'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 hover:shadow-sm'
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isItemActive || hasActiveChildren ? "text-blue-800 dark:text-blue-200" : "text-gray-800 dark:text-gray-300"
                    )} />
                    <span>{item.title}</span>
                    
                    {(isItemActive || hasActiveChildren) && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-10 bg-gradient-to-b from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 rounded-r-full shadow-md" />
                    )}
                  </Link>
                  
                  {item.children && (
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ml-1"
                    >
                      {shouldExpand ? (
                        <ChevronDown className="h-4 w-4 text-blue-800 dark:text-blue-200 transition-transform duration-300" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-800 dark:text-gray-200 transition-transform duration-300" />
                      )}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {item.children && shouldExpand && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="ml-7 mt-2 space-y-1.5 overflow-hidden pl-2 border-l-2 border-blue-100 dark:border-blue-900"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={handleLinkClick}
                          className={cn(
                            'flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300',
                            isActive(child.href)
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-medium shadow-sm'
                              : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-gray-100'
                          )}
                        >
                          <child.icon className={cn(
                            "h-4 w-4",
                            isActive(child.href) ? "text-blue-800 dark:text-blue-200" : "text-gray-800 dark:text-gray-300"
                          )} />
                          <span>{child.title}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>
      </div>

      {/* Bottom Action Buttons */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3 mt-2">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-300 w-full border border-transparent hover:border-blue-200 dark:hover:border-blue-800/50"
        >
          <ExternalLink className="h-5 w-5 text-blue-700 dark:text-blue-300" />
          <span>View Gallery</span>
        </Link>
        
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-800 dark:hover:text-red-300 transition-all duration-300 w-full justify-start border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="text-center">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            {storeName || 'My Store'} © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="hidden lg:flex bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-r border-gray-200 dark:border-gray-800 h-screen flex-shrink-0 w-64 flex-col shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50"
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-white/95 dark:bg-gray-900/95 border-r border-gray-200 dark:border-gray-800 flex flex-col backdrop-blur-md shadow-xl"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Mobile Header Component
export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="lg:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between shadow-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex items-center">
        <Palette className="h-5 w-5 text-primary mr-2 drop-shadow-sm" />
        <h1 className="text-lg font-semibold gradient-text drop-shadow-sm">Collector Dashboard</h1>
      </div>
      <div className="w-8" /> {/* Spacer for centering */}
    </div>
  )
}
