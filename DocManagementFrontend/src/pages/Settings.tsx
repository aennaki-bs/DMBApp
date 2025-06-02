import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  Globe,
  Palette,
  Settings as SettingsIcon,
  ArrowLeft,
  Check,
} from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

// Predefined background options
const backgroundOptions = [
  {
    id: "default",
    name: "Default",
    url: "https://www.tigernix.com/wp-content/uploads/2024/01/why-singapore-needs-automation-erp-tigernix-singapore.jpg",
    preview:
      "https://www.tigernix.com/wp-content/uploads/2024/01/why-singapore-needs-automation-erp-tigernix-singapore.jpg",
  },
  {
    id: "modern-office",
    name: "Modern Office",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop",
    preview:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
  },
  {
    id: "tech-abstract",
    name: "Tech Abstract",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop",
    preview:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
  },
  {
    id: "minimal-gradient",
    name: "Minimal Gradient",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop",
    preview:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop",
  },
];

const Settings = () => {
  const { theme, setTheme, language, setLanguage } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Background Settings
  const [selectedBackground, setSelectedBackground] = useState(() => {
    return localStorage.getItem("selectedBackground") || "default";
  });

  const t = translations[language].settings;

  const handleThemeChange = (value: "light" | "dark") => {
    setTheme(value);
    toast.success(`Theme changed to ${value} mode`);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#0d1117] to-[#1a1625] relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-blue-900/30 bg-[#0f1642]/80 backdrop-blur-xl shadow-lg"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <EnhancedButton
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-blue-300 hover:text-white hover:bg-blue-800/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </EnhancedButton>
              <div className="h-6 w-px bg-blue-900/30"></div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
                  <SettingsIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Settings</h1>
                  <p className="text-blue-300/80">
                    Customize your DocuVerse experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Theme Settings */}
          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Theme Settings"
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-400"
                >
                  <Palette className="h-3 w-3 mr-1" />
                  Visual
                </Badge>
              }
            >
              <div className="space-y-6">
                <RadioGroup
                  value={theme}
                  onValueChange={handleThemeChange}
                  className="grid grid-cols-2 gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <RadioGroupItem
                      value="light"
                      id="light"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="light"
                      className="flex flex-col items-center gap-3 p-4 border-2 border-blue-900/30 rounded-lg cursor-pointer hover:border-blue-600/50 peer-checked:border-amber-500 peer-checked:bg-amber-500/10 transition-all"
                    >
                      <div className="p-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500">
                        <Sun className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-blue-100 font-medium">
                        Light Mode
                      </span>
                      <span className="text-xs text-blue-300/80">
                        Bright and clean
                      </span>
                    </Label>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <RadioGroupItem
                      value="dark"
                      id="dark"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="dark"
                      className="flex flex-col items-center gap-3 p-4 border-2 border-blue-900/30 rounded-lg cursor-pointer hover:border-blue-600/50 peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 transition-all"
                    >
                      <div className="p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600">
                        <Moon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-blue-100 font-medium">
                        Dark Mode
                      </span>
                      <span className="text-xs text-blue-300/80">
                        Easy on the eyes
                      </span>
                    </Label>
                  </motion.div>
                </RadioGroup>
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
                  className="bg-green-500/10 text-green-400"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  Global
                </Badge>
              }
            >
              <div className="space-y-4">
                <Label className="text-blue-100">Display Language</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="bg-blue-950/30 border-blue-800/30 text-blue-100">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1642] border-blue-800/30">
                    <SelectItem
                      value="en"
                      className="text-blue-100 focus:bg-blue-800/30"
                    >
                      🇺🇸 English
                    </SelectItem>
                    <SelectItem
                      value="fr"
                      className="text-blue-100 focus:bg-blue-800/30"
                    >
                      🇫🇷 Français
                    </SelectItem>
                    <SelectItem
                      value="es"
                      className="text-blue-100 focus:bg-blue-800/30"
                    >
                      🇪🇸 Español
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Background Settings */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <DashboardCard
              title="Background Selection"
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-purple-500/10 text-purple-400"
                >
                  🎨 Custom
                </Badge>
              }
            >
              <div className="space-y-6">
                <p className="text-blue-300/80 text-sm">
                  Choose from our curated background collection
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {backgroundOptions.map((background) => (
                    <motion.div
                      key={background.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
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
                        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-blue-900/30 peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-500/30 transition-all hover:border-blue-600/50">
                          <img
                            src={background.preview}
                            alt={background.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {selectedBackground === background.id && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <div className="bg-blue-500 rounded-full p-1">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-center text-sm text-blue-200 mt-2 font-medium">
                          {background.name}
                        </p>
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* User Info Display */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <DashboardCard title="Account Information">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/30">
                  <p className="text-blue-300 text-xs">User ID</p>
                  <p className="text-blue-100 font-medium">
                    {user?.userId || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/30">
                  <p className="text-blue-300 text-xs">Email</p>
                  <p className="text-blue-100 font-medium">
                    {user?.email || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/30">
                  <p className="text-blue-300 text-xs">Theme</p>
                  <p className="text-blue-100 font-medium capitalize">
                    {theme}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/30">
                  <p className="text-blue-300 text-xs">Language</p>
                  <p className="text-blue-100 font-medium">
                    {language.toUpperCase()}
                  </p>
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
