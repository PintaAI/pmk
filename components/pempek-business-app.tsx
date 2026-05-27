"use client"

import * as React from "react"
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  BoxesIcon,
  ClipboardListIcon,
  CoinsIcon,
  HomeIcon,
  PackagePlusIcon,
  PlusIcon,
  ReceiptTextIcon,
  Trash2Icon,
  TrendingUpIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type RecordKind = "sale" | "product" | "production" | "expense"

type BusinessRecord = {
  id: string
  kind: RecordKind
  name: string
  quantity: number
  amount: number
  note?: string
  createdAt: string
}

type EntryValues = {
  name: string
  quantity: string
  amount: string
  note: string
}

type SaveRecordInput = {
  id?: string
  kind: RecordKind
  name: string
  quantity: number
  amount: number
  note?: string
}

type FormConfig = {
  title: string
  description: string
  nameLabel: string
  quantityLabel: string
  amountLabel: string
  notePlaceholder: string
  submitLabel: string
}

const recordsKey = ["pempek-records"] as const
const storageKey = "pempek-business-records"

const defaultRecords: BusinessRecord[] = [
  {
    id: "sale-1",
    kind: "sale",
    name: "Pempek kapal selam",
    quantity: 18,
    amount: 270000,
    note: "Order kantor pagi",
    createdAt: new Date().toISOString(),
  },
  {
    id: "product-1",
    kind: "product",
    name: "Pempek lenjer",
    quantity: 46,
    amount: 12000,
    note: "Stok siap jual",
    createdAt: new Date().toISOString(),
  },
  {
    id: "production-1",
    kind: "production",
    name: "Adonan ikan tenggiri",
    quantity: 7,
    amount: 420000,
    note: "Batch hari ini",
    createdAt: new Date().toISOString(),
  },
  {
    id: "expense-1",
    kind: "expense",
    name: "Ikan tenggiri",
    quantity: 5,
    amount: 375000,
    note: "Belanja pasar 16 Ilir",
    createdAt: new Date().toISOString(),
  },
]

const formConfigs: Record<RecordKind, FormConfig> = {
  sale: {
    title: "Catat penjualan",
    description: "Tambah atau ubah transaksi tanpa meninggalkan halaman.",
    nameLabel: "Produk terjual",
    quantityLabel: "Jumlah porsi",
    amountLabel: "Total penjualan",
    notePlaceholder: "Contoh: GoFood, pelanggan tetap, COD",
    submitLabel: "Simpan penjualan",
  },
  product: {
    title: "Kelola stok",
    description: "Gunakan form yang sama untuk produk baru dan perubahan stok.",
    nameLabel: "Nama produk",
    quantityLabel: "Stok tersedia",
    amountLabel: "Harga per porsi",
    notePlaceholder: "Contoh: frozen, siap goreng, paling laris",
    submitLabel: "Simpan stok",
  },
  production: {
    title: "Catat produksi",
    description: "Pantau batch produksi dan biaya modal per proses.",
    nameLabel: "Nama batch",
    quantityLabel: "Output porsi",
    amountLabel: "Biaya produksi",
    notePlaceholder: "Contoh: ikan 5 kg, selesai jam 10 pagi",
    submitLabel: "Simpan produksi",
  },
  expense: {
    title: "Catat biaya",
    description: "Pisahkan belanja bahan, operasional, dan kebutuhan harian.",
    nameLabel: "Nama biaya",
    quantityLabel: "Jumlah item",
    amountLabel: "Total biaya",
    notePlaceholder: "Contoh: gas, cabai, kemasan, ongkir",
    submitLabel: "Simpan biaya",
  },
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
      },
    },
  })
}

export function PempekBusinessApp() {
  const [queryClient] = React.useState(createQueryClient)
  const isClientReady = useClientReady()

  if (!isClientReady) {
    return <main className="min-h-svh bg-[#fffaf1] text-slate-950" />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PempekWorkspace />
    </QueryClientProvider>
  )
}

