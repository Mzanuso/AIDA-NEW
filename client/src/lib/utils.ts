import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Unisce classi di tailwind in modo efficiente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}