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
  isLimited: boolean
  addLabel?: string
  onAdd: () => void
  onEdit?: (record: EditableRecord) => void
  onDelete: (id: string) => void
}

export function SectionCard({
  view,
  kind,
  records,
  isLimited,
  addLabel = "Tambah",
  onAdd,
  onEdit,
  onDelete,
}: SectionCardProps) {
  return (
    <Card className="flex max-h-[calc(100svh-15rem)] min-h-0 flex-col bg-white md:max-h-[calc(100svh-10rem)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{view.title}</CardTitle>
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
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-3">
        {records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 p-5 text-center text-sm text-slate-500">
            Belum ada catatan di bagian ini.
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            {records.map((record) => (
              <RecordItem
                key={record.id}
                kind={kind}
                record={record}
                onEdit={onEdit ? () => onEdit(record) : undefined}
                onDelete={() => onDelete(record.id)}
              />
            ))}
          </div>
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
