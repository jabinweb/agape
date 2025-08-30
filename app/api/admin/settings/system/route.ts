import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { clearSettingsCache } from '@/lib/settings'

export async function GET() {
  try {
    let settings = await prisma.systemSettings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.systemSettings.create({
        data: {
          storeName: 'ATELIER 7X',
          storeAddress: '123 Art Gallery Street, New York, NY 10001',
          storePhone: '+1 (212) 555-7890',
          storeEmail: 'contact@atelier7x.com',
          storeWebsite: 'https://atelier7x.com',
          enablePayment: true,
          maintenanceMode: false,
          currency: 'INR'
        }
      })
    }

    return NextResponse.json({
      storeName: settings.storeName,
      storeAddress: settings.storeAddress || '',
      storePhone: settings.storePhone || '',
      storeEmail: settings.storeEmail || '',
      storeWebsite: settings.storeWebsite || '',
      enablePayment: settings.enablePayment,
      maintenanceMode: settings.maintenanceMode,
      currency: settings.currency,
      logoUrl: settings.logoUrl,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      facebookUrl: settings.facebookUrl,
      twitterUrl: settings.twitterUrl,
      instagramUrl: settings.instagramUrl,
      supportPhone: settings.supportPhone,
      privacyPolicyUrl: settings.privacyPolicyUrl,
      termsUrl: settings.termsUrl
    })
  } catch (error) {
    console.error('Error fetching system settings:', error)
    
    // Return default settings if database fails
    return NextResponse.json({
      storeName: 'ATELIER 7X',
      storeAddress: '123 Art Street, Creative District, NY 10001',
      storePhone: '(555) 123-4567',
      storeEmail: 'info@atelier7x.com',
      storeWebsite: 'https://atelier7x.com',
      enablePayment: true,
      maintenanceMode: false,
      currency: 'INR',
      logoUrl: null
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get or create system settings
    let settings = await prisma.systemSettings.findFirst()
    
    if (!settings) {
      // Create new settings
      settings = await prisma.systemSettings.create({
        data: body
      })
    } else {
      // Update existing settings
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: body
      })
    }

    // Clear the settings cache so new values are fetched
    clearSettingsCache()

    return NextResponse.json({ 
      success: true,
      settings: {
        storeName: settings.storeName,
        storeAddress: settings.storeAddress,
        storePhone: settings.storePhone,
        storeEmail: settings.storeEmail,
        storeWebsite: settings.storeWebsite,
        maintenanceMode: settings.maintenanceMode,
        currency: settings.currency,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        backgroundColor: settings.backgroundColor,
        textColor: settings.textColor,
        timezone: settings.timezone,
        defaultLanguage: settings.defaultLanguage,
        facebookUrl: settings.facebookUrl,
        twitterUrl: settings.twitterUrl,
        instagramUrl: settings.instagramUrl,
        supportPhone: settings.supportPhone,
        privacyPolicyUrl: settings.privacyPolicyUrl,
        termsUrl: settings.termsUrl
      }
    })
  } catch (error) {
    console.error('Error updating system settings:', error)
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    )
  }
}
      