import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Palette } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useThemeContext } from "@/context/ThemeContext";
import {
  type Theme,
  getThemeDisplayName,
  getThemeDescription,
} from "@/lib/themes";

const themeIcons = {
  light: Sun,
  dark: Moon,
  standard: Palette,
} as const;

const themeColors = {
  light: "from-amber-400 to-yellow-500",
  dark: "from-indigo-600 to-purple-600",
  standard: "from-blue-500 to-blue-600",
} as const;

const themeBorderColors = {
  light: "peer-checked:border-amber-500 peer-checked:bg-amber-500/5",
  dark: "peer-checked:border-indigo-500 peer-checked:bg-indigo-500/5",
  standard: "peer-checked:border-blue-500 peer-checked:bg-blue-500/5",
} as const;

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const { theme, setTheme } = useThemeContext();

  const themes: Theme[] = ["standard", "light", "dark"];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Theme Selection
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose your preferred interface theme
          </p>
        </div>

        <RadioGroup
          value={theme}
          onValueChange={handleThemeChange}
          className="space-y-3"
        >
          {themes.map((themeOption) => {
            const Icon = themeIcons[themeOption];
            const iconGradient = themeColors[themeOption];
            const borderColor = themeBorderColors[themeOption];

            return (
              <motion.div
                key={themeOption}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <RadioGroupItem
                  value={themeOption}
                  id={themeOption}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={themeOption}
                  className={`flex items-center gap-4 p-4 border-2 border-border rounded-xl cursor-pointer hover:border-primary/50 transition-all ${borderColor}`}
                >
                  <div
                    className={`p-3 rounded-full bg-gradient-to-r ${iconGradient}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-foreground font-semibold">
                      {getThemeDisplayName(themeOption)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getThemeDescription(themeOption)}
                    </p>
                  </div>
                  {theme === themeOption && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </Label>
              </motion.div>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
}
