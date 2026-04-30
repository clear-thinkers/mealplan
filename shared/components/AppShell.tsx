"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Home,
  ListChecks,
  NotebookTabs,
  Settings,
  ShoppingBasket,
  SlidersHorizontal,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"

const primaryNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/recipes", label: "Recipes", icon: NotebookTabs },
  { href: "/meal-plan", label: "Meal plan", icon: CalendarDays },
  { href: "/shopping", label: "Shopping", icon: ShoppingBasket },
  { href: "/log", label: "Log", icon: ClipboardList },
  { href: "/preferences", label: "Preferences", icon: SlidersHorizontal },
  { href: "/reports/monthly", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/recipes", label: "Recipes", icon: NotebookTabs },
  { href: "/meal-plan", label: "Plan", icon: CalendarDays },
  { href: "/shopping", label: "Shop", icon: ShoppingBasket },
  { href: "/log", label: "Log", icon: ListChecks },
]

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-cream text-text-dark">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border bg-green-dark px-4 py-5 text-cream md:block">
        <Link href="/dashboard" className="block rounded-[10px] px-2 py-1">
          <p className="text-[10px] font-normal tracking-[0.06em] text-green-muted">
            Family kitchen
          </p>
          <h1 className="mt-1 text-[19px] font-semibold text-cream">
            Diet planning
          </h1>
        </Link>

        <nav className="mt-8 space-y-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon
            const active = isActivePath(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] font-normal text-green-muted transition-colors",
                  active && "bg-green-mid font-semibold text-cream",
                  !active && "hover:bg-green-light/30 hover:text-cream"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="min-h-screen pb-20 md:pl-64">
        <div className="mx-auto w-full max-w-6xl px-[14px] py-4 md:px-8 md:py-7">
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-sidebar-border bg-green-dark px-1 py-1.5 text-cream md:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-[10px] px-1 py-1.5 text-[10px] font-normal text-green-muted",
                active && "bg-green-mid font-semibold text-cream"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
