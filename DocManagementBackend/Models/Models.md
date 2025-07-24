# Database Models Documentation

## Overview
This document provides a comprehensive guide to all database models in the Document Management System. The system is designed around a workflow-based document approval process with support for ERP integration and complex line item management.

## Table of Contents
1. [Core Entities](#core-entities)
2. [Workflow Management](#workflow-management)
3. [Document Line Items](#document-line-items)
4. [Reference Data](#reference-data)
5. [Support Systems](#support-systems)
6. [Entity Relationships](#entity-relationships)
7. [Key Enums](#key-enums)

---

## Core Entities

### User
**File**: `user.cs`
**Purpose**: Manages user accounts, authentication, and user roles.

**Key Properties**:
- `Id` (PK): Unique identifier
- `Email`, `Username`: Authentication credentials
- `PasswordHash`: Encrypted password
- `RoleId` (FK): Links to Role table
- `ResponsibilityCentreId` (FK): Optional assignment to responsibility centre
- `IsActive`, `IsOnline`: User status flags
- `RefreshToken`, `RefreshTokenExpiry`: JWT token management

**Relationships**:
- One-to-Many with `Document` (as creator/updater)
- One-to-Many with `LogHistory`
- Many-to-One with `Role`
- Many-to-One with `ResponsibilityCentre`

### Role
**File**: `user.cs`
**Purpose**: Defines user permissions and access levels.

**Key Properties**:
- `Id` (PK): Unique identifier
- `RoleName`: Role designation
- `IsAdmin`, `IsSimpleUser`, `IsFullUser`: Permission flags

### Document
**File**: `document.cs`
**Purpose**: Core entity representing business documents in the system.

**Key Properties**:
- `Id` (PK): Unique identifier
- `DocumentKey`: Business key for the document
- `CreatedByUserId` (FK): Document creator
- `TypeId` (FK): Links to DocumentType
- `SubTypeId` (FK): Optional sub-type classification
- `CircuitId` (FK): Current workflow circuit
- `CurrentStatusId` (FK): Current workflow status
- `CurrentStepId` (FK): Current workflow step
- `CustomerOrVendor`: Dynamic reference to Customer/Vendor
- `IsArchived`: Archive status flag
- `ERPDocumentCode`: ERP system integration reference

**Relationships**:
- One-to-Many with `Ligne` (document lines)
- Many-to-One with `DocumentType`, `SubType`
- Many-to-One with `Circuit`, `Status`, `Step`
- Dynamic relationship with `Customer`/`Vendor` based on document type

### DocumentType
**File**: `document.cs`
**Purpose**: Defines document categories and their characteristics.

**Key Properties**:
- `Id` (PK): Unique identifier
- `TypeKey`, `TypeName`: Type identification
- `TierType`: Enum defining if type relates to Customer/Vendor/None
- `DocumentCounter`: Auto-increment counter for documents

**Relationships**:
- One-to-Many with `Document`
- One-to-Many with `Circuit`
- One-to-Many with `SubType`

### SubType
**File**: `document.cs`  
**Purpose**: Provides sub-categorization of document types with time-bound validity.

**Key Properties**:
- `Id` (PK): Unique identifier
- `DocumentTypeId` (FK): Parent document type
- `StartDate`, `EndDate`: Validity period
- `DocumentCounter`: Counter for documents of this subtype

---

## Workflow Management

### Circuit
**File**: `circuit.cs`
**Purpose**: Defines workflow circuits that documents follow for approval.

**Key Properties**:
- `Id` (PK): Unique identifier
- `CircuitKey`, `Title`: Circuit identification
- `DocumentTypeId` (FK): Associated document type
- `HasOrderedFlow`: Whether steps must follow sequence
- `AllowBacktrack`: Whether backward movement is allowed

**Relationships**:
- One-to-Many with `Status`, `Step`
- Many-to-One with `DocumentType`

### Step
**File**: `circuit.cs`
**Purpose**: Individual steps within a workflow circuit.

**Key Properties**:
- `Id` (PK): Unique identifier
- `CircuitId` (FK): Parent circuit
- `CurrentStatusId` (FK): Status when step is current
- `NextStatusId` (FK): Status after step completion
- `RequiresApproval`: Whether step needs approval
- `ApprovatorId` (FK): Individual approver
- `ApprovatorsGroupId` (FK): Group of approvers

**Relationships**:
- Many-to-One with `Circuit`, `Status` (current/next)
- One-to-One with `Approvator` or `ApprovatorsGroup`

### Status
**File**: `status.cs`
**Purpose**: Defines workflow statuses within circuits.

**Key Properties**:
- `Id` (PK): Unique identifier
- `CircuitId` (FK): Parent circuit
- `StatusKey`, `Title`: Status identification
- `IsInitial`, `IsFinal`: Workflow position flags
- `IsRequired`, `IsFlexible`: Behavior flags

### Approval System
**Files**: `approval.cs`
**Purpose**: Manages complex approval workflows with individual and group approvers.

**Key Entities**:
- **Approvator**: Individual approvers with user references
- **ApprovatorsGroup**: Groups of approvers with configurable rules
- **ApprovatorsGroupUser**: Members of approval groups
- **ApprovatorsGroupRule**: Rules governing group approval behavior
- **ApprovalWriting**: Active approval requests
- **ApprovalResponse**: Individual responses to approval requests

**Group Rule Types** (RuleType enum):
- `Any`: Any group member can approve
- `All`: All members must approve
- `Sequential`: Members approve in specified order
- `MinimumWithRequired`: Minimum count plus required members

---

## Document Line Items

### Ligne
**File**: `lignes.cs`
**Purpose**: Individual line items within documents.

**Key Properties**:
- `Id` (PK): Unique identifier
- `DocumentId` (FK): Parent document
- `Type` (FK): Links to LignesElementType
- `ElementId`: Dynamic reference to Item/GeneralAccount
- `Quantity`, `PriceHT`: Line quantities and pricing
- `LocationCode` (FK): Item location (for Item types)
- `UnitCode` (FK): Unit of measure (for Item types)
- `VatPercentage`, `DiscountPercentage`: Tax and discount rates

**Relationships**:
- Many-to-One with `Document`
- Many-to-One with `LignesElementType`
- Dynamic relationships with `Item`/`GeneralAccounts`
- Many-to-One with `Location`, `UnitOfMeasure`
- One-to-Many with `SousLigne`

### SousLigne
**File**: `lignes.cs`
**Purpose**: Sub-line items providing additional detail for main lines.

**Key Properties**:
- `Id` (PK): Unique identifier
- `LigneId` (FK): Parent line
- `Title`, `Attribute`: Sub-line details

### LignesElementType
**File**: `LignesElementType.cs`
**Purpose**: Defines types of elements that can be used in document lines.

**Key Properties**:
- `Id` (PK): Unique identifier
- `Code`: Unique type code
- `TypeElement`: Enum (Item/GeneralAccounts)
- `TableName`: Target table name for the element type

**Purpose**: Acts as a template system allowing lines to reference either inventory items or general ledger accounts.

---

## Reference Data

### Item
**File**: `LignesElementType.cs`
**Purpose**: Inventory items that can be referenced in document lines.

**Key Properties**:
- `Code` (PK): Item code
- `Description`: Item description
- `Unite` (FK): Default unit of measure

**Relationships**:
- Many-to-One with `UnitOfMeasure`
- One-to-Many with `ItemUnitOfMeasure` (alternative units)

### GeneralAccounts
**File**: `LignesElementType.cs`
**Purpose**: General ledger accounts for financial document lines.

**Key Properties**:
- `Code` (PK): Account code
- `Description`: Account description
- `AccountType`: Account classification (from ERP)

### Customer / Vendor
**File**: `LignesElementType.cs`
**Purpose**: Business partners (customers for sales, vendors for purchases).

**Key Properties**:
- `Code`/`VendorCode` (PK): Partner identifier
- `Name`, `Address`, `City`, `Country`: Contact information

**Relationships**:
- One-to-Many with `Document` (dynamic based on DocumentType.TierType)

### UnitOfMeasure
**File**: `LignesElementType.cs`
**Purpose**: Units of measurement for items.

**Key Properties**:
- `Code` (PK): Unit code
- `Description`: Unit description

**Relationships**:
- One-to-Many with `Item` (default units)
- One-to-Many with `ItemUnitOfMeasure` (conversion ratios)

### ItemUnitOfMeasure
**File**: `LignesElementType.cs`
**Purpose**: Defines conversion ratios between different units for the same item.

**Key Properties**:
- `ItemCode` (FK): Item reference
- `UnitOfMeasureCode` (FK): Unit reference
- `QtyPerUnitOfMeasure`: Conversion ratio

### Location
**File**: `LignesElementType.cs`
**Purpose**: Physical or logical locations for inventory items.

### ResponsibilityCentre
**File**: `ResponsibilityCentre.cs`
**Purpose**: Organizational units for document and user assignment.

**Key Properties**:
- `Id` (PK): Unique identifier
- `Code`: Centre code
- `Descr`: Description

**Relationships**:
- One-to-Many with `User`, `Document`

---

## Support Systems

### LogHistory
**File**: `user.cs`
**Purpose**: Audit trail for user actions.

**Key Properties**:
- `UserId` (FK): User who performed action
- `ActionType`: Numeric code for action type
- `Timestamp`: When action occurred

**Action Types**:
- 0: Logout, 1: Login, 2: Create profile, 3: Update profile
- 4: Create document, 5: Update document, 6: Delete document
- 7: Create user profile, 8: Update user profile, 9: Delete user profile

### ErpArchivalError
**File**: `ErpArchivalError.cs`
**Purpose**: Tracks errors during ERP system integration.

**Key Properties**:
- `DocumentId` (FK): Related document
- `LigneId` (FK): Related line (optional)
- `ErrorType`: Type of ERP error
- `IsResolved`: Resolution status

### Document History Tables
**File**: `document.cs`
**Purpose**: Track document workflow progression.

**Key Entities**:
- **DocumentCircuitHistory**: Records workflow transitions
- **DocumentStepHistory**: Records step changes
- **DocumentStatus**: Tracks status completion

### Phone Verification
**File**: `PhoneVerificationModels.cs`
**Purpose**: Supporting phone number verification process.

### API Sync Models
**File**: `ApiSyncModels.cs`
**Purpose**: Manages synchronization with external ERP systems (Business Central).

**Key Entities**:
- **ApiSyncConfiguration**: Sync endpoint configuration
- **BcItemDto**, **BcCustomerDto**, etc.: External API data transfer objects
- **SyncResult**: Synchronization operation results

---

## Entity Relationships

### Core Document Flow
```
User -> Document -> Ligne -> SousLigne
  |        |         |
  |        |         +-> Item/GeneralAccounts (via LignesElementType)
  |        |
  |        +-> DocumentType -> SubType
  |        +-> Circuit -> Step -> Status
  |        +-> Customer/Vendor (dynamic)
  |
  +-> Role
  +-> ResponsibilityCentre
```

### Workflow System
```
Circuit -> Step -> Approvator/ApprovatorsGroup
  |         |
  |         +-> Status (Current/Next)
  |
  +-> DocumentType
  +-> Status (multiple)
```

### Approval System
```
ApprovalWriting -> ApprovalResponse
    |                   |
    +-> Step            +-> User
    +-> Document        
    +-> Approvator/ApprovatorsGroup
```

### Reference Data Network
```
Item -> UnitOfMeasure
  |         |
  |         +-> ItemUnitOfMeasure (conversion ratios)
  |
  +-> Location (for line items)

LignesElementType -> Item/GeneralAccounts
```

---

## Key Enums

### ElementType
- `Item`: References inventory items
- `GeneralAccounts`: References general ledger accounts

### TierType
- `None`: Document not related to customers/vendors
- `Customer`: Document relates to customers
- `Vendor`: Document relates to vendors

### RuleType (Approval Groups)
- `Any`: Any group member can approve
- `All`: All members must approve
- `Sequential`: Sequential approval required
- `MinimumWithRequired`: Minimum count plus specific members

### ApprovalStatus
- `Open`: Approval not yet started
- `InProgress`: Approval in process
- `Accepted`: Approval granted
- `Rejected`: Approval denied

### ErpErrorType
- `DocumentArchival`: Document-level ERP errors
- `LineArchival`: Line-level ERP errors
- `ValidationError`: Data validation errors
- `NetworkError`: Communication errors
- `AuthenticationError`: Authentication failures
- `BusinessRuleError`: ERP business rule violations

---

## Recent Changes

### Action System Removal
The Action system has been completely removed from the backend as of July 2025. This included:

**Removed Models**:
- `Action`: Previously defined workflow actions like approve, reject
- `StepAction`: Junction table linking steps to actions
- `ActionStatusEffect`: Effects of actions on statuses

**Affected Models**:
- `Step`: Removed `StepActions` collection
- `DocumentCircuitHistory`: Removed `ActionId` property and `Action` navigation

**Current Workflow Processing**:
With Actions removed, the system now relies on:
1. **Direct Status Transitions**: Using direct status changes without action intermediaries
2. **Approval System**: Processing approvals directly through ApprovalWritings
3. **Step-Based Processing**: Moving documents between steps using existing step management

---

## Notes

1. **Dynamic References**: The system uses dynamic foreign key references (e.g., Customer/Vendor based on DocumentType.TierType, Item/GeneralAccount based on LignesElementType.TypeElement).

2. **Workflow Flexibility**: Circuits can be configured for ordered or flexible workflows with backtracking capabilities.

3. **ERP Integration**: Models include ERP-specific fields for integration with external systems like Business Central.

4. **Audit Trail**: Comprehensive logging through LogHistory and various history tables.

5. **Multi-Unit Support**: Advanced unit of measure conversion system for inventory items.

6. **Approval Complexity**: Sophisticated approval system supporting individual approvers, groups, and various approval rules.

7. **Simplified Workflow**: Post-Action removal, workflows are processed through direct status transitions and approvals, providing a cleaner and more maintainable architecture. 