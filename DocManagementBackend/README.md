# DocuVerse - Document Management Backend

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/download)
[![Entity Framework Core](https://img.shields.io/badge/Entity%20Framework%20Core-9.0-green.svg)](https://docs.microsoft.com/en-us/ef/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019+-red.svg)](https://www.microsoft.com/en-us/sql-server)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

A comprehensive document management system backend built with .NET 9.0, featuring advanced workflow management, ERP integration, and real-time document processing capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Recent Changes](#recent-changes)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [ERP Integration](#erp-integration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

DocuVerse Backend is a powerful document management system that provides comprehensive document lifecycle management with integrated Business Central ERP operations. The system handles complex approval workflows, circuit-based document processing, and seamless data synchronization with external systems.

### Key Capabilities

- **Document Lifecycle Management**: Complete document workflow from creation to archival
- **Circuit-Based Approvals**: Multi-level approval workflows with customizable circuits
- **ERP Integration**: Seamless integration with Microsoft Dynamics 365 Business Central
- **Real-time Synchronization**: Background services for automatic data sync
- **Advanced Security**: JWT-based authentication with role-based access control
- **Audit Trail**: Comprehensive logging and document history tracking

## ✨ Features

### Core Document Management
- ✅ Document creation, editing, and versioning
- ✅ Multi-type document support with customizable subtypes
- ✅ Advanced document search and filtering
- ✅ Bulk document operations
- ✅ Document templating system
- ✅ File attachment management
- ✅ Document expiration and archival

### Workflow & Approval System
- ✅ Circuit-based approval workflows
- ✅ Multi-level approval chains
- ✅ Parallel and sequential approval paths
- ✅ Approval delegation and escalation
- ✅ Custom approval rules and conditions
- ✅ Real-time notification system
- ✅ Approval history and audit trails

### ERP Integration
- ✅ Business Central document archival
- ✅ Line-by-line ERP synchronization
- ✅ Automatic code generation
- ✅ Error handling and retry mechanisms
- ✅ Transaction rollback capabilities
- ✅ ERP status monitoring

### User Management
- ✅ Role-based access control (RBAC)
- ✅ Responsibility center assignments
- ✅ User profile management
- ✅ Authentication with JWT tokens
- ✅ Password policies and security
- ✅ User activity tracking

### API & Integration
- ✅ RESTful API design
- ✅ OpenAPI/Swagger documentation
- ✅ Background service workers
- ✅ Automated data synchronization
- ✅ Webhook support
- ✅ Third-party integrations

## 🛠 Technology Stack

### Backend Framework
- **Core**: .NET 9.0 ASP.NET Core
- **Database**: SQL Server with Entity Framework Core 9.0
- **Authentication**: JWT Bearer tokens
- **API Documentation**: Swagger/OpenAPI 3.0

### Dependencies
```xml
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="DotNetEnv" Version="3.1.1" />
<PackageReference Include="FirebaseAdmin" Version="3.1.0" />
<PackageReference Include="Google.Apis.Auth" Version="1.69.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.2" />
<PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="9.0.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.2" />
<PackageReference Include="RestSharp" Version="112.1.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="7.2.0" />
```

### External Integrations
- **Microsoft Dynamics 365 Business Central**: Document archival and ERP operations
- **Firebase**: (Optional) Authentication and notifications
- **NTLM Authentication**: For Business Central API access

## 🏗 Architecture

### Layered Architecture
```
┌─────────────────────────────┐
│     Presentation Layer      │  Controllers, API Endpoints
├─────────────────────────────┤
│    Business Logic Layer     │  Services, Workflows
├─────────────────────────────┤
│    Data Access Layer        │  Entity Framework, Repositories
├─────────────────────────────┤
│   External Integration      │  ERP Clients, API Sync
└─────────────────────────────┘
```

### Core Components

#### Controllers (23 Controllers)
- **AccountController**: User account management
- **AdminController**: Administrative operations
- **DocumentsController**: Document CRUD operations
- **WorkflowController**: Workflow and circuit management
- **ApprovalController**: Approval process management
- **ApiSyncController**: Background synchronization control

#### Services (10 Services)
- **DocumentWorkflowService**: Document lifecycle management
- **DocumentErpArchivalService**: ERP integration operations
- **CircuitManagementService**: Approval circuit logic
- **ApiSyncService**: Data synchronization with external APIs
- **UserAuthorizationService**: Permission and access control

#### Models & DTOs
- **Core Entities**: 20+ models including Document, User, Circuit, Status
- **DTOs**: Dedicated data transfer objects for API communication
- **Workflow Models**: Approval, Step entities (Action system removed)

## 📁 Project Structure

```
DocManagementBackend/
├── 📁 Controllers/                          # API Controllers (23 files)
│   ├── 📄 AccountController.cs              # User accounts & authentication
│   ├── 📄 AdminController.cs                # Administrative operations
│   ├── 📄 ApprovalController.cs             # Approval workflow management
│   ├── 📄 AuthController.cs                 # Authentication endpoints
│   ├── 📄 CircuitController.cs              # Workflow circuit management
│   ├── 📄 CustomerController.cs             # Customer data management
│   ├── 📄 DashboardController.cs            # Dashboard statistics
│   ├── 📄 DocumentsController.cs            # Document CRUD & ERP operations
│   ├── 📄 GeneralAccountsController.cs      # General ledger accounts
│   ├── 📄 ItemController.cs                 # Inventory items
│   ├── 📄 LigneController.cs                # Document lines management
│   ├── 📄 LignesElementTypeController.cs    # Line element types
│   ├── 📄 LocationController.cs             # Inventory locations
│   ├── 📄 OAuthController.cs                # OAuth authentication
│   ├── 📄 PhoneVerificationController.cs    # Phone verification
│   ├── 📄 ResponsibilityCentreController.cs # Organizational units
│   ├── 📄 SousLigneController.cs            # Document sub-lines
│   ├── 📄 StatusController.cs               # Workflow statuses
│   ├── 📄 SubTypeController.cs              # Document sub-types
│   ├── 📄 UniteCodeController.cs            # Units of measure
│   ├── 📄 VendorController.cs               # Vendor data management
│   ├── 📄 WorkflowController.cs             # Workflow operations
│   └── 📄 controllers.md                    # 📖 Controllers Documentation
│
├── 📁 Services/                             # Business Logic Services (10 files)
│   ├── 📄 ApiSyncBackgroundService.cs       # Background sync worker
│   ├── 📄 ApiSyncService.cs                 # External API synchronization
│   ├── 📄 BcApiClient.cs                    # Business Central API client
│   ├── 📄 CircuitManagementService.cs       # Circuit configuration
│   ├── 📄 DocumentErpArchivalService.cs     # ERP integration service
│   ├── 📄 DocumentWorkflowService.cs        # Document lifecycle management
│   ├── 📄 EmailVerificationService.cs       # Email validation service
│   ├── 📄 LineElementService.cs             # Line element management
│   ├── 📄 SmsVerificationService.cs         # SMS verification service
│   ├── 📄 UserAuthorizationService.cs       # Authorization service
│   └── 📄 Services.md                       # 📖 Services Documentation
│
├── 📁 Models/                               # Entity Models (12 files)
│   ├── 📄 ApiSyncModels.cs                  # API synchronization models
│   ├── 📄 approval.cs                       # Approval system entities
│   ├── 📄 circuit.cs                        # Workflow circuit models
│   ├── 📄 document.cs                       # Document core entities
│   ├── 📄 ErpArchivalError.cs               # ERP error tracking
│   ├── 📄 lignes.cs                         # Document lines models
│   ├── 📄 LignesElementType.cs              # Line element type system
│   ├── 📄 PhoneVerificationModels.cs        # Phone verification
│   ├── 📄 ResponsibilityCentre.cs           # Organizational units
│   ├── 📄 status.cs                         # Workflow status models
│   ├── 📄 user.cs                           # User and role models
│   └── 📄 Models.md                         # 📖 Models Documentation
│
├── 📁 ModelsDtos/                           # Data Transfer Objects (17 files)
│   ├── 📄 AccountDtos.cs                    # Account management DTOs
│   ├── 📄 AdminDtos.cs                      # Administrative DTOs
│   ├── 📄 ApprovalDtos.cs                   # Approval system DTOs
│   ├── 📄 AuthDtos.cs                       # Authentication DTOs
│   ├── 📄 CircuitDtos.cs                    # Workflow circuit DTOs
│   ├── 📄 DocumentDtos.cs                   # Document DTOs (empty - redirect)
│   ├── 📄 DocumentsDtos.cs                  # Document operation DTOs
│   ├── 📄 ErpArchivalDtos.cs                # ERP integration DTOs
│   ├── 📄 LignesDtos.cs                     # Document lines DTOs
│   ├── 📄 LineElementDtos.cs                # Line element DTOs
│   ├── 📄 LogHistoryDtos.cs                 # Audit log DTOs
│   ├── 📄 OAuthDtos.cs                      # OAuth DTOs
│   ├── 📄 ResponsibilityCentreDtos.cs       # Responsibility center DTOs
│   ├── 📄 StatusDtos.cs                     # Workflow status DTOs
│   ├── 📄 SubTypeDtos.cs                    # Document sub-type DTOs
│   ├── 📄 UserDtos.cs                       # User management DTOs
│   ├── 📄 WorkflowDtos.cs                   # Workflow operation DTOs
│   └── 📄 DTOS_DOCUMENTATION.md             # 📖 DTOs Documentation
│
├── 📁 Data/                                 # Data Access Layer (2 files)
│   ├── 📄 ApplicationDbContext.cs           # Entity Framework DbContext
│   ├── 📄 DataSeeder.cs                     # Database initialization
│   └── 📄 DATA_LAYER_DOCUMENTATION.md      # 📖 Data Layer Documentation
│
├── 📁 utils/                                # Utility Classes (5 files)
│   ├── 📄 AuthHelper.cs                     # Authentication utilities
│   ├── 📄 ConsoleColorHelper.cs             # Console output formatting
│   ├── 📄 GeneratePassword.cs               # Password generation
│   ├── 📄 LigneCalculations.cs              # Financial calculations
│   ├── 📄 Mappings.cs                       # Entity-to-DTO mappings
│   └── 📄 Utils.md                          # 📖 Utilities Documentation
│
├── 📁 Migrations/                           # Database Migrations (95+ files)
│   ├── 📄 20250508114801_AddInitialData.cs        # Initial database setup
│   ├── 📄 20250722135355_RemoveActionsSystem.cs   # Action system removal
│   └── 📄 ApplicationDbContextModelSnapshot.cs     # Current model snapshot
│
├── 📁 wwwroot/                              # Static Files
│   └── 📁 images/                           # User profile images
│       └── 📁 profile/                      # Profile picture storage
│
├── 📁 docs/                                 # Technical Documentation
│   ├── 📄 API_Examples.md                   # API usage examples
│   ├── 📄 API_SYNC_DOCUMENTATION.md         # Sync service documentation
│   └── 📄 BACKEND_DOCUMENTATION.md          # Comprehensive backend docs
│
├── 📄 Program.cs                            # Application entry point
├── 📄 appsettings.json                      # Configuration settings
├── 📄 appsettings.Development.json          # Development configuration
├── 📄 DocManagementBackend.csproj           # Project file
├── 📄 DocManagementBackend.http             # HTTP request examples
└── 📄 README.md                             # 📖 This documentation
```

### Folder Structure Explanation

#### **Controllers/** 
Contains 23 API controllers handling all HTTP endpoints. Each controller focuses on a specific domain (documents, users, workflows, etc.). See [controllers.md](Controllers/controllers.md) for detailed endpoint documentation.

#### **Services/** 
Business logic layer with 10 services managing complex operations like workflow processing, ERP integration, and external API synchronization. See [Services.md](Services/Services.md) for complete service documentation.

#### **Models/** 
Entity models representing database tables and domain objects. Includes core entities like Document, User, Circuit, and Approval. See [Models.md](Models/Models.md) for complete model documentation.

#### **ModelsDtos/** 
Data Transfer Objects for API communication, providing clean separation between internal models and external contracts. See [DTOS_DOCUMENTATION.md](ModelsDtos/DTOS_DOCUMENTATION.md) for comprehensive DTO documentation.

#### **Data/** 
Entity Framework configuration and database seeding. Contains the main DbContext and initialization logic. See [DATA_LAYER_DOCUMENTATION.md](Data/DATA_LAYER_DOCUMENTATION.md) for data layer details.

#### **utils/** 
Utility classes for common operations like authentication, calculations, and data mapping. See [Utils.md](utils/Utils.md) for utility documentation.

## 📖 Documentation

Each major component has dedicated documentation in its respective folder:

### Core Documentation
- **[Controllers Documentation](Controllers/controllers.md)** - Complete API endpoint reference
- **[Services Documentation](Services/Services.md)** - Business logic and service layer
- **[Models Documentation](Models/Models.md)** - Database entities and relationships  
- **[DTOs Documentation](ModelsDtos/DTOS_DOCUMENTATION.md)** - Data transfer objects
- **[Data Layer Documentation](Data/DATA_LAYER_DOCUMENTATION.md)** - Database and Entity Framework
- **[Utils Documentation](utils/Utils.md)** - Utility functions and helpers

### Technical Documentation
- **[Backend Documentation](docs/BACKEND_DOCUMENTATION.md)** - Comprehensive technical guide
- **[API Examples](docs/API_Examples.md)** - Practical API usage examples
- **[API Sync Documentation](docs/API_SYNC_DOCUMENTATION.md)** - External API integration

### Quick Reference
- **API Endpoints**: 100+ REST endpoints across 23 controllers
- **Business Services**: 10 specialized services for complex operations
- **Database Entities**: 20+ models with comprehensive relationships
- **Data Transfer Objects**: 50+ DTOs for type-safe API communication
- **Utility Functions**: 15+ utility classes for common operations

## 🔄 Recent Changes

### July 2025 - Action System Removal
The Action-based workflow system has been completely removed to simplify the architecture:

#### **Removed Components**
- ❌ **Action Model**: Workflow actions (approve, reject, etc.)
- ❌ **StepAction Model**: Junction table linking steps to actions
- ❌ **ActionStatusEffect Model**: Action effects on statuses
- ❌ **ActionController**: Action management API
- ❌ **ActionDtos**: Action-related data transfer objects

#### **New Workflow Architecture**
- ✅ **Direct Status Transitions**: Simplified status movement without action intermediaries
- ✅ **Enhanced Approval System**: Robust individual and group approval processing
- ✅ **Step-Based Processing**: Clean step transitions with approval integration
- ✅ **Improved Performance**: Reduced complexity and faster workflow processing

#### **Migration Impact**
- **Database**: Migration `20250722135355_RemoveActionsSystem` applied
- **API Changes**: Action endpoints removed, new direct status endpoints added
- **Documentation**: All documentation updated to reflect new architecture
- **Compatibility**: Frontend clients need updates for new workflow endpoints

### Current System Benefits
- **Simplified Architecture**: Cleaner workflow processing without action complexity
- **Better Performance**: Reduced database queries and simpler logic
- **Enhanced Maintainability**: Fewer moving parts, easier to extend
- **Improved User Experience**: More intuitive workflow operations

## ⚙️ Installation

### Prerequisites

- .NET 9.0 SDK or later
- SQL Server 2019 or later (Express edition supported)
- Visual Studio 2022 or VS Code with C# extension
- Git for version control

### Clone Repository

```bash
git clone https://github.com/your-org/docuverse.git
cd docuverse/DocManagementBackend
```

### Restore Dependencies

```bash
dotnet restore
```

### Build Project

```bash
dotnet build
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
ISSUER=DocuVerse-API
AUDIENCE=DocuVerse-Clients

# Database Connection
CONNECTION_STRING=Server=localhost;Database=DocManagementDB;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=true;

# Business Central API
BC_USERNAME=your_bc_username
BC_PASSWORD=your_bc_password
BC_DOMAIN=your_domain
BC_WORKSTATION=localhost

# Email Configuration
EMAIL_ADDRESS=notifications@company.com
EMAIL_PASSWORD=app-specific-password

# Optional: Firebase
FIREBASE_PROJECT_ID=your-firebase-project

# External Services
ABSTRACT_API_KEY=email-validation-key
```

### Application Settings

Update `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DocManagementDB;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=true;"
  },
  "JwtSettings": {
    "ExpiryMinutes": 480
  },
  "ApiSync": {
    "CheckIntervalMinutes": 1,
    "DefaultPollingIntervalMinutes": 60
  },
  "BcApi": {
    "BaseUrl": "http://localhost:25048/BC250/api/bslink/docverse/v1.0",
    "Domain": "your_domain",
    "Workstation": "localhost"
  }
}
```

### Development Settings

For development, use `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information",
      "DocManagementBackend": "Debug"
    }
  }
}
```

## 🗄 Database Setup

### Initial Migration

```bash
# Add initial migration (if not exists)
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

### Data Seeding

The application automatically seeds initial data on startup including:
- Default document types (Sales/Purchase: Quote, Order, Invoice, Credit Memo, etc.)
- Default line element types (Item, General Account)
- Initial responsibility centers and roles
- System configuration data

### Sample Data Setup

```bash
# The DataSeeder runs automatically on application start
# Check DataSeeder.cs for detailed seeded data
# See Data/DATA_LAYER_DOCUMENTATION.md for seeding details
```

## 📚 API Documentation

### Swagger/OpenAPI

When running in development mode, access the interactive API documentation at:
```
https://localhost:5001/swagger
```

### Authentication

All protected endpoints require JWT Bearer token authentication:

```http
Authorization: Bearer {your-jwt-token}
```

### Core API Endpoints

#### Authentication
```http
POST /api/Auth/login          # User login
POST /api/Auth/register       # User registration  
POST /api/Auth/refresh-token  # Token refresh
POST /api/Auth/valide-email   # Email validation
```

#### Document Management
```http
GET    /api/Documents                    # Get all documents
GET    /api/Documents/{id}               # Get document by ID
GET    /api/Documents/recent             # Get recent documents
GET    /api/Documents/archived           # Get archived documents
POST   /api/Documents                    # Create new document
PUT    /api/Documents/{id}               # Update document
DELETE /api/Documents/{id}               # Delete document
POST   /api/Documents/{id}/archive-to-erp # Archive to ERP
```

#### Workflow Operations
```http
GET    /api/Workflow/circuits                     # Get all circuits
POST   /api/Workflow/assign-circuit               # Assign circuit to document
POST   /api/Workflow/move-to-status               # Direct status transition
GET    /api/Workflow/document/{id}/workflow-status # Get workflow status
GET    /api/Workflow/document/{id}/history        # Get document history
GET    /api/Workflow/pending-documents            # Get pending documents
```

#### Approval Management
```http
GET    /api/Approval/pending                      # Get pending approvals
POST   /api/Approval/{id}/respond                 # Respond to approval
GET    /api/Approval/history/{documentId}         # Get approval history
GET    /api/Approval/documents-to-approve         # Get documents awaiting approval
POST   /api/Approval/groups                       # Create approval group
GET    /api/Approval/configure/steps              # Get approval configuration
```

#### Admin Operations
```http
GET    /api/Admin/users                # Get all users
POST   /api/Admin/users               # Create user
PUT    /api/Admin/users/{id}          # Update user
DELETE /api/Admin/delete-users        # Delete multiple users
GET    /api/Admin/roles               # Get all roles
```

### Request/Response Examples

#### Create Document
```http
POST /api/Documents
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Purchase Request #PR-2024-001",
  "content": "Requesting office supplies for Q1",
  "typeId": 11,
  "subTypeId": 2,
  "docDate": "2024-01-15T00:00:00Z",
  "comptableDate": "2024-01-15T00:00:00Z",
  "documentExterne": "PR-2024-001",
  "responsibilityCentreId": 1,
  "circuitId": 3,
  "customerVendorCode": "VENDOR001",
  "customerVendorName": "Office Supplies Ltd"
}
```

#### Response
```json
{
  "id": 123,
  "documentKey": "PO-2024-0001",
  "title": "Purchase Request #PR-2024-001",
  "status": 1,
  "createdAt": "2024-01-15T10:30:00Z",
  "erpDocumentCode": null,
  "createdBy": {
    "id": 1,
    "email": "user@company.com",
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe"
  },
  "circuit": {
    "id": 3,
    "title": "Purchase Order Approval",
    "isActive": true
  }
}
```

#### Move Document Status
```http
POST /api/Workflow/move-to-status
Content-Type: application/json
Authorization: Bearer {token}

{
  "documentId": 123,
  "targetStatusId": 5,
  "comments": "Moving to manager review"
}
```

## 🔗 ERP Integration

### Business Central Integration

The system integrates with Microsoft Dynamics 365 Business Central for document archival and line operations.

#### Features
- **Document Archival**: Automatic archival of completed documents
- **Line Synchronization**: Individual line item creation in BC
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Status Tracking**: Real-time status updates
- **Enhanced Error Reporting**: Detailed error categorization and user-friendly messages

#### Configuration

```json
{
  "BcApi": {
    "BaseUrl": "http://localhost:25048/BC250/api/bslink/docverse/v1.0",
    "Username": "bc_username",
    "Password": "bc_password", 
    "Domain": "your_domain",
    "Workstation": "localhost"
  }
}
```

#### API Endpoints Used
- `POST /api/journal` - Document creation
- `POST /api/journalLine` - Line creation
- `GET /api/items` - Item synchronization
- `GET /api/accounts` - General accounts sync
- `GET /api/customers` - Customer data sync
- `GET /api/vendors` - Vendor data sync

### API Synchronization

Background service automatically synchronizes reference data:

#### Supported Endpoints
1. **UnitOfMeasures**: Units of measure (foundation data)
2. **Items**: Product/service catalog
3. **GeneralAccounts**: Chart of accounts
4. **Customers**: Customer master data
5. **Vendors**: Vendor master data
6. **Locations**: Inventory locations
7. **ResponsibilityCentres**: Organizational units
8. **ItemUnitOfMeasures**: Unit conversion data

#### Sync Configuration
```bash
# Manual sync via API
POST /api/ApiSync/sync/all
POST /api/ApiSync/sync/items
POST /api/ApiSync/sync/customers
GET  /api/ApiSync/configurations
```

#### Sync Dependencies
The system maintains proper sync order due to foreign key dependencies:
```
UnitOfMeasures → Items → ItemUnitOfMeasures
GeneralAccounts (independent)
Customers, Vendors, Locations (independent)
```

## 💻 Development

### Running the Application

```bash
# Development mode with hot reload
dotnet watch run

# Standard development mode
dotnet run

# Production mode
dotnet run --environment Production
```

### Development Tools

#### Entity Framework Commands
```bash
# Add migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Remove last migration
dotnet ef migrations remove

# Generate script
dotnet ef migrations script

# Drop database (development only)
dotnet ef database drop
```

#### Testing Commands
```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test category
dotnet test --filter Category=Unit
```

### Code Style and Standards

#### Naming Conventions
- **Controllers**: PascalCase ending with "Controller"
- **Services**: PascalCase ending with "Service"
- **Models**: PascalCase
- **DTOs**: PascalCase ending with "Dto"
- **Methods**: PascalCase with descriptive names
- **Variables**: camelCase

#### Architecture Patterns
- **Dependency Injection**: All services registered in DI container
- **Repository Pattern**: Data access through Entity Framework
- **DTO Pattern**: Separate DTOs for API communication
- **Service Layer**: Business logic encapsulated in services
- **SOLID Principles**: Single responsibility, dependency inversion

#### Best Practices
- Use async/await for all I/O operations
- Implement comprehensive error handling
- Add XML documentation for public APIs
- Follow RESTful API design principles
- Use DTOs for all API communication
- Implement proper logging and monitoring

### Debugging

#### Enable Detailed Logging
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.EntityFrameworkCore": "Information",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information",
      "DocManagementBackend.Services": "Debug"
    }
  }
}
```

#### Common Debug Scenarios
1. **Database Connection Issues**: Check connection string and SQL Server status
2. **JWT Token Problems**: Verify secret key and token expiration
3. **ERP Integration Failures**: Check BC API connectivity and credentials
4. **Workflow Issues**: Review circuit configuration and step definitions
5. **Authorization Problems**: Verify user roles and permissions

## 🧪 Testing

### Test Structure
```
DocManagementBackend.Tests/
├── Controllers/            # Controller tests
├── Services/              # Service tests
├── Models/                # Model tests
├── Integration/           # Integration tests
└── Utilities/             # Test utilities
```

### Running Tests

```bash
# All tests
dotnet test

# Unit tests only
dotnet test --filter Category=Unit

# Integration tests only
dotnet test --filter Category=Integration

# With coverage report
dotnet test --collect:"XPlat Code Coverage" --results-directory:"./TestResults"
```

### Test Categories
- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end API testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Authentication and authorization testing

## 🚀 Deployment

### Production Deployment

#### 1. Environment Preparation
```bash
# Install .NET 9.0 Runtime
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y aspnetcore-runtime-9.0
```

#### 2. Database Setup
```bash
# Update production database
dotnet ef database update --environment Production
```

#### 3. Application Configuration
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "your-production-connection-string"
  }
}
```

#### 4. Publish Application
```bash
# Publish for production
dotnet publish -c Release -o ./publish

