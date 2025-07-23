import { Link } from "react-router-dom";
import { Settings, Building2, ChevronRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function UserProfileSection() {
  const { user, refreshUserInfo } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  if (!user) return null;

  const handleRefreshUserInfo = async () => {
    try {
      setIsRefreshing(true);
      await refreshUserInfo();
      toast.success("User information refreshed!");
    } catch (error) {
      console.error("Failed to refresh user info:", error);
      toast.error("Failed to refresh user information");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get responsibility center from either property name (API uses responsibilityCenter, our old code used responsibilityCentre)
  const responsibilityCenter =
    user.responsibilityCenter || user.responsibilityCentre;

  return (
    <motion.div
      className={cn(
        "mx-3 my-4",
        isMobile ? "mx-2 my-3" : "mx-3 my-4"
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Professional profile card with glass morphism effects */}
      <div className="bg-background/10 backdrop-blur-xl rounded-xl border border-border/30 shadow-lg overflow-hidden supports-[backdrop-filter]:bg-background/5">
        {/* User avatar and basic info */}
        <div className={cn(
          "p-4 pb-3",
          isMobile ? "p-3 pb-2" : "p-4 pb-3"
        )}>
          <div className="flex items-center space-x-3">
            <motion.div
              className="relative flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className={cn(
                "rounded-xl overflow-hidden bg-primary ring-2 ring-primary/40 shadow-md",
                isMobile ? "h-10 w-10" : "h-12 w-12"
              )}>
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className={cn(
                    "h-full w-full flex items-center justify-center text-primary-foreground font-bold",
                    isMobile ? "text-base" : "text-lg"
                  )}>
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <motion.div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full border-2 border-background/50 shadow-sm",
                  isMobile ? "h-2.5 w-2.5" : "h-3 w-3"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.2, type: "spring" }}
              />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-foreground font-semibold truncate",
                isMobile ? "text-sm" : "text-sm"
              )}>
                {user.username || "User"}
              </h3>
              <div className="mt-1">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md font-medium bg-primary/80 text-primary-foreground border border-primary/50 shadow-sm backdrop-blur-sm",
                  isMobile ? "text-xs" : "text-xs"
                )}>
                  {user.role || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional responsibility centre section */}
        <div className={cn(
          "px-4 py-3 bg-background/5 backdrop-blur-sm border-t border-border/30",
          isMobile ? "px-3 py-2" : "px-4 py-3"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="flex-shrink-0">
                <div className={cn(
                  "p-1.5 rounded-lg bg-primary/20 border border-primary/40 backdrop-blur-sm",
                  isMobile ? "p-1" : "p-1.5"
                )}>
                  <Building2 className={cn(
                    "text-primary",
                    isMobile ? "h-3 w-3" : "h-3.5 w-3.5"
                  )} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className={cn(
                    "font-medium text-muted-foreground/80 mb-0.5",
                    isMobile ? "text-xs" : "text-xs"
                  )}>
                    {t("navigation.responsibilityCenter")}
                  </p>
                  <button
                    onClick={handleRefreshUserInfo}
                    disabled={isRefreshing}
                    className={cn(
                      "text-muted-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-accent/50",
                      isMobile ? "p-0.5" : "p-1"
                    )}
                    title="Refresh user information"
                  >
                    <RefreshCw
                      className={cn(
                        isRefreshing ? "animate-spin" : "",
                        isMobile ? "h-2.5 w-2.5" : "h-3 w-3"
                      )}
                    />
                  </button>
                </div>
                <p className={cn(
                  "text-foreground font-medium truncate",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {responsibilityCenter ? (
                    responsibilityCenter.descr || responsibilityCenter.code
                  ) : (
                    <span className="text-muted-foreground/80 font-normal">
                      {t("navigation.notAssigned")}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {responsibilityCenter && (
              <div className="flex-shrink-0 ml-2">
                <div className={cn(
                  "rounded-full bg-green-500 shadow-sm",
                  isMobile ? "w-1.5 h-1.5" : "w-2 h-2"
                )}></div>
              </div>
            )}
          </div>
        </div>

        {/* Professional manage account link */}
        {/* <div className="p-2">
          <Link
            to="/profile"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 group backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2">
              <Settings className="h-3.5 w-3.5" />
              <span>{t("navigation.manageAccount")}</span>
            </div>
            <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        </div> */}
      </div>

      {/* Professional center info card */}
      {/* {responsibilityCenter && (
        <motion.div
          className="mt-3 p-3 bg-background/10 backdrop-blur-xl rounded-lg border border-border/30 supports-[backdrop-filter]:bg-background/5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground/80 font-medium">
                {t("navigation.centerCode")}
              </p>
              <p className="text-sm text-foreground font-mono">
                {responsibilityCenter.code}
              </p>
            </div>
            <div className="text-right">
              <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center backdrop-blur-sm">
                <Building2 className="h-3 w-3 text-primary" />
              </div>
            </div>
          </div>
        </motion.div>
      )} */}
    </motion.div>
  );
}