function useClientReady() {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      const timeout = window.setTimeout(onStoreChange, 0)

      return () => window.clearTimeout(timeout)
    },
    () => true,
    () => false
  )
}

function PempekWorkspace() {
  const [editingRecord, setEditingRecord] = React.useState<BusinessRecord | null>(
    null
  )
  const [quickKind, setQuickKind] = React.useState<RecordKind>("sale")
  const recordsQuery = useRecords()
  const saveRecord = useSaveRecord()
  const deleteRecord = useDeleteRecord()
  const records = recordsQuery.data ?? []
  const metrics = getMetrics(records)

  const handleSubmit = (kind: RecordKind, values: EntryValues, id?: string) => {
    const quantity = Number(values.quantity) || 0
    const amount = Number(values.amount) || 0

    const input: SaveRecordInput = {
      kind,
      name: values.name.trim(),
      quantity,
      amount,
      note: values.note.trim(),
    }

    if (id) {
      input.id = id
    }

    saveRecord.mutate(input)
    setEditingRecord(null)
  }

  return (
    <main className="min-h-svh bg-[#fffaf1] text-slate-950">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col">
        <header className="sticky top-0 z-20 border-b border-orange-200/70 bg-[#fffaf1]/90 px-4 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
                Central Pempek
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Bisnis pempek harian
              </h1>
            </div>
            <Badge className="bg-orange-600 text-white">Mobile SPA</Badge>
          </div>
        </header>

        <Tabs defaultValue="dashboard" className="flex min-h-0 flex-1 flex-col gap-0">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-32 pt-4">
            <TabsContent value="dashboard" className="space-y-4">
              <HeroSummary metrics={metrics} />
              <QuickEntry
                kind={quickKind}
                editingRecord={editingRecord}
                onKindChange={setQuickKind}
                onCancelEdit={() => setEditingRecord(null)}
                onSubmit={handleSubmit}
                isPending={saveRecord.isPending}
              />
              <RecordList
                title="Aktivitas terbaru"
                records={records.slice(0, 5)}
                emptyText="Belum ada aktivitas. Mulai dari catatan penjualan."
                onEdit={(record) => {
                  setQuickKind(record.kind)
                  setEditingRecord(record)
                }}
                onDelete={(id) => deleteRecord.mutate(id)}
              />
            </TabsContent>

            <TabsContent value="sales" className="space-y-4">
              <SectionHeader
                icon={<ReceiptTextIcon />}
                title="Penjualan"
                description="Catat order, total uang masuk, dan sumber transaksi."
              />
              <EntryForm
                key={`sale-${editingRecord?.kind === "sale" ? editingRecord.id : "new"}`}
                kind="sale"
                record={editingRecord?.kind === "sale" ? editingRecord : null}
                onSubmit={handleSubmit}
                onCancel={() => setEditingRecord(null)}
                isPending={saveRecord.isPending}
              />
              <RecordList
                title="Riwayat penjualan"
                records={records.filter((record) => record.kind === "sale")}
                emptyText="Penjualan hari ini belum dicatat."
                onEdit={setEditingRecord}
                onDelete={(id) => deleteRecord.mutate(id)}
              />
            </TabsContent>

            <TabsContent value="stock" className="space-y-4">
              <SectionHeader
                icon={<BoxesIcon />}
                title="Stok"
                description="Pantau menu siap jual dan harga dasar per produk."
              />
              <EntryForm
                key={`product-${
                  editingRecord?.kind === "product" ? editingRecord.id : "new"
                }`}
                kind="product"
                record={editingRecord?.kind === "product" ? editingRecord : null}
                onSubmit={handleSubmit}
                onCancel={() => setEditingRecord(null)}
                isPending={saveRecord.isPending}
              />
              <RecordList
                title="Produk aktif"
                records={records.filter((record) => record.kind === "product")}
                emptyText="Belum ada stok produk."
                onEdit={setEditingRecord}
                onDelete={(id) => deleteRecord.mutate(id)}
              />
            </TabsContent>

            <TabsContent value="ops" className="space-y-4">
              <SectionHeader
                icon={<ClipboardListIcon />}
                title="Produksi & biaya"
                description="Kelola batch produksi dan pengeluaran dari satu halaman."
              />
              <EntryForm
                key={`production-${
                  editingRecord?.kind === "production" ? editingRecord.id : "new"
                }`}
                kind="production"
                record={editingRecord?.kind === "production" ? editingRecord : null}
                onSubmit={handleSubmit}
                onCancel={() => setEditingRecord(null)}
                isPending={saveRecord.isPending}
              />
              <EntryForm
                key={`expense-${
                  editingRecord?.kind === "expense" ? editingRecord.id : "new"
                }`}
                kind="expense"
                record={editingRecord?.kind === "expense" ? editingRecord : null}
                onSubmit={handleSubmit}
                onCancel={() => setEditingRecord(null)}
                isPending={saveRecord.isPending}
              />
              <RecordList
                title="Operasional terbaru"
                records={records.filter(
                  (record) => record.kind === "production" || record.kind === "expense"
                )}
                emptyText="Belum ada produksi atau biaya."
                onEdit={setEditingRecord}
                onDelete={(id) => deleteRecord.mutate(id)}
              />
            </TabsContent>
          </div>

          <TabsList className="fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto !grid !h-[4.5rem] !w-[calc(100%-2rem)] max-w-sm grid-cols-4 items-center gap-0.5 rounded-[2rem] border border-orange-200 bg-white/95 p-2 shadow-[0_18px_55px_-24px_rgba(15,23,42,0.8),0_8px_24px_-18px_rgba(234,88,12,0.9)] backdrop-blur-xl">
            <MobileTab value="dashboard" icon={<HomeIcon />} label="Home" />
            <MobileTab value="sales" icon={<CoinsIcon />} label="Jual" />
            <MobileTab value="stock" icon={<BoxesIcon />} label="Stok" />
            <MobileTab value="ops" icon={<PackagePlusIcon />} label="Ops" />
          </TabsList>
        </Tabs>
      </div>
    </main>
  )
}

