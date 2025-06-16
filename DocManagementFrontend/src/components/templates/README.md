# Management Page Template

A comprehensive, reusable template for all management pages in the DocuVerse application. This template provides a consistent UI pattern with header, search bar, table, bulk actions, and pagination components.

## Features

- **🎨 Theme-Responsive Design**: Automatically adapts to all theme changes with professional styling
- **🔍 Advanced Search & Filtering**: Built-in search with field selection and advanced filter popover
- **📊 Professional Table Layout**: Fixed header with scrollable body, responsive design
- **⚡ Bulk Actions**: Floating action bar with smooth animations
- **📄 Smart Pagination**: Built-in pagination with customizable page sizes
- **🎭 Loading & Error States**: Professional loading spinners and error handling
- **📱 Responsive Design**: Works seamlessly across all screen sizes
- **🔧 Highly Customizable**: Flexible props for different use cases

## Basic Usage

```tsx
import { ManagementPageTemplate } from "@/components/templates/ManagementPageTemplate";
import { Users, UserPlus, Download, Shield, Trash } from "lucide-react";

function UserManagementExample() {
  // Your state management
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [statusFilter, setStatusFilter] = useState("any");
  const [roleFilter, setRoleFilter] = useState("any");
  const [isLoading, setIsLoading] = useState(false);

  // Page actions (header buttons)
  const pageActions = [
    {
      label: "Export Users",
      variant: "outline" as const,
      icon: Download,
      onClick: () => handleExport(),
    },
    {
      label: "Create User",
      variant: "default" as const,
      icon: UserPlus,
      onClick: () => setCreateUserOpen(true),
    },
  ];

  // Search fields configuration
  const searchFields = [
    { id: "all", label: "All Fields", value: "all" },
    { id: "name", label: "Name", value: "name" },
    { id: "email", label: "Email", value: "email" },
    { id: "role", label: "Role", value: "role" },
  ];

  // Filter configuration
  const filters = [
    {
      key: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { id: "any", label: "Any Status", value: "any" },
        { id: "active", label: "Active", value: "active" },
        { id: "inactive", label: "Inactive", value: "inactive" },
      ],
    },
    {
      key: "role",
      label: "Role",
      value: roleFilter,
      onChange: setRoleFilter,
      options: [
        { id: "any", label: "Any Role", value: "any" },
        { id: "admin", label: "Admin", value: "Admin" },
        { id: "fulluser", label: "Full User", value: "FullUser" },
        { id: "simpleuser", label: "Simple User", value: "SimpleUser" },
      ],
    },
  ];

  // Bulk actions configuration
  const bulkActions = [
    {
      label: "Change Role",
      variant: "outline" as const,
      icon: Shield,
      onClick: () => handleBulkRoleChange(),
    },
    {
      label: "Delete",
      variant: "destructive" as const,
      icon: Trash,
      onClick: () => handleBulkDelete(),
    },
  ];

  return (
    <ManagementPageTemplate
      // Page Header
      title="User Management"
      subtitle="Manage users and their permissions"
      icon={Users}
      actions={pageActions}
      // Search
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchField={searchField}
      onSearchFieldChange={setSearchField}
      searchFields={searchFields}
      searchPlaceholder="Search users..."
      // Filters
      filters={filters}
      onClearFilters={() => {
        setStatusFilter("any");
        setRoleFilter("any");
        setSearchQuery("");
      }}
      // Data
      data={users}
      isLoading={isLoading}
      isError={false}
      // Selection
      selectedItems={selectedUsers}
      onSelectItem={handleSelectUser}
      onSelectAll={handleSelectAll}
      // Table
      tableHeader={<UserTableHeader />}
      tableBody={<UserTableBody users={users} />}
      // Bulk Actions
      bulkActions={bulkActions}
    >
      {/* Additional modals, dialogs, etc. */}
      <CreateUserDialog />
      <EditUserDialog />
    </ManagementPageTemplate>
  );
}
```

## Props Reference

### Core Props

