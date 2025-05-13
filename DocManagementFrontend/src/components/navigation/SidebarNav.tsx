import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Layers,
  Users,
  CalendarRange,
  Settings,
  PlayCircle,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { UserProfileSection } from "./UserProfileSection";

export function SidebarNav() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "Admin";
  const isSimpleUser = user?.role === "SimpleUser";

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div className="h-full w-full bg-[#0a1033]/95 backdrop-blur-lg border-r border-blue-900/30 overflow-y-auto">
      {/* User Profile Section */}
      <UserProfileSection />

      <div className="px-4 py-2">
        <p className="text-xs font-medium text-blue-400/80 px-2 py-2">
          MAIN NAVIGATION
        </p>
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/dashboard")
                  ? "bg-blue-600/40 text-blue-200"
                  : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </li>

          {/* User Management - Only for Admin */}
          {isAdmin && (
            <li>
              <Link
                to="/user-management"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/user-management")
                    ? "bg-blue-600/40 text-blue-200"
                    : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                }`}
              >
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </Link>
            </li>
          )}

          {/* Documents */}
          <li>
            <Link
              to="/documents"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/documents")
                  ? "bg-blue-600/40 text-blue-200"
                  : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Documents</span>
            </Link>
          </li>

          {/* Document Types - Only for non-simple users */}
          {!isSimpleUser && (
            <>
              <li>
                <Link
                  to="/document-types-management"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/document-types-management")
                      ? "bg-blue-600/40 text-blue-200"
                      : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                  }`}
                >
                  <Layers className="h-5 w-5" />
                  <span>Document Types</span>
                </Link>
              </li>
              {/* <li>
                <Link 
                  to="/subtype-management"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/subtype-management') 
                      ? 'bg-blue-600/40 text-blue-200' 
                      : 'text-blue-100 hover:bg-blue-800/30 hover:text-blue-50'
                  }`}
                >
                  <CalendarRange className="h-5 w-5" />
                  <span>Subtypes</span>
                </Link>
              </li> */}
              {/* Circuits */}
              <li>
                <Link
                  to="/circuits"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/circuits")
                      ? "bg-blue-600/40 text-blue-200"
                      : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                  }`}
                >
                  <GitBranch className="h-5 w-5" />
                  <span>Circuits</span>
                </Link>
              </li>
              {/* Actions Management */}
              {/* <li>
                <Link
                  to="/actions"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/actions")
                      ? "bg-blue-600/40 text-blue-200"
                      : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                  }`}
                >
                  <PlayCircle className="h-5 w-5" />
                  <span>Actions</span>
                </Link>
              </li> */}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
