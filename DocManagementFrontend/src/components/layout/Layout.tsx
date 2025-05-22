import { Outlet } from "react-router-dom";
import { MainNavbar } from "@/components/navigation/MainNavbar";
import { SidebarNav } from "@/components/navigation/SidebarNav";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettings } from "@/context/SettingsContext";
import ConnectionStatusIndicator from "@/components/shared/ConnectionStatusIndicator";

export function Layout() {
  const isMobile = useIsMobile();
  const { theme } = useSettings();

  return (
    <SidebarProvider>
      <div
        className="min-h-screen w-full flex flex-col bg-background text-foreground"
        style={{
          backgroundImage:
            "url('https://www.tigernix.com/wp-content/uploads/2024/01/why-singapore-needs-automation-erp-tigernix-singapore.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Dark overlay for background */}
        <div
          className={`absolute inset-0 ${
            theme === "dark" ? "bg-[#070b28]/90" : "bg-slate-100/80"
          } z-0`}
        ></div>

        {/* Main layout structure - z-10 to appear above the overlay */}
        <div className="relative flex h-screen overflow-hidden z-10">
          {/* Sidebar - hidden on mobile unless triggered */}
          <aside
            className={`h-full ${
              isMobile ? "hidden" : "w-64 flex-shrink-0"
            } border-r border-border transition-all duration-200 z-20`}
          >
            <SidebarNav />
          </aside>

          {/* Main content area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top navbar */}
            <header
              className={`${
                isMobile ? "bg-background" : "bg-background/90"
              } backdrop-blur-lg border-b border-border z-30`}
            >
              <div className="flex items-center">
                {isMobile && <SidebarTrigger className="p-2" />}
                <MainNavbar />

                {/* Connection status indicator */}
                <div className="ml-auto mr-4">
                  <ConnectionStatusIndicator showRetryButton />
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-4">
              <div
                className={`${
                  theme === "dark" ? "bg-[#111633]/95" : "bg-white/95"
                } h-full rounded-xl border border-border shadow-lg overflow-auto`}
              >
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
