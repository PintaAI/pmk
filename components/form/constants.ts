import type { PriceKind } from "./types"

export const priceKindLabels: Record<PriceKind, string> = {
  default: "Default",
  reseller: "Reseller",
  online: "Online",
}

export const priceKinds: readonly PriceKind[] = ["default", "reseller", "online"]