| Prop       | Type           | Required | Description                    |
| ---------- | -------------- | -------- | ------------------------------ |
| `title`    | `string`       | ✅       | Page title displayed in header |
| `subtitle` | `string`       | ✅       | Page subtitle/description      |
| `icon`     | `LucideIcon`   | ✅       | Icon for the page header       |
| `actions`  | `PageAction[]` | ❌       | Header action buttons          |

### Search Props

| Prop                  | Type                      | Required | Description                     |
| --------------------- | ------------------------- | -------- | ------------------------------- |
| `searchQuery`         | `string`                  | ✅       | Current search query            |
| `onSearchChange`      | `(query: string) => void` | ✅       | Search query change handler     |
| `searchField`         | `string`                  | ✅       | Currently selected search field |
| `onSearchFieldChange` | `(field: string) => void` | ✅       | Search field change handler     |
| `searchFields`        | `SearchField[]`           | ✅       | Available search fields         |
| `searchPlaceholder`   | `string`                  | ❌       | Search input placeholder        |

### Filter Props

| Prop             | Type             | Required | Description               |
| ---------------- | ---------------- | -------- | ------------------------- |
| `filters`        | `FilterConfig[]` | ❌       | Filter configurations     |
| `onClearFilters` | `() => void`     | ❌       | Clear all filters handler |

### Data Props

| Prop           | Type      | Required | Description          |
| -------------- | --------- | -------- | -------------------- |
| `data`         | `T[]`     | ✅       | Array of data items  |
| `isLoading`    | `boolean` | ❌       | Loading state        |
| `isError`      | `boolean` | ❌       | Error state          |
| `errorMessage` | `string`  | ❌       | Custom error message |

### Selection Props

| Prop            | Type                   | Required | Description                   |
| --------------- | ---------------------- | -------- | ----------------------------- |
| `selectedItems` | `any[]`                | ✅       | Array of selected item IDs    |
| `onSelectItem`  | `(id: any) => void`    | ✅       | Single item selection handler |
| `onSelectAll`   | `(items: T[]) => void` | ✅       | Select all items handler      |

### Table Props

| Prop            | Type                      | Required | Description                  |
| --------------- | ------------------------- | -------- | ---------------------------- |
| `tableHeader`   | `ReactNode`               | ✅       | Table header component       |
| `tableBody`     | `ReactNode`               | ✅       | Table body component         |
| `emptyState`    | `ReactNode`               | ❌       | Custom empty state component |
| `sortBy`        | `string`                  | ❌       | Current sort field           |
| `sortDirection` | `"asc" \| "desc"`         | ❌       | Current sort direction       |
| `onSort`        | `(field: string) => void` | ❌       | Sort handler                 |

### Bulk Actions Props

| Prop          | Type           | Required | Description                |
| ------------- | -------------- | -------- | -------------------------- |
| `bulkActions` | `BulkAction[]` | ❌       | Bulk action configurations |

### Pagination Props

| Prop               | Type        | Required | Description                     |
| ------------------ | ----------- | -------- | ------------------------------- |
| `customPagination` | `ReactNode` | ❌       | Custom pagination component     |
| `initialPageSize`  | `number`    | ❌       | Initial page size (default: 15) |
| `pageSizeOptions`  | `number[]`  | ❌       | Available page size options     |

## Type Definitions

```tsx
interface PageAction {
  label: string;
  onClick: () => void;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";
  icon?: LucideIcon;
}

interface SearchField {
  id: string;
  label: string;
  value: string;
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive";
  icon?: LucideIcon;
}
```

## Advanced Examples

### Document Management Page