# Copy to server
scp -r ./publish user@server:/path/to/app
```

#### 5. Service Configuration (systemd)
```ini
[Unit]
Description=DocuVerse Backend API
After=network.target

[Service]
Type=notify
ExecStart=/usr/bin/dotnet /path/to/app/DocManagementBackend.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=docuverse-backend
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["DocManagementBackend.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DocManagementBackend.dll"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  docuverse-backend:
    build: .
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=db;Database=DocManagementDB;User=sa;Password=YourPassword;
    depends_on:
      - db
  
  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourPassword
    ports:
      - "1433:1433"
```

### Performance Optimization

#### Application Settings
```json
{
  "Kestrel": {
    "Limits": {
      "MaxConcurrentConnections": 100,
      "MaxRequestBodySize": 10485760
    }
  }
}
```

#### Caching Configuration
```csharp
// Add to Program.cs
builder.Services.AddMemoryCache();
builder.Services.AddResponseCaching();
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-feature`
3. **Make changes**: Follow coding standards and architecture patterns
4. **Add tests**: Ensure adequate test coverage
5. **Update documentation**: Update relevant documentation files
6. **Commit changes**: Use conventional commit messages
7. **Push branch**: `git push origin feature/new-feature`
8. **Create Pull Request**: Provide detailed description

### Commit Message Format
```
type(scope): description

feat(auth): add JWT refresh token functionality
fix(workflow): resolve circuit assignment bug
docs(api): update authentication documentation
refactor(erp): simplify archival error handling
test(services): add workflow service unit tests
```

### Code Review Process
- All changes require pull request approval
- Automated tests must pass
- Code coverage should not decrease
- Follow established coding standards
- Update relevant documentation
- Consider impact on existing APIs

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Failures
```bash
# Check SQL Server status
sudo systemctl status mssql-server

# Test connection
sqlcmd -S localhost -U sa -P YourPassword

# Check connection string
dotnet ef database update --verbose
```

#### 2. JWT Authentication Issues
- Verify JWT_SECRET environment variable is set
- Check token expiration settings
- Ensure HTTPS in production
- Validate issuer and audience configuration

#### 3. ERP Integration Problems
- Verify Business Central API connectivity
- Check NTLM authentication credentials
- Review firewall and network settings
- Check BC API base URL and endpoints

#### 4. Background Service Issues
```bash
# Check service logs
journalctl -u docuverse-backend -f

# Restart service
sudo systemctl restart docuverse-backend

# Check API sync status
curl -X GET "https://localhost:5001/api/ApiSync/configurations" -H "Authorization: Bearer {token}"
```

#### 5. Workflow Problems
- Verify circuit configuration
- Check step definitions and transitions
- Review approval assignments
- Validate status flow logic

### Logging and Monitoring

#### Application Insights Integration
```json
{
  "ApplicationInsights": {
    "InstrumentationKey": "your-instrumentation-key"
  }
}
```

#### Health Checks
```http
GET /health       # Overall health status
GET /health/ready # Readiness check
GET /health/live  # Liveness check
```

#### Performance Monitoring
- Monitor database query performance
- Track API response times
- Monitor ERP integration success rates
- Track background service execution

### Support Resources

- **API Documentation**: Swagger UI at `/swagger`
- **Technical Documentation**: `/docs` folder
- **Component Documentation**: Folder-specific `.md` files
- **Issue Tracking**: GitHub Issues
- **Community Support**: Project discussions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For technical support and questions:
- **Email**: support@docuverse.com
- **Documentation**: [docs/](docs/)
- **GitHub Issues**: [Create an issue](https://github.com/your-org/docuverse/issues)

---

**DocuVerse Backend** - Empowering Document Management with Advanced Workflow Capabilities

Built with ❤️ using .NET 9.0, Entity Framework Core, and modern software architecture principles. 