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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { UserProfileSection } from "./UserProfileSection";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import approvalService from "@/services/approvalService";
import { useTranslation } from "@/hooks/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface SidebarNavProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SidebarNav({ collapsed = false, onToggleCollapse }: SidebarNavProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const isMobile = useIsMobile();
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
      isActive("/locations-management")
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

  // Enhanced responsive classes
  const getNavItemClasses = (isActiveItem: boolean) => {
    const baseClasses = cn(
      "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-out cursor-pointer overflow-hidden",
      "hover:shadow-md hover:shadow-primary/5",
      isMobile ? "py-3" : "py-2.5",
      isActiveItem 
        ? "bg-gradient-to-r from-primary/10 via-primary/8 to-primary/6 border border-primary/20 shadow-sm shadow-primary/10" 
        : "hover:bg-gradient-to-r hover:from-accent/10 hover:via-accent/8 hover:to-accent/6 hover:border hover:border-accent/20"
    );

    return baseClasses;
  };

  const getSubmenuItemClasses = (isActiveItem: boolean) => {
    const baseClasses = cn(
      "group flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-300 ease-out cursor-pointer relative overflow-hidden",
      "hover:shadow-sm hover:shadow-primary/5",
      isMobile ? "py-2.5" : "py-2",
      isActiveItem 
        ? "bg-gradient-to-r from-primary/8 via-primary/6 to-primary/4 border border-primary/15 text-primary font-medium" 
        : "hover:bg-gradient-to-r hover:from-accent/8 hover:via-accent/6 hover:to-accent/4 hover:text-foreground"
    );

    return baseClasses;
  };

  const getSubmenuButtonClasses = (isActiveSection: boolean, isOpen: boolean) => {
    const baseClasses = cn(
      "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-out cursor-pointer overflow-hidden w-full",
      "hover:shadow-md hover:shadow-primary/5",
      isMobile ? "py-3" : "py-2.5",
      isActiveSection || isOpen
        ? "bg-gradient-to-r from-primary/8 via-primary/6 to-primary/4 border border-primary/15" 
        : "hover:bg-gradient-to-r hover:from-accent/10 hover:via-accent/8 hover:to-accent/6 hover:border hover:border-accent/20"
    );

    return baseClasses;
  };

  // Enhanced navigation item component with better responsive design
  const NavItem = ({ to, icon: Icon, label, description, isActiveItem, badge, onClick }: any) => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            onClick={onClick}
            className={cn(
              getNavItemClasses(isActiveItem),
              collapsed ? "justify-center px-3" : ""
            )}
          >
            {/* Active state background glow */}
            {isActiveItem && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
            )}

            <Icon className={cn(
              "flex-shrink-0 transition-all duration-300 relative z-10",
              isMobile ? "h-5 w-5" : "h-4 w-4",
              isActiveItem
                ? "text-primary drop-shadow-sm"
                : "text-foreground/70 group-hover:text-foreground group-hover:scale-110"
            )} />

            {!collapsed && (
              <span className={cn(
                "flex-1 truncate relative z-10 transition-all duration-300",
                isMobile ? "text-sm" : "text-xs",
                isActiveItem ? "text-primary font-semibold" : "group-hover:translate-x-0.5"
              )}>
                {label}
              </span>
            )}

            {!collapsed && badge && (
              <div className="flex items-center justify-center h-5 w-5 text-xs bg-destructive text-destructive-foreground rounded-full font-bold animate-pulse shadow-lg relative z-10">
                {badge}
              </div>
            )}

            {/* Enhanced active indicator */}
            {isActiveItem && !collapsed && (
              <div className="absolute right-3 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50 animate-pulse relative z-10" />
            )}

            {/* Hover effect line */}
            <div className={cn(
              "absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300",
              isActiveItem ? "opacity-0" : ""
            )} />
          </Link>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent
            side="right"
            className="bg-popover/95 backdrop-blur-md border border-primary/20 shadow-xl rounded-lg p-3 max-w-xs"
            sideOffset={12}
          >
            <div>
              <p className="font-semibold text-sm text-foreground">{label}</p>
              {description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  // Enhanced submenu button component with better responsive design
  const SubmenuButton = ({ icon: Icon, label, isOpen, isActiveSection, onClick, children }: any) => (
    <li>
      <button
        onClick={collapsed ? undefined : onClick}
        className={cn(
          getSubmenuButtonClasses(isActiveSection, isOpen), 
          collapsed ? "justify-center px-3" : "justify-between"
        )}
      >
        {/* Background effect for active/open states */}
        {(isActiveSection || isOpen) && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5 animate-pulse" />
        )}

        <div className={cn(
          "flex items-center flex-1 relative z-10",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <Icon className={cn(
            "flex-shrink-0 transition-all duration-300",
            isMobile ? "h-5 w-5" : "h-4 w-4",
            isActiveSection
              ? "text-primary drop-shadow-sm"
              : isOpen
                ? "text-foreground scale-105"
                : "text-foreground/70 group-hover:text-foreground group-hover:scale-110"
          )} />
          {!collapsed && (
            <span className={cn(
              "truncate transition-all duration-300",
              isMobile ? "text-sm" : "text-xs",
              isActiveSection
                ? "text-primary font-semibold"
                : isOpen
                  ? "text-foreground font-medium"
                  : "group-hover:translate-x-0.5"
            )}>
              {label}
            </span>
          )}
        </div>

        {!collapsed && (
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
                isMobile ? "h-4 w-4" : "h-3 w-3",
                isActiveSection
                  ? "text-primary"
                  : isOpen
                    ? "text-foreground"
                    : "text-foreground/70 group-hover:text-foreground"
              )} />
            </div>
          </div>
        )}

        {/* Hover effect line */}
        <div className={cn(
          "absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300",
          isActiveSection || isOpen ? "opacity-0" : ""
        )} />
      </button>

      {/* Enhanced submenu with improved animations - hidden when collapsed */}
      {!collapsed && (
        <div className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          isOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
        )}>
          <ul className={cn(
            "space-y-1 border-l-2 border-gradient-to-b from-primary/30 to-primary/10 pl-4 relative",
            isMobile ? "ml-4" : "ml-6"
          )}>
            {/* Animated border effect with glow */}
            <div className="absolute left-0 top-0 w-0.5 bg-gradient-to-b from-primary/60 via-primary/40 to-transparent h-full rounded-full shadow-sm shadow-primary/20" />
            {children}
          </ul>
        </div>
      )}
    </li>
  );

  return (
    <div className={cn(
      "h-full w-full bg-background/10 backdrop-blur-xl border-r border-border/30 overflow-y-auto supports-[backdrop-filter]:bg-background/5",
      isMobile ? "px-3" : "px-4"
    )}>
      {/* User Profile Section */}
      <UserProfileSection />

      {/* Desktop Sidebar Toggle Button */}
      {!isMobile && onToggleCollapse && (
        <div className={cn(
          "flex p-2 border-b border-border/30",
          collapsed ? "justify-center" : "justify-end"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 rounded-lg"
            onClick={onToggleCollapse}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      <div className={cn(
        "py-2",
        isMobile ? "px-2" : "px-4"
      )}>
        {!collapsed && (
          <div className={cn(
            "flex items-center gap-2 px-2 py-3",
            isMobile ? "py-2" : "py-3"
          )}>
            <p className={cn(
              "font-semibold text-muted-foreground/80 uppercase tracking-wide flex-1",
              isMobile ? "text-xs" : "text-xs"
            )}>
              Main Navigation
            </p>
            <div className="w-8 h-0.5 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent rounded-full" />
          </div>
        )}

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
              >
                <FileText className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-xs")}>Activated</span>
              </Link>
            </li>
            <li>
              <Link
                to="/documents/archived"
                className={getSubmenuItemClasses(
                  isActive("/documents/archived") || isArchivedDocumentContext()
                )}
              >
                <Archive className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-xs")}>Archived</span>
              </Link>
            </li>
            <li>
              <Link
                to="/documents/completed-not-archived"
                className={getSubmenuItemClasses(
                  isActive("/documents/completed-not-archived") || isCompletedDocumentContext()
                )}
              >
                <FileCheck className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-xs")}>Completed</span>
              </Link>
            </li>
          </SubmenuButton>

          {/* Document Types Management - Only for Admin */}
          {isAdmin && (
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
              >
                <Hash className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-xs")}>Element Types</span>
              </Link>
            </li>
            <li>
              <Link
                to="/items-management"
                className={getSubmenuItemClasses(isActive("/items-management"))}
              >
                <Package className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-xs")}>Items</span>
              </Link>
            </li>
            <li>
              <Link
                to="/unit-codes-management"
                className={getSubmenuItemClasses(isActive("/unit-codes-management"))}
              >
                <Calculator className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-xs")}>Unit Codes</span>
              </Link>
            </li>
            <li>
              <Link
                to="/general-accounts-management"
                className={getSubmenuItemClasses(isActive("/general-accounts-management"))}
              >
                <Box className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-xs")}>General Accounts</span>
              </Link>
            </li>
            <li>
              <Link
                to="/locations-management"
                className={getSubmenuItemClasses(isActive("/locations-management"))}
              >
                <MapPin className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-xs")}>Locations</span>
              </Link>
            </li>
          </SubmenuButton>

          {/* Circuits - Only for Admin */}
          {isAdmin && (
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
              >
                <UsersRound className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-xs")}>Approval Groups</span>
              </Link>
            </li>
            <li>
              <Link
                to="/approvers-management"
                className={getSubmenuItemClasses(isActive("/approvers-management"))}
              >
                <UserCog className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
                <span className={cn(isMobile ? "text-sm" : "text-xs")}>Approvers</span>
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

          {/* Customer Management - Only for Admin */}
          {isAdmin && (
            <li>
              <NavItem
                to="/customer-management"
                icon={Users}
                label="Customer Management"
                description={navDescriptions["/customer-management"]}
                isActiveItem={isActive("/customer-management")}
              />
            </li>
          )}

          {/* Vendor Management - Only for Admin */}
          {isAdmin && (
            <li>
              <NavItem
                to="/vendor-management"
                icon={Truck}
                label="Vendor Management"
                description={navDescriptions["/vendor-management"]}
                isActiveItem={isActive("/vendor-management")}
              />
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

