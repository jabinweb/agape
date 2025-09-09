import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price value with the given currency
 * @param price - The price to format
 * @param currency - The currency code (e.g., 'USD', 'INR', 'EUR')
 * @param options - Additional formatting options
 */
export function formatCurrency(
  price: number,
  currency: string = 'INR',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  }
) {
  const { minimumFractionDigits = 0, maximumFractionDigits = 2, locale } = options || {};
  
  return price.toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

/**
 * Get currency symbol from currency code
 * @param currency - The currency code (e.g., 'USD', 'INR', 'EUR')
 */
export function getCurrencySymbol(currency: string = 'INR'): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'SEK': 'kr',
    'NZD': 'NZ$',
    'MXN': '$',
    'SGD': 'S$',
    'HKD': 'HK$',
    'NOK': 'kr',
    'TRY': '₺',
    'RUB': '₽',
    'BRL': 'R$',
    'ZAR': 'R',
    'PLN': 'zł',
    'KRW': '₩',
    'THB': '฿'
  };
  
  return symbols[currency.toUpperCase()] || currency;
}
