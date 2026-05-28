"use client"

import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { EditableRecord, RecordKind } from "@/components/form/types"
import { RecordItem } from "./record-item"
import type { ViewConfig } from "./view-configs"

type SectionCardProps = {
  view: ViewConfig
  kind: RecordKind
  records: EditableRecord[]
  totalRecords: number
  isLimited: boolean
  addLabel?: string
  editHint?: string
  onAdd: () => void
  onEdit?: (record: EditableRecord) => void
  onDelete: (id: string) => void
}

export function SectionCard({
  view,
  kind,
  records,
  totalRecords,
  isLimited,
  addLabel = "Tambah",
  editHint = "Tap catatan untuk edit",
  onAdd,
  onEdit,
  onDelete,
}: SectionCardProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{view.title}</CardTitle>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-orange-600 text-white hover:bg-orange-700"
            onClick={onAdd}
          >
            <PlusIcon />
            {addLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{totalRecords} catatan</span>
          <span>{editHint}</span>
        </div>
        {records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 p-5 text-center text-sm text-slate-500">
            Belum ada catatan di bagian ini.
          </div>
        ) : (
          records.map((record) => (
            <RecordItem
              key={record.id}
              kind={kind}
              record={record}
              onEdit={onEdit ? () => onEdit(record) : undefined}
              onDelete={() => onDelete(record.id)}
            />
          ))
        )}
        {isLimited && (
          <p className="text-center text-xs text-slate-500">
            Buka menu bawah untuk melihat semua catatan per bagian.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