function HeroSummary({ metrics }: { metrics: ReturnType<typeof getMetrics> }) {
  return (
    <Card className="border-0 bg-slate-950 text-white ring-0">
      <CardHeader>
        <CardDescription className="text-orange-100">Ringkasan hari ini</CardDescription>
        <CardTitle className="text-3xl font-bold">{formatCurrency(metrics.profit)}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <MetricPill label="Omzet" value={formatCurrency(metrics.revenue)} />
        <MetricPill label="Biaya" value={formatCurrency(metrics.expense)} />
        <MetricPill label="Porsi terjual" value={`${metrics.sold} porsi`} />
        <MetricPill label="Stok" value={`${metrics.stock} porsi`} />
      </CardContent>
    </Card>
  )
}

function QuickEntry({
  kind,
  editingRecord,
  onKindChange,
  onCancelEdit,
  onSubmit,
  isPending,
}: {
  kind: RecordKind
  editingRecord: BusinessRecord | null
  onKindChange: (kind: RecordKind) => void
  onCancelEdit: () => void
  onSubmit: (kind: RecordKind, values: EntryValues, id?: string) => void
  isPending: boolean
}) {
  return (
    <Card className="border-orange-200 bg-white ring-orange-200">
      <CardHeader>
        <CardTitle>Input cepat</CardTitle>
        <CardDescription>Pilih jenis catatan, lalu simpan dengan optimistik UI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {(["sale", "product", "production", "expense"] as RecordKind[]).map(
            (option) => (
              <Button
                key={option}
                type="button"
                variant={kind === option ? "default" : "outline"}
                className={cn(
                  "h-10 px-2 text-xs",
                  kind === option && "bg-orange-600 text-white hover:bg-orange-700"
                )}
                onClick={() => onKindChange(option)}
              >
                {kindLabel(option)}
              </Button>
            )
          )}
        </div>
        <EntryForm
          key={`${editingRecord?.id ?? "new"}-${editingRecord?.kind ?? kind}`}
          kind={editingRecord?.kind ?? kind}
          record={editingRecord}
          compact
          onSubmit={onSubmit}
          onCancel={onCancelEdit}
          isPending={isPending}
        />
      </CardContent>
    </Card>
  )
}

