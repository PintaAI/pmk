"use server"

import { prisma } from "@/lib/prisma"
import type { BusinessMetrics } from "@/components/form/record-helpers"
import { getRecentActivities } from "./activity-log"

export async function getBusinessDashboard(): Promise<BusinessMetrics> {
  const [sales, purchases, products, counts, recentActivities] = await Promise.all([
    prisma.sale.aggregate({ _sum: { amount: true, quantity: true } }),
    prisma.purchase.aggregate({ _sum: { amount: true } }),
    prisma.product.aggregate({ _sum: { quantity: true } }),
    Promise.all([
      prisma.sale.count(),
      prisma.product.count(),
      prisma.inventoryItem.count(),
      prisma.purchase.count(),
      prisma.production.count(),
    ]),
    getRecentActivities(10),
  ])

  const revenue = sales._sum.amount ?? 0
  const expense = purchases._sum.amount ?? 0

  return {
    revenue,
    expense,
    profit: revenue - expense,
    sold: sales._sum.quantity ?? 0,
    stock: products._sum.quantity ?? 0,
    tableCounts: {
      sales: counts[0],
      products: counts[1],
      inventoryItems: counts[2],
      purchases: counts[3],
      productions: counts[4],
    },
    recentActivities,
  }
}
