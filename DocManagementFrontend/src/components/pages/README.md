# 🏗️ Page Components Architecture

## Overview

This directory contains dedicated component architectures for each major page in the application. Each page has its own folder with a complete modular structure that includes components, hooks, types, and utilities specific to that page.

## 🎯 **Architecture Benefits**

✅ **Modular & Organized**: Each page has its own dedicated components  
✅ **Easy Maintenance**: Changes to one page don't affect others  
✅ **Reusable Components**: Components can be imported and reused  
✅ **Consistent Theming**: All pages maintain the same UI/UX standards  
✅ **TypeScript Support**: Full type safety with dedicated interfaces  
✅ **Performance**: Better code splitting and lazy loading

## 📁 **Folder Structure**

```
src/components/pages/
├── README.md                           # This documentation
├── vendor-management/                  # ✅ COMPLETED
│   ├── VendorManagementPage.tsx       # Main page component
│   ├── VendorManagementContent.tsx    # Content logic & state
│   ├── index.ts                       # Export definitions
│   ├── components/                    # Page-specific components
│   │   ├── VendorSearchBar.tsx       # Search & filtering
│   │   ├── VendorTable.tsx           # Table with sorting/selection
│   │   ├── VendorPagination.tsx      # Pagination controls
│   │   ├── VendorEditDialog.tsx      # Edit functionality
│   │   ├── VendorBulkActions.tsx     # Bulk operations
│   │   └── VendorDeleteDialog.tsx    # Delete confirmations
│   └── hooks/                        # Page-specific hooks
│       ├── useVendorFilters.ts       # Filter logic
│       └── useVendorSelection.ts     # Selection management
├── customer-management/               # 🚧 IN PROGRESS
│   ├── CustomerManagementPage.tsx
│   ├── CustomerManagementContent.tsx
│   └── ... (similar structure)
├── document-types-management/         # 🚧 PLANNED
│   └── ... (similar structure)
├── approval-groups-management/        # 🚧 PLANNED
│   └── ... (similar structure)
├── circuits-management/               # 🚧 PLANNED
│   └── ... (similar structure)
└── ... (all other pages)
```

## 🎨 **Component Pattern**

### 1. **Main Page Component** (`[Page]ManagementPage.tsx`)

- Contains the page header with title, icon, and actions
- Manages refetch functionality from header
- Provides consistent page layout structure

### 2. **Content Component** (`[Page]ManagementContent.tsx`)

- Contains all business logic and state management
- Handles API calls, mutations, and data processing
- Orchestrates all sub-components
- Manages loading, error, and empty states

### 3. **Sub-Components** (`components/`)

- **SearchBar**: Advanced search and filtering functionality
- **Table**: Data display with sorting, selection, and actions
- **Pagination**: Page navigation and size controls
- **EditDialog**: Edit/update functionality
- **BulkActions**: Bulk operations (delete, export, etc.)
- **DeleteDialog**: Confirmation dialogs

### 4. **Custom Hooks** (`hooks/`)

- **useFilters**: Search and filtering logic
- **useSelection**: Row selection management
- **useTableState**: Sorting and pagination state

## 🎯 **Key Features Maintained**

### ✨ **Enhanced UI/UX**

- Glass morphism effects and modern styling
- Smooth animations and transitions
- Responsive design for all devices
- Consistent theme integration

### 🔍 **Advanced Search & Filtering**

- Multi-field search capabilities
- Real-time filtering with visual feedback
- Advanced filter popovers
- Clear filter functionality

### 📊 **Smart Table Management**

- Fixed headers with scrollable content
- Row selection with indeterminate states
- Sortable columns with visual indicators
- Bulk actions with confirmation dialogs

### 📄 **Intelligent Pagination**

- Flexible page sizes (10, 25, 50, 100)
- Auto-scroll to top on page changes
- Visual statistics and range indicators
- Always-visible pagination bar

### 🔄 **State Management**

- React Query for server state
- Custom hooks for local state
- Optimistic updates with error handling
- Manual refresh functionality

## 🛠️ **Usage Examples**

### Import Main Page Component

```typescript
import VendorManagementPage from "@/components/pages/vendor-management/VendorManagementPage";

export default function VendorManagement() {
  return <VendorManagementPage />;
}
```

### Import Individual Components

```typescript
import {
  VendorSearchBar,
  VendorTable,
  useVendorFilters,
} from "@/components/pages/vendor-management";
```

### Use Custom Hooks

```typescript
const { searchQuery, filteredData, clearAllFilters } = useVendorFilters(data);
```

## 🎨 **Styling & Theming**

All components use the established theme system with consistent:

- **Glass morphism containers**: `table-glass-container`
- **Search styling**: `table-search-input`, `table-search-select`
- **Color coding**: Country badges, status indicators
- **Animation classes**: Hover effects, loading states
- **Responsive breakpoints**: Mobile-first approach

## 🔧 **Extending the Architecture**

### Adding a New Page Component:

1. **Create the folder structure**:

```bash
mkdir src/components/pages/new-page-management
mkdir src/components/pages/new-page-management/components
mkdir src/components/pages/new-page-management/hooks
```

2. **Create the main components**:

- `NewPageManagementPage.tsx` (header + layout)
- `NewPageManagementContent.tsx` (logic + state)

3. **Add sub-components**:

- `NewPageSearchBar.tsx`
- `NewPageTable.tsx`
- `NewPagePagination.tsx`
- etc.

4. **Create custom hooks**:

- `useNewPageFilters.ts`
- `useNewPageSelection.ts`

5. **Create index.ts** for exports

6. **Update the page file** to use the new component

### Template Files Available:

- Copy the vendor-management folder as a template
- Replace "Vendor" with your entity name
- Update interfaces and API calls
- Customize business logic as needed

## 🚀 **Performance Benefits**

- **Code Splitting**: Each page loads only its required components
- **Lazy Loading**: Pages can be lazy-loaded for better initial performance
- **Tree Shaking**: Unused components are excluded from builds
- **Memoization**: Expensive operations are cached with useMemo/useCallback
- **Optimized Rendering**: Components re-render only when necessary

## 📝 **Best Practices**

1. **Keep components focused**: Each component should have a single responsibility
2. **Use TypeScript**: Define proper interfaces for all props and data
3. **Handle loading states**: Always provide feedback for async operations
4. **Error boundaries**: Implement proper error handling
5. **Accessibility**: Follow ARIA guidelines and keyboard navigation
6. **Testing**: Write unit tests for custom hooks and complex logic

## 🔍 **Future Enhancements**

- [ ] Add global search across all management pages
- [ ] Implement data export functionality
- [ ] Add advanced filtering with date ranges
- [ ] Create reusable table component library
- [ ] Add data visualization components
- [ ] Implement real-time updates with WebSockets

---

**Note**: This architecture provides a scalable foundation for managing complex business applications while maintaining code quality and developer experience.
