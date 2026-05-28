"use server"

import { prisma } from "@/lib/prisma"
import type { EntryValues } from "@/components/form/types"
import { mapProduction } from "./mappers"
import { refreshHome, toNumber } from "./utils"
import { logActivity } from "./activity-log"

export async function getProductions() {
  const productions = await prisma.production.findMany({
    include: { ingredients: true, outputs: true },
    orderBy: { createdAt: "desc" },
  })
  return productions.map(mapProduction)
}

export async function createProduction(values: EntryValues) {
  const ingredients = values.ingredients
    .map((item) => ({
      inventoryItemId: item.inventoryItemId,
      quantity: toNumber(item.quantity),
    }))
    .filter((item) => item.inventoryItemId && item.quantity > 0)
  const outputs = values.outputs
    .map((item) => ({
      productId: item.productId,
      quantity: toNumber(item.quantity),
    }))
    .filter((item) => item.productId && item.quantity > 0)

  if (ingredients.length === 0 || outputs.length === 0) return

  let productionName = "Produksi"

  await prisma.$transaction(async (tx) => {
    const inventoryItems = await tx.inventoryItem.findMany({
      where: { id: { in: ingredients.map((item) => item.inventoryItemId) } },
    })

    const hasInvalidIngredient = ingredients.some((ingredient) => {
      const inventoryItem = inventoryItems.find((item) => item.id === ingredient.inventoryItemId)
      return !inventoryItem || ingredient.quantity > inventoryItem.quantity
    })

    if (hasInvalidIngredient) return

    const products = await tx.product.findMany({
      where: { id: { in: outputs.map((item) => item.productId) } },
    })
    const outputNames = outputs
      .map((output) => products.find((product) => product.id === output.productId)?.name)
      .filter(Boolean)
      .join(", ")

    productionName = outputNames || "Produksi"

    await tx.production.create({
      data: {
        name: productionName,
        quantity: outputs.reduce((total, output) => total + output.quantity, 0),
        note: values.note.trim() || null,
        ingredients: { create: ingredients },
        outputs: { create: outputs },
      },
    })

    await Promise.all([
      ...ingredients.map((ingredient) =>
        tx.inventoryItem.update({
          where: { id: ingredient.inventoryItemId },
          data: { quantity: { decrement: ingredient.quantity } },
        })
      ),
      ...outputs.map((output) =>
        tx.product.update({
          where: { id: output.productId },
          data: { quantity: { increment: output.quantity } },
        })
      ),
    ])
  })

  await logActivity("production", "created", `Created production "${productionName}"`)
  refreshHome()
}

export async function deleteProduction(id: string) {
  const production = await prisma.production.findUnique({ where: { id }, select: { name: true } })
  await prisma.production.delete({ where: { id } })
  await logActivity("production", "deleted", `Deleted production "${production?.name ?? id}"`, id)
  refreshHome()
}
