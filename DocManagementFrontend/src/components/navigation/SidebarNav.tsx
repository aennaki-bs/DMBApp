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
  UserCheck,
  ChevronDown,
  ChevronRight,
  UserCog,
  UsersRound,
  ClipboardCheck,
  Bell,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { UserProfileSection } from "./UserProfileSection";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import approvalService from "@/services/approvalService";

export function SidebarNav() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "Admin";
  const isSimpleUser = user?.role === "SimpleUser";

  // State for the approval submenu
  const [approvalMenuOpen, setApprovalMenuOpen] = useState(false);

  // Fetch pending approvals count
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ["pendingApprovals"],
    queryFn: () => approvalService.getPendingApprovals(),
    enabled: !!user?.userId,
  });

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Check if any approval-related route is active
  const isApprovalActive = () => {
    return (
      isActive("/approval-groups") ||
      isActive("/approvers-management") ||
      isActive("/pending-approvals")
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

          {/* Pending Approvals - Visible to all users */}
          <li>
            <Link
              to="/pending-approvals"
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/pending-approvals")
                  ? "bg-blue-600/40 text-blue-200"
                  : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                <span>My Approvals</span>
              </div>
              {pendingApprovals.length > 0 && (
                <div className="flex items-center justify-center h-5 w-5 text-xs bg-red-500 text-white rounded-full">
                  {pendingApprovals.length}
                </div>
              )}
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

              {/* Approval Section with submenu */}
              <li>
                <button
                  onClick={() => setApprovalMenuOpen(!approvalMenuOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isApprovalActive()
                      ? "bg-blue-600/40 text-blue-200"
                      : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    <span>Approval</span>
                  </div>
                  {approvalMenuOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {/* Submenu for Approval section */}
                {approvalMenuOpen && (
                  <ul className="ml-6 mt-1 space-y-1 border-l-2 border-blue-900/30 pl-2">
                    <li>
                      <Link
                        to="/approval-groups"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/approval-groups")
                            ? "bg-blue-700/40 text-blue-200"
                            : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                        }`}
                      >
                        <UsersRound className="h-4 w-4" />
                        <span>Groups</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/approvers-management"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/approvers-management")
                            ? "bg-blue-700/40 text-blue-200"
                            : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                        }`}
                      >
                        <UserCog className="h-4 w-4" />
                        <span>Approvers</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
