import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Layers,
  Users,
  UserCheck,
  ChevronDown,
  ChevronRight,
  UserCog,
  UsersRound,
  ClipboardCheck,
  Building2,
  Box,
  Tag,
  Package,
  Hash,
  Calculator,
  Truck,
  MapPin,
  X,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { UserProfileSection } from "./UserProfileSection";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import approvalService from "@/services/approvalService";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function SidebarNav() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
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
      isActive("/vendor-management") ||
      isActive("/locations-management")
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

  // Close mobile sidebar when navigating to a new page
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  // Fetch pending approvals count
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ["pendingApprovals"],
    queryFn: () => approvalService.getPendingApprovals(),
    enabled: !!user?.userId && !isSimpleUser,
  });

  // Function to close mobile sidebar
  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Enhanced Link component that closes sidebar on mobile
  const SidebarLink = ({ to, className, children, ...props }: any) => (
    <Link to={to} className={className} onClick={closeMobileSidebar} {...props}>
      {children}
    </Link>
  );

  // Professional navigation item classes with semantic theming
  const getNavItemClasses = (isActiveItem: boolean) => {
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActiveItem
        ? "bg-accent text-accent-foreground shadow-sm border border-border"
        : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
    }`;
  };

  const getSubmenuItemClasses = (isActiveItem: boolean) => {
    return `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      isActiveItem
        ? "bg-accent text-accent-foreground shadow-sm"
        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
    }`;
  };

  return (
    <Sidebar className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <SidebarHeader>
        <div className="relative ">
          <UserProfileSection />
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMobileSidebar}
              className="absolute top-2 right-2 h-8 w-8 shrink-0 bg-background/80 backdrop-blur-sm border border-border/40 shadow-sm hover:bg-accent/50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-muted-foreground px-2 py-3 uppercase tracking-wide">
            MAIN NAVIGATION
          </p>
          <ul className="space-y-1">
            {/* Dashboard */}
            <li>
              <SidebarLink
                to="/dashboard"
                className={getNavItemClasses(isActive("/dashboard"))}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>{t("nav.dashboard")}</span>
              </SidebarLink>
            </li>

            {/* Pending Approvals - Not visible to SimpleUser */}
            {!isSimpleUser && (
              <li>
                <SidebarLink
                  to="/pending-approvals"
                  className={`${getNavItemClasses(
                    isActive("/pending-approvals")
                  )} justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="h-5 w-5" />
                    <span>{t("nav.myApprovals")}</span>
                  </div>
                  {pendingApprovals.length > 0 && (
                    <div className="flex items-center justify-center h-5 w-5 text-xs bg-destructive text-destructive-foreground rounded-full font-medium">
                      {pendingApprovals.length}
                    </div>
                  )}
                </SidebarLink>
              </li>
            )}

            {/* User Management - Only for Admin */}
            {isAdmin && (
              <li>
                <SidebarLink
                  to="/user-management"
                  className={getNavItemClasses(isActive("/user-management"))}
                >
                  <Users className="h-5 w-5" />
                  <span>{t("nav.userManagement")}</span>
                </SidebarLink>
              </li>
            )}

            {/* Documents */}
            <li>
              <SidebarLink
                to="/documents"
                className={getNavItemClasses(isActive("/documents"))}
              >
                <FileText className="h-5 w-5" />
                <span>{t("nav.documents")}</span>
              </SidebarLink>
            </li>

            {/* Document Types - Only for non-simple users */}
            {!isSimpleUser && (
              <>
                <li>
                  <SidebarLink
                    to="/document-types-management"
                    className={getNavItemClasses(
                      isActive("/document-types-management")
                    )}
                  >
                    <Layers className="h-5 w-5" />
                    <span>{t("nav.documentTypes")}</span>
                  </SidebarLink>
                </li>

                {/* Line Elements Section with submenu */}
                <li>
                  <button
                    onClick={() =>
                      setLineElementsMenuOpen(!lineElementsMenuOpen)
                    }
                    className={`w-full ${getNavItemClasses(
                      isLineElementsActive()
                    )} justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Box className="h-5 w-5" />
                      <span>{t("nav.lineElements")}</span>
                    </div>
                    {lineElementsMenuOpen ? (
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                    )}
                  </button>

                  {/* Professional submenu for Line Elements */}
                  {lineElementsMenuOpen && (
                    <ul className="ml-6 mt-2 space-y-1 border-l-2 border-border pl-3">
                      <li>
                        <SidebarLink
                          to="/line-elements-management?tab=elementtypes"
                          className={getSubmenuItemClasses(
                            isActive("/line-elements-management") &&
                              new URLSearchParams(location.search).get(
                                "tab"
                              ) === "elementtypes"
                          )}
                        >
                          <Tag className="h-4 w-4" />
                          <span>Element Types</span>
                        </SidebarLink>
                      </li>
                      <li>
                        <SidebarLink
                          to="/items-management"
                          className={getSubmenuItemClasses(
                            isActive("/items-management")
                          )}
                        >
                          <Package className="h-4 w-4" />
                          <span>Items</span>
                        </SidebarLink>
                      </li>
                      <li>
                        <SidebarLink
                          to="/unit-codes-management"
                          className={getSubmenuItemClasses(
                            isActive("/unit-codes-management")
                          )}
                        >
                          <Hash className="h-4 w-4" />
                          <span>Unit Codes</span>
                        </SidebarLink>
                      </li>
                      <li>
                        <SidebarLink
                          to="/general-accounts-management"
                          className={getSubmenuItemClasses(
                            isActive("/general-accounts-management")
                          )}
                        >
                          <Calculator className="h-4 w-4" />
                          <span>General Accounts</span>
                        </SidebarLink>
                      </li>
                      <li>
                        <SidebarLink
                          to="/locations-management"
                          className={getSubmenuItemClasses(
                            isActive("/locations-management")
                          )}
                        >
                          <MapPin className="h-4 w-4" />
                          <span>Locations</span>
                        </SidebarLink>
                      </li>
                      <li>
                        <SidebarLink
                          to="/customer-management"
                          className={getSubmenuItemClasses(
                            isActive("/customer-management")
                          )}
                        >
                          <Users className="h-4 w-4" />
                          <span>Customers</span>
                        </SidebarLink>
                      </li>
                      <li>
                        <SidebarLink
                          to="/vendor-management"
                          className={getSubmenuItemClasses(
                            isActive("/vendor-management")
                          )}
                        >
                          <Truck className="h-4 w-4" />
                          <span>Vendors</span>
                        </SidebarLink>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Circuits */}
                <li>
                  <SidebarLink
                    to="/circuits"
                    className={getNavItemClasses(isActive("/circuits"))}
                  >
                    <GitBranch className="h-5 w-5" />
                    <span>{t("nav.circuits")}</span>
                  </SidebarLink>
                </li>

                {/* Approval Section with submenu */}
                {!isSimpleUser && (
                  <li>
                    <button
                      onClick={() => setApprovalMenuOpen(!approvalMenuOpen)}
                      className={`w-full ${getNavItemClasses(
                        isApprovalActive()
                      )} justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-5 w-5" />
                        <span>{t("nav.approval")}</span>
                      </div>
                      {approvalMenuOpen ? (
                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                      )}
                    </button>

                    {/* Professional submenu for Approval */}
                    {approvalMenuOpen && (
                      <ul className="ml-6 mt-2 space-y-1 border-l-2 border-border pl-3">
                        <li>
                          <SidebarLink
                            to="/approval-groups"
                            className={getSubmenuItemClasses(
                              isActive("/approval-groups")
                            )}
                          >
                            <UsersRound className="h-4 w-4" />
                            <span>Groups</span>
                          </SidebarLink>
                        </li>
                        <li>
                          <SidebarLink
                            to="/approvers-management"
                            className={getSubmenuItemClasses(
                              isActive("/approvers-management")
                            )}
                          >
                            <UserCog className="h-4 w-4" />
                            <span>Approvers</span>
                          </SidebarLink>
                        </li>
                      </ul>
                    )}
                  </li>
                )}

                {/* Responsibility Centres */}
                {isAdmin && (
                  <li>
                    <SidebarLink
                      to="/responsibility-centres"
                      className={getNavItemClasses(
                        isActive("/responsibility-centres")
                      )}
                    >
                      <Building2 className="h-5 w-5" />
                      <span>{t("nav.responsibilityCentres")}</span>
                    </SidebarLink>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
