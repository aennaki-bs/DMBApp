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
  X,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { UserProfileSection } from "./UserProfileSection";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import approvalService from "@/services/approvalService";
import { useTranslation } from "@/hooks/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
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

  const isLineElementsActive = () => {
    return (
      isActive("/element-types") ||
      isActive("/items-management") ||
      isActive("/unit-codes-management") ||
      isActive("/general-accounts-management") ||
      isActive("/locations-management") ||
      isActive("/customer-management") ||
      isActive("/vendor-management")
    );
  };

  const isApprovalActive = () => {
    return (
      isActive("/approval-groups") ||
      isActive("/approvers-management")
    );
  };

  const isDocumentsActive = () => {
    return (
      isActive("/documents") ||
      isActive("/documents/archived") ||
      isActive("/documents/completed-not-archived") ||
      isArchivedDocumentContext() ||
      isCompletedDocumentContext()
    );
  };

  // Fetch pending approvals for badge
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ["pendingApprovals"],
    queryFn: approvalService.getPendingApprovals,
    enabled: !isSimpleUser,
  });

  // State for submenu toggles
  const [documentsMenuOpen, setDocumentsMenuOpen] = useState(false);
  const [lineElementsMenuOpen, setLineElementsMenuOpen] = useState(false);
  const [approvalMenuOpen, setApprovalMenuOpen] = useState(false);

  // Auto-expand submenus based on current route
  useEffect(() => {
    if (isDocumentsActive()) {
      setDocumentsMenuOpen(true);
    }
    if (isLineElementsActive()) {
      setLineElementsMenuOpen(true);
    }
    if (isApprovalActive()) {
      setApprovalMenuOpen(true);
    }
  }, [location.pathname]);

  const handleSubmenuToggle = (menu: 'approval' | 'lineElements' | 'documents') => {
    switch (menu) {
      case 'documents':
        setDocumentsMenuOpen(!documentsMenuOpen);
        break;
      case 'lineElements':
        setLineElementsMenuOpen(!lineElementsMenuOpen);
        break;
      case 'approval':
        setApprovalMenuOpen(!approvalMenuOpen);
        break;
    }
  };

  // Enhanced responsive classes with original colors
  const getNavItemClasses = (isActiveItem: boolean) => {
    const baseClasses = cn(
      "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out overflow-hidden",
      isMobile ? "py-3" : "py-3 px-5"
    );

    if (isActiveItem) {
      return `${baseClasses} bg-gradient-to-r from-primary/25 via-primary/20 to-primary/15 text-primary border border-primary/20 shadow-lg shadow-primary/10 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`;
    }

    return `${baseClasses} text-foreground/85 hover:text-foreground hover:bg-gradient-to-r hover:from-accent/20 hover:via-accent/15 hover:to-accent/10 hover:shadow-md hover:shadow-accent/5 hover:border hover:border-accent/20 border border-transparent hover:backdrop-blur-sm`;
  };

  const getSubmenuItemClasses = (isActiveItem: boolean) => {
    const baseClasses = cn(
      "group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ease-out overflow-hidden",
      isMobile ? "py-2.5" : "py-2.5 px-6"
    );

    if (isActiveItem) {
      return `${baseClasses} bg-gradient-to-r from-primary/20 to-primary/15 text-primary font-semibold border border-primary/25 shadow-md shadow-primary/5 backdrop-blur-sm before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary before:rounded-r-full`;
    }

    return `${baseClasses} text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-accent/15 hover:to-accent/10 hover:shadow-sm hover:border hover:border-accent/20 border border-transparent hover:font-medium`;
  };

  const getSubmenuButtonClasses = (isActiveSection: boolean, isOpen: boolean) => {
    const baseClasses = cn(
      "group w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out overflow-hidden",
      isMobile ? "py-3" : "py-3 px-5"
    );

    if (isActiveSection) {
      return `${baseClasses} bg-gradient-to-r from-primary/25 via-primary/20 to-primary/15 text-primary border border-primary/20 shadow-lg shadow-primary/10 backdrop-blur-sm`;
    }

    if (isOpen) {
      return `${baseClasses} text-foreground bg-gradient-to-r from-accent/15 to-accent/10 border border-accent/15 shadow-sm backdrop-blur-sm`;
    }

    return `${baseClasses} text-foreground/85 hover:text-foreground hover:bg-gradient-to-r hover:from-accent/20 hover:via-accent/15 hover:to-accent/10 hover:shadow-md hover:shadow-accent/5 hover:border hover:border-accent/20 border border-transparent`;
  };

  // Enhanced navigation item component with better responsive design
  const NavItem = ({ to, icon: Icon, label, description, isActiveItem, badge, onClick }: any) => (
    <Link
      to={to}
      onClick={(e) => {
        onClick?.(e);
        // Close mobile sidebar when clicking a navigation item
        if (isMobile) {
          setOpenMobile(false);
        }
      }}
      className={getNavItemClasses(isActiveItem)}
    >
      {/* Active state background glow */}
      {isActiveItem && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
      )}

      <Icon className={cn(
        "flex-shrink-0 transition-all duration-300 relative z-10",
        isMobile ? "h-5 w-5" : "h-5 w-5",
        isActiveItem
          ? "text-primary drop-shadow-sm"
          : "text-foreground/70 group-hover:text-foreground group-hover:scale-110"
      )} />

      <span className={cn(
        "flex-1 truncate relative z-10 transition-all duration-300",
        isMobile ? "text-sm" : "text-base",
        isActiveItem ? "text-primary font-semibold" : "group-hover:translate-x-0.5"
      )}>
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
      <div className={cn(
        "absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300",
        isActiveItem ? "opacity-0" : ""
      )} />
    </Link>
  );

  // Enhanced submenu button component with better responsive design
  const SubmenuButton = ({ icon: Icon, label, isOpen, isActiveSection, onClick, children }: any) => (
    <li>
      <button
        onClick={onClick}
        className={cn(getSubmenuButtonClasses(isActiveSection, isOpen), "justify-between")}
      >
        {/* Background effect for active/open states */}
        {(isActiveSection || isOpen) && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5 animate-pulse" />
        )}

        <div className="flex items-center gap-3 flex-1 relative z-10">
          <Icon className={cn(
            "flex-shrink-0 transition-all duration-300",
            isMobile ? "h-5 w-5" : "h-5 w-5",
            isActiveSection
              ? "text-primary drop-shadow-sm"
              : isOpen
                ? "text-foreground scale-105"
                : "text-foreground/70 group-hover:text-foreground group-hover:scale-110"
          )} />
          <span className={cn(
            "truncate transition-all duration-300",
            isMobile ? "text-sm" : "text-base",
            isActiveSection
              ? "text-primary font-semibold"
              : isOpen
                ? "text-foreground font-medium"
                : "group-hover:translate-x-0.5"
          )}>
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {/* Enhanced active indicator */}
          {isActiveSection && (
            <div className="w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50 animate-pulse" />
          )}
          <div className={cn(
            "transition-all duration-300",
            isOpen ? 'rotate-90 scale-110' : 'group-hover:scale-110'
          )}>
            <ChevronRight className={cn(
              isMobile ? "h-4 w-4" : "h-4 w-4",
              isActiveSection
                ? "text-primary"
                : isOpen
                  ? "text-foreground"
                  : "text-foreground/70 group-hover:text-foreground"
            )} />
          </div>
        </div>

        {/* Hover effect line */}
        <div className={cn(
          "absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300",
          isActiveSection || isOpen ? "opacity-0" : ""
        )} />
      </button>

      {/* Enhanced submenu with improved animations */}
      <div className={cn(
        "overflow-hidden transition-all duration-500 ease-out",
        isOpen ? ' opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
      )}>
        <ul className={cn(
          "ml-6 space-y-1 border-l-2 border-gradient-to-b from-primary/30 to-primary/10 pl-4 relative",
          isMobile ? "ml-4" : "ml-6"
        )}>
          {/* Animated border effect with glow */}
          <div className="absolute left-0 top-0 w-0.5 bg-gradient-to-b from-primary/60 via-primary/40 to-transparent h-full rounded-full shadow-sm shadow-primary/20" />
          {children}
        </ul>
      </div>
    </li>
  );

  return (
    <div className={cn(
      "h-full w-full bg-background/10 backdrop-blur-xl border-r border-border/30 overflow-y-auto supports-[backdrop-filter]:bg-background/5",
      isMobile ? "px-3" : "px-6"
    )}>
      {/* Mobile Close Button */}
      {isMobile && (
        <div className="flex justify-end p-2 border-b border-border/30">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 rounded-lg"
            onClick={() => setOpenMobile(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* User Profile Section */}
      <UserProfileSection />

      <div className={cn(
        "py-2",
        isMobile ? "px-2" : "px-2"
      )}>
        <div className={cn(
          "flex items-center gap-2 px-2 py-3",
          isMobile ? "py-2" : "py-3"
        )}>
          <p className={cn(
            "font-semibold text-muted-foreground/80 uppercase tracking-wide flex-1",
            isMobile ? "text-xs" : "text-xs"
          )}>
            {t('nav.mainNavigation')}
          </p>
          <div className="w-8 h-0.5 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent rounded-full" />
        </div>

        <ul className={cn(
          "space-y-1.5",
          isMobile ? "space-y-2" : "space-y-1.5"
        )}>
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
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <FileText className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-4 w-4"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-base")}>{t('nav.activated')}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/documents/archived"
                className={getSubmenuItemClasses(
                  isActive("/documents/archived") || isArchivedDocumentContext()
                )}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <Archive className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-4 w-4"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-base")}>{t('nav.archived')}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/documents/completed-not-archived"
                className={getSubmenuItemClasses(
                  isActive("/documents/completed-not-archived") || isCompletedDocumentContext()
                )}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <FileCheck className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-4 w-4"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-base")}>{t('nav.completed')}</span>
              </Link>
            </li>
          </SubmenuButton>

          {/* Document Types Management - Admin and FullUser */}
          {!isSimpleUser && (
            <li>
              <NavItem
                to="/document-types-management"
                icon={Tag}
                label={t("nav.documentTypes")}
                description={navDescriptions["/document-types-management"]}
                isActiveItem={isActive("/document-types-management")}
              />
            </li>
          )}

          {/* Basic Data Section */}
          <SubmenuButton
            icon={Layers}
            label={t("nav.lineElements")}
            isOpen={lineElementsMenuOpen}
            isActiveSection={isLineElementsActive()}
            onClick={() => handleSubmenuToggle('lineElements')}
          >
            <li>
              <Link
                to="/element-types"
                className={getSubmenuItemClasses(isActive("/element-types"))}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <Hash className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-2" : "h-4 w-4"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-base")}>{t('nav.elementTypes')}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/items-management"
                className={getSubmenuItemClasses(isActive("/items-management"))}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <Package className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-4 w-4"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-base")}>{t('nav.items')}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/unit-codes-management"
                className={getSubmenuItemClasses(isActive("/unit-codes-management"))}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <Calculator className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-4 w-4"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-base")}>{t('nav.unitCodes')}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/general-accounts-management"
                className={getSubmenuItemClasses(isActive("/general-accounts-management"))}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <Box className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-4 w-4"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-base")}>{t('nav.generalAccounts')}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/locations-management"
                className={getSubmenuItemClasses(isActive("/locations-management"))}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <MapPin className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-4 w-4"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-base")}>{t('nav.locations')}</span>
              </Link>
            </li>
              <li>
                <Link
                  to="/customer-management"
                  className={getSubmenuItemClasses(isActive("/customer-management"))}
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <Users className={cn(
                    "transition-all duration-300 group-hover:scale-110",
                    isMobile ? "h-4 w-4" : "h-4 w-4"
                  )} />
                  <span className={cn(isMobile ? "text-sm" : "text-base")}>Customer </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/vendor-management"
                  className={getSubmenuItemClasses(isActive("/vendor-management"))}
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <Truck className={cn(
                    "transition-all duration-300 group-hover:scale-110",
                    isMobile ? "h-4 w-4" : "h-4 w-4"
                  )} />
                  <span className={cn(isMobile ? "text-sm" : "text-base")}>Vendor </span>
                </Link>
              </li>
            
          </SubmenuButton>

          {/* Circuits - Admin and FullUser */}
          {!isSimpleUser && (
            <li>
              <NavItem
                to="/circuits"
                icon={GitBranch}
                label={t("nav.circuits")}
                description={navDescriptions["/circuits"]}
                isActiveItem={isActive("/circuits")}
              />
            </li>
          )}

          {/* Approval Section */}
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
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <UsersRound className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-4 w-4"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-base")}>{t('nav.approvalGroups')}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/approvers-management"
                className={getSubmenuItemClasses(isActive("/approvers-management"))}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <UserCog className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-4 w-4"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-base")}>{t('nav.approvers')}</span>
              </Link>
            </li>
          </SubmenuButton>

          {/* Responsibility Centres - Only for Admin */}
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
        </ul>
      </div>
    </div>
  );
}

