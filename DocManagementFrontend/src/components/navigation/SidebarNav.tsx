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
  MapPin,
  Archive,
  FileCheck,
  Info,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { UserProfileSection } from "./UserProfileSection";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import approvalService from "@/services/approvalService";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Navigation item descriptions for tooltips
const navDescriptions = {
  "/dashboard": "Main dashboard with activity overview",
  "/pending-approvals": "View and manage pending approval requests",
  "/user-management": "Manage system users and permissions",
  "/documents": "Manage active documents and submissions",
  "/document-types-management": "Configure document types and templates",
  "/circuits": "Manage workflow circuits and approval flows",
  "/approval-groups": "Configure approval groups and rules",
  "/approvers-management": "Manage approvers and their assignments",
  "/responsibility-centres": "Manage organizational responsibility centers",
  "/element-types": "Configure element types for line items",
  "/items-management": "Manage inventory items and catalog",
  "/unit-codes-management": "Configure measurement units",
  "/general-accounts-management": "Manage general ledger accounts",
  "/locations-management": "Manage locations and facilities",
  "/customer-management": "Manage customer database",
  "/vendor-management": "Manage vendor relationships",
};

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

  // Special handling for document detail pages to determine source
  const isArchivedDocumentContext = () => {
    if (location.pathname.match(/^\/documents\/\d+$/)) {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('from') === 'archived') {
        return true;
      }
      const documentContext = sessionStorage.getItem('documentContext');
      return documentContext === 'archived';
    }
    return false;
  };

  const isCompletedDocumentContext = () => {
    if (location.pathname.match(/^\/documents\/\d+$/)) {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('from') === 'completed') {
        return true;
      }
      const documentContext = sessionStorage.getItem('documentContext');
      return documentContext === 'completed';
    }
    return false;
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
      isActive("/locations-management") ||
      isActive("/element-types")
    );
  };

  // Check if any approval-related route is active (but NOT for My Approvals)
  const isApprovalActive = () => {
    return (
      (isActive("/approval-groups") || isActive("/approvers-management"))
    );
  };

  // Check if any documents-related route is active
  const isDocumentsActive = () => {
    return (
      isActive("/documents") || isActive("/documents/archived") || isActive("/documents/completed-not-archived")
    );
  };

  // Enhanced submenu state management - allows manual control
  const [approvalMenuOpen, setApprovalMenuOpen] = useState(isApprovalActive());
  const [lineElementsMenuOpen, setLineElementsMenuOpen] = useState(isLineElementsActive());
  const [documentsMenuOpen, setDocumentsMenuOpen] = useState(isDocumentsActive());

  // Track which submenus have been manually controlled to prevent auto-closing
  const [manuallyControlled, setManuallyControlled] = useState({
    approval: false,
    lineElements: false,
    documents: false,
  });

  // Smart submenu management based on current route
  useEffect(() => {
    const currentPath = location.pathname;

    // Determine which section is currently active
    const activeSection = {
      documents: isDocumentsActive(),
      lineElements: isLineElementsActive(),
      approval: isApprovalActive(),
    };

    // Auto-open the submenu for the current active section
    if (activeSection.documents && !documentsMenuOpen) {
      setDocumentsMenuOpen(true);
    }
    if (activeSection.lineElements && !lineElementsMenuOpen) {
      setLineElementsMenuOpen(true);
    }
    if (activeSection.approval && !approvalMenuOpen) {
      setApprovalMenuOpen(true);
    }

    // Close other submenus when navigating to a different section (unless manually controlled)
    // Only close if we're on a main navigation item that's not part of a submenu section
    const isOnMainNavItem =
      isActive("/dashboard") ||
      isActive("/pending-approvals") ||
      isActive("/user-management") ||
      isActive("/document-types-management") ||
      isActive("/circuits") ||
      isActive("/responsibility-centres");

    if (isOnMainNavItem) {
      // Close all submenus when navigating to main nav items
      if (!activeSection.documents && !manuallyControlled.documents) {
        setDocumentsMenuOpen(false);
      }
      if (!activeSection.lineElements && !manuallyControlled.lineElements) {
        setLineElementsMenuOpen(false);
      }
      if (!activeSection.approval && !manuallyControlled.approval) {
        setApprovalMenuOpen(false);
      }
    }
  }, [location.pathname]);

  // Handle manual submenu toggles - gives user full control
  const handleSubmenuToggle = (menu: 'approval' | 'lineElements' | 'documents') => {
    // Mark this submenu as manually controlled
    setManuallyControlled(prev => ({ ...prev, [menu]: true }));

    switch (menu) {
      case 'approval':
        setApprovalMenuOpen(prev => !prev);
        break;
      case 'lineElements':
        setLineElementsMenuOpen(prev => !prev);
        break;
      case 'documents':
        setDocumentsMenuOpen(prev => !prev);
        break;
    }

    // Reset manual control flag after navigation to allow smart behavior again
    setTimeout(() => {
      setManuallyControlled(prev => ({ ...prev, [menu]: false }));
    }, 100);
  };

  // Fetch pending approvals count
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ["pendingApprovals"],
    queryFn: () => approvalService.getPendingApprovals(),
    enabled: !!user?.userId && !isSimpleUser,
  });

  // Enhanced navigation item classes with improved visual feedback
  const getNavItemClasses = (isActiveItem: boolean) => {
    const baseClasses = "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out overflow-hidden";

    if (isActiveItem) {
      return `${baseClasses} bg-gradient-to-r from-primary/25 via-primary/20 to-primary/15 text-primary border border-primary/20 shadow-lg shadow-primary/10 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`;
    }

    return `${baseClasses} text-foreground/85 hover:text-foreground hover:bg-gradient-to-r hover:from-accent/20 hover:via-accent/15 hover:to-accent/10 hover:shadow-md hover:shadow-accent/5 hover:border hover:border-accent/20 border border-transparent hover:backdrop-blur-sm`;
  };

  // Enhanced submenu item classes with better selection clarity
  const getSubmenuItemClasses = (isActiveItem: boolean) => {
    const baseClasses = "group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ease-out overflow-hidden";

    if (isActiveItem) {
      return `${baseClasses} bg-gradient-to-r from-primary/20 to-primary/15 text-primary font-semibold border border-primary/25 shadow-md shadow-primary/5 backdrop-blur-sm before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary before:rounded-r-full`;
    }

    return `${baseClasses} text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-accent/15 hover:to-accent/10 hover:shadow-sm hover:border hover:border-accent/20 border border-transparent hover:font-medium`;
  };

  // Enhanced submenu button classes with better visual hierarchy
  const getSubmenuButtonClasses = (isActiveSection: boolean, isOpen: boolean) => {
    const baseClasses = "group w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out overflow-hidden";

    if (isActiveSection) {
      return `${baseClasses} bg-gradient-to-r from-primary/25 via-primary/20 to-primary/15 text-primary border border-primary/20 shadow-lg shadow-primary/10 backdrop-blur-sm`;
    }

    if (isOpen) {
      return `${baseClasses} text-foreground bg-gradient-to-r from-accent/15 to-accent/10 border border-accent/15 shadow-sm backdrop-blur-sm`;
    }

    return `${baseClasses} text-foreground/85 hover:text-foreground hover:bg-gradient-to-r hover:from-accent/20 hover:via-accent/15 hover:to-accent/10 hover:shadow-md hover:shadow-accent/5 hover:border hover:border-accent/20 border border-transparent`;
  };

  // Navigation item component with enhanced tooltip and better interactions
  const NavItem = ({ to, icon: Icon, label, description, isActiveItem, badge, onClick }: any) => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            onClick={onClick}
            className={getNavItemClasses(isActiveItem)}
          >
            {/* Active state background glow */}
            {isActiveItem && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
            )}

            <Icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 relative z-10 ${isActiveItem
              ? "text-primary drop-shadow-sm"
              : "text-foreground/70 group-hover:text-foreground group-hover:scale-110"
              }`} />

            <span className={`flex-1 truncate relative z-10 transition-all duration-300 ${isActiveItem ? "text-primary font-semibold" : "group-hover:translate-x-0.5"
              }`}>
              {label}
            </span>

            {badge && (
              <div className="flex items-center justify-center h-5 w-5 text-xs bg-destructive text-destructive-foreground rounded-full font-bold animate-pulse shadow-lg relative z-10">
                {badge}
              </div>
            )}

            {/* Enhanced active indicator */}
            {isActiveItem && (
              <div className="absolute right-3 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50 animate-pulse relative z-10" />
            )}

            {/* Hover effect line */}
            <div className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${isActiveItem ? "opacity-0" : ""
              }`} />
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-popover/95 backdrop-blur-md border border-primary/20 shadow-xl rounded-lg p-3 max-w-xs"
          sideOffset={12}
        >
          <div>
            <p className="font-semibold text-sm text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Enhanced submenu button component with better visual feedback
  const SubmenuButton = ({ icon: Icon, label, isOpen, isActiveSection, onClick, children }: any) => (
    <li>
      <button
        onClick={onClick}
        className={`${getSubmenuButtonClasses(isActiveSection, isOpen)} justify-between`}
      >
        {/* Background effect for active/open states */}
        {(isActiveSection || isOpen) && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5 animate-pulse" />
        )}

        <div className="flex items-center gap-3 flex-1 relative z-10">
          <Icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${isActiveSection
            ? "text-primary drop-shadow-sm"
            : isOpen
              ? "text-foreground scale-105"
              : "text-foreground/70 group-hover:text-foreground group-hover:scale-110"
            }`} />
          <span className={`truncate transition-all duration-300 ${isActiveSection
            ? "text-primary font-semibold"
            : isOpen
              ? "text-foreground font-medium"
              : "group-hover:translate-x-0.5"
            }`}>
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {/* Enhanced active indicator */}
          {isActiveSection && (
            <div className="w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50 animate-pulse" />
          )}
          <div className={`transition-all duration-300 ${isOpen ? 'rotate-90 scale-110' : 'group-hover:scale-110'
            }`}>
            <ChevronRight className={`h-4 w-4 ${isActiveSection
              ? "text-primary"
              : isOpen
                ? "text-foreground"
                : "text-foreground/70 group-hover:text-foreground"
              }`} />
          </div>
        </div>

        {/* Hover effect line */}
        <div className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${isActiveSection || isOpen ? "opacity-0" : ""
          }`} />
      </button>

      {/* Enhanced submenu with improved animations */}
      <div className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
        }`}>
        <ul className="ml-6 space-y-1 border-l-2 border-gradient-to-b from-primary/30 to-primary/10 pl-4 relative">
          {/* Animated border effect with glow */}
          <div className="absolute left-0 top-0 w-0.5 bg-gradient-to-b from-primary/60 via-primary/40 to-transparent h-full rounded-full shadow-sm shadow-primary/20" />
          {children}
        </ul>
      </div>
    </li>
  );

  return (
    <div className="h-full w-full bg-background/10 backdrop-blur-xl border-r border-border/30 overflow-y-auto supports-[backdrop-filter]:bg-background/5">
      {/* User Profile Section */}
      <UserProfileSection />

      <div className="px-4 py-2">
        <div className="flex items-center gap-2 px-2 py-3">
          <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wide flex-1">
            Main Navigation
          </p>
          <div className="w-8 h-0.5 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent rounded-full" />
        </div>

        <ul className="space-y-1.5">
          {/* Dashboard */}
          <li>
            <NavItem
              to="/dashboard"
              icon={LayoutDashboard}
              label={t("nav.dashboard")}
              description={navDescriptions["/dashboard"]}
              isActiveItem={isActive("/dashboard")}
            />
          </li>

          {/* Pending Approvals - Not visible to SimpleUser */}
          {!isSimpleUser && (
            <li>
              <NavItem
                to="/pending-approvals"
                icon={ClipboardCheck}
                label={t("nav.myApprovals")}
                description={navDescriptions["/pending-approvals"]}
                isActiveItem={isActive("/pending-approvals")}
                badge={pendingApprovals.length > 0 ? pendingApprovals.length : null}
              />
            </li>
          )}

          {/* User Management - Only for Admin */}
          {isAdmin && (
            <li>
              <NavItem
                to="/user-management"
                icon={Users}
                label={t("nav.userManagement")}
                description={navDescriptions["/user-management"]}
                isActiveItem={isActive("/user-management")}
              />
            </li>
          )}

          {/* Documents Section with enhanced submenu */}
          <SubmenuButton
            icon={FileText}
            label={t("nav.documents")}
            isOpen={documentsMenuOpen}
            isActiveSection={isDocumentsActive()}
            onClick={() => handleSubmenuToggle('documents')}
          >
            <li>
              <Link
                to="/documents"
                className={getSubmenuItemClasses(
                  (isActive("/documents") && !isActive("/documents/archived") && !isActive("/documents/completed-not-archived") && !isArchivedDocumentContext() && !isCompletedDocumentContext())
                )}
              >
                <FileText className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                <span>Active</span>
              </Link>
            </li>
            <li>
              <Link
                to="/documents/archived"
                className={getSubmenuItemClasses(
                  isActive("/documents/archived") || isArchivedDocumentContext()
                )}
              >
                <Archive className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                <span>Archived</span>
              </Link>
            </li>
            <li>
              <Link
                to="/documents/completed-not-archived"
                className={getSubmenuItemClasses(
                  isActive("/documents/completed-not-archived") || isCompletedDocumentContext()
                )}
              >
                <FileCheck className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                <span>Completed</span>
              </Link>
            </li>
          </SubmenuButton>

          {/* Document Types - Only for non-simple users */}
          {!isSimpleUser && (
            <>
              <li>
                <NavItem
                  to="/document-types-management"
                  icon={Layers}
                  label={t("nav.documentTypes")}
                  description={navDescriptions["/document-types-management"]}
                  isActiveItem={isActive("/document-types-management")}
                />
              </li>

              {/* Line Elements Section with enhanced submenu */}
              <SubmenuButton
                icon={Box}
                label={t("nav.lineElements")}
                isOpen={lineElementsMenuOpen}
                isActiveSection={isLineElementsActive()}
                onClick={() => handleSubmenuToggle('lineElements')}
              >
                <li>
                  <Link
                    to="/element-types"
                    className={getSubmenuItemClasses(isActive("/element-types"))}
                  >
                    <Tag className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                    <span>Element Types</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/items-management"
                    className={getSubmenuItemClasses(isActive("/items-management"))}
                  >
                    <Package className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                    <span>Items</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/unit-codes-management"
                    className={getSubmenuItemClasses(isActive("/unit-codes-management"))}
                  >
                    <Hash className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                    <span>Unit Codes</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/general-accounts-management"
                    className={getSubmenuItemClasses(isActive("/general-accounts-management"))}
                  >
                    <Calculator className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                    <span>General Accounts</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/locations-management"
                    className={getSubmenuItemClasses(isActive("/locations-management"))}
                  >
                    <MapPin className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                    <span>Locations</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/customer-management"
                    className={getSubmenuItemClasses(isActive("/customer-management"))}
                  >
                    <Users className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                    <span>Customers</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/vendor-management"
                    className={getSubmenuItemClasses(isActive("/vendor-management"))}
                  >
                    <Truck className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                    <span>Vendors</span>
                  </Link>
                </li>
              </SubmenuButton>

              {/* Circuits */}
              <li>
                <NavItem
                  to="/circuits"
                  icon={GitBranch}
                  label={t("nav.circuits")}
                  description={navDescriptions["/circuits"]}
                  isActiveItem={isActive("/circuits")}
                />
              </li>

              {/* Approval Section with enhanced submenu */}
              <SubmenuButton
                icon={UserCheck}
                label={t("nav.approval")}
                isOpen={approvalMenuOpen}
                isActiveSection={isApprovalActive()}
                onClick={() => handleSubmenuToggle('approval')}
              >
                <li>
                  <Link
                    to="/approval-groups"
                    className={getSubmenuItemClasses(isActive("/approval-groups"))}
                  >
                    <UsersRound className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                    <span>Groups</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/approvers-management"
                    className={getSubmenuItemClasses(isActive("/approvers-management"))}
                  >
                    <UserCog className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                    <span>Approvers</span>
                  </Link>
                </li>
              </SubmenuButton>

              {/* Responsibility Centres */}
              {isAdmin && (
                <li>
                  <NavItem
                    to="/responsibility-centres"
                    icon={Building2}
                    label={t("nav.responsibilityCentres")}
                    description={navDescriptions["/responsibility-centres"]}
                    isActiveItem={isActive("/responsibility-centres")}
                  />
                </li>
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

