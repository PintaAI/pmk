"use client"

import { PlusIcon, ShoppingCartIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewKey } from "@/components/form/types"
import { viewConfigs } from "./view-configs"

type BottomNavProps = {
  value: ViewKey
  cartQuantity: number
  actionLabel?: string
  onChange: (view: ViewKey) => void
  onAdd: () => void
}

export function BottomNav({ value, cartQuantity, actionLabel, onChange, onAdd }: BottomNavProps) {
  const leftItems = ["home", "sales"] as const
  const rightItems = ["stock", "inventory"] as const
  const isCartAction = value === "sales"
  const buttonLabel = actionLabel ?? (isCartAction ? "Buka keranjang" : "Tambah catatan")

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto grid h-[4.5rem] max-w-sm grid-cols-5 items-center gap-0.5 rounded-[2rem] border border-orange-200 bg-white/95 px-2 shadow-[0_18px_55px_-24px_rgba(15,23,42,0.8),0_8px_24px_-18px_rgba(234,88,12,0.9)] backdrop-blur-xl">
        {leftItems.map((key) => (
          <NavButton key={key} view={key} activeView={value} onChange={onChange} />
        ))}

        <button
          type="button"
          aria-label={buttonLabel}
          className="relative -mt-6 flex size-14 items-center justify-center justify-self-center rounded-full border-2 border-orange-500/20 bg-orange-600 text-white shadow-lg ring-6 ring-white/90 transition active:scale-95"
          onClick={onAdd}
        >
          {isCartAction ? <ShoppingCartIcon className="size-6" /> : <PlusIcon className="size-6" />}
          {isCartAction && cartQuantity > 0 && (
            <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-slate-950 px-1 text-[11px] font-bold text-white">
              {cartQuantity}
            </span>
          )}
        </button>

        {rightItems.map((key) => (
          <NavButton key={key} view={key} activeView={value} onChange={onChange} />
        ))}
      </div>
    </nav>
  )
}

function NavButton({
  view,
  activeView,
  onChange,
}: {
  view: ViewKey
  activeView: ViewKey
  onChange: (view: ViewKey) => void
}) {
  const config = viewConfigs[view]
  const isActive = activeView === view

  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex h-14 min-w-0 flex-col items-center justify-center gap-px overflow-hidden rounded-full px-2 py-1 text-xs font-medium transition-colors active:scale-95",
        isActive
          ? "bg-orange-100 text-orange-700"
          : "text-slate-500 hover:bg-orange-50 hover:text-slate-950"
      )}
      onClick={() => onChange(view)}
    >
      {config.icon}
      <span className="text-[10px] leading-none">{config.label}</span>
    </button>
  )
}
