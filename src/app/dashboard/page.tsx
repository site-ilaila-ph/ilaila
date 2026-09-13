import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <main className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iste doloribus enim ex voluptatem placeat tempore a dolorum excepturi! Culpa ex cumque nesciunt ducimus odit ad numquam delectus minima nisi voluptatum?
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
