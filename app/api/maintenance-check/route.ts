import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'



export async function GET() {
  try {
    // Check if system_settings table exists, if not create default settings
    let settings
    try {
      settings = await prisma.systemSettings.findFirst()
    } catch (error) {
      // If table doesn't exist, return default values
      console.warn('SystemSettings table not found, using defaults')
      settings = {
        maintenanceMode: false,
        storeName: 'Grace Community Church',
        enableOnlineGiving: true,
        enableEventRegistration: true,
        enablePrayerRequests: true
      }
    }

    // If no settings exist, create default ones
    if (!settings) {
      try {
        settings = await prisma.systemSettings.create({
          data: {
            storeName: 'Grace Community Church',
            maintenanceMode: false
          }
        })
      } catch (error) {
        // If we can't create settings, use defaults
        settings = {
          maintenanceMode: false,
          storeName: 'Grace Community Church',
          enableOnlineGiving: true,
          enableEventRegistration: true,
          enablePrayerRequests: true
        }
      }
    }

    // Check if user is admin
    const session = await auth()
    const isAdmin = session?.user?.role && ['ADMIN', 'STAFF'].includes(session.user.role)

    return NextResponse.json({
      maintenanceMode: settings.maintenanceMode,
      isAdmin: isAdmin || false,
      settings: {
        storeName: settings.storeName,
      }
    })
  } catch (error) {
    console.error('Error checking maintenance mode:', error)
    
    // Return safe defaults if there's any error
    return NextResponse.json({
      maintenanceMode: false,
      isAdmin: false,
      settings: {
        storeName: 'Grace Community Church',
        enableOnlineGiving: true,
        enableEventRegistration: true,
        enablePrayerRequests: true
      }
    })
  }
}
