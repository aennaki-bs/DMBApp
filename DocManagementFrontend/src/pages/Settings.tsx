
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Globe, Image as ImageIcon, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/context/SettingsContext';
import { translations } from '@/translations';

const Settings = () => {
  const { theme, setTheme, language, setLanguage } = useSettings();
  const [useCustomBg, setUseCustomBg] = useState(() => {
    return localStorage.getItem('useCustomBg') === 'true';
  });
  const [bgImage, setBgImage] = useState(() => {
    return localStorage.getItem('backgroundImage') || '';
  });
  
  const t = translations[language].settings;

  const handleThemeChange = (value: 'light' | 'dark') => {
    setTheme(value);
  };

  const handleLanguageChange = (value: 'en' | 'fr' | 'es') => {
    setLanguage(value);
  };

  const handleCustomBgChange = (checked: boolean) => {
    setUseCustomBg(checked);
    localStorage.setItem('useCustomBg', checked.toString());
    
    // Apply or remove background image
    if (checked && bgImage) {
      document.body.style.backgroundImage = `url(${bgImage})`;
    } else {
      document.body.style.backgroundImage = '';
    }
  };

  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBgImage(result);
        localStorage.setItem('backgroundImage', result);
        
        if (useCustomBg) {
          document.body.style.backgroundImage = `url(${result})`;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Apply background image on component mount if enabled
  useEffect(() => {
    if (useCustomBg && bgImage) {
      document.body.style.backgroundImage = `url(${bgImage})`;
    }
    
    return () => {
      // Don't remove on unmount, as it would affect other pages
    };
  }, [useCustomBg, bgImage]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-semibold text-card-foreground">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-md">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  {t.theme}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <RadioGroup
                  value={theme}
                  onValueChange={handleThemeChange}
                  className="grid grid-cols-1 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                      <Sun className="h-4 w-4 text-amber-500" />
                      {t.lightMode}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                      <Moon className="h-4 w-4 text-indigo-400" />
                      {t.darkMode}
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          {/* Language Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-md">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  {t.language}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectLanguage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          {/* Background Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2"
          >
            <Card className="shadow-md">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  {t.background}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={useCustomBg}
                      onCheckedChange={handleCustomBgChange}
                    />
                    <Label>{t.useCustomBg}</Label>
                  </div>
                  
                  {useCustomBg && (
                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBgImageChange}
                        className="hidden"
                        id="bg-upload"
                      />
                      <Label
                        htmlFor="bg-upload"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        {bgImage ? (
                          <img src={bgImage} alt="Background Preview" className="h-full object-cover rounded" />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">{t.uploadBg}</p>
                          </div>
                        )}
                      </Label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
