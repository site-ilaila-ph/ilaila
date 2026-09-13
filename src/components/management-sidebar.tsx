"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Route } from "next"
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  MessageSquareText,
  Store,
  Utensils,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { href: "/management", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/management/businesses", icon: Store, label: "Mga Negosyo" },
  { href: "/management/foods", icon: Utensils, label: "Mga Pagkain" },
  { href: "/management/reviews", icon: MessageSquareText, label: "Mga Review" },
  { href: "/management/users", icon: Users, label: "Mga Gumagamit" },
  { href: "/management/app-reviews", icon: ClipboardList, label: "Review ng App" },
] satisfies { href: Route; icon: React.ElementType; label: string }[]

export function ManagementSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/management" />}
            >
              <div className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
                <BarChart3 size={14} />
              </div>
              <span className="text-base font-semibold">Ilaila Admin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-xl bg-primary p-3 text-xs text-primary-foreground shadow-sm">
          <p className="font-semibold">Kailangan ng tulong?</p>
          <p className="mt-1 text-primary-foreground/80">Tingnan ang dokumentasyon</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}