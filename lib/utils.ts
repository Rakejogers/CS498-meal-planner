import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "spicy food" → "Spicy food". Food names are stored lowercase. */
export function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
