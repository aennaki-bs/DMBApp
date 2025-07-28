# Simple Ligne Filters - Uniform Design

## Overview
The SimpleLigneFilters component provides a clean, compact filter system that matches the uniform UI pattern used across all pages in the application.

## Design Pattern

### 🎨 **Uniform Theme**
- **Main Container**: `bg-[#1e2a4a]` - Dark blue background
- **Interactive Elements**: `bg-[#22306e]` - Slightly lighter blue for inputs/selects
- **Text Colors**: `text-blue-100` - Light blue for good contrast
- **Borders**: `border-blue-900/40` - Subtle blue borders with transparency
- **Accents**: `text-blue-400` - Icons and highlights

### 📐 **Layout Structure**
```
[Search Field Selector] [Search Input ........................] [Filter Button]
[Active Filter Badges ...................................................]
```

### 🔧 **Components Hierarchy**
1. **Main Container**: Full-width responsive flex container
2. **Search Section**: Field selector + search input with icon
3. **Filter Section**: Button with count badge + popover content
4. **Badges Section**: Active filters with individual remove options

## Features

### 🔍 **Search Functionality**
- **Field-specific search**: All fields, Title, Items, Item Code, Account Code
- **Real-time filtering**: Instant results as you type
- **Clear button**: Quick search reset with ×
- **Dynamic placeholder**: Shows selected search field

### 📊 **Column Filters**
- **Quantity**: < 5, 5-20, > 20
- **Price HT**: < 100 MAD, 100-500 MAD, > 500 MAD
- **Amount TTC**: < 500 MAD, 500-2000 MAD, > 2000 MAD
- **Discount**: None, < 10%, 10-25%, > 25%

### 🏷️ **Visual Feedback**
- **Filter count badge**: Shows number of active filters
- **Active filter badges**: Individual removable indicators
- **Results counter**: Shows "X of Y results"
- **Consistent styling**: Matches application-wide patterns

## Usage

### Basic Implementation
```tsx
<SimpleLigneFilters
  lignes={lignes}
  onFiltersChange={handleFiltersChange}
  className="w-full"
/>
```

### Integration Pattern
```tsx
// In parent component
const [filteredLignes, setFilteredLignes] = useState<Ligne[]>(lignes);

const handleFiltersChange = (filtered: Ligne[]) => {
  setFilteredLignes(filtered);
};

return (
  <div className="h-full flex flex-col space-y-2">
    <div className="flex-shrink-0">
      <SimpleLigneFilters
        lignes={lignes}
        onFiltersChange={handleFiltersChange}
      />
    </div>
    <div className="flex-1 min-h-0">
      {/* Table content */}
    </div>
  </div>
);
```

## Design Consistency

### ✅ **Matches Application Standards**
- Same color scheme as other filter components
- Consistent spacing and typography
- Identical interaction patterns
- Unified component styling

### 📱 **Responsive Design**
- **Desktop**: Horizontal layout with all elements in single row
- **Mobile**: Stacked layout with proper spacing
- **Adaptive**: Smooth transitions between breakpoints

### 🎯 **User Experience**
- **Familiar**: Same as other pages in the application
- **Intuitive**: Standard search and filter patterns
- **Efficient**: Minimal space usage, maximum functionality
- **Clear**: Visual indicators for all states

## Technical Details

### State Management
- React hooks for local state
- Memoized filtering for performance
- Callback optimization with useEffect

### Performance
- Real-time filtering without lag
- Optimized re-renders
- Efficient filter algorithms

### Accessibility
- Proper focus management
- Keyboard navigation support
- Screen reader compatibility
- High contrast text ratios

## Customization

While maintaining design consistency, the component supports:
- Custom filter ranges (easily adjustable)
- Additional search fields
- Extended filter options
- Flexible badge styling

The uniform design ensures that any customizations maintain the application's visual coherence. 