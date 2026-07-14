import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatOmrDisplay(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0.000 OMR';
  const num = typeof value === 'number' ? value.toFixed(3) : String(value);
  return `${num} OMR`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