function EntryForm({
  kind,
  record,
  compact = false,
  onSubmit,
  onCancel,
  isPending,
}: {
  kind: RecordKind
  record: BusinessRecord | null
  compact?: boolean
  onSubmit: (kind: RecordKind, values: EntryValues, id?: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const config = formConfigs[kind]
  const [values, setValues] = React.useState<EntryValues>(() => valuesFromRecord(record))

  return (
    <form
      className={cn(
        "space-y-3 rounded-2xl bg-white",
        !compact && "border border-orange-200 p-4 shadow-sm"
      )}
      onSubmit={(event) => {
        event.preventDefault()
        if (!values.name.trim()) {
          return
        }
        onSubmit(kind, values, record?.id)
        setValues(valuesFromRecord(null))
      }}
    >
      {!compact && (
        <div>
          <h2 className="font-semibold">{record ? `Edit ${kindLabel(kind)}` : config.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>
        </div>
      )}
      <Field label={config.nameLabel}>
        <Input
          value={values.name}
          placeholder="Contoh: Pempek kulit"
          onChange={(event) => setValues({ ...values, name: event.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={config.quantityLabel}>
          <Input
            inputMode="numeric"
            min="0"
            type="number"
            value={values.quantity}
            onChange={(event) =>
              setValues({ ...values, quantity: event.target.value })
            }
          />
        </Field>
        <Field label={config.amountLabel}>
          <Input
            inputMode="numeric"
            min="0"
            type="number"
            value={values.amount}
            onChange={(event) => setValues({ ...values, amount: event.target.value })}
          />
        </Field>
      </div>
      <Field label="Catatan">
        <Input
          value={values.note}
          placeholder={config.notePlaceholder}
          onChange={(event) => setValues({ ...values, note: event.target.value })}
        />
      </Field>
      <div className="flex gap-2">
        {record && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
          disabled={isPending || !values.name.trim()}
        >
          <PlusIcon />
          {record ? "Simpan edit" : config.submitLabel}
        </Button>
      </div>
    </form>
  )
}

function RecordList({
  title,
  records,
  emptyText,
  onEdit,
  onDelete,
}: {
  title: string
  records: BusinessRecord[]
  emptyText: string
  onEdit: (record: BusinessRecord) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{records.length} catatan tersimpan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 p-5 text-center text-sm text-slate-500">
            {emptyText}
          </div>
        ) : (
          records.map((record) => (
            <RecordItem
              key={record.id}
              record={record}
              onEdit={() => onEdit(record)}
              onDelete={() => onDelete(record.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

function RecordItem({
  record,
  onEdit,
  onDelete,
}: {
  record: BusinessRecord
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-orange-100 text-orange-700">
        {recordIcon(record.kind)}
      </div>
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onEdit}>
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{record.name}</p>
          <Badge variant="secondary">{kindLabel(record.kind)}</Badge>
        </div>
        <p className="mt-1 truncate text-xs text-slate-500">
          {record.quantity} item · {formatCurrency(record.amount)}
          {record.note ? ` · ${record.note}` : ""}
        </p>
      </button>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onDelete}>
        <Trash2Icon />
        <span className="sr-only">Hapus</span>
      </Button>
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-orange-100 p-4 text-orange-950">
      <div className="grid size-12 place-items-center rounded-2xl bg-orange-600 text-white [&_svg]:size-5">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-orange-900/70">{description}</p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = React.useId()

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {React.isValidElement<{ id?: string }>(children)
        ? React.cloneElement(children, { id })
        : children}
    </div>
  )
}

function MobileTab({
  value,
  icon,
  label,
}: {
  value: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <TabsTrigger
      value={value}
      className="!h-14 min-w-0 flex-col rounded-2xl px-0 data-active:bg-orange-100 data-active:text-orange-700"
    >
      <span className="[&_svg]:size-5">{icon}</span>
      <span className="text-[11px] font-semibold">{label}</span>
    </TabsTrigger>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-xs text-orange-100">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}

function useRecords() {
  return useQuery({
    queryKey: recordsKey,
    queryFn: async () => readRecords(),
  })
}

function useSaveRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SaveRecordInput) => {
      const records = await readRecords()
      const nextRecord: BusinessRecord = {
        id: input.id ?? crypto.randomUUID(),
        kind: input.kind,
        name: input.name,
        quantity: input.quantity,
        amount: input.amount,
        note: input.note,
        createdAt:
          records.find((record) => record.id === input.id)?.createdAt ??
          new Date().toISOString(),
      }
      const nextRecords = records.some((record) => record.id === nextRecord.id)
        ? records.map((record) => (record.id === nextRecord.id ? nextRecord : record))
        : [nextRecord, ...records]

      writeRecords(nextRecords)
      return nextRecord
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: recordsKey })
      const previous = queryClient.getQueryData<BusinessRecord[]>(recordsKey) ?? []
      const optimisticRecord: BusinessRecord = {
        id: input.id ?? `optimistic-${Date.now()}`,
        kind: input.kind,
        name: input.name,
        quantity: input.quantity,
        amount: input.amount,
        note: input.note,
        createdAt:
          previous.find((record) => record.id === input.id)?.createdAt ??
          new Date().toISOString(),
      }

      queryClient.setQueryData<BusinessRecord[]>(recordsKey, (current = []) =>
        current.some((record) => record.id === optimisticRecord.id)
          ? current.map((record) =>
              record.id === optimisticRecord.id ? optimisticRecord : record
            )
          : [optimisticRecord, ...current]
      )

      return { previous }
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(recordsKey, context?.previous ?? [])
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: recordsKey })
    },
  })
}

function useDeleteRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const records = await readRecords()
      const nextRecords = records.filter((record) => record.id !== id)
      writeRecords(nextRecords)
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: recordsKey })
      const previous = queryClient.getQueryData<BusinessRecord[]>(recordsKey) ?? []
      queryClient.setQueryData<BusinessRecord[]>(recordsKey, (current = []) =>
        current.filter((record) => record.id !== id)
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(recordsKey, context?.previous ?? [])
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: recordsKey })
    },
  })
}

