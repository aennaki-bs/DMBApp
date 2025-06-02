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

export function MainNavbar() {
  const { user, logout } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    navigateToResult,
  } = useNavSearch();

  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
  };

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleSelectResult = (path: string) => {
    navigateToResult(path);
    setShowResults(false);
  };

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close search results on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowResults(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <nav className="border-b border-blue-900/30 bg-[#0a1033]/95 backdrop-blur-sm h-16 shadow-md w-full">
      <div className="container h-full mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center md:w-64">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-8 h-8 rounded flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              D
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-200 to-blue-400 text-transparent bg-clip-text">
              DocuVerse
            </span>
          </Link>
        </div>

        {/* Search bar */}
        <div
          className="hidden md:flex flex-1 max-w-md mx-6 relative"
          ref={searchRef}
        >
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300 group-hover:text-blue-200 transition-colors duration-200" />
            <Input
              className="pl-9 pr-10 bg-blue-950/40 border-blue-800/30 text-white placeholder:text-blue-300/50 w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md transition-all duration-200 group-hover:border-blue-700/50 group-hover:bg-blue-900/40 backdrop-blur-sm shadow-inner"
              placeholder="Search pages, navigation, documents..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-300 hover:text-blue-100 hover:bg-blue-800/40 rounded-full"
                onClick={handleClearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Search results dropdown */}
          {showResults && (
            <SearchResults
              results={searchResults}
              isSearching={isSearching}
              onSelect={handleSelectResult}
              searchQuery={searchQuery}
            />
          )}
        </div>

        {user ? (
          <div className="flex items-center space-x-4 ml-auto">
            <EnhancedButton
              variant="ghost"
              size="icon-sm"
              className="relative text-blue-300 hover:text-white hover:bg-blue-800/30"
              animation="pulse"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0a1033]/95"></span>
            </EnhancedButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <EnhancedButton
                  variant="frost"
                  size="sm"
                  className="flex items-center gap-2 text-blue-100 hover:bg-blue-800/30"
                >
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium">
                      {user.username || "User"}
                    </p>
                    <p className="text-xs text-blue-300">{user.role}</p>
                  </div>
                  <Avatar className="h-8 w-8 ring-2 ring-blue-600/30">
                    <AvatarImage
                      src={user.profilePicture}
                      alt={user.username || "User"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-blue-300" />
                </EnhancedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[#0a1033] border-blue-900/50 text-blue-100 animate-in fade-in-50 zoom-in-95 shadow-lg shadow-blue-900/20"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-blue-800/30" />

                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center cursor-pointer w-full hover:bg-blue-800/30"
                  >
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex items-center cursor-pointer w-full hover:bg-blue-800/30"
                  >
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-blue-800/30" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center cursor-pointer hover:bg-blue-800/30 text-red-400 focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <EnhancedButton
                variant="frost"
                size="sm"
                rounded="lg"
                className="text-blue-300 hover:text-white"
              >
                Login
              </EnhancedButton>
            </Link>
            <Link to="/register">
              <EnhancedButton
                variant="premium"
                size="sm"
                rounded="lg"
                animation="shimmer"
                leadingIcon={<User className="h-4 w-4" />}
              >
                Register
              </EnhancedButton>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
