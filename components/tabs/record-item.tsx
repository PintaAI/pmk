"use client"

import { Trash2Icon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formConfigs } from "@/components/form/record-drawer"
import type { EditableRecord, RecordKind } from "@/components/form/types"
import { getProductPrice } from "@/components/form/helpers"

type RecordItemProps = {
  kind: RecordKind
  record: EditableRecord
  onEdit?: () => void
  onDelete: () => void
}

export function RecordItem({ kind, record, onEdit, onDelete }: RecordItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-orange-100 text-orange-700">
        {formConfigs[kind].icon}
      </div>
      {onEdit ? (
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onEdit}>
          <RecordDetails kind={kind} record={record} />
        </button>
      ) : (
        <div className="min-w-0 flex-1 text-left">
          <RecordDetails kind={kind} record={record} />
        </div>
      )}
      <Button type="button" variant="ghost" size="icon-sm" onClick={onDelete}>
        <Trash2Icon />
        <span className="sr-only">Hapus</span>
      </Button>
    </div>
  )
}

function RecordDetails({ kind, record }: { kind: RecordKind; record: EditableRecord }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <p className="truncate font-medium">{record.name}</p>
        <Badge variant="secondary">{formConfigs[kind].label}</Badge>
      </div>
      <p className="mt-1 truncate text-xs text-slate-500">
        {getRecordMeta(kind, record)}
      </p>
    </>
  )
}

function getRecordMeta(kind: RecordKind, record: EditableRecord) {
  if (kind === "product" && "priceDefault" in record) {
    return `${record.quantity} stok · Default ${formatCurrency(
      getProductPrice(record, "default")
    )} · Reseller ${formatCurrency(getProductPrice(record, "reseller"))} · Online ${formatCurrency(
      getProductPrice(record, "online")
    )}`
  }

  if (kind === "inventory" && "unitPrice" in record) {
    return `${record.quantity} stok · ${formatCurrency(record.unitPrice)} / unit${
      record.note ? ` · ${record.note}` : ""
    }`
  }

  if (kind === "purchase" && "amount" in record && "date" in record) {
    return `${record.date ?? record.createdAt.slice(0, 10)} · ${record.items?.length ?? 0} bahan · ${formatCurrency(
      record.amount
    )}${record.note ? ` · ${record.note}` : ""}`
  }

  if (kind === "production") {
    return `${record.quantity} item${record.note ? ` · ${record.note}` : ""}`
  }

  return `${record.quantity} item · ${"amount" in record ? formatCurrency(record.amount) : ""}${record.note ? ` · ${record.note}` : ""}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}
