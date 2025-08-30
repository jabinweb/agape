import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Return only public settings
    return NextResponse.json({
      storeName: settings.storeName,
      storeEmail: settings.storeEmail || '',
      storePhone: settings.storePhone || '',
      currency: settings.currency || 'INR',
      enablePayment: settings.enablePayment,
      maintenanceMode: settings.maintenanceMode,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      logoUrl: settings.logoUrl,
      facebookUrl: settings.facebookUrl,
      twitterUrl: settings.twitterUrl,
      instagramUrl: settings.instagramUrl,
    })
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return NextResponse.json({
      storeName: 'ATELIER 7X',
      storeEmail: 'contact@atelier7x.com',
      storePhone: '+1 (212) 555-7890',
      currency: 'INR',
      enablePayment: true,
      maintenanceMode: false,
    })
  }
}
