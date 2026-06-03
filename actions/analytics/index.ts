"use server"

import { prisma } from "@/lib/prisma"

export type AnalyticsData = {
  totalRevenue: number
  totalExpense: number
  profit: number
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
  monthlySales: Array<{ month: string; revenue: number; count: number }>
  counts: {
    products: number
    inventoryItems: number
    purchases: number
    productions: number
  }
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const [salesAgg, purchaseAgg, topProductsRaw, monthlyRaw, counts] =
    await Promise.all([
      prisma.sale.aggregate({ _sum: { amount: true, quantity: true } }),
      prisma.purchase.aggregate({ _sum: { amount: true } }),
      prisma.saleItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
      prisma.$queryRaw<
        Array<{ month: string; revenue: bigint; count: bigint }>
      >`
        SELECT
          to_char("createdAt", 'YYYY-MM') AS month,
          COALESCE(SUM(amount), 0) AS revenue,
          COUNT(*) AS count
        FROM "sale"
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `,
      Promise.all([
        prisma.product.count(),
        prisma.inventoryItem.count(),
        prisma.purchase.count(),
        prisma.production.count(),
      ]),
    ])

  const productIds = topProductsRaw.map((p) => p.productId)
  const products = productIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, priceDefault: true },
      })
    : []
  const productMap = new Map(products.map((p) => [p.id, p]))

  const topProducts = topProductsRaw.map((p) => {
    const product = productMap.get(p.productId)
    const quantity = p._sum.quantity ?? 0
    return {
      name: product?.name ?? "Produk terhapus",
      quantity,
      revenue: quantity * (product?.priceDefault ?? 0),
    }
  })

  const totalRevenue = salesAgg._sum.amount ?? 0
  const totalExpense = purchaseAgg._sum.amount ?? 0

  const monthlySales = monthlyRaw.map((row) => ({
    month: row.month,
    revenue: Number(row.revenue),
    count: Number(row.count),
  }))

  return {
    totalRevenue,
    totalExpense,
    profit: totalRevenue - totalExpense,
    topProducts,
    monthlySales,
    counts: {
      products: counts[0],
      inventoryItems: counts[1],
      purchases: counts[2],
      productions: counts[3],
    },
  }
}
