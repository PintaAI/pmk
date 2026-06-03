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
  let productionId: string | undefined
  let outputMetadata: Array<{ name: string; quantity: number }> = []
  let ingredientMetadata: Array<{ name: string; quantity: number }> = []

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
    outputMetadata = outputs.map((output) => ({
      name: products.find((product) => product.id === output.productId)?.name ?? output.productId,
      quantity: output.quantity,
    }))
    ingredientMetadata = ingredients.map((ingredient) => ({
      name: inventoryItems.find((item) => item.id === ingredient.inventoryItemId)?.name ?? ingredient.inventoryItemId,
      quantity: ingredient.quantity,
    }))

    const production = await tx.production.create({
      data: {
        name: productionName,
        quantity: outputs.reduce((total, output) => total + output.quantity, 0),
        note: values.note.trim() || null,
        ingredients: { create: ingredients },
        outputs: { create: outputs },
      },
    })
    productionId = production.id

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

  await logActivity("production", "created", `Produksi dibuat "${productionName}"`, productionId, {
    quantity: outputMetadata.reduce((total, item) => total + item.quantity, 0),
    outputs: outputMetadata,
    ingredients: ingredientMetadata,
  })
  refreshHome()
}

export async function deleteProduction(id: string) {
  const production = await prisma.$transaction(async (tx) => {
    const existingProduction = await tx.production.findUnique({
      where: { id },
      include: { ingredients: true, outputs: true },
    })
    if (!existingProduction) return null

    await Promise.all([
      ...existingProduction.ingredients.map((ingredient) =>
        tx.inventoryItem.update({
          where: { id: ingredient.inventoryItemId },
          data: { quantity: { increment: ingredient.quantity } },
        })
      ),
      ...existingProduction.outputs.map(async (output) => {
        const product = await tx.product.findUnique({ where: { id: output.productId } })
        if (!product) return

        await tx.product.update({
          where: { id: product.id },
          data: { quantity: Math.max(0, product.quantity - output.quantity) },
        })
      }),
    ])

    await tx.production.delete({ where: { id } })
    return existingProduction
  })

  await logActivity("production", "deleted", `Produksi dihapus "${production?.name ?? id}"`, id, production ? {
    quantity: production.quantity,
    outputs: production.outputs.map((item) => ({ name: item.productId, quantity: item.quantity })),
    ingredients: production.ingredients.map((item) => ({ name: item.inventoryItemId, quantity: item.quantity })),
  } : undefined)
  refreshHome()
}