```tsx
function DocumentManagementPage() {
  return (
    <ManagementPageTemplate
      title="Document Management"
      subtitle="Manage all documents and their workflows"
      icon={FileText}
      actions={[
        {
          label: "Upload Document",
          variant: "default",
          icon: Upload,
          onClick: () => setUploadOpen(true),
        },
      ]}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchField={searchField}
      onSearchFieldChange={setSearchField}
      searchFields={[
        { id: "all", label: "All Fields", value: "all" },
        { id: "title", label: "Title", value: "title" },
        { id: "type", label: "Type", value: "type" },
        { id: "status", label: "Status", value: "status" },
      ]}
      filters={[
        {
          key: "type",
          label: "Document Type",
          value: typeFilter,
          onChange: setTypeFilter,
          options: documentTypeOptions,
        },
        {
          key: "status",
          label: "Status",
          value: statusFilter,
          onChange: setStatusFilter,
          options: statusOptions,
        },
      ]}
      data={documents}
      selectedItems={selectedDocuments}
      onSelectItem={handleSelectDocument}
      onSelectAll={handleSelectAllDocuments}
      tableHeader={<DocumentTableHeader />}
      tableBody={<DocumentTableBody documents={documents} />}
      bulkActions={[
        {
          label: "Archive",
          variant: "outline",
          icon: Archive,
          onClick: handleBulkArchive,
        },
        {
          label: "Delete",
          variant: "destructive",
          icon: Trash,
          onClick: handleBulkDelete,
        },
      ]}
    />
  );
}
```

### Circuit Management Page

```tsx
function CircuitManagementPage() {
  return (
    <ManagementPageTemplate
      title="Circuit Management"
      subtitle="Create and manage document workflow circuits"
      icon={GitBranch}
      actions={[
        {
          label: "New Circuit",
          variant: "default",
          icon: Plus,
          onClick: () => setCreateOpen(true),
        },
      ]}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchField={searchField}
      onSearchFieldChange={setSearchField}
      searchFields={circuitSearchFields}
      data={circuits}
      selectedItems={selectedCircuits}
      onSelectItem={handleSelectCircuit}
      onSelectAll={handleSelectAllCircuits}
      tableHeader={<CircuitTableHeader />}
      tableBody={<CircuitTableBody circuits={circuits} />}
      bulkActions={[
        {
          label: "Activate",
          variant: "outline",
          icon: Play,
          onClick: handleBulkActivate,
        },
        {
          label: "Deactivate",
          variant: "outline",
          icon: Pause,
          onClick: handleBulkDeactivate,
        },
      ]}
    />
  );
}
```

## Styling & Theming

The template automatically uses the theme-responsive CSS classes:

- `table-search-bar` - Search bar container
- `table-search-select` - Select dropdowns
- `table-search-input` - Search input
- `table-search-icon` - Search icons
- `table-container` - Main table container
- `table-header` - Table header
- `table-scroll-area` - Scrollable table body
- `bulk-actions-container` - Bulk actions bar
- `bulk-actions-button` - Bulk action buttons

These classes automatically adapt to theme changes and provide consistent styling across all management pages.

## Migration Guide

To migrate existing management pages to use this template:

1. **Replace page structure** with `ManagementPageTemplate`
2. **Extract search logic** into the template props
3. **Configure filters** using the `FilterConfig` interface
4. **Move bulk actions** to the `bulkActions` prop
5. **Pass table components** as `tableHeader` and `tableBody`
6. **Add selection logic** for bulk operations

### Before (Old Pattern)

```tsx
function OldManagementPage() {
  return (
    <div>
      <PageHeader title="Management" />
      <SearchBar />
      <FilterBar />
      <Table />
      <Pagination />
      <BulkActions />
    </div>
  );
}
```

### After (New Template)

```tsx
function NewManagementPage() {
  return (
    <ManagementPageTemplate
      title="Management"
      subtitle="Description"
      icon={Icon}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      // ... other props
      tableHeader={<TableHeader />}
      tableBody={<TableBody />}
    />
  );
}
```

## Best Practices

1. **Consistent Naming**: Use consistent naming for similar actions across pages
2. **Icon Usage**: Use appropriate Lucide icons for actions and page headers
3. **Loading States**: Always handle loading and error states
4. **Responsive Design**: Test on different screen sizes
5. **Accessibility**: Ensure proper ARIA labels and keyboard navigation
6. **Performance**: Use pagination for large datasets
7. **User Feedback**: Provide clear feedback for bulk actions

## Theme Integration

The template is fully integrated with the theme system and will automatically adapt colors, gradients, and effects when themes are switched. All components use CSS custom properties that respond to theme changes.
