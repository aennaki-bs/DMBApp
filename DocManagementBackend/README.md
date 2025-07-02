# DocManagementBackend

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/download/dotnet/9.0)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019+-red.svg)](https://www.microsoft.com/en-us/sql-server)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A comprehensive **Document Management System Backend** built with .NET 9.0, providing enterprise-grade document workflow management with integrated ERP capabilities and Business Central integration.

## 🚀 Key Features

- **📄 Document Lifecycle Management**: Complete document workflow from creation to archival
- **🔄 Circuit-Based Approval Workflows**: Multi-level approval processes with role-based authorization
- **🔗 ERP Integration**: Seamless integration with Microsoft Dynamics 365 Business Central
- **👥 User Management**: Role-based access control with comprehensive user administration
- **📊 Real-time Dashboard**: Document status tracking and analytics
- **🔍 Advanced Search & Filtering**: Powerful document discovery capabilities
- **📱 API-First Design**: RESTful API with Swagger documentation
- **🔐 JWT Authentication**: Secure authentication with role-based permissions
- **🚀 Background Services**: Automated API synchronization and document processing

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Architecture Overview](#architecture-overview)
7. [API Documentation](#api-documentation)
8. [Docker Deployment](#docker-deployment)
9. [Development Guide](#development-guide)
10. [Contributing](#contributing)
11. [Support](#support)

## 🛠 Prerequisites

Before setting up the DocManagementBackend, ensure you have the following installed:

- **.NET 9.0 SDK** or later ([Download](https://dotnet.microsoft.com/download/dotnet/9.0))
- **SQL Server 2019** or later / **SQL Server Express** ([Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads))
- **Visual Studio 2022** (recommended) or **Visual Studio Code**
- **Git** for version control
- **Docker** (optional, for containerized deployment)

### System Requirements

- **OS**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space
- **Network**: Internet connection for ERP integration

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/DMBApp.git
cd DMBApp/DocManagementBackend
```

### 2. Restore NuGet Packages

```bash
dotnet restore
```

### 3. Install Required Dependencies

The project includes the following key dependencies:

- **Microsoft.EntityFrameworkCore.SqlServer** - Database ORM
- **Microsoft.AspNetCore.Authentication.JwtBearer** - JWT Authentication
- **BCrypt.Net-Next** - Password hashing
- **RestSharp** - HTTP client for ERP integration
- **FirebaseAdmin** - Firebase integration
- **Swashbuckle.AspNetCore** - API documentation

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
ISSUER=DocManagement.API
AUDIENCE=DocManagement.Client

# Database Configuration
CONNECTION_STRING=Server=localhost;Database=DocManagementDB;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=true;

# Business Central API Configuration
BC_API_BASE_URL=http://your-bc-server:port/BC/api/bslink/docverse/v1.0
BC_API_USERNAME=your-bc-username
BC_API_PASSWORD=your-bc-password
BC_API_DOMAIN=your-domain
BC_API_WORKSTATION=your-workstation

# Firebase Configuration (Optional)
FIREBASE_WEB_API_KEY=your-firebase-web-api-key
```

### 2. Update appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DocManagementDB;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=true;"
  },
  "JwtSettings": {
    "ExpiryMinutes": 180
  },
  "ApiSync": {
    "CheckIntervalMinutes": 1,
    "DefaultPollingIntervalMinutes": 60
  },
  "BcApi": {
    "BaseUrl": "http://localhost:25048/BC250/api/bslink/docverse/v1.0",
    "Username": "USERNAME",
    "Password": "PASSWORD",
    "Domain": "DOMAIN",
    "Workstation": "localhost"
  }
}
```

## 🗄️ Database Setup

### 1. Create Database

Create a new SQL Server database named `DocManagementDB` or use the connection string to auto-create.

### 2. Apply Migrations

```bash
# Update database with latest migrations
dotnet ef database update

# If you need to create a new migration
dotnet ef migrations add YourMigrationName
```

### 3. Seed Initial Data

The application automatically seeds initial data on startup, including:
- Default admin user
- Document types and statuses
- System roles and permissions
- Reference data

## 🏃‍♂️ Running the Application

### Development Environment

```bash
# Run the application
dotnet run

# Run with specific environment
dotnet run --environment Development

# Run with hot reload (watch mode)
dotnet watch run
```

The API will be available at:
- **HTTPS**: `https://localhost:7001`
- **HTTP**: `http://localhost:5001`
- **Swagger UI**: `https://localhost:7001/swagger`

### Production Environment

```bash
# Build for production
dotnet build --configuration Release

# Publish the application
dotnet publish --configuration Release --output ./publish

# Run published application
dotnet ./publish/DocManagementBackend.dll
```

## 🏗️ Architecture Overview

### Project Structure

```
DocManagementBackend/
├── 📁 Controllers/          # API Controllers (24 controllers)
│   ├── AccountController.cs      # User account management
│   ├── AdminController.cs        # Admin operations
│   ├── ApiSyncController.cs      # API synchronization
│   ├── ApprovalController.cs     # Document approvals
│   ├── CircuitController.cs      # Workflow circuits
│   ├── DocumentsController.cs    # Document management
│   ├── LigneController.cs        # Document lines
│   └── WorkflowController.cs     # Workflow operations
├── 📁 Services/             # Business Logic Services
│   ├── ApiSyncService.cs         # Background sync service
│   ├── BcApiClient.cs           # Business Central client
│   ├── DocumentErpArchivalService.cs  # ERP integration
│   ├── DocumentWorkflowService.cs     # Workflow logic
│   └── CircuitManagementService.cs    # Circuit management
├── 📁 Models/               # Entity Models
│   ├── document.cs              # Document entity
│   ├── lignes.cs               # Document lines
│   ├── user.cs                 # User entity
│   ├── circuit.cs              # Workflow circuit
│   └── approval.cs             # Approval entities
├── 📁 ModelsDtos/           # Data Transfer Objects
│   ├── DocumentsDtos.cs         # Document DTOs
│   ├── LignesDtos.cs           # Line DTOs
│   └── AccountDtos.cs          # Account DTOs
├── 📁 Data/                 # Database Context
│   ├── ApplicationDbContext.cs  # EF Core context
│   └── DataSeeder.cs           # Initial data seeding
├── 📁 Migrations/           # Database Migrations
├── 📁 utils/                # Utility Classes
├── 📁 wwwroot/              # Static Files
│   └── images/profile/         # User profile images
├── 📁 docs/                 # Documentation
└── 📄 Program.cs            # Application entry point
```

### Architecture Layers

1. **🎯 Presentation Layer** - API Controllers handling HTTP requests
2. **💼 Business Logic Layer** - Services implementing domain logic  
3. **🗃️ Data Access Layer** - Entity Framework with DbContext
4. **🔗 Integration Layer** - External API clients (Business Central)
5. **🛠️ Cross-Cutting Concerns** - Authentication, logging, validation

### Key Design Patterns

- **Repository Pattern** - Data access abstraction
- **Dependency Injection** - Loose coupling and testability
- **DTO Pattern** - Data transfer and API contracts
- **Service Layer Pattern** - Business logic encapsulation

## 📚 API Documentation

### Authentication

All endpoints (except auth endpoints) require JWT Bearer authentication:

```bash
Authorization: Bearer <your-jwt-token>
```

### Core API Endpoints

#### 🔐 Authentication & User Management

```http
POST   /api/auth/login           # User login
POST   /api/auth/register        # User registration  
POST   /api/auth/refresh         # Token refresh
GET    /api/account/profile      # Get user profile
PUT    /api/account/profile      # Update profile
POST   /api/oauth/google         # Google OAuth login
POST   /api/phone/verify         # Phone verification
```

#### 📄 Document Management

```http
GET    /api/documents            # List documents with filtering
POST   /api/documents            # Create new document
GET    /api/documents/{id}       # Get document by ID
PUT    /api/documents/{id}       # Update document
DELETE /api/documents/{id}       # Delete document
POST   /api/documents/{id}/archive # Archive to ERP
GET    /api/documents/{id}/status # Get document workflow status
```

#### 📝 Document Lines (Lignes)

```http
GET    /api/ligne/document/{id}  # Get document lines
POST   /api/ligne               # Create document line
PUT    /api/ligne/{id}          # Update line
DELETE /api/ligne/{id}          # Delete line
POST   /api/ligne/{id}/add-to-erp # Add line to ERP
GET    /api/ligne/{id}/erp-status # Check ERP integration status
```

#### 🔄 Workflow & Approvals

```http
GET    /api/workflow/circuits    # List workflow circuits
POST   /api/approval/submit     # Submit for approval
POST   /api/approval/approve    # Approve document
POST   /api/approval/reject     # Reject document
GET    /api/approval/pending    # Get pending approvals
GET    /api/approval/groups     # Manage approval groups
POST   /api/approval/groups     # Create approval group
```

#### 👥 Administration

```http
GET    /api/admin/users          # List all users
POST   /api/admin/users          # Create user
PUT    /api/admin/users/{id}     # Update user
DELETE /api/admin/users/{id}     # Delete user
GET    /api/admin/dashboard      # Admin dashboard stats
```

#### 🏢 Reference Data Management

```http
GET    /api/customer             # List customers
POST   /api/customer             # Create customer
PUT    /api/customer/{id}        # Update customer
GET    /api/vendor               # List vendors
POST   /api/vendor               # Create vendor
GET    /api/item                 # List items
POST   /api/item                 # Create item
GET    /api/generalaccounts      # List general accounts
GET    /api/location             # List locations
GET    /api/unitecode            # List unit of measures
```

#### 🔄 Circuit & Workflow Management

```http
GET    /api/circuit              # List circuits
POST   /api/circuit              # Create circuit
PUT    /api/circuit/{id}         # Update circuit
DELETE /api/circuit/{id}         # Delete circuit
POST   /api/circuit/{id}/activate # Activate circuit
POST   /api/circuit/{id}/deactivate # Deactivate circuit
GET    /api/workflow/steps       # Get workflow steps
POST   /api/workflow/steps       # Create workflow step
```

#### 🔗 API Synchronization

```http
GET    /api/apisync/status       # Get sync status
POST   /api/apisync/trigger      # Trigger manual sync
GET    /api/apisync/logs         # Get sync logs
PUT    /api/apisync/config       # Update sync configuration
```

## 🗄️ Database Schema Overview

### Core Entities

#### Documents & Lines
- **Document**: Main document entity with workflow status
- **Ligne**: Document line items with ERP integration
- **SousLigne**: Sub-line items for detailed tracking

#### Workflow & Approvals
- **Circuit**: Workflow circuit definitions
- **Step**: Individual workflow steps
- **Status**: Document status definitions
- **Approval**: Approval tracking and history

#### User Management
- **User**: System users with role-based access
- **Role**: User roles and permissions
- **ResponsibilityCentre**: User responsibility centers

#### Reference Data
- **Customer**: Customer master data
- **Vendor**: Vendor master data
- **Item**: Item master data
- **GeneralAccounts**: Chart of accounts
- **Location**: Location master data
- **UnitOfMeasure**: Unit of measure codes

#### ERP Integration
- **ApiSyncConfiguration**: API sync settings
- **DocumentCircuitHistory**: Workflow audit trail
- **DocumentStepHistory**: Step-level audit trail

### Key Relationships

```sql
Document -> User (CreatedBy, UpdatedBy)
Document -> SubType -> DocumentType
Document -> ResponsibilityCentre
Document -> Status (CurrentStatus)
Ligne -> Document
Ligne -> Item/GeneralAccount
Step -> Circuit -> DocumentType
Step -> Status (CurrentStatus, NextStatus)
Approval -> Document -> User
```

## 🔗 ERP Integration Details

### Business Central Integration

The system provides comprehensive integration with Microsoft Dynamics 365 Business Central:

#### Document Archival Process
1. **Document Validation**: Ensure all required fields are complete
2. **ERP Document Creation**: Create document header in Business Central
3. **Line Item Processing**: Transfer each document line to Business Central
4. **Status Synchronization**: Update document status with ERP codes
5. **Error Handling**: Capture and report integration failures

#### Supported Operations
- **Document Archival**: Complete document transfer to Business Central
- **Line Creation**: Individual line item creation
- **Status Checking**: Real-time ERP status verification
- **Error Recovery**: Automatic retry mechanisms for failed operations

#### API Payload Examples

**Document Creation Payload:**
```json
{
  "tierTYpe": 1,              // 0=None, 1=Customer, 2=Vendor
  "type": 3,                  // Document type number
  "custVendoNo": "CUST001",   // Customer/Vendor code
  "documentDate": "2024-01-01",
  "postingDate": "2024-01-01",
  "responsabilityCentre": "RC001",
  "externalDocNo": "EXT001"
}
```

**Line Creation Payload:**
```json
{
  "tierTYpe": 1,
  "docType": 3,
  "docNo": "DOC001",
  "type": 2,                  // 1=General Account, 2=Item
  "codeLine": "ITEM001",
  "descriptionLine": "Item Description",
  "qty": 10,
  "uniteOfMeasure": "PCS",
  "unitpriceCOst": 100.00,
  "discountAmt": 5.00,
  "locationCOde": "LOC001"
}
```

## 🚀 Background Services

### API Synchronization Service

The **ApiSyncBackgroundService** provides automated synchronization with external systems:

#### Key Features
- **Scheduled Synchronization**: Configurable intervals for data sync
- **Error Recovery**: Automatic retry mechanisms for failed syncs
- **Logging**: Comprehensive sync operation logging
- **Configuration Management**: Dynamic sync configuration updates

#### Configuration Options
```json
{
  "ApiSync": {
    "CheckIntervalMinutes": 1,
    "DefaultPollingIntervalMinutes": 60,
    "MaxRetryAttempts": 3,
    "RetryDelaySeconds": 30,
    "EnabledSyncTypes": ["Customer", "Vendor", "Item"]
  }
}
```

### Document Workflow Service

Handles automated document workflow processing:
- **Status Transitions**: Automatic status updates based on conditions
- **Notification Management**: Email/SMS notifications for approvals
- **Deadline Monitoring**: Approval deadline tracking and escalation
- **Audit Trail**: Complete workflow audit logging

### API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "errors": null,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "message": "Error occurred",
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Field is required",
      "field": "documentTitle"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🐳 Docker Deployment

### 1. Using Docker Compose

```yaml
version: '3.8'
services:
  docmanagement-api:
    build: .
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=sql-server;Database=DocManagementDB;User Id=sa;Password=YourPassword123;
    depends_on:
      - sql-server
    
  sql-server:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourPassword123
      - MSSQL_PID=Express
    ports:
      - "1433:1433"
    volumes:
      - sql-data:/var/opt/mssql

volumes:
  sql-data:
```

### 2. Run with Docker Compose

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f docmanagement-api

# Stop services
docker-compose down
```

### 3. Manual Docker Build

```bash
# Build Docker image
docker build -t docmanagement-api .

# Run container
docker run -d -p 5000:80 --name docmanagement-api \
  -e ConnectionStrings__DefaultConnection="your-connection-string" \
  docmanagement-api
```

## 🛠️ Development Guide

### Setting Up Development Environment

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd DocManagementBackend
   dotnet restore
   ```

2. **Database Development**
   ```bash
   # Add new migration
   dotnet ef migrations add MigrationName
   
   # Update database
   dotnet ef database update
   
   # Generate SQL script
   dotnet ef migrations script
   ```

3. **Running Tests**
   ```bash
   # Run all tests
   dotnet test
   
   # Run with coverage
   dotnet test --collect:"XPlat Code Coverage"
   ```

### Code Style and Standards

- **Naming Conventions**: Follow C# naming conventions
- **Code Documentation**: Use XML documentation comments
- **Async/Await**: Use async patterns for I/O operations
- **Error Handling**: Implement comprehensive error handling
- **Logging**: Use structured logging with ILogger

### Adding New Features

1. **Create Model** in `Models/` directory
2. **Add DbSet** to `ApplicationDbContext`
3. **Create Migration** using EF Core
4. **Implement Service** in `Services/` directory
5. **Create Controller** in `Controllers/` directory
6. **Add DTOs** in `ModelsDtos/` directory
7. **Update Documentation**

## 🔧 Configuration Options

### JWT Settings

```json
"JwtSettings": {
  "SecretKey": "your-secret-key",
  "Issuer": "DocManagement.API",
  "Audience": "DocManagement.Client",
  "ExpiryMinutes": 180
}
```

### API Sync Settings

```json
"ApiSync": {
  "CheckIntervalMinutes": 1,
  "DefaultPollingIntervalMinutes": 60,
  "MaxRetryAttempts": 3,
  "RetryDelaySeconds": 30
}
```

### Business Central Settings

```json
"BcApi": {
  "BaseUrl": "http://your-bc-server/api/endpoint",
  "Username": "username",
  "Password": "password",
  "Domain": "domain",
  "Workstation": "workstation",
  "TimeoutSeconds": 30
}
```

## 📊 Monitoring and Logging

### Logging Configuration

The application uses structured logging with the following log levels:

- **Trace**: Detailed execution flow
- **Debug**: Development debugging information  
- **Information**: General application flow
- **Warning**: Unexpected situations
- **Error**: Error conditions
- **Critical**: Critical failures

### Health Checks

The application includes health check endpoints:

```http
GET /health          # Basic health check
GET /health/detailed # Detailed health information
```

## 🚀 Performance Optimization

### Database Performance

- **Indexes**: Optimized database indexes for common queries
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: EF Core query optimization

### Caching Strategy

- **Memory Caching**: In-memory caching for frequently accessed data
- **Response Caching**: HTTP response caching for read-only endpoints
- **Distributed Caching**: Redis support for scaled deployments

### API Performance

- **Async Operations**: Non-blocking I/O operations
- **Pagination**: Efficient data pagination
- **Compression**: Response compression enabled
- **Rate Limiting**: API rate limiting protection

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure JWT-based authentication
- **Role-Based Access**: Fine-grained permission system
- **Password Security**: BCrypt password hashing
- **Session Management**: Secure session handling

### Data Protection

- **Input Validation**: Comprehensive input validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Cross-site scripting prevention
- **CORS Configuration**: Secure cross-origin requests

## 📈 Scaling Considerations

### Horizontal Scaling

- **Stateless Design**: Stateless API design for scaling
- **Load Balancing**: Support for load balancer deployment
- **Database Scaling**: Read replica support
- **Caching Layer**: Distributed caching support

### Monitoring

- **Application Insights**: Azure Application Insights integration
- **Custom Metrics**: Business-specific metrics tracking
- **Error Tracking**: Comprehensive error monitoring
- **Performance Monitoring**: Response time and throughput tracking

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues

**Problem**: Cannot connect to SQL Server database
```
Microsoft.Data.SqlClient.SqlException: A network-related or instance-specific error occurred
```

**Solutions**:
1. **Check SQL Server Service**: Ensure SQL Server service is running
2. **Verify Connection String**: Check server name, database name, and credentials
3. **Enable TCP/IP**: Enable TCP/IP protocol in SQL Server Configuration Manager
4. **Firewall Settings**: Ensure SQL Server port (default 1433) is open
5. **Authentication Mode**: Verify SQL Server authentication mode (Windows/Mixed)

```bash
# Test connection using sqlcmd
sqlcmd -S localhost -d DocManagementDB -E

# Check SQL Server services
services.msc -> Look for SQL Server services
```

#### Migration Issues

**Problem**: Entity Framework migrations fail
```
Unable to create an object of type 'ApplicationDbContext'
```

**Solutions**:
1. **Check Connection String**: Ensure valid connection string in appsettings.json
2. **Install EF Tools**: Install Entity Framework tools globally
3. **Build Project**: Ensure project builds successfully before migration

```bash
# Install EF Core tools globally
dotnet tool install --global dotnet-ef

# Clean and rebuild
dotnet clean
dotnet build

# Update database
dotnet ef database update
```

#### JWT Authentication Issues

**Problem**: JWT token validation fails
```
401 Unauthorized - Bearer token validation failed
```

**Solutions**:
1. **Check JWT Secret**: Ensure JWT_SECRET environment variable is set
2. **Token Expiry**: Verify token hasn't expired (default 180 minutes)
3. **Token Format**: Ensure Bearer token format: `Authorization: Bearer <token>`
4. **Clock Skew**: Check server time synchronization

```bash
# Set environment variable
export JWT_SECRET="your-super-secret-jwt-key-here-minimum-32-characters"

# Check token in JWT debugger
# Visit: https://jwt.io/
```

#### Business Central Integration Issues

**Problem**: ERP integration fails
```
NetworkError: Connection to Business Central failed
```

**Solutions**:
1. **Check BC Service**: Ensure Business Central service is running
2. **Verify Credentials**: Check username, password, domain in configuration
3. **Network Connectivity**: Test network connection to BC server
4. **API Endpoints**: Verify BC API endpoints are accessible
5. **NTLM Authentication**: Ensure NTLM authentication is properly configured

```bash
# Test BC API connectivity
curl -u "DOMAIN\USERNAME:PASSWORD" http://bc-server:port/BC/api/bslink/docverse/v1.0/journal

# Check BC API configuration
"BcApi": {
  "BaseUrl": "http://bc-server:port/BC/api/bslink/docverse/v1.0",
  "Username": "USERNAME",
  "Password": "PASSWORD",
  "Domain": "DOMAIN"
}
```

#### Docker Deployment Issues

**Problem**: Docker container startup fails
```
Docker container exits immediately with code 1
```

**Solutions**:
1. **Check Environment Variables**: Ensure all required env vars are set
2. **Connection String**: Verify database connection string for containerized SQL Server
3. **Network Configuration**: Check Docker network settings
4. **Log Analysis**: Examine container logs for specific errors

```bash
# Check container logs
docker logs container-name

# Run with environment variables
docker run -e ConnectionStrings__DefaultConnection="Server=sql-server;Database=DocManagementDB;User Id=sa;Password=YourPassword123;" your-image

# Test container interactively
docker run -it --entrypoint /bin/bash your-image
```

#### Performance Issues

**Problem**: Slow API response times
```
API responses taking longer than expected
```

**Solutions**:
1. **Database Indexing**: Check if proper indexes are in place
2. **Query Optimization**: Analyze EF Core generated SQL queries
3. **Connection Pooling**: Verify database connection pool settings
4. **Async Operations**: Ensure all I/O operations are async
5. **Caching**: Implement caching for frequently accessed data

```bash
# Enable EF Core query logging
"Logging": {
  "LogLevel": {
    "Microsoft.EntityFrameworkCore.Database.Command": "Information"
  }
}

# Check database performance
-- SQL Server query to check slow queries
SELECT TOP 10 
    qt.query_sql_text,
    qs.execution_count,
    qs.total_elapsed_time,
    qs.avg_elapsed_time
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY qs.avg_elapsed_time DESC
```

### Logging and Debugging

#### Enable Detailed Logging

Update `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information",
      "Microsoft.EntityFrameworkCore": "Information",
      "DocManagementBackend": "Debug"
    }
  }
}
```

#### Common Log Locations

- **Development**: Console output and debug window
- **Production**: Application logs in configured logging provider
- **Docker**: Container logs accessible via `docker logs`
- **IIS**: Event Viewer and IIS logs

### Health Check Endpoints

The application provides health check endpoints for monitoring:

```http
GET /health              # Basic health status
GET /health/detailed     # Detailed health information
GET /health/db          # Database health check
GET /health/external    # External service health (BC API)
```

Example health check response:
```json
{
  "status": "Healthy",
  "results": {
    "database": {
      "status": "Healthy",
      "description": "Database connection successful"
    },
    "businesscentral": {
      "status": "Healthy", 
      "description": "BC API connection successful"
    }
  },
  "totalDuration": "00:00:00.1234567"
}
```

## 🤝 Contributing

We welcome contributions to improve the DocManagementBackend! Please follow these guidelines:

### Development Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- Follow C# coding conventions
- Write comprehensive unit tests
- Update documentation
- Ensure all tests pass
- Follow existing architectural patterns

### Reporting Issues

Please use the GitHub Issues tab to report bugs or request features. Include:

- **Environment details** (OS, .NET version, etc.)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Error messages** and stack traces

## 📞 Support

### Documentation

- **API Documentation**: Available at `/swagger` endpoint
- **Technical Documentation**: See `docs/` directory
- **Architecture Guide**: `docs/BACKEND_DOCUMENTATION.md`
- **API Examples**: `docs/API_Examples.md`

### Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Check the comprehensive docs
- **Email Support**: Contact the development team

### Frequently Asked Questions

**Q: How do I reset the admin password?**
A: Use the DataSeeder or SQL script to reset admin credentials.

**Q: How do I configure Business Central integration?**
A: Update the BcApi settings in appsettings.json with your BC server details.

**Q: Can I run without Business Central?**
A: Yes, the ERP integration is optional and can be disabled.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Microsoft for .NET and Entity Framework
- The open-source community for excellent packages
- Business Central team for API integration support

---

**Built with ❤️ by the DocManagement Team**

For more information, visit our [Documentation](docs/) or contact our development team. 