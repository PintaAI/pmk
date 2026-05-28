"use server"

import { prisma } from "@/lib/prisma"
import type { EntryValues } from "@/components/form/types"
import { mapPurchase } from "./mappers"
import { refreshHome, toNumber } from "./utils"
import { logActivity } from "./activity-log"

export async function getPurchases() {
  const purchases = await prisma.purchase.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } })
  return purchases.map(mapPurchase)
}

export async function createPurchase(values: EntryValues) {
  const purchaseItems = values.purchaseItems
    .map((item) => ({
      name: item.name.trim(),
      quantity: toNumber(item.quantity),
      price: toNumber(item.price),
    }))
    .filter((item) => item.name && item.quantity > 0)

  if (purchaseItems.length === 0) return

  await prisma.$transaction(async (tx) => {
    await tx.purchase.create({
      data: {
        name: "Belanja bahan baku",
        quantity: purchaseItems.reduce((total, item) => total + item.quantity, 0),
        amount: purchaseItems.reduce((total, item) => total + item.quantity * item.price, 0),
        note: values.note.trim() || null,
        date: values.date ? new Date(`${values.date}T00:00:00.000Z`) : new Date(),
        items: { create: purchaseItems },
      },
    })

    await Promise.all(
      purchaseItems.map((item) =>
        tx.inventoryItem.upsert({
          where: { name: item.name },
          create: {
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            note: "Dari belanja bahan baku",
          },
          update: {
            quantity: { increment: item.quantity },
            unitPrice: item.price,
          },
        })
      )
    )
  })

  const itemNames = purchaseItems.map((item) => item.name).join(", ")
  await logActivity("purchase", "created", `Created purchase (${purchaseItems.length} items: ${itemNames})`)
  refreshHome()
}

export async function deletePurchase(id: string) {
  await prisma.purchase.delete({ where: { id } })
  await logActivity("purchase", "deleted", `Deleted purchase`, id)
  refreshHome()
}
