import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { HomeSidebar } from "@/components/home-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <HomeSidebar />
      <main>
        <SidebarTrigger className="text-white" />
        {children}
      </main>
    </SidebarProvider>
  )
}