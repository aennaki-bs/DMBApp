import React from "react";
import { motion } from "framer-motion";
import { Palette, Info, CheckCircle } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { useThemeContext } from "@/context/ThemeContext";
import { getThemeDisplayName, getThemeDescription } from "@/lib/themes";

const ThemeDemo = () => {
  const { theme, currentActiveTheme } = useThemeContext();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-card shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
              <Palette className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Theme System Demo
              </h1>
              <p className="text-muted-foreground">
                Showcasing the enhanced theme system with Standard Theme
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-10"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Theme Selector */}
          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Theme Control Panel"
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  <Palette className="h-3 w-3 mr-1" />
                  Live Demo
                </Badge>
              }
              className="h-full"
            >
              <ThemeSelector />
            </DashboardCard>
          </motion.div>

          {/* Current Theme Status */}
          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Current Theme Status"
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-600 border-green-500/30"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              }
              className="h-full"
            >
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg bg-muted border border-border">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                      Selected Theme
                    </p>
                    <p className="text-foreground font-semibold text-lg">
                      {getThemeDisplayName(theme)}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {getThemeDescription(theme)}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted border border-border">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                      Active Mode
                    </p>
                    <p className="text-foreground font-semibold text-lg capitalize">
                      {currentActiveTheme}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Currently applied visual theme
                    </p>
                  </div>
                </div>

                {theme === "standard" && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-primary" />
                      <h4 className="text-foreground font-semibold">
                        Standard Theme Features
                      </h4>
                    </div>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>• Enhanced DocuVerse branding colors</li>
                      <li>• Optimized for professional use</li>
                      <li>• Improved accessibility and contrast</li>
                      <li>• Clean and modern interface design</li>
                    </ul>
                  </div>
                )}
              </div>
            </DashboardCard>
          </motion.div>

          {/* Color Palette Demo */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <DashboardCard
              title="Color Palette Preview"
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-600 border-blue-500/30"
                >
                  <Palette className="h-3 w-3 mr-1" />
                  Showcase
                </Badge>
              }
            >
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Preview of the current theme's color palette and components
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-primary text-primary-foreground text-center">
                    <p className="font-semibold">Primary</p>
                    <p className="text-xs opacity-80">Action Color</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary text-secondary-foreground text-center">
                    <p className="font-semibold">Secondary</p>
                    <p className="text-xs opacity-80">Support Color</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted text-muted-foreground text-center">
                    <p className="font-semibold">Muted</p>
                    <p className="text-xs opacity-80">Subtle Color</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent text-accent-foreground text-center">
                    <p className="font-semibold">Accent</p>
                    <p className="text-xs opacity-80">Highlight Color</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-card text-card-foreground">
                    <h4 className="font-semibold mb-2">Card Component</h4>
                    <p className="text-sm text-muted-foreground">
                      This demonstrates how cards look in the current theme.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-popover text-popover-foreground">
                    <h4 className="font-semibold mb-2">Popover Style</h4>
                    <p className="text-sm text-muted-foreground">
                      Popover components with theme colors.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 text-foreground">
                    <h4 className="font-semibold mb-2">Featured Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Highlighted content with primary colors.
                    </p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThemeDemo;
