"use client"

import type * as React from "react"
import { Trash2Icon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formConfigs } from "@/components/form/record-drawer"
import type { EditableRecord, RecordKind } from "@/components/form/types"
import { cn } from "@/lib/utils"

type RecordItemProps = {
  kind: RecordKind
  record: EditableRecord
  onEdit?: () => void
  onDelete: () => void
}

export function RecordItem({ kind, record, onEdit, onDelete }: RecordItemProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onEdit || (event.key !== "Enter" && event.key !== " ")) return
    event.preventDefault()
    onEdit()
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-3xl border border-orange-100 bg-[#fff8ed] p-3 text-left shadow-sm transition hover:border-orange-200 hover:bg-orange-50/80 hover:shadow-md",
        onEdit && "cursor-pointer"
      )}
      role={onEdit ? "button" : undefined}
      tabIndex={onEdit ? 0 : undefined}
      onClick={onEdit}
      onKeyDown={handleKeyDown}
    >
      <RecordAvatar kind={kind} record={record} />
      <div className="min-w-0 flex-1 space-y-1">
        <RecordContent kind={kind} record={record} />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-slate-500 hover:bg-white hover:text-red-600"
        onClick={(event) => {
          event.stopPropagation()
          onDelete()
        }}
      >
        <Trash2Icon />
        <span className="sr-only">Hapus</span>
      </Button>
    </div>
  )
}

function RecordAvatar({ kind, record }: { kind: RecordKind; record: EditableRecord }) {
  const badge = getRecordBadge(kind, record)

  if (kind === "product" && "priceDefault" in record && record.image) {
    return (
      <div
        className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-cover bg-center bg-orange-100 sm:size-24"
        style={{ backgroundImage: `url(${record.image})` }}
        role="img"
        aria-label={record.name}
      >
        {badge ? (
          <Badge className="absolute left-1.5 top-1.5 border-0 bg-white/90 px-2 py-0.5 text-[0.65rem] text-orange-700 shadow-sm backdrop-blur">
            {badge}
          </Badge>
        ) : null}
      </div>
    )
  }

  return (
    <div className="relative grid size-20 shrink-0 place-items-center rounded-2xl bg-orange-100 text-orange-700 sm:size-24 [&_svg]:size-9">
      {formConfigs[kind].icon}
      {badge ? (
        <Badge className="absolute left-1.5 top-1.5 border-0 bg-white/90 px-2 py-0.5 text-[0.65rem] text-orange-700 shadow-sm backdrop-blur">
          {badge}
        </Badge>
      ) : null}
    </div>
  )
}

function getRecordBadge(kind: RecordKind, record: EditableRecord) {
  if (kind === "inventory" && "unitPrice" in record) return record.quantity > 0 ? `${record.quantity} stok` : "Habis"
  if (kind === "purchase" && "items" in record) return `${record.items?.length ?? 0} bahan`
  if (kind === "production") return `${record.quantity} item`
  if (kind === "product" && "priceDefault" in record) return record.quantity > 0 ? `${record.quantity} stok` : "Habis"
  return null
}

function RecordContent({ kind, record }: { kind: RecordKind; record: EditableRecord }) {
  if (kind === "inventory" && "unitPrice" in record) {
    return (
      <>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950 sm:text-base">{record.name}</p>
          {record.note ? <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{record.note}</p> : null}
        </div>
        <p className="text-lg font-black tracking-tight text-orange-700">
          {formatCurrency(record.unitPrice)} / unit
        </p>
      </>
    )
  }

  if (kind === "purchase" && "amount" in record && "date" in record) {
    return (
      <>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950 sm:text-base">{record.name}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
            {record.date ?? record.createdAt.slice(0, 10)} &middot; {record.items?.length ?? 0} bahan
            {record.note ? ` · ${record.note}` : ""}
          </p>
        </div>
        <p className="text-lg font-black tracking-tight text-orange-700">
          {formatCurrency(record.amount)}
        </p>
      </>
    )
  }

  if (kind === "production") {
    return (
      <>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950 sm:text-base">{record.name}</p>
          {record.note ? <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{record.note}</p> : null}
        </div>
        <p className="text-lg font-black tracking-tight text-orange-700">
          {record.quantity} item
        </p>
      </>
    )
  }

  return (
    <>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950 sm:text-base">{record.name}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
          {record.quantity} item
          {"amount" in record ? ` · ${formatCurrency(record.amount)}` : ""}
          {record.note ? ` · ${record.note}` : ""}
        </p>
      </div>
    </>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}
