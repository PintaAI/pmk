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

  let purchaseId: string | undefined
  const amount = purchaseItems.reduce((total, item) => total + item.quantity * item.price, 0)

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        name: "Belanja bahan baku",
        quantity: purchaseItems.reduce((total, item) => total + item.quantity, 0),
        amount,
        note: values.note.trim() || null,
        date: values.date ? new Date(`${values.date}T00:00:00.000Z`) : new Date(),
        items: { create: purchaseItems },
      },
    })
    purchaseId = purchase.id

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
  await logActivity("purchase", "created", `Belanja dibuat (${purchaseItems.length} item: ${itemNames})`, purchaseId, {
    amount,
    quantity: purchaseItems.reduce((total, item) => total + item.quantity, 0),
    items: purchaseItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      amount: item.quantity * item.price,
    })),
  })
  refreshHome()
}

export async function deletePurchase(id: string) {
  const purchase = await prisma.$transaction(async (tx) => {
    const existingPurchase = await tx.purchase.findUnique({ where: { id }, include: { items: true } })
    if (!existingPurchase) return null

    await Promise.all(
      existingPurchase.items.map(async (item) => {
        const inventoryItem = await tx.inventoryItem.findUnique({ where: { name: item.name } })
        if (!inventoryItem) return

        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: Math.max(0, inventoryItem.quantity - item.quantity) },
        })
      })
    )

    await tx.purchase.delete({ where: { id } })
    return existingPurchase
  })

  await logActivity("purchase", "deleted", `Belanja dihapus`, id, purchase ? {
    amount: purchase.amount,
    quantity: purchase.quantity,
    items: purchase.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      amount: item.quantity * item.price,
    })),
  } : undefined)
  refreshHome()
}
