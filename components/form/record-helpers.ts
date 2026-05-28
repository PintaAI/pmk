import type { ActivityLogRecord, RecordKind, ViewKey } from "./types"

export type BusinessMetrics = {
  revenue: number
  expense: number
  profit: number
  sold: number
  stock: number
  tableCounts: {
    sales: number
    products: number
    inventoryItems: number
    purchases: number
    productions: number
  }
  recentActivities: ActivityLogRecord[]
}

export function getDrawerKinds(activeView: ViewKey): readonly RecordKind[] {
  if (activeView === "stock") {
    return ["production"]
  }

  if (activeView === "inventory") {
    return ["purchase"]
  }

  return ["sale"]
}
