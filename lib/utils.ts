/**
 * Utility function to merge class names.
 * Supports Tailwind CSS variants and conditional classes.
 * Example: cn('text-red-500', { 'hover:text-red-700': isHovered })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ClassValue = string | number | boolean | null | undefined | ClassDictionary | ClassArray

interface ClassDictionary {
  [key: string]: any
}

interface ClassArray extends Array<ClassValue> {}

interface TwMerge {
  /**
   * Merges Tailwind CSS class names, handling conflicts.
   * @param t - Tailwind CSS class names.
   * @returns Merged class names.
   */
  (t: TemplateStringsArray | string): string
}

// Mock implementation for twMerge and clsx if not available
const twMerge: TwMerge = (t) => Array.isArray(t) ? t.join(' ') : String(t);
const clsx = (inputs: any[]): string => inputs.filter(Boolean).join(' ');

// If you have actual installations of clsx and tailwind-merge, replace them:
// import { clsx } from 'clsx'
// import { twMerge } from 'tailwind-merge'
