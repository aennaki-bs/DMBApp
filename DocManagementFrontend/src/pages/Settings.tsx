import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Palette,
  Settings as SettingsIcon,
  Check,
  User,
  Monitor,
} from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { translations } from "@/translations";
import { toast } from "sonner";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { useThemeContext } from "@/context/ThemeContext";
import { PageHeader } from "@/components/shared/PageHeader";

// Predefined background options
const backgroundOptions = [
  {
    id: "default",
    name: "Default",
    url: "https://www.tigernix.com/wp-content/uploads/2024/01/why-singapore-needs-automation-erp-tigernix-singapore.jpg",
    preview:
      "https://www.tigernix.com/wp-content/uploads/2024/01/why-singapore-needs-automation-erp-tigernix-singapore.jpg",
    description: "Professional business environment",
  },
  {
    id: "modern-office",
    name: "Modern Office",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop",
    preview:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    description: "Clean workspace aesthetic",
  },
  {
    id: "minimal-gradient",
    name: "Minimal Gradient",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop",
    preview:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop",
    description: "Smooth, minimal design",
  },
];

const Settings = () => {
  const { theme, setTheme, language, setLanguage } = useSettings();
  const { theme: newTheme } = useThemeContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Background Settings
  const [selectedBackground, setSelectedBackground] = useState(() => {
    return localStorage.getItem("selectedBackground") || "default";
  });

  const t = translations[language].settings;

  const handleLanguageChange = (value: "en" | "fr" | "es") => {
    setLanguage(value);
    toast.success("Language updated successfully");
  };

  const handleBackgroundChange = (backgroundId: string) => {
    const background = backgroundOptions.find((bg) => bg.id === backgroundId);
    if (background) {
      setSelectedBackground(backgroundId);
      localStorage.setItem("selectedBackground", backgroundId);

      // Apply the background
      document.body.style.backgroundImage = `url(${background.url})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";

      // Dispatch custom event to notify Layout component
      window.dispatchEvent(new CustomEvent("backgroundChanged"));

      toast.success(`Background changed to ${background.name}`);
    }
  };

  // Apply selected background on component mount
  useEffect(() => {
    const background = backgroundOptions.find(
      (bg) => bg.id === selectedBackground
    );
    if (background) {
      document.body.style.backgroundImage = `url(${background.url})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    }
  }, [selectedBackground]);

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Application Settings"
        description="Customize your DocuVerse experience"
        icon={<SettingsIcon className="h-6 w-6 text-blue-400" />}
      />

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Enhanced Theme Settings */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <DashboardCard
              title="Theme Selection"
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                >
                  <Palette className="h-3 w-3 mr-1" />
                  Enhanced
                </Badge>
              }
              className="h-full"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-blue-300/80 text-sm">
                    Choose from our theme collection: Standard, Light, and Dark
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-400 border-green-500/30"
                  >
                    Current:{" "}
                    {newTheme === "standard"
                      ? "Standard"
                      : newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}
                  </Badge>
                </div>

                <ThemeSelector />

                {/* <div className="mt-6 p-4 rounded-lg bg-blue-950/20 border border-blue-800/30">
                  <h4 className="text-blue-100 font-semibold mb-2">
                    Standard Theme Features
                  </h4>
                  <ul className="text-blue-300/80 text-sm space-y-1">
                    <li>• Optimized color palette for better readability</li>
                    <li>• Enhanced spacing and typography</li>
                    <li>• Professional DocuVerse branding</li>
                    <li>• Improved accessibility and contrast</li>
                  </ul>
                </div> */}
              </div>
            </DashboardCard>
          </motion.div>

          {/* Language Settings */}
          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Language & Region"
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-400 border-green-500/20"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  Global
                </Badge>
              }
              className="h-full"
            >
              <div className="space-y-6">
                <p className="text-blue-300/80 text-sm">
                  Select your preferred display language
                </p>

                <div className="space-y-4">
                  <Label className="text-blue-100 font-semibold">
                    Display Language
                  </Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="bg-blue-950/30 border-blue-800/30 text-blue-100 h-12">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1642] border-blue-800/30">
                      <SelectItem
                        value="en"
                        className="text-blue-100 focus:bg-blue-800/30 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🇺🇸</span>
                          <span>English</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="fr"
                        className="text-blue-100 focus:bg-blue-800/30 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🇫🇷</span>
                          <span>Français</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="es"
                        className="text-blue-100 focus:bg-blue-800/30 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🇪🇸</span>
                          <span>Español</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* User Info Display */}
          {/* <motion.div variants={itemVariants}>
            <DashboardCard
              title="Account Information"
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                >
                  <User className="h-3 w-3 mr-1" />
                  Profile
                </Badge>
              }
              className="h-full"
            >
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-800/30">
                  <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">
                    User ID
                  </p>
                  <p className="text-blue-100 font-semibold">
                    {user?.userId || "N/A"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-800/30">
                  <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-blue-100 font-semibold">
                    {user?.email || "N/A"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/30">
                    <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">
                      Theme
                    </p>
                    <p className="text-blue-100 font-medium">
                      {newTheme === "standard"
                        ? "Standard"
                        : newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/30">
                    <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">
                      Language
                    </p>
                    <p className="text-blue-100 font-medium">
                      {language.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </motion.div> */}

          {/* Background Settings - Full Width */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <DashboardCard
              title="Background Selection"
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                >
                  <Monitor className="h-3 w-3 mr-1" />
                  Themes
                </Badge>
              }
            >
              <div className="space-y-8">
                <p className="text-blue-300/80">
                  Choose from our curated background collection to personalize
                  your workspace
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {backgroundOptions.map((background) => (
                    <motion.div
                      key={background.id}
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group"
                    >
                      <input
                        type="radio"
                        id={background.id}
                        name="background"
                        value={background.id}
                        checked={selectedBackground === background.id}
                        onChange={() => handleBackgroundChange(background.id)}
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor={background.id}
                        className="block cursor-pointer"
                      >
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-3 border-blue-900/30 peer-checked:border-blue-500 peer-checked:ring-4 peer-checked:ring-blue-500/20 transition-all hover:border-blue-600/50 group-hover:shadow-xl group-hover:shadow-blue-500/10">
                          <img
                            src={background.preview}
                            alt={background.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                          {/* Selected Indicator */}
                          {selectedBackground === background.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3"
                            >
                              <div className="bg-blue-500 rounded-full p-2 shadow-lg">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </motion.div>
                          )}

                          {/* Content */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-lg mb-1">
                              {background.name}
                            </h3>
                            <p className="text-white/80 text-sm">
                              {background.description}
                            </p>
                          </div>
                        </div>
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </div>
            </DashboardCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
