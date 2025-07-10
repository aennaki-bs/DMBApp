import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Index from "./pages/common/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/user/Dashboard";
import Profile from "./pages/user/Profile";
import NotFound from "./pages/common/NotFound";
import Welcome from "./pages/auth/Welcome";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";
import ProtectedRoute from "./components/ProtectedRoute";
import EmailVerification from "./pages/register/EmailVerification";
import AdminPage from "./pages/admin/Admin";
import DocumentsPageWrapper from "./pages/documents/DocumentsPageWrapper";
import ArchivedDocuments from "./pages/documents/ArchivedDocuments";
// import DocumentTypes from "./pages/documents/DocumentTypes";
import DocumentTypesManagement from "./pages/documents/DocumentTypesManagement";
import SubTypeManagement from "./pages/reference-data/SubTypeManagement";
import CreateDocument from "./pages/documents/CreateDocument";
import ViewDocument from "./pages/documents/ViewDocument";
import EditDocument from "./pages/documents/EditDocument";
import DocumentLignesPage from "./pages/documents/DocumentLignesPage";
import CircuitsPage from "./pages/workflows/Circuits";
import CircuitStepsPage from "./pages/workflows/CircuitStepsPage";
import CircuitStatusesPage from "./pages/workflows/CircuitStatusesPage";
import CircuitStatusStepsPage from "./pages/workflows/CircuitTransitionsPage";
// import StepStatusesPage from "./pages/workflows/StepStatusesPage";
import PendingApprovalsPage from "./pages/workflows/PendingApprovalsPage";
import UserManagement from "./pages/admin/UserManagement";
import DocumentFlowPage from "./pages/documents/DocumentFlowPage";
import { Layout } from "./components/layout/Layout";
import Settings from "./pages/user/Settings";
import { SettingsProvider } from "./context/SettingsContext";
import SubTypeManagementPage from "./pages/reference-data/SubTypeManagementPage";
import RegistrationSuccess from "./pages/auth/RegistrationSuccess";
import ApprovalGroupsManagement from "./pages/admin/ApprovalGroupsManagement";
import ApproversManagement from "./pages/admin/ApproversManagement";
import ButtonShowcasePage from "./pages/demo/ButtonShowcase";
import ResponsibilityCentreManagement from "./pages/admin/ResponsibilityCentreManagement";
import LineElementsManagement from "./pages/reference-data/LineElementsManagement";
import ItemsPage from "./pages/reference-data/ItemsPage";
import UnitCodesPage from "./pages/reference-data/UnitCodesPage";
import GeneralAccountsPage from "./pages/reference-data/GeneralAccountsPage";
import CustomerManagementPage from "./pages/reference-data/CustomerManagement";
import VendorManagementPage from "./pages/reference-data/VendorManagement";
import LocationsManagementPage from "./pages/reference-data/LocationsManagement";
import ThemeDemo from "./pages/demo/ThemeDemo";
import ElementTypesPage from "./pages/reference-data/ElementTypesPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <SettingsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/registration-success"
                  element={<RegistrationSuccess />}
                />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/verify/:email" element={<EmailVerification />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/update-password/:email"
                  element={<UpdatePassword />}
                />
                <Route path="/ui-showcase" element={<ButtonShowcasePage />} />
                <Route path="/theme-demo" element={<ThemeDemo />} />

                {/* Protected routes with layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="Admin">
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/user-management"
                    element={
                      <ProtectedRoute requiredRole="Admin">
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Document Types Management routes */}
                  <Route
                    path="/document-types"
                    element={
                      <Navigate to="/document-types-management" replace />
                    }
                  />
                  <Route
                    path="/document-types-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <DocumentTypesManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Document Type Detail route */}
                  {/* <Route
                    path="/document-types/:id"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <DocumentTypeDetail />
                      </ProtectedRoute>
                    }
                  /> */}

                  {/* Line Elements Management route */}
                  <Route
                    path="/line-elements-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <LineElementsManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Individual Line Elements pages */}
                  <Route
                    path="/items-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <ItemsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/unit-codes-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <UnitCodesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/general-accounts-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <GeneralAccountsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/locations-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <LocationsManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Document routes */}
                  <Route path="/documents" element={<DocumentsPageWrapper />} />
                  <Route path="/documents/archived" element={<ArchivedDocuments />} />
                  <Route path="/documents/:id" element={<ViewDocument />} />

                  <Route
                    path="/document-types/:id/subtypes"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <SubTypeManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Add the missing subtype-management route */}
                  <Route
                    path="/subtype-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <SubTypeManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Line Elements Management routes */}
                  <Route
                    path="/element-types"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <ElementTypesPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/documents/create"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <CreateDocument />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/documents/:id/edit"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <EditDocument />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/documents/:id/flow"
                    element={<DocumentFlowPage />}
                  />

                  {/* Document Lignes routes */}
                  <Route
                    path="/documents/:id/lignes"
                    element={
                      <ProtectedRoute requiresManagement>
                        <DocumentLignesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/documents/:id/lignes/:ligneId"
                    element={<ViewDocument />}
                  />

                  {/* Document SousLignes routes */}
                  <Route
                    path="/documents/:id/lignes/:ligneId/souslignes"
                    element={
                      <ProtectedRoute requiresManagement>
                        <ViewDocument />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/documents/:id/lignes/:ligneId/souslignes/:sousLigneId"
                    element={<ViewDocument />}
                  />

                  {/* Circuit Management routes */}
                  <Route path="/circuits" element={<CircuitsPage />} />
                  <Route
                    path="/circuits/:circuitId/steps"
                    element={<CircuitStepsPage />}
                  />
                  <Route
                    path="/circuits/:circuitId/statuses"
                    element={<CircuitStatusesPage />}
                  />
                  <Route
                    path="/circuit/:circuitId/steps"
                    element={<CircuitStepsPage />}
                  />
                  <Route
                    path="/circuit/:circuitId/transitions"
                    element={<CircuitStatusStepsPage />}
                  />
                  {/* <Route
                    path="/circuits/:circuitId/steps/:stepId/statuses"
                    element={<StepStatusesPage />}
                  /> */}
                  <Route
                    path="/pending-approvals"
                    element={
                      <ProtectedRoute requiredRole={["Admin", "FullUser"]}>
                        <PendingApprovalsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Approval Groups route */}
                  <Route
                    path="/approval-groups"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <ApprovalGroupsManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Approvers Management route */}
                  <Route
                    path="/approvers-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <ApproversManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Responsibility Centre Management route */}
                  <Route
                    path="/responsibility-centres"
                    element={
                      <ProtectedRoute requiresManagement requiredRole="Admin">
                        <ResponsibilityCentreManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Customer Management route */}
                  <Route
                    path="/customer-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <CustomerManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Vendor Management route */}
                  <Route
                    path="/vendor-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <VendorManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Settings route */}
                  <Route path="/settings" element={<Settings />} />
                </Route>
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </SettingsProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