async function readRecords() {
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) {
    writeRecords(defaultRecords)
    return defaultRecords
  }

  return JSON.parse(stored) as BusinessRecord[]
}

function writeRecords(records: BusinessRecord[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(records))
}

function valuesFromRecord(record: BusinessRecord | null): EntryValues {
  return {
    name: record?.name ?? "",
    quantity: record?.quantity ? String(record.quantity) : "",
    amount: record?.amount ? String(record.amount) : "",
    note: record?.note ?? "",
  }
}

function getMetrics(records: BusinessRecord[]) {
  const revenue = records
    .filter((record) => record.kind === "sale")
    .reduce((total, record) => total + record.amount, 0)
  const expense = records
    .filter((record) => record.kind === "expense" || record.kind === "production")
    .reduce((total, record) => total + record.amount, 0)
  const sold = records
    .filter((record) => record.kind === "sale")
    .reduce((total, record) => total + record.quantity, 0)
  const stock = records
    .filter((record) => record.kind === "product")
    .reduce((total, record) => total + record.quantity, 0)

  return {
    revenue,
    expense,
    profit: revenue - expense,
    sold,
    stock,
  }
}

function kindLabel(kind: RecordKind) {
  const labels: Record<RecordKind, string> = {
    sale: "Jual",
    product: "Stok",
    production: "Produksi",
    expense: "Biaya",
  }

  return labels[kind]
}

function recordIcon(kind: RecordKind) {
  const icons: Record<RecordKind, React.ReactNode> = {
    sale: <CoinsIcon className="size-4" />,
    product: <BoxesIcon className="size-4" />,
    production: <TrendingUpIcon className="size-4" />,
    expense: <ReceiptTextIcon className="size-4" />,
  }

  return icons[kind]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}
