import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatira cijenu u eurima s hrvatskim formatiranjem
 * @param price - Cijena kao broj
 * @param showSymbol - Da li prikazati € simbol (default: true)
 * @returns Formatirana cijena kao string
 */
export function formatPrice(price: number, showSymbol: boolean = true): string {
  const formatter = new Intl.NumberFormat('hr-HR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const formattedPrice = formatter.format(price);
  return showSymbol ? `${formattedPrice} €` : formattedPrice;
}

/**
 * Formatira cijenu za prikaz s oznakom periode (po satu/danu)
 * @param price - Cijena kao broj
 * @param period - Perioda ('hour' | 'day')
 * @returns Formatirana cijena s periodom
 */
export function formatPriceWithPeriod(price: number, period: 'hour' | 'day'): string {
  const periodText = period === 'hour' ? 'sat' : 'dan';
  return `${formatPrice(price)}/${periodText}`;
}