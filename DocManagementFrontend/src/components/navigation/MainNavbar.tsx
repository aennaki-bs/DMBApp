
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User,
  LogOut, 
  Settings,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export function MainNavbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="border-b border-blue-900/30 bg-[#0a1033]/95 backdrop-blur-sm h-16 shadow-md w-full">
      <div className="container h-full mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center md:w-64">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-8 h-8 rounded flex items-center justify-center text-white font-bold">
              D
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-200 to-blue-400 text-transparent bg-clip-text">DocuVerse</span>
          </Link>
        </div>
        
        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300/70" />
            <Input 
              className="pl-9 bg-blue-900/20 border-blue-800/30 text-white placeholder:text-blue-300/50 w-full focus:border-blue-500"
              placeholder="Search..." 
            />
          </div>
        </div>
        
        {user ? (
          <div className="flex items-center space-x-4 ml-auto">
            <Button variant="ghost" size="icon" className="relative text-blue-300 hover:text-white hover:bg-blue-800/30">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-blue-100 hover:bg-blue-800/30">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-blue-300">{user.role}</p>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user.profilePicture} 
                      alt={`${user.firstName} ${user.lastName}`} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-blue-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0a1033] border-blue-900/50 text-blue-100">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-blue-800/30" />
                
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center cursor-pointer w-full hover:bg-blue-800/30">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center cursor-pointer w-full hover:bg-blue-800/30">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-blue-800/30" />
                
                <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer hover:bg-blue-800/30 text-red-400 focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-blue-300 hover:text-white hover:bg-blue-800/30">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Register</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
