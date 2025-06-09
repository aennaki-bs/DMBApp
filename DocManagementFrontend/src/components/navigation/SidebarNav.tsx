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
  Building2,
  Box,
  Tag,
  Package,
  Hash,
  Calculator,
  Truck,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { UserProfileSection } from "./UserProfileSection";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import approvalService from "@/services/approvalService";
import { useTranslation } from "@/hooks/useTranslation";

export function SidebarNav() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const isAdmin = user?.role === "Admin";
  const isSimpleUser = user?.role === "SimpleUser";

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Check if any line elements-related route is active
  const isLineElementsActive = () => {
    return (
      isActive("/line-elements-management") ||
      isActive("/items-management") ||
      isActive("/unit-codes-management") ||
      isActive("/general-accounts-management") ||
      isActive("/customer-management") ||
      isActive("/vendor-management")
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

  // State for the approval submenu
  const [approvalMenuOpen, setApprovalMenuOpen] = useState(isApprovalActive());
  // State for the line elements submenu - open by default if on a line elements page
  const [lineElementsMenuOpen, setLineElementsMenuOpen] = useState(
    isLineElementsActive()
  );

  // Update submenu states when location changes
  useEffect(() => {
    setApprovalMenuOpen(isApprovalActive());
    setLineElementsMenuOpen(isLineElementsActive());
  }, [location.pathname]);

  // Fetch pending approvals count
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ["pendingApprovals"],
    queryFn: () => approvalService.getPendingApprovals(),
    enabled: !!user?.userId && !isSimpleUser,
  });

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
              <span>{t("nav.dashboard")}</span>
            </Link>
          </li>

          {/* Pending Approvals - Not visible to SimpleUser */}
          {!isSimpleUser && (
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
                  <span>{t("nav.myApprovals")}</span>
                </div>
                {pendingApprovals.length > 0 && (
                  <div className="flex items-center justify-center h-5 w-5 text-xs bg-red-500 text-white rounded-full">
                    {pendingApprovals.length}
                  </div>
                )}
              </Link>
            </li>
          )}

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
                <span>{t("nav.userManagement")}</span>
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
              <span>{t("nav.documents")}</span>
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
                  <span>{t("nav.documentTypes")}</span>
                </Link>
              </li>

              {/* Line Elements Section with submenu */}
              <li>
                <button
                  onClick={() => setLineElementsMenuOpen(!lineElementsMenuOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isLineElementsActive()
                      ? "bg-blue-600/40 text-blue-200"
                      : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    <span>{t("nav.lineElements")}</span>
                  </div>
                  {lineElementsMenuOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {/* Submenu for Line Elements section */}
                {lineElementsMenuOpen && (
                  <ul className="ml-6 mt-1 space-y-1 border-l-2 border-blue-900/30 pl-2">
                    <li>
                      <Link
                        to="/line-elements-management?tab=elementtypes"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/line-elements-management") &&
                          new URLSearchParams(location.search).get("tab") ===
                            "elementtypes"
                            ? "bg-blue-700/40 text-blue-200"
                            : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                        }`}
                      >
                        <Tag className="h-4 w-4" />
                        <span>Element Types</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/items-management"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/items-management")
                            ? "bg-blue-700/40 text-blue-200"
                            : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                        }`}
                      >
                        <Package className="h-4 w-4" />
                        <span>Items</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/unit-codes-management"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/unit-codes-management")
                            ? "bg-blue-700/40 text-blue-200"
                            : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                        }`}
                      >
                        <Hash className="h-4 w-4" />
                        <span>Unit Codes</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/general-accounts-management"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/general-accounts-management")
                            ? "bg-blue-700/40 text-blue-200"
                            : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                        }`}
                      >
                        <Calculator className="h-4 w-4" />
                        <span>General Accounts</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/customer-management"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/customer-management")
                            ? "bg-blue-700/40 text-blue-200"
                            : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                        }`}
                      >
                        <Users className="h-4 w-4" />
                        <span>Customers</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/vendor-management"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/vendor-management")
                            ? "bg-blue-700/40 text-blue-200"
                            : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                        }`}
                      >
                        <Truck className="h-4 w-4" />
                        <span>Vendors</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

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
                  <span>{t("nav.circuits")}</span>
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
                    <span>{t("nav.approval")}</span>
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

              {/* Responsibility Centres */}
              {isAdmin && (
                <li>
                  <Link
                    to="/responsibility-centres"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive("/responsibility-centres")
                        ? "bg-blue-600/40 text-blue-200"
                        : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                    <span>{t("nav.responsibilityCentres")}</span>
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
