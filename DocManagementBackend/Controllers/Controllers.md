# Controllers Documentation

## Overview
This document provides comprehensive documentation for all API controllers in the Document Management Backend. Each controller manages specific business domains with role-based authorization and comprehensive error handling.

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Core Document Management](#core-document-management)
3. [Workflow Management](#workflow-management)
4. [Approval System](#approval-system)
5. [Administrative Functions](#administrative-functions)
6. [Reference Data Management](#reference-data-management)
7. [ERP Integration](#erp-integration)
8. [Utility Controllers](#utility-controllers)

---

## Authentication & Authorization

### AuthController
**Purpose**: Handles user authentication, registration, and account verification.
**Base Route**: `/api/Auth`
**Authorization**: Public endpoints for authentication

#### Key Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| POST | `/valide-email` | Public | Validates email availability |
| POST | `/register` | Public | User registration with company details |
| POST | `/login` | Public | User authentication |
| POST | `/refresh-token` | Public | JWT token refresh |
| POST | `/verify-email` | Public | Email verification |
| POST | `/resend-verification` | Public | Resend verification email |

#### Example Usage
```http
POST /api/Auth/register
Content-Type: application/json

{
  "email": "user@company.com",
  "username": "newuser",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "ACME Corp",
  "city": "New York",
  "country": "USA"
}
```

### AccountController
**Purpose**: Manages user account information and profile updates.
**Base Route**: `/api/Account`
**Authorization**: Authenticated users

#### Key Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/user-info` | All Users | Get current user information |
| PUT | `/update-profile` | All Users | Update user profile |
| POST | `/change-password` | All Users | Change user password |
| POST | `/upload-profile-picture` | All Users | Upload profile picture |

---

## Core Document Management

### DocumentsController
**Purpose**: Central controller for document lifecycle management with ERP integration.
**Base Route**: `/api/Documents`
**Authorization**: Role-based access control

#### Key Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/` | Admin, FullUser, SimpleUser | Get all documents with filtering |
| GET | `/my-documents` | Admin, FullUser, SimpleUser | Get user's documents |
| GET | `/{id}` | Admin, FullUser, SimpleUser | Get specific document |
| GET | `/recent` | Admin, FullUser, SimpleUser | Get recent documents |
| GET | `/archived` | Admin, FullUser, SimpleUser | Get archived documents |
| GET | `/completed-not-archived` | Admin, FullUser, SimpleUser | Get completed but not archived |
| POST | `/` | Admin, FullUser | Create new document |
| PUT | `/{id}` | Admin, FullUser | Update document |
| DELETE | `/{id}` | Admin, FullUser | Delete document |

#### Document Type Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/Types` | Admin, FullUser | Get all document types |
| GET | `/Types/{id}` | Admin, FullUser | Get specific document type |
| POST | `/Types` | Admin, FullUser | Create document type |
| PUT | `/Types/{id}` | Admin, FullUser | Update document type |
| DELETE | `/Types/{id}` | Admin | Delete document type |

#### ERP Integration Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| POST | `/{id}/archive-to-erp` | Admin | Archive document to ERP |
| POST | `/{id}/create-lines-in-erp` | Admin | Create document lines in ERP |
| GET | `/{id}/erp-status` | Admin, FullUser, SimpleUser | Get ERP archival status |
| GET | `/{id}/erp-errors` | Admin, FullUser, SimpleUser | Get ERP errors |
| POST | `/erp-errors/{errorId}/resolve` | Admin, FullUser | Resolve ERP error |
| POST | `/check-erp-status` | Admin, FullUser | Check ERP status for multiple documents |

#### Example Usage
```http
POST /api/Documents
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "title": "Purchase Order #1001",
  "documentAlias": "PO",
  "docDate": "2025-01-15T00:00:00Z",
  "comptableDate": "2025-01-15T00:00:00Z",
  "typeId": 1,
  "subTypeId": 2,
  "responsibilityCentreId": 1,
  "customerVendorCode": "VENDOR001",
  "customerVendorName": "ACME Supplies",
  "documentExterne": "EXT-2025-001",
  "circuitId": 3
}
```

---

## Workflow Management

### WorkflowController
**Purpose**: Manages document workflow, status transitions, and circuit operations.
**Base Route**: `/api/Workflow`
**Authorization**: Role-based access control

#### Core Workflow Operations

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| POST | `/assign-circuit` | Admin, FullUser | Assign document to circuit |
| POST | `/move-to-status` | Admin, FullUser | Move document to specific status |
| POST | `/return-to-previous` | Admin, FullUser | Return document to previous status |
| POST | `/complete-status` | Admin, FullUser | Complete document status |
| POST | `/reinitialize-workflow` | Admin, FullUser | Reinitialize document workflow |

#### Workflow Information

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/document/{id}/current-status` | All Users | Get document current status |
| GET | `/document/{id}/available-transitions` | All Users | Get available status transitions |
| GET | `/document/{id}/next-statuses` | All Users | Get next possible statuses |
| GET | `/document/{id}/workflow-status` | All Users | Get complete workflow status |
| GET | `/document/{id}/step-statuses` | All Users | Get step statuses |
| GET | `/document/{id}/history` | All Users | Get document workflow history |
| GET | `/pending-documents` | All Users | Get pending documents |

#### Configuration & Debug

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| POST | `/configure-step-approval` | Admin, FullUser | Configure step approval settings |
| GET | `/debug/document/{id}/steps` | All Users | Debug document steps |

#### Example Usage
```http
POST /api/Workflow/move-to-status
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "documentId": 123,
  "targetStatusId": 5,
  "comments": "Moving to review status"
}
```

### CircuitController
**Purpose**: Manages workflow circuits, steps, and circuit configurations.
**Base Route**: `/api/Circuit`
**Authorization**: Authenticated users

#### Circuit Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/` | All Users | Get all circuits |
| GET | `/{id}` | All Users | Get specific circuit |
| POST | `/` | Admin, FullUser | Create new circuit |
| PUT | `/{id}` | Admin, FullUser | Update circuit |
| DELETE | `/{id}` | Admin | Delete circuit |
| GET | `/{id}/steps` | All Users | Get circuit steps |
| GET | `/{id}/statuses` | All Users | Get circuit statuses |

### StatusController
**Purpose**: Manages workflow statuses within circuits.
**Base Route**: `/api/Status`
**Authorization**: Authenticated users

#### Status Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/circuit/{circuitId}` | All Users | Get statuses for circuit |
| POST | `/` | Admin, FullUser | Create new status |
| PUT | `/{id}` | Admin, FullUser | Update status |
| DELETE | `/{id}` | Admin | Delete status |

---

## Approval System

### ApprovalController
**Purpose**: Comprehensive approval system with individual and group approvals.
**Base Route**: `/api/Approval`
**Authorization**: Role-based access control

#### Core Approval Workflow

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/pending` | All Users | Get pending approvals for current user |
| GET | `/pending/user/{userId}` | Admin, FullUser | Get pending approvals for specific user |
| POST | `/{approvalId}/respond` | Admin, FullUser | Respond to approval request |
| GET | `/{approvalId}/status-summary` | All Users | Get approval status summary |

#### Approval History & Reports

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/history/{documentId}` | All Users | Get approval history for document |
| GET | `/history/user/{userId}` | Admin, FullUser | Get user's approval history |
| GET | `/history` | Admin, FullUser | Get general approval history |
| GET | `/pending-approvals` | Admin, FullUser | Get all pending approvals |
| GET | `/rejected-approvals` | Admin, FullUser | Get rejected approvals |
| GET | `/documents-to-approve` | All Users | Get documents awaiting approval |
| GET | `/document/{documentId}` | All Users | Get document approvals |

#### Approval Configuration

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/configure/steps` | Admin, FullUser | Get steps with approval configuration |
| POST | `/configure/step/{stepId}` | Admin, FullUser | Configure step approval |
| GET | `/configure/step/{stepId}` | Admin, FullUser | Get step approval configuration |

#### Approver Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/eligible-approvers` | Admin, FullUser | Get eligible approvers |
| GET | `/available-approvers` | Admin, FullUser | Get available approvers |
| GET | `/approvators` | Admin, FullUser | Get all approvators |
| POST | `/approvators` | Admin, FullUser | Create approvator |
| PUT | `/approvators/{id}` | Admin, FullUser | Update approvator |
| DELETE | `/approvators/{id}` | Admin, FullUser | Delete approvator |

#### Approval Groups

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/groups` | Admin, FullUser | Get approval groups |
| POST | `/groups` | Admin, FullUser | Create approval group |
| PUT | `/groups/{id}` | Admin, FullUser | Update approval group |
| DELETE | `/groups/{id}` | Admin, FullUser | Delete approval group |
| GET | `/groups/{id}/users` | Admin, FullUser | Get group users |
| POST | `/groups/{id}/users` | Admin, FullUser | Add user to group |
| DELETE | `/groups/{groupId}/users/{userId}` | Admin, FullUser | Remove user from group |

#### Example Usage
```http
POST /api/Approval/123/respond
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "isApproved": true,
  "comments": "Approved - all documents are in order"
}
```

---

## Administrative Functions

### AdminController
**Purpose**: Administrative functions for user and system management.
**Base Route**: `/api/Admin`
**Authorization**: Admin only

#### User Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/users` | Admin | Get all users |
| GET | `/users/unassigned` | Admin | Get unassigned users |
| GET | `/users/{id}` | Admin | Get specific user |
| POST | `/users` | Admin | Create new user |
| PUT | `/users/{id}` | Admin | Update user |
| DELETE | `/delete-users` | Admin | Delete multiple users |
| GET | `/roles` | Admin | Get all roles |
| GET | `/logs/{id}` | Admin | Get user log history |

#### Example Usage
```http
POST /api/Admin/users
Authorization: Bearer {admin-jwt-token}
Content-Type: application/json

{
  "email": "newuser@company.com",
  "username": "newuser",
  "passwordHash": "hashedpassword",
  "firstName": "Jane",
  "lastName": "Smith",
  "roleName": "FullUser",
  "responsibilityCenterId": 1,
  "city": "Boston",
  "country": "USA"
}
```

### DashboardController
**Purpose**: Provides dashboard statistics and overview data.
**Base Route**: `/api/Dashboard`
**Authorization**: Authenticated users

#### Dashboard Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/stats` | All Users | Get dashboard statistics |
| GET | `/activity-summary` | All Users | Get activity summary |
| GET | `/recent-activity` | All Users | Get recent activity |

---

## Reference Data Management

### ItemController
**Purpose**: Manages inventory items for document lines.
**Base Route**: `/api/Item`
**Authorization**: Authenticated users

#### Item Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/` | All Users | Get all items |
| GET | `/{code}` | All Users | Get specific item |
| POST | `/` | Admin, FullUser | Create item |
| PUT | `/{code}` | Admin, FullUser | Update item |
| DELETE | `/{code}` | Admin | Delete item |

### GeneralAccountsController
**Purpose**: Manages general ledger accounts for financial document lines.
**Base Route**: `/api/GeneralAccounts`
**Authorization**: Authenticated users

#### Account Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/` | All Users | Get all general accounts |
| GET | `/{code}` | All Users | Get specific account |
| POST | `/` | Admin, FullUser | Create account |
| PUT | `/{code}` | Admin, FullUser | Update account |
| DELETE | `/{code}` | Admin | Delete account |

### CustomerController
**Purpose**: Manages customer data for sales documents.
**Base Route**: `/api/Customer`
**Authorization**: Authenticated users

#### Customer Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/` | All Users | Get all customers |
| GET | `/{code}` | All Users | Get specific customer |
| POST | `/` | Admin, FullUser | Create customer |
| PUT | `/{code}` | Admin, FullUser | Update customer |
| DELETE | `/{code}` | Admin | Delete customer |

### VendorController
**Purpose**: Manages vendor data for purchase documents.
**Base Route**: `/api/Vendor`
**Authorization**: Authenticated users

#### Vendor Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/` | All Users | Get all vendors |
| GET | `/{code}` | Get specific vendor |
| POST | `/` | Admin, FullUser | Create vendor |
| PUT | `/{code}` | Admin, FullUser | Update vendor |
| DELETE | `/{code}` | Admin | Delete vendor |

### LocationController
**Purpose**: Manages inventory locations.
**Base Route**: `/api/Location`
**Authorization**: Authenticated users

#### Location Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/` | All Users | Get all locations |
| GET | `/{code}` | All Users | Get specific location |
| POST | `/` | Admin, FullUser | Create location |
| PUT | `/{code}` | Admin, FullUser | Update location |
| DELETE | `/{code}` | Admin | Delete location |

### UniteCodeController
**Purpose**: Manages units of measure.
**Base Route**: `/api/UniteCode`
**Authorization**: Authenticated users

#### Unit Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/` | All Users | Get all units of measure |
| GET | `/{code}` | All Users | Get specific unit |
| POST | `/` | Admin, FullUser | Create unit |
| PUT | `/{code}` | Admin, FullUser | Update unit |
| DELETE | `/{code}` | Admin | Delete unit |

### ResponsibilityCentreController
**Purpose**: Manages organizational responsibility centres.
**Base Route**: `/api/ResponsibilityCentre`
**Authorization**: Authenticated users

#### Responsibility Centre Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/` | All Users | Get all responsibility centres |
| GET | `/{id}` | All Users | Get specific centre |
| POST | `/` | Admin, FullUser | Create centre |
| PUT | `/{id}` | Admin, FullUser | Update centre |
| DELETE | `/{id}` | Admin | Delete centre |

---

## Document Lines & Sub-components

### LignesController
**Purpose**: Manages document line items with ERP integration.
**Base Route**: `/api/Lignes`
**Authorization**: Role-based access control

#### Line Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/` | All Users | Get all lines |
| GET | `/document/{documentId}` | All Users | Get lines for document |
| GET | `/{id}` | All Users | Get specific line |
| POST | `/` | Admin, FullUser | Create line |
| PUT | `/{id}` | Admin, FullUser | Update line |
| DELETE | `/{id}` | Admin, FullUser | Delete line |

#### ERP Integration

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| POST | `/{id}/add-to-erp` | Admin, FullUser | Add line to ERP |
| GET | `/{id}/erp-status` | All Users | Get line ERP status |

### SousLigneController
**Purpose**: Manages sub-line items for detailed line breakdowns.
**Base Route**: `/api/SousLigne`
**Authorization**: Role-based access control

#### Sub-line Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/ligne/{ligneId}` | All Users | Get sub-lines for line |
| POST | `/` | Admin, FullUser | Create sub-line |
| PUT | `/{id}` | Admin, FullUser | Update sub-line |
| DELETE | `/{id}` | Admin, FullUser | Delete sub-line |

### LignesElementTypeController
**Purpose**: Manages line element types (Item/GeneralAccount templates).
**Base Route**: `/api/LignesElementType`
**Authorization**: Role-based access control

#### Element Type Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/` | All Users | Get all element types |
| GET | `/{id}` | All Users | Get specific element type |
| POST | `/` | Admin, FullUser | Create element type |
| PUT | `/{id}` | Admin, FullUser | Update element type |
| DELETE | `/{id}` | Admin | Delete element type |

---

## ERP Integration

### ApiSyncController
**Purpose**: Manages synchronization with external ERP systems (Business Central).
**Base Route**: `/api/ApiSync`
**Authorization**: Admin only

#### Synchronization Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/configurations` | Admin | Get sync configurations |
| POST | `/sync/{endpointName}` | Admin | Trigger manual sync |
| GET | `/status` | Admin | Get sync status |
| GET | `/history` | Admin | Get sync history |
| POST | `/configure` | Admin | Configure sync endpoint |

#### Example Usage
```http
POST /api/ApiSync/sync/Items
Authorization: Bearer {admin-jwt-token}

{
  "force": true,
  "resetLastSync": false
}
```

---

## Utility Controllers

### SubTypeController
**Purpose**: Manages document sub-types with time-based validity.
**Base Route**: `/api/SubType`
**Authorization**: Role-based access control

#### Sub-type Management

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| GET | `/documentType/{typeId}` | All Users | Get sub-types for document type |
| GET | `/{id}` | All Users | Get specific sub-type |
| POST | `/` | Admin, FullUser | Create sub-type |
| PUT | `/{id}` | Admin, FullUser | Update sub-type |
| DELETE | `/{id}` | Admin | Delete sub-type |

### PhoneVerificationController
**Purpose**: Handles phone number verification process.
**Base Route**: `/api/PhoneVerification`
**Authorization**: Authenticated users

#### Verification Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| POST | `/send-code` | All Users | Send verification code |
| POST | `/verify-code` | All Users | Verify phone code |

### OAuthController
**Purpose**: Handles OAuth authentication integrations.
**Base Route**: `/api/OAuth`
**Authorization**: Public/Private hybrid

#### OAuth Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| POST | `/google` | Public | Google OAuth authentication |
| POST | `/microsoft` | Public | Microsoft OAuth authentication |

---

## Authorization Roles

### Role Definitions

| Role | Description | Typical Permissions |
|------|-------------|-------------------|
| **Admin** | Full system access | All operations, user management, system configuration |
| **FullUser** | Business user with document management rights | Create/edit documents, manage workflows, approvals |
| **SimpleUser** | Read-only user with limited operations | View documents, basic operations |

### Authorization Patterns

#### Endpoint Authorization Examples
```csharp
[Authorize(Roles = "Admin")] // Admin only
[Authorize(Roles = "Admin,FullUser")] // Admin or FullUser
[Authorize] // Any authenticated user
// No attribute = Public access
```

#### Custom Authorization Service
The system uses `UserAuthorizationService` for consistent authorization checks:

```csharp
var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
if (!authResult.IsAuthorized)
    return authResult.ErrorResponse!;
```

---

## Error Handling

### Standard Error Responses

| Status Code | Description | Example |
|-------------|-------------|---------|
| 200 | Success | `{ "data": {...} }` |
| 400 | Bad Request | `{ "message": "Invalid request data" }` |
| 401 | Unauthorized | `{ "message": "Authentication required" }` |
| 403 | Forbidden | `{ "message": "Insufficient permissions" }` |
| 404 | Not Found | `{ "message": "Resource not found" }` |
| 500 | Server Error | `{ "message": "Internal server error" }` |

### ERP Integration Error Handling

ERP operations return enhanced error information:

```json
{
  "isSuccess": false,
  "errorMessage": "Failed to create document in ERP system",
  "errorDetails": "Invalid customer code provided",
  "errorType": "ValidationError",
  "statusCode": 400
}
```

---

## Request/Response Examples

### Authentication Flow
```http
# 1. Login
POST /api/Auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "password123"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires": "2025-01-16T12:00:00Z",
  "refreshToken": "abc123...",
  "user": {
    "id": 1,
    "username": "user",
    "role": "FullUser"
  }
}
```

### Document Creation Flow
```http
# 1. Create Document
POST /api/Documents
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Invoice #INV-2025-001",
  "typeId": 1,
  "docDate": "2025-01-15T00:00:00Z",
  "customerVendorCode": "CUST001"
}

# 2. Add Lines
POST /api/Lignes
Authorization: Bearer {token}
Content-Type: application/json

{
  "documentId": 123,
  "title": "Office Supplies",
  "quantity": 10,
  "priceHT": 25.00,
  "type": 1,
  "elementId": "ITEM001"
}

# 3. Assign to Circuit
POST /api/Workflow/assign-circuit
Authorization: Bearer {token}
Content-Type: application/json

{
  "documentId": 123,
  "circuitId": 5
}
```

### Approval Flow
```http
# 1. Get Pending Approvals
GET /api/Approval/pending
Authorization: Bearer {token}

# 2. Respond to Approval
POST /api/Approval/456/respond
Authorization: Bearer {token}
Content-Type: application/json

{
  "isApproved": true,
  "comments": "Approved - budget is available"
}
```

---

## Performance Considerations

### Pagination
Most list endpoints support pagination:
```http
GET /api/Documents?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc
```

### Filtering
Documents and other entities support comprehensive filtering:
```http
GET /api/Documents?status=1&typeId=2&dateFrom=2025-01-01&dateTo=2025-01-31
```

### Caching
- Reference data (Items, Customers, etc.) is cached for performance
- ERP sync operations are throttled to prevent overload
- User permissions are cached per request

---

## API Versioning & Compatibility

### Current Version
- **API Version**: v1 (implied in routes)
- **Backend Version**: .NET 9.0
- **Database**: SQL Server with Entity Framework Core

### Breaking Changes
- Action system removed (July 2025) - affects workflow operations
- Direct status transitions replace action-based workflow
- Enhanced ERP error handling

### Migration Notes
- Clients should use direct status movement endpoints instead of action-based ones
- Approval system remains unchanged and fully functional
- ERP integration enhanced with better error reporting

This documentation represents the current state of the system after the Action model removal and provides comprehensive coverage of all available endpoints and their functionality. 