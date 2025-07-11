import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { MainNavbar } from "@/components/navigation/MainNavbar";
import { SidebarNav } from "@/components/navigation/SidebarNav";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile, getIsMobile } from "@/hooks/use-mobile";
import { useSettings } from "@/context/SettingsContext";
import ConnectionStatusIndicator from "@/components/shared/ConnectionStatusIndicator";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTheme } from "@/context/ThemeContext";

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
    id: "minimal-gradient",
    name: "Minimal Gradient",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop",
  },
];

export function Layout() {
  // Safely detect mobile with multiple fallbacks
  let isMobile: boolean;
  try {
    isMobile = useIsMobile();
  } catch (error) {
    console.warn("useIsMobile hook failed, using fallback:", error);
    try {
      isMobile = getIsMobile();
    } catch (fallbackError) {
      console.warn("getIsMobile fallback also failed:", fallbackError);
      isMobile = false; // Ultimate fallback
    }
  }

  const { theme } = useSettings();
  const { theme: themeConfig } = useTheme();
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

    // Also listen for manual updates (same-window changes)
    const handleCustomEvent = () => {
      const selectedBackgroundId =
        localStorage.getItem("selectedBackground") || "default";
      const selectedBackground = backgroundOptions.find(
        (bg) => bg.id === selectedBackgroundId
      );
      if (selectedBackground) {
        setBackgroundUrl(selectedBackground.url);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("backgroundChanged", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("backgroundChanged", handleCustomEvent);
    };
  }, []);

  // Use Standard theme styling but allow background images
  const isStandardTheme = themeConfig.variant === "standard";

  return (
    <SidebarProvider>
      <div
        className="flex-1 min-h-full w-full flex text-foreground bg-background"
        style={{
          backgroundImage: backgroundUrl
            ? `url('${backgroundUrl}')`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: isMobile ? "scroll" : "fixed", // Better mobile performance
          minHeight: "100vh",
          height: "100%",
        }}
      >
        {/* Light overlay for better readability */}
        <div className="absolute inset-0 bg-background/20 pointer-events-none"></div>

        {/* Main layout structure - elevated above overlay */}
        <div className="relative flex w-full min-h-full">
          {/* Sidebar - responsive with mobile overlay */}
          <SidebarNav />

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-full min-w-0">
            {/* Responsive header */}
            <header
              className={`${
                isStandardTheme
                  ? "glass-header"
                  : "bg-card/15 backdrop-blur-xl border-b border-border"
              } shadow-sm transition-all duration-300 relative z-40`}
              style={{
                height: isMobile ? "3.5rem" : "4rem",
                flexShrink: 0,
              }}
            >
              <div className="flex items-center h-full px-3 sm:px-4 lg:px-6">
                {isMobile && (
                  <SidebarTrigger className="p-2 mr-2 sm:mr-4 hover:bg-accent rounded-md transition-colors flex-shrink-0" />
                )}

                {/* Main navbar content - responsive */}
                <div className="flex-1 min-w-0">
                  <MainNavbar />
                </div>

                {/* Right side items with responsive spacing */}
                <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 ml-2 sm:ml-4 flex-shrink-0">
                  <ConnectionStatusIndicator showRetryButton />
                </div>
              </div>
            </header>

            {/* Main content with responsive padding */}
            <main
              className="flex-1 overflow-hidden relative"
              style={{
                minHeight: isMobile
                  ? "calc(100vh - 3.5rem)"
                  : "calc(100vh - 4rem)",
              }}
            >
              <div
                className={`h-full rounded-lg overflow-auto ${
                  isStandardTheme
                    ? "glass-card"
                    : "border border-border bg-card/85"
                } shadow-lg transition-all duration-300 relative`}
                style={{ minHeight: "100%" }}
              >
                <div className="h-full overflow-hidden p-2 relative">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
