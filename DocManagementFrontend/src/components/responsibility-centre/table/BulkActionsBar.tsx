import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Trash2,
  X,
  Check,
  Info,
  Users,
  FileText,
} from "lucide-react";
import { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClearSelection?: () => void;
  totalCount?: number;
  itemName?: string;
  icon?: ReactNode;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onClearSelection,
  totalCount,
  itemName = "centre",
  icon,
}: BulkActionsBarProps) {
  const { theme } = useTheme();
  const selectionPercentage = totalCount
    ? (selectedCount / totalCount) * 100
    : 0;

  // Get theme-specific colors
  const getThemeColors = () => {
    const themeVariant = theme.variant;
    const isDark = theme.mode === "dark";

    switch (themeVariant) {
      case "ocean-blue":
        return {
          gradient: isDark
            ? "linear-gradient(90deg, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%)"
            : "linear-gradient(90deg, rgba(59, 130, 246, 0.95) 0%, rgba(96, 165, 250, 0.95) 100%)",
          border: isDark
            ? "rgba(96, 165, 250, 0.6)"
            : "rgba(59, 130, 246, 0.6)",
          text: isDark ? "rgb(191, 219, 254)" : "rgb(30, 58, 138)",
          textAccent: isDark ? "rgb(219, 234, 254)" : "rgb(59, 130, 246)",
          buttonBg: isDark
            ? "rgba(30, 64, 175, 0.4)"
            : "rgba(59, 130, 246, 0.4)",
          buttonBgHover: isDark
            ? "rgba(30, 64, 175, 0.6)"
            : "rgba(59, 130, 246, 0.6)",
          buttonBorder: isDark
            ? "rgba(96, 165, 250, 0.4)"
            : "rgba(59, 130, 246, 0.4)",
          buttonBorderHover: isDark
            ? "rgba(147, 197, 253, 0.6)"
            : "rgba(96, 165, 250, 0.6)",
          buttonText: isDark ? "rgb(191, 219, 254)" : "rgb(30, 58, 138)",
          progressColors: ["#3b82f6", "#60a5fa", "#93c5fd"],
        };

      case "emerald-green":
        return {
          gradient: isDark
            ? "linear-gradient(90deg, rgba(6, 78, 59, 0.95) 0%, rgba(6, 95, 70, 0.95) 100%)"
            : "linear-gradient(90deg, rgba(5, 150, 105, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)",
          border: isDark
            ? "rgba(52, 211, 153, 0.6)"
            : "rgba(16, 185, 129, 0.6)",
          text: isDark ? "rgb(167, 243, 208)" : "rgb(6, 78, 59)",
          textAccent: isDark ? "rgb(209, 250, 229)" : "rgb(5, 150, 105)",
          buttonBg: isDark
            ? "rgba(5, 150, 105, 0.4)"
            : "rgba(16, 185, 129, 0.4)",
          buttonBgHover: isDark
            ? "rgba(5, 150, 105, 0.6)"
            : "rgba(16, 185, 129, 0.6)",
          buttonBorder: isDark
            ? "rgba(16, 185, 129, 0.4)"
            : "rgba(52, 211, 153, 0.4)",
          buttonBorderHover: isDark
            ? "rgba(52, 211, 153, 0.6)"
            : "rgba(110, 231, 183, 0.6)",
          buttonText: isDark ? "rgb(167, 243, 208)" : "rgb(6, 78, 59)",
          progressColors: ["#059669", "#10b981", "#34d399"],
        };

      case "purple-haze":
        return {
          gradient: isDark
            ? "linear-gradient(90deg, rgba(59, 7, 100, 0.95) 0%, rgba(88, 28, 135, 0.95) 100%)"
            : "linear-gradient(90deg, rgba(107, 33, 168, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%)",
          border: isDark
            ? "rgba(196, 181, 253, 0.6)"
            : "rgba(124, 58, 237, 0.6)",
          text: isDark ? "rgb(221, 214, 254)" : "rgb(59, 7, 100)",
          textAccent: isDark ? "rgb(237, 233, 254)" : "rgb(107, 33, 168)",
          buttonBg: isDark
            ? "rgba(107, 33, 168, 0.4)"
            : "rgba(124, 58, 237, 0.4)",
          buttonBgHover: isDark
            ? "rgba(107, 33, 168, 0.6)"
            : "rgba(124, 58, 237, 0.6)",
          buttonBorder: isDark
            ? "rgba(168, 85, 247, 0.4)"
            : "rgba(147, 51, 234, 0.4)",
          buttonBorderHover: isDark
            ? "rgba(196, 181, 253, 0.6)"
            : "rgba(168, 85, 247, 0.6)",
          buttonText: isDark ? "rgb(221, 214, 254)" : "rgb(59, 7, 100)",
          progressColors: ["#8b5cf6", "#a78bfa", "#c4b5fd"],
        };

      case "orange-sunset":
        return {
          gradient: isDark
            ? "linear-gradient(90deg, rgba(154, 52, 18, 0.95) 0%, rgba(194, 65, 12, 0.95) 100%)"
            : "linear-gradient(90deg, rgba(234, 88, 12, 0.95) 0%, rgba(251, 146, 60, 0.95) 100%)",
          border: isDark ? "rgba(251, 146, 60, 0.6)" : "rgba(234, 88, 12, 0.6)",
          text: isDark ? "rgb(254, 215, 170)" : "rgb(124, 45, 18)",
          textAccent: isDark ? "rgb(255, 237, 213)" : "rgb(194, 65, 12)",
          buttonBg: isDark
            ? "rgba(194, 65, 12, 0.4)"
            : "rgba(234, 88, 12, 0.4)",
          buttonBgHover: isDark
            ? "rgba(194, 65, 12, 0.6)"
            : "rgba(234, 88, 12, 0.6)",
          buttonBorder: isDark
            ? "rgba(251, 146, 60, 0.4)"
            : "rgba(249, 115, 22, 0.4)",
          buttonBorderHover: isDark
            ? "rgba(253, 186, 116, 0.6)"
            : "rgba(251, 146, 60, 0.6)",
          buttonText: isDark ? "rgb(254, 215, 170)" : "rgb(124, 45, 18)",
          progressColors: ["#ea580c", "#fb923c", "#fdba74"],
        };

      case "dark-neutral":
        return {
          gradient: isDark
            ? "linear-gradient(90deg, rgba(23, 23, 23, 0.95) 0%, rgba(38, 38, 38, 0.95) 100%)"
            : "linear-gradient(90deg, rgba(64, 64, 64, 0.95) 0%, rgba(115, 115, 115, 0.95) 100%)",
          border: isDark ? "rgba(115, 115, 115, 0.6)" : "rgba(64, 64, 64, 0.6)",
          text: isDark ? "rgb(212, 212, 212)" : "rgb(23, 23, 23)",
          textAccent: isDark ? "rgb(245, 245, 245)" : "rgb(38, 38, 38)",
          buttonBg: isDark
            ? "rgba(64, 64, 64, 0.4)"
            : "rgba(115, 115, 115, 0.4)",
          buttonBgHover: isDark
            ? "rgba(64, 64, 64, 0.6)"
            : "rgba(115, 115, 115, 0.6)",
          buttonBorder: isDark
            ? "rgba(115, 115, 115, 0.4)"
            : "rgba(163, 163, 163, 0.4)",
          buttonBorderHover: isDark
            ? "rgba(163, 163, 163, 0.6)"
            : "rgba(212, 212, 212, 0.6)",
          buttonText: isDark ? "rgb(212, 212, 212)" : "rgb(23, 23, 23)",
          progressColors: ["#404040", "#737373", "#a3a3a3"],
        };

      default: // standard theme
        return {
          gradient: isDark
            ? "linear-gradient(90deg, rgba(4, 7, 20, 0.95) 0%, rgba(18, 34, 89, 0.95) 100%)"
            : "linear-gradient(90deg, rgba(59, 130, 246, 0.95) 0%, rgba(96, 165, 250, 0.95) 100%)",
          border: isDark
            ? "rgba(96, 165, 250, 0.6)"
            : "rgba(59, 130, 246, 0.6)",
          text: isDark ? "rgb(219, 234, 254)" : "rgb(30, 58, 138)",
          textAccent: isDark ? "rgb(239, 246, 255)" : "rgb(59, 130, 246)",
          buttonBg: isDark
            ? "rgba(30, 64, 175, 0.4)"
            : "rgba(59, 130, 246, 0.4)",
          buttonBgHover: isDark
            ? "rgba(30, 64, 175, 0.6)"
            : "rgba(59, 130, 246, 0.6)",
          buttonBorder: isDark
            ? "rgba(96, 165, 250, 0.4)"
            : "rgba(59, 130, 246, 0.4)",
          buttonBorderHover: isDark
            ? "rgba(147, 197, 253, 0.6)"
            : "rgba(96, 165, 250, 0.6)",
          buttonText: isDark ? "rgb(219, 234, 254)" : "rgb(30, 58, 138)",
          progressColors: ["#3b82f6", "#60a5fa", "#93c5fd"],
        };
    }
  };

  const colors = getThemeColors();

  return createPortal(
    <motion.div
      initial={{ y: 80, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.6,
      }}
      className="fixed bottom-0 left-0 right-0 z-[9999] p-2"
      style={{
        // Use CSS variables for theme-aware backdrop
        background: "var(--bulk-actions-backdrop, rgba(0, 0, 0, 0.15))",
      }}
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm pointer-events-none" />

      {/* Main content container - compact and centered */}
      <div className="relative flex justify-center items-end">
        <div
          className="backdrop-blur-xl shadow-lg rounded-lg border overflow-hidden w-fit"
          style={{
            background: colors.gradient,
            borderColor: colors.border,
            boxShadow: `0 10px 25px -5px ${colors.border}40, 0 4px 6px -2px ${colors.border}20`,
          }}
        >
          {/* Thin animated top border with theme colors */}
          <div className="h-0.5 bg-gradient-to-r from-transparent to-transparent relative overflow-hidden">
            <motion.div
              className="h-full"
              style={{
                background: `linear-gradient(90deg, ${colors.progressColors[0]}, ${colors.progressColors[1]}, ${colors.progressColors[2]})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(selectionPercentage, 100)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* Compact content with theme-aware styling */}
          <div className="p-3 px-4">
            <div className="flex items-center gap-4">
              {/* Left section - compact selection info */}
              <div className="flex items-center gap-3">
                {/* Smaller icon with theme gradient */}
                <div className="relative flex-shrink-0">
                  <div
                    className="p-2 rounded-lg shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${colors.progressColors[0]}, ${colors.progressColors[1]})`,
                    }}
                  >
                    {icon || <Building2 className="w-4 h-4 text-white" />}
                  </div>
                </div>

                {/* Compact selection text with theme colors */}
                <div className="flex items-center gap-2">
                  <motion.span
                    className="font-bold text-base"
                    style={{ color: colors.textAccent }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 0.2 }}
                    key={selectedCount}
                  >
                    {selectedCount}
                  </motion.span>
                  <span
                    className="font-medium text-sm"
                    style={{ color: colors.text }}
                  >
                    {selectedCount === 1
                      ? itemName.charAt(0).toUpperCase() + itemName.slice(1)
                      : itemName.charAt(0).toUpperCase() +
                        itemName.slice(1) +
                        "s"}{" "}
                    Selected
                  </span>
                  {totalCount && (
                    <span
                      className="text-xs"
                      style={{ color: colors.text, opacity: 0.8 }}
                    >
                      ({selectionPercentage.toFixed(0)}% of {totalCount})
                    </span>
                  )}
                </div>
              </div>

              {/* Separator with theme color */}
              <div
                className="w-px h-8"
                style={{ backgroundColor: colors.border }}
              ></div>

              {/* Stats chip - centered with theme styling */}
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border"
                style={{
                  backgroundColor: `${colors.progressColors[0]}30`,
                  borderColor: `${colors.progressColors[0]}60`,
                }}
              >
                <Users
                  className="w-3 h-3"
                  style={{ color: colors.progressColors[1] }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: colors.text }}
                >
                  {selectionPercentage.toFixed(0)}%
                </span>
              </div>

              {/* Another separator with theme color */}
              <div
                className="w-px h-8"
                style={{ backgroundColor: colors.border }}
              ></div>

              {/* Right section - compact actions with theme styling */}
              <div className="flex items-center gap-2">
                {onClearSelection && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 transition-all duration-200 text-xs font-medium backdrop-blur-sm border"
                    style={{
                      backgroundColor: colors.buttonBg,
                      borderColor: colors.buttonBorder,
                      color: colors.buttonText,
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.backgroundColor = colors.buttonBgHover;
                      target.style.borderColor = colors.buttonBorderHover;
                      target.style.color = colors.textAccent;
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.backgroundColor = colors.buttonBg;
                      target.style.borderColor = colors.buttonBorder;
                      target.style.color = colors.buttonText;
                    }}
                    onClick={onClearSelection}
                  >
                    <X className="w-3 h-3 mr-1" />
                    <span>Clear</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 transition-all duration-200 text-xs font-medium backdrop-blur-sm border"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.3)",
                    borderColor: "rgba(239, 68, 68, 0.5)",
                    color:
                      theme.mode === "dark"
                        ? "rgb(254, 202, 202)"
                        : "rgb(127, 29, 29)",
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = "rgba(239, 68, 68, 0.5)";
                    target.style.borderColor = "rgba(248, 113, 113, 0.7)";
                    target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = "rgba(239, 68, 68, 0.3)";
                    target.style.borderColor = "rgba(239, 68, 68, 0.5)";
                    target.style.color =
                      theme.mode === "dark"
                        ? "rgb(254, 202, 202)"
                        : "rgb(127, 29, 29)";
                  }}
                  onClick={onDelete}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Subtle bottom accent with theme color */}
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${colors.progressColors[1]}60, transparent)`,
            }}
          />
        </div>
      </div>
    </motion.div>,
    document.body
  );
}
