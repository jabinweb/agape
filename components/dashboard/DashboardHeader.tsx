'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ReactNode } from 'react'

interface DashboardHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  backHref?: string
  actions?: ReactNode
}

export function DashboardHeader({ 
  title, 
  description, 
  icon, 
  backHref = "/dashboard",
  actions 
}: DashboardHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 15, stiffness: 100 }}
      className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-white/20 dark:border-gray-800 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%), radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%)'
      }}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
          <Button 
            variant="ghost" 
            asChild 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100/80 dark:bg-gray-800/80 p-0 hover:bg-blue-100/80 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 transition-all duration-200 hover:scale-105"
          >
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 transition-transform hover:scale-105">
              <motion.div
                initial={{ rotate: -5 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {icon}
              </motion.div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white gradient-text drop-shadow-sm">
                {title}
              </h1>
              {description && (
                <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
        
        {actions && (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0 lg:ml-4">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Export a version with animations already applied as the default
export default function AnimatedDashboardHeader(props: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <DashboardHeader {...props} />
    </motion.div>
  )
}
