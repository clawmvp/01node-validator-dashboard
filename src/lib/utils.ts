import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number to human readable format
 * 1234 -> 1.2K
 * 1234567 -> 1.2M
 * 1234567890 -> 1.2B
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1_000_000_000) {
    return sign + (absNum / 1_000_000_000).toFixed(decimals).replace(/\.0+$/, '') + 'B';
  }
  if (absNum >= 1_000_000) {
    return sign + (absNum / 1_000_000).toFixed(decimals).replace(/\.0+$/, '') + 'M';
  }
  if (absNum >= 1_000) {
    return sign + (absNum / 1_000).toFixed(decimals).replace(/\.0+$/, '') + 'K';
  }
  
  return sign + absNum.toFixed(0);
}

/**
 * Format currency to human readable format with $ prefix
 */
export function formatCurrency(num: number, decimals: number = 1): string {
  const sign = num < 0 ? '-' : '';
  return sign + '$' + formatNumber(Math.abs(num), decimals);
}
