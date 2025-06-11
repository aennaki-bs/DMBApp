import { Link } from "react-router-dom";
import { Settings, Building2, ChevronRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export function UserProfileSection() {
  const { user, refreshUserInfo } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useTranslation();

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
      className="mx-3 my-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Main Profile Card */}
      <div className="bg-gradient-to-br from-[#1a2570] to-[#0f1642] rounded-xl border border-blue-800/30 shadow-lg overflow-hidden">
        {/* User Avatar and Basic Info */}
        <div className="p-4 pb-3">
          <div className="flex items-center space-x-3">
            <motion.div
              className="relative flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 ring-2 ring-blue-500/40 shadow-md">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white text-lg font-bold">
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 bg-green-500 h-3 w-3 rounded-full border-2 border-[#1a2570] shadow-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.2, type: "spring" }}
              />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">
                {user.username || "User"}
              </h3>
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {user.role || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsibility Centre Section */}
        <div className="px-4 py-3 bg-[#0a1033]/40 border-t border-blue-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="flex-shrink-0">
                <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Building2 className="h-3.5 w-3.5 text-blue-400" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-blue-400 mb-0.5">
                    {t("navigation.responsibilityCenter")}
                  </p>
                  <button
                    onClick={handleRefreshUserInfo}
                    disabled={isRefreshing}
                    className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded-md hover:bg-blue-500/10"
                    title="Refresh user information"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-white font-medium truncate">
                  {responsibilityCenter ? (
                    responsibilityCenter.descr || responsibilityCenter.code
                  ) : (
                    <span className="text-blue-300/70 font-normal">
                      {t("navigation.notAssigned")}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {responsibilityCenter && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm"></div>
              </div>
            )}
          </div>
        </div>

        {/* Manage Account Link */}
        <div className="p-2">
          <Link
            to="/profile"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-blue-300 hover:text-white hover:bg-blue-600/20 rounded-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-2">
              <Settings className="h-3.5 w-3.5" />
              <span>{t("navigation.manageAccount")}</span>
            </div>
            <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        </div>
      </div>

      {/* Optional: Quick Stats or Additional Info Card */}
      {responsibilityCenter && (
        <motion.div
          className="mt-3 p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-400 font-medium">{t("navigation.centerCode")}</p>
              <p className="text-sm text-white font-mono">
                {responsibilityCenter.code}
              </p>
            </div>
            <div className="text-right">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Building2 className="h-3 w-3 text-blue-400" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
