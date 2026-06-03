"use client"

import { usePathname, useRouter } from "next/navigation"
import { BarChart3Icon, PlusIcon, ShoppingCartIcon } from "lucide-react"
import type { ViewKey } from "@/components/form/types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { viewConfigs } from "@/components/tabs"

type AppSidebarProps = {
  value?: ViewKey
  cartQuantity?: number
  onChange?: (view: ViewKey) => void
  onAdd?: () => void
}

const navItems = ["home", "sales", "stock", "inventory"] as const

function pathnameToView(pathname: string): ViewKey | null {
  if (pathname === "/") return "home"
  return null
}

export function AppSidebar({ value: valueProp, cartQuantity = 0, onChange, onAdd }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isAnalyticPage = pathname === "/analytic"

  const effectiveValue = valueProp ?? pathnameToView(pathname) ?? "home"

  const isCartAction = effectiveValue === "sales"
  const actionLabel = isCartAction ? "Buka keranjang" : "Tambah catatan"

  const handleNav = (key: ViewKey) => {
    if (onChange) {
      onChange(key)
    } else {
      router.push(key === "home" ? "/" : `/${key}`)
    }
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-orange-600 text-xs font-bold text-white">
            P
          </div>
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            Pempek Kasir
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {onAdd ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  data-cart-target
                  tooltip={actionLabel}
                  onClick={onAdd}
                  className="relative mb-1 bg-orange-600 text-white hover:bg-orange-700 hover:text-white active:bg-orange-800"
                >
                  <span className="relative">
                    {isCartAction ? <ShoppingCartIcon className="size-4" /> : <PlusIcon className="size-4" />}
                    {isCartAction && cartQuantity > 0 && (
                      <span className="absolute -right-2 -top-2 grid min-w-4 place-items-center rounded-full bg-slate-950 px-1 text-[10px] font-bold leading-4 text-white">
                        {cartQuantity}
                      </span>
                    )}
                  </span>
                  <span>{actionLabel}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarSeparator className="mx-0 mb-1" />
            </>
          ) : null}
          {navItems.map((key) => {
            const config = viewConfigs[key]
            const isActive = !isAnalyticPage && (valueProp !== undefined ? valueProp === key : key === "home")
            return (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={config.label}
                  onClick={() => handleNav(key)}
                >
                  {config.icon}
                  <span>{config.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
          <SidebarSeparator className="mx-0 mt-1 mb-1" />
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isAnalyticPage}
              tooltip="Analisis"
              onClick={() => router.push("/analytic")}
            >
              <BarChart3Icon className="size-4" />
              <span>Analisis</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
