'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '@/lib/settings';

interface SettingsContextType {
  settings: StoreSettings | null;
  currency: string;
  currencySymbol: string;
  storeName: string;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Utility to get currency symbol from code
function getCurrencySymbol(code: string | undefined) {
  if (!code) return '₹';
  try {
    return (0).toLocaleString(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/\d/g, '').trim() || '₹';
  } catch {
    return '₹';
  }
}

interface SettingsProviderProps {
  children: React.ReactNode;
  initialSettings?: StoreSettings;
}

export function SettingsProvider({ children, initialSettings }: SettingsProviderProps) {
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings || null);
  const [isLoading, setIsLoading] = useState(!initialSettings);

  const refreshSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Keep current settings or use fallback
      if (!settings) {
        setSettings({
          storeName: 'My Store',
          storeAddress: '',
          storePhone: '',
          storeEmail: '',
          storeWebsite: '',
          enablePayment: true,
          maintenanceMode: false,
          currency: 'INR',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have initial settings
    if (!initialSettings) {
      refreshSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSettings]);

  const currency = settings?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currency);
  const storeName = settings?.storeName || 'My Store';

  return (
    <SettingsContext.Provider
      value={{
        settings,
        currency,
        currencySymbol,
        storeName,
        isLoading,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error('useSystemSettings must be used within a SettingsProvider');
  }

  return {
    ...context.settings,
    currency: context.currency,
    currencySymbol: context.currencySymbol,
    storeName: context.storeName,
    shopName: context.storeName, // legacy alias
    isLoading: context.isLoading,
    refreshSettings: context.refreshSettings,
  };
}
