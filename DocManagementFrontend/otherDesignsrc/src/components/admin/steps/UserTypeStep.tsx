import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Check, ShieldCheck } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "@/context/ThemeContext";

interface UserTypeStepProps {
  form: UseFormReturn<any>;
}

export function UserTypeStep({ form }: UserTypeStepProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Get theme colors
  const getThemeColors = () => {
    const themeVariant = theme.variant;
    const isDark = theme.mode === "dark";

    switch (themeVariant) {
      case "ocean-blue":
        return {
          personal: {
            bg: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
            border: isDark
              ? "rgba(59, 130, 246, 0.3)"
              : "rgba(59, 130, 246, 0.2)",
            selectedBg: isDark
              ? "rgba(59, 130, 246, 0.2)"
              : "rgba(59, 130, 246, 0.1)",
            selectedBorder: isDark
              ? "rgba(59, 130, 246, 0.6)"
              : "rgba(59, 130, 246, 0.4)",
            icon: isDark ? "#60a5fa" : "#3b82f6",
            text: isDark ? "rgb(219, 234, 254)" : "rgb(30, 58, 138)",
            textSecondary: isDark ? "rgb(147, 197, 253)" : "rgb(59, 130, 246)",
          },
          company: {
            bg: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
            border: isDark
              ? "rgba(16, 185, 129, 0.3)"
              : "rgba(16, 185, 129, 0.2)",
            selectedBg: isDark
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(16, 185, 129, 0.1)",
            selectedBorder: isDark
              ? "rgba(16, 185, 129, 0.6)"
              : "rgba(16, 185, 129, 0.4)",
            icon: isDark ? "#34d399" : "#10b981",
            text: isDark ? "rgb(209, 250, 229)" : "rgb(6, 78, 59)",
            textSecondary: isDark ? "rgb(167, 243, 208)" : "rgb(5, 150, 105)",
          },
        };

      case "emerald-green":
        return {
          personal: {
            bg: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
            border: isDark
              ? "rgba(59, 130, 246, 0.3)"
              : "rgba(59, 130, 246, 0.2)",
            selectedBg: isDark
              ? "rgba(59, 130, 246, 0.2)"
              : "rgba(59, 130, 246, 0.1)",
            selectedBorder: isDark
              ? "rgba(59, 130, 246, 0.6)"
              : "rgba(59, 130, 246, 0.4)",
            icon: isDark ? "#60a5fa" : "#3b82f6",
            text: isDark ? "rgb(209, 250, 229)" : "rgb(6, 78, 59)",
            textSecondary: isDark ? "rgb(167, 243, 208)" : "rgb(5, 150, 105)",
          },
          company: {
            bg: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
            border: isDark
              ? "rgba(16, 185, 129, 0.3)"
              : "rgba(16, 185, 129, 0.2)",
            selectedBg: isDark
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(16, 185, 129, 0.1)",
            selectedBorder: isDark
              ? "rgba(16, 185, 129, 0.6)"
              : "rgba(16, 185, 129, 0.4)",
            icon: isDark ? "#34d399" : "#10b981",
            text: isDark ? "rgb(209, 250, 229)" : "rgb(6, 78, 59)",
            textSecondary: isDark ? "rgb(167, 243, 208)" : "rgb(5, 150, 105)",
          },
        };

      case "purple-haze":
        return {
          personal: {
            bg: isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.05)",
            border: isDark
              ? "rgba(139, 92, 246, 0.3)"
              : "rgba(139, 92, 246, 0.2)",
            selectedBg: isDark
              ? "rgba(139, 92, 246, 0.2)"
              : "rgba(139, 92, 246, 0.1)",
            selectedBorder: isDark
              ? "rgba(139, 92, 246, 0.6)"
              : "rgba(139, 92, 246, 0.4)",
            icon: isDark ? "#a78bfa" : "#8b5cf6",
            text: isDark ? "rgb(237, 233, 254)" : "rgb(59, 7, 100)",
            textSecondary: isDark ? "rgb(221, 214, 254)" : "rgb(107, 33, 168)",
          },
          company: {
            bg: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
            border: isDark
              ? "rgba(16, 185, 129, 0.3)"
              : "rgba(16, 185, 129, 0.2)",
            selectedBg: isDark
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(16, 185, 129, 0.1)",
            selectedBorder: isDark
              ? "rgba(16, 185, 129, 0.6)"
              : "rgba(16, 185, 129, 0.4)",
            icon: isDark ? "#34d399" : "#10b981",
            text: isDark ? "rgb(209, 250, 229)" : "rgb(6, 78, 59)",
            textSecondary: isDark ? "rgb(167, 243, 208)" : "rgb(5, 150, 105)",
          },
        };

      case "orange-sunset":
        return {
          personal: {
            bg: isDark ? "rgba(251, 146, 60, 0.1)" : "rgba(251, 146, 60, 0.05)",
            border: isDark
              ? "rgba(251, 146, 60, 0.3)"
              : "rgba(251, 146, 60, 0.2)",
            selectedBg: isDark
              ? "rgba(251, 146, 60, 0.2)"
              : "rgba(251, 146, 60, 0.1)",
            selectedBorder: isDark
              ? "rgba(251, 146, 60, 0.6)"
              : "rgba(251, 146, 60, 0.4)",
            icon: isDark ? "#fdba74" : "#fb923c",
            text: isDark ? "rgb(255, 237, 213)" : "rgb(124, 45, 18)",
            textSecondary: isDark ? "rgb(254, 215, 170)" : "rgb(194, 65, 12)",
          },
          company: {
            bg: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
            border: isDark
              ? "rgba(16, 185, 129, 0.3)"
              : "rgba(16, 185, 129, 0.2)",
            selectedBg: isDark
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(16, 185, 129, 0.1)",
            selectedBorder: isDark
              ? "rgba(16, 185, 129, 0.6)"
              : "rgba(16, 185, 129, 0.4)",
            icon: isDark ? "#34d399" : "#10b981",
            text: isDark ? "rgb(209, 250, 229)" : "rgb(6, 78, 59)",
            textSecondary: isDark ? "rgb(167, 243, 208)" : "rgb(5, 150, 105)",
          },
        };

      case "dark-neutral":
        return {
          personal: {
            bg: isDark
              ? "rgba(115, 115, 115, 0.1)"
              : "rgba(115, 115, 115, 0.05)",
            border: isDark
              ? "rgba(115, 115, 115, 0.3)"
              : "rgba(115, 115, 115, 0.2)",
            selectedBg: isDark
              ? "rgba(115, 115, 115, 0.2)"
              : "rgba(115, 115, 115, 0.1)",
            selectedBorder: isDark
              ? "rgba(115, 115, 115, 0.6)"
              : "rgba(115, 115, 115, 0.4)",
            icon: isDark ? "#a3a3a3" : "#737373",
            text: isDark ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)",
            textSecondary: isDark ? "rgb(212, 212, 212)" : "rgb(38, 38, 38)",
          },
          company: {
            bg: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
            border: isDark
              ? "rgba(16, 185, 129, 0.3)"
              : "rgba(16, 185, 129, 0.2)",
            selectedBg: isDark
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(16, 185, 129, 0.1)",
            selectedBorder: isDark
              ? "rgba(16, 185, 129, 0.6)"
              : "rgba(16, 185, 129, 0.4)",
            icon: isDark ? "#34d399" : "#10b981",
            text: isDark ? "rgb(209, 250, 229)" : "rgb(6, 78, 59)",
            textSecondary: isDark ? "rgb(167, 243, 208)" : "rgb(5, 150, 105)",
          },
        };

      default: // standard theme
        return {
          personal: {
            bg: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
            border: isDark
              ? "rgba(59, 130, 246, 0.3)"
              : "rgba(59, 130, 246, 0.2)",
            selectedBg: isDark
              ? "rgba(59, 130, 246, 0.2)"
              : "rgba(59, 130, 246, 0.1)",
            selectedBorder: isDark
              ? "rgba(59, 130, 246, 0.6)"
              : "rgba(59, 130, 246, 0.4)",
            icon: isDark ? "#60a5fa" : "#3b82f6",
            text: isDark ? "rgb(219, 234, 254)" : "rgb(30, 58, 138)",
            textSecondary: isDark ? "rgb(147, 197, 253)" : "rgb(59, 130, 246)",
          },
          company: {
            bg: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
            border: isDark
              ? "rgba(16, 185, 129, 0.3)"
              : "rgba(16, 185, 129, 0.2)",
            selectedBg: isDark
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(16, 185, 129, 0.1)",
            selectedBorder: isDark
              ? "rgba(16, 185, 129, 0.6)"
              : "rgba(16, 185, 129, 0.4)",
            icon: isDark ? "#34d399" : "#10b981",
            text: isDark ? "rgb(209, 250, 229)" : "rgb(6, 78, 59)",
            textSecondary: isDark ? "rgb(167, 243, 208)" : "rgb(5, 150, 105)",
          },
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p
          className="text-base leading-relaxed"
          style={{ color: colors.personal.textSecondary }}
        >
          {t("userManagement.selectUserType")}
        </p>
      </motion.div>

      <FormField
        control={form.control}
        name="userType"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Personal User Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="group cursor-pointer border-2 rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
                  style={{
                    backgroundColor:
                      field.value === "simple"
                        ? colors.personal.selectedBg
                        : colors.personal.bg,
                    borderColor:
                      field.value === "simple"
                        ? colors.personal.selectedBorder
                        : colors.personal.border,
                  }}
                  onClick={() => field.onChange("simple")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="rounded-2xl p-4 transition-all duration-300"
                        style={{
                          backgroundColor:
                            field.value === "simple"
                              ? colors.personal.icon + "20"
                              : colors.personal.icon + "10",
                        }}
                        animate={{
                          scale: field.value === "simple" ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <User
                          className="h-8 w-8"
                          style={{ color: colors.personal.icon }}
                        />
                      </motion.div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className="text-xl font-bold"
                            style={{ color: colors.personal.text }}
                          >
                            {t("userManagement.personalUser")}
                          </h3>
                          <AnimatePresence>
                            {field.value === "simple" && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 500 }}
                                className="rounded-full p-1"
                                style={{
                                  backgroundColor: colors.personal.icon,
                                }}
                              >
                                <Check className="h-4 w-4 text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: colors.personal.textSecondary }}
                        >
                          {t("userManagement.personalUserDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Company Account Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="group cursor-pointer border-2 rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
                  style={{
                    backgroundColor:
                      field.value === "company"
                        ? colors.company.selectedBg
                        : colors.company.bg,
                    borderColor:
                      field.value === "company"
                        ? colors.company.selectedBorder
                        : colors.company.border,
                  }}
                  onClick={() => field.onChange("company")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="rounded-2xl p-4 transition-all duration-300"
                        style={{
                          backgroundColor:
                            field.value === "company"
                              ? colors.company.icon + "20"
                              : colors.company.icon + "10",
                        }}
                        animate={{
                          scale: field.value === "company" ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Building2
                          className="h-8 w-8"
                          style={{ color: colors.company.icon }}
                        />
                      </motion.div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className="text-xl font-bold"
                            style={{ color: colors.company.text }}
                          >
                            {t("userManagement.companyAccount")}
                          </h3>
                          <AnimatePresence>
                            {field.value === "company" && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 500 }}
                                className="rounded-full p-1"
                                style={{ backgroundColor: colors.company.icon }}
                              >
                                <Check className="h-4 w-4 text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: colors.company.textSecondary }}
                        >
                          {t("userManagement.companyAccountDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
