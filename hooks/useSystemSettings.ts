'use client'

import { useEffect, useState } from 'react'

// Force clear cache for fresh data
let cachedSettings: any = null
let cachedPromise: Promise<any> | null = null

async function fetchSettings() {
  if (cachedSettings) return cachedSettings
  if (cachedPromise) return cachedPromise
  cachedPromise = fetch('/api/settings')
    .then(res => res.json())
    .then(data => {
      cachedSettings = data
      return data
    })
    .catch(() => {
      cachedSettings = { 
        currency: 'INR',
        storeName: 'My Store',
        storeEmail: 'contact@mystore.com',
        storePhone: '+1 (212) 555-7890',
        enablePayment: true,
        maintenanceMode: false,
      }
      return cachedSettings
    })
  return cachedPromise
}

// Utility to get currency symbol from code
function getCurrencySymbol(code: string | undefined) {
  if (!code) return '₹'
  try {
    return (0).toLocaleString(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/\d/g, '').trim() || '₹'
  } catch {
    return '₹'
  }
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<any>(cachedSettings)
  const [currency, setCurrency] = useState<string>(cachedSettings?.currency || 'INR')
  const [currencySymbol, setCurrencySymbol] = useState<string>(getCurrencySymbol(cachedSettings?.currency || 'INR'))

  useEffect(() => {
    let mounted = true
    if (!settings) {
      fetchSettings().then(data => {
        if (mounted) {
          setSettings(data)
          setCurrency(data.currency || 'INR')
          setCurrencySymbol(getCurrencySymbol(data.currency))
        }
      })
    }
    return () => { mounted = false }
  }, [settings])

  return { 
    ...settings, 
    currency, 
    currencySymbol,
    // Provide both new and legacy field names for compatibility
    storeName: settings?.storeName || 'My Store',
    shopName: settings?.storeName || 'My Store', // legacy alias
  }
}
