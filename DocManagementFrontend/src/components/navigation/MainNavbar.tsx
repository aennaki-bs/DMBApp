import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useNavSearch } from "@/hooks/useNavSearch";
import { SearchResults } from "./SearchResults";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function MainNavbar() {
  const { user, logout } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    navigateToResult,
  } = useNavSearch();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const [showResults, setShowResults] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
  };

  const handleInputFocus = () => {
    setShowResults(true);
    setIsSearchFocused(true);
  };

  const handleInputBlur = () => {
    setIsSearchFocused(false);
    // Delay hiding results to allow for clicks
    setTimeout(() => {
      if (!isSearchFocused) {
        setShowResults(false);
      }
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  const handleSelectResult = (path: string) => {
    navigateToResult(path);
    setShowResults(false);
    setShowMobileSearch(false);
    setIsSearchFocused(false);
  };

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle escape key to close search
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowResults(false);
        setShowMobileSearch(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="border-b border-border shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-6">
        {/* Left Section - Logo/Brand */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 sm:gap-3 flex-shrink-0 hover:opacity-80 transition-opacity duration-200"
        >
          <EnhancedButton
            variant="ghost"
            size="icon"
            className={cn(
              "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg transition-all duration-300",
              isMobile ? "h-9 w-9" : "h-10 w-10"
            )}
          >
            <span
              className={cn(
                "font-black tracking-tight",
                isMobile ? "text-lg" : "text-xl"
              )}
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              D
            </span>
          </EnhancedButton>
          <span className={cn(
            "hidden sm:block font-bold text-foreground tracking-tight",
            isMobile ? "text-lg" : "text-xl"
          )}>
            DM<span className="text-blue-400">V</span>
          </span>
        </Link>

        {/* Mobile Search Toggle */}
        {isMobile && !showMobileSearch && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 rounded-lg"
            onClick={() => setShowMobileSearch(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
        )}

        {/* Central Search Bar - Enhanced Design with Responsive Sizing */}
        <div
          className={cn(
            "relative transition-all duration-300",
            isMobile 
              ? showMobileSearch 
                ? "flex-1 mx-2" 
                : "hidden"
              : "flex-1 mx-4 sm:mx-6 lg:mx-8"
          )}
          style={{ 
            maxWidth: isMobile ? "100%" : "clamp(20rem, 50vw, 42rem)" 
          }}
          ref={searchRef}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            <div className="relative flex items-center">
              <Search
                className={cn(
                  "absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors duration-300 z-10",
                  isMobile ? "h-4 w-4" : "h-5 w-5"
                )}
              />
              <Input
                className={cn(
                  "bg-muted/60 border-2 border-border hover:border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground w-full rounded-xl transition-all duration-300 backdrop-blur-md shadow-inner group-hover:bg-muted/80 focus:bg-card/90",
                  isMobile ? "input-fluid" : "input-responsive",
                  isSearchFocused && "ring-2 ring-primary/20"
                )}
                style={{
                  paddingLeft: isMobile ? "2.5rem" : "clamp(2.75rem, 4vw, 3.5rem)",
                  paddingRight: isMobile ? "2.5rem" : "clamp(2.75rem, 4vw, 3.5rem)",
                }}
                placeholder={t("navigation.searchPlaceholder")}
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-200"
                  style={{
                    width: isMobile ? "1.5rem" : "clamp(1.5rem, 2.5vw, 1.75rem)",
                    height: isMobile ? "1.5rem" : "clamp(1.5rem, 2.5vw, 1.75rem)",
                  }}
                  onClick={handleClearSearch}
                >
                  <X
                    style={{
                      width: isMobile ? "0.875rem" : "clamp(0.875rem, 1.5vw, 1rem)",
                      height: isMobile ? "0.875rem" : "clamp(0.875rem, 1.5vw, 1rem)",
                    }}
                  />
                </Button>
              )}
              {isMobile && showMobileSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground rounded-full transition-all duration-200"
                  onClick={() => {
                    setShowMobileSearch(false);
                    setSearchQuery("");
                    setShowResults(false);
                    setIsSearchFocused(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Search Results */}
          {showResults && (
            <SearchResults
              results={searchResults}
              isSearching={isSearching}
              onSelect={handleSelectResult}
              searchQuery={searchQuery}
              onClose={() => setShowResults(false)}
            />
          )}
        </div>

        {/* Right Section - User Actions */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Clean Notification Button - Hidden on mobile when search is active */}
            {(!isMobile || !showMobileSearch) && (
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 rounded-lg"
                style={{
                  width: isMobile ? "2.5rem" : "clamp(2.5rem, 3vw, 2.75rem)",
                  height: isMobile ? "2.5rem" : "clamp(2.5rem, 3vw, 2.75rem)",
                }}
              >
                <Bell
                  style={{
                    width: isMobile ? "1rem" : "clamp(1rem, 2vw, 1.25rem)",
                    height: isMobile ? "1rem" : "clamp(1rem, 2vw, 1.25rem)",
                  }}
                />
                <span
                  className="absolute -top-1 -right-1 bg-destructive rounded-full ring-1 ring-background"
                  style={{
                    width: isMobile ? "0.5rem" : "clamp(0.5rem, 1vw, 0.625rem)",
                    height: isMobile ? "0.5rem" : "clamp(0.5rem, 1vw, 0.625rem)",
                  }}
                ></span>
              </Button>
            )}

            {/* Clean User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 hover:bg-accent/50 transition-all duration-200 rounded-lg",
                    isMobile ? "px-2" : "px-3"
                  )}
                  style={{
                    height: isMobile ? "2.5rem" : "clamp(2.5rem, 3vw, 2.75rem)",
                  }}
                >
                  <Avatar
                    className="avatar-fluid-sm"
                    style={{
                      width: isMobile ? "1.75rem" : "clamp(1.75rem, 2.5vw, 2rem)",
                      height: isMobile ? "1.75rem" : "clamp(1.75rem, 2.5vw, 2rem)",
                    }}
                  >
                    <AvatarImage src={user.profilePicture} alt={user.username} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground truncate max-w-24">
                      {user.username}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-24">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "hidden sm:block text-muted-foreground transition-transform duration-200",
                      isMobile ? "h-4 w-4" : "h-5 w-5"
                    )}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-card/95 backdrop-blur-xl border border-border/50 shadow-xl"
              >
                <DropdownMenuLabel className="font-semibold text-foreground">
                  {t("navigation.myAccount")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>{t("navigation.profile")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t("navigation.settings")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("navigation.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>
    </div>
  );
}
