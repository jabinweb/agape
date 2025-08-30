import { prisma } from '@/lib/prisma'

export interface StoreSettings {
  storeName: string
  storeAddress: string
  storePhone: string
  storeEmail: string
  storeWebsite: string
  enablePayment: boolean
  maintenanceMode: boolean
  currency: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  facebookUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  supportPhone?: string
  privacyPolicyUrl?: string
  termsUrl?: string
}

let cachedSettings: StoreSettings | null = null
let cacheExpiry: number = 0

export async function getStoreSettings(): Promise<StoreSettings> {
  // Return cached settings if still valid (cache for 5 minutes)
  if (cachedSettings && Date.now() < cacheExpiry) {
    return cachedSettings
  }

  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      throw new Error('Cannot use Prisma in browser environment')
    }

    // Check if we're in Edge Runtime (middleware environment)
    if (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis) {
      throw new Error('Cannot use Prisma in Edge Runtime')
    }

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

    cachedSettings = {
      storeName: settings.storeName,
      storeAddress: settings.storeAddress || '',
      storePhone: settings.storePhone || '',
      storeEmail: settings.storeEmail || '',
      storeWebsite: settings.storeWebsite || '',
      enablePayment: settings.enablePayment,
      maintenanceMode: settings.maintenanceMode,
      currency: settings.currency,
      logoUrl: settings.logoUrl || undefined,
      primaryColor: settings.primaryColor || undefined,
      secondaryColor: settings.secondaryColor || undefined,
      accentColor: settings.accentColor || undefined,
      facebookUrl: settings.facebookUrl || undefined,
      twitterUrl: settings.twitterUrl || undefined,
      instagramUrl: settings.instagramUrl || undefined,
      supportPhone: settings.supportPhone || undefined,
      privacyPolicyUrl: settings.privacyPolicyUrl || undefined,
      termsUrl: settings.termsUrl || undefined
    }

    // Cache for 5 minutes
    cacheExpiry = Date.now() + 5 * 60 * 1000

    return cachedSettings
  } catch (error) {
    console.error('Error getting store settings:', error)
    
    // Return default settings if database fails
    return {
      storeName: 'ATELIER 7X',
      storeAddress: '123 Art Gallery Street, New York, NY 10001',
      storePhone: '+1 (212) 555-7890',
      storeEmail: 'contact@atelier7x.com',
      storeWebsite: 'https://atelier7x.com',
      enablePayment: true,
      maintenanceMode: false,
      currency: 'INR'
    }
  }
}

export function clearSettingsCache() {
  cachedSettings = null
  cacheExpiry = 0
}

// Legacy export for backward compatibility
export const getChurchSettings = getStoreSettings
export type ChurchSettings = StoreSettings
