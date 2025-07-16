import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(birthMonth: number, birthYear: number): number {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // Convert to 1-based month
  
  let totalMonths = (currentYear - birthYear) * 12
  totalMonths += (currentMonth - birthMonth)
  
  return totalMonths
}
