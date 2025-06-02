import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
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

// Predefined background options (same as in Settings)
const backgroundOptions = [
  {
    id: "default",
    name: "Default",
    url: "https://www.tigernix.com/wp-content/uploads/2024/01/why-singapore-needs-automation-erp-tigernix-singapore.jpg",
  },
  {
    id: "modern-office",
    name: "Modern Office",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop",
  },
  {
    id: "tech-abstract",
    name: "Tech Abstract",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop",
  },
  {
    id: "minimal-gradient",
    name: "Minimal Gradient",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop",
  },
];

export function Layout() {
  const isMobile = useIsMobile();
  const { theme } = useSettings();
  const [backgroundUrl, setBackgroundUrl] = useState("");

  // Get the selected background from localStorage
  useEffect(() => {
    const selectedBackgroundId =
      localStorage.getItem("selectedBackground") || "default";
    const selectedBackground = backgroundOptions.find(
      (bg) => bg.id === selectedBackgroundId
    );

    if (selectedBackground) {
      setBackgroundUrl(selectedBackground.url);
    }
  }, []);

  // Listen for background changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedBackground") {
        const newBackgroundId = e.newValue || "default";
        const newBackground = backgroundOptions.find(
          (bg) => bg.id === newBackgroundId
        );
        if (newBackground) {
          setBackgroundUrl(newBackground.url);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <SidebarProvider>
      <div
        className="min-h-screen w-full flex flex-col bg-background text-foreground"
        style={{
          backgroundImage: backgroundUrl
            ? `url('${backgroundUrl}')`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Dark overlay for background */}
        <div
          className={`absolute inset-0 ${
            theme === "dark" ? "bg-[#070b28]/95" : "bg-slate-100/85"
          } z-0`}
        ></div>

        {/* Main layout structure - z-10 to appear above the overlay */}
        <div className="relative flex h-screen overflow-hidden z-10">
          {/* Sidebar - hidden on mobile unless triggered */}
          <aside
            className={`h-full ${
              isMobile ? "hidden" : "w-64 flex-shrink-0"
            } border-r border-blue-900/30 transition-all duration-200 z-20`}
          >
            <SidebarNav />
          </aside>

          {/* Main content area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top navbar */}
            <header
              className={`${
                isMobile ? "bg-[#0a1033]" : "bg-[#0a1033]/90"
              } backdrop-blur-lg border-b border-blue-900/30 z-30`}
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
                  theme === "dark" ? "bg-[#0f1642]/95" : "bg-white/95"
                } h-full rounded-xl border border-blue-900/30 shadow-lg overflow-auto`}
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
