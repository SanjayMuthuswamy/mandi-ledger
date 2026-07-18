import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseVarietyName(name: string, quantityKg: number) {
  const match = name.match(/(\d+)\s*kg/i)
  if (match) {
    const kgPerBag = parseInt(match[1], 10)
    let brandName = name.replace(/(\d+)\s*kg.*/i, '').trim()
    brandName = brandName.replace(/[()|\\-]/g, '').trim()
    if (!brandName) brandName = name
    
    const bags = kgPerBag > 0 ? Math.round(quantityKg / kgPerBag) : 0
    return {
      isBagged: true,
      brandName,
      kgPerBag,
      bags
    }
  }
  
  const defaultKg = 26
  const bags = Math.round(quantityKg / defaultKg)
  return {
    isBagged: false,
    brandName: name,
    kgPerBag: defaultKg,
    bags
  }
}
