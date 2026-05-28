import { revalidatePath } from "next/cache"

export function toNumber(value: string | number | undefined) {
  return Number(value) || 0
}

export function refreshHome() {
  revalidatePath("/")
}
