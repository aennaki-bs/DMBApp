# Responsive Design Guide for DocuVerse

This guide provides comprehensive instructions for implementing responsive design across all pages in the DocuVerse application.

## Table of Contents

1. [Breakpoints](#breakpoints)
2. [Utility Classes](#utility-classes)
3. [Component Patterns](#component-patterns)
4. [Layout Guidelines](#layout-guidelines)
5. [Best Practices](#best-practices)
6. [Common Patterns](#common-patterns)
7. [Implementation Examples](#implementation-examples)

## Breakpoints

Our responsive design uses the following Tailwind CSS breakpoints:

```css
/* Mobile First Approach */
/* Default: 0px - 639px (Mobile) */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Laptops */
2xl: 1536px /* Large screens */
```

## Utility Classes

### Container Classes

```css
.responsive-container          /* Standard container with responsive padding */
/* Standard container with responsive padding */
.responsive-container-tight; /* Tighter container for compact layouts */
```

### Grid Systems

```css
.responsive-grid              /* 1-2-3-4 column responsive grid */
/* 1-2-3-4 column responsive grid */
.responsive-grid-2            /* 1-2 column responsive grid */
.responsive-grid-auto; /* Auto-fit responsive grid */
```

### Flexbox Layouts

```css
.responsive-flex              /* Column on mobile, row on desktop */
/* Column on mobile, row on desktop */
.responsive-flex-center       /* Centered flex layout */
.responsive-flex-between; /* Space-between flex layout */
```

### Spacing

```css
.responsive-spacing           /* Responsive vertical spacing */
/* Responsive vertical spacing */
.responsive-spacing-tight     /* Tighter responsive spacing */
.responsive-padding           /* Responsive padding */
.responsive-padding-tight; /* Tighter responsive padding */
```

### Typography

```css
.responsive-text-sm           /* xs on mobile, sm on desktop */
/* xs on mobile, sm on desktop */
.responsive-text-base         /* sm on mobile, base on desktop */
.responsive-text-lg           /* base on mobile, lg on desktop */
.responsive-text-xl           /* lg on mobile, xl-2xl on desktop */
.responsive-text-2xl; /* xl on mobile, 2xl-3xl on desktop */
```

### Buttons

```css
.responsive-button            /* Full width on mobile, auto on desktop */
/* Full width on mobile, auto on desktop */
.responsive-button-group; /* Stacked on mobile, inline on desktop */
```

### Cards

```css
.responsive-card              /* Responsive card with adaptive padding */
/* Responsive card with adaptive padding */
.responsive-card-compact; /* Compact responsive card */
```

### Tables

```css
.responsive-table-container   /* Horizontal scroll on mobile */
/* Horizontal scroll on mobile */
.responsive-table; /* Responsive table wrapper */
```

### Modals/Dialogs

```css
.responsive-modal             /* Standard responsive modal */
/* Standard responsive modal */
.responsive-modal-wide        /* Wide responsive modal */
.responsive-modal-full; /* Full-width responsive modal */
```

### Forms

```css
.responsive-form              /* Responsive form spacing */
/* Responsive form spacing */
.responsive-form-group        /* Responsive form field group */
.responsive-form-buttons; /* Responsive form button layout */
```

### Visibility

```css
.mobile-only                  /* Show only on mobile */
/* Show only on mobile */
.desktop-only                 /* Show only on desktop */
.tablet-up                    /* Show on tablet and up */
.mobile-tablet; /* Show on mobile and tablet only */
```

## Component Patterns

### 1. Search Bars

```tsx
// Mobile-first search bar
<div className="responsive-search">
  <div className="responsive-search-input">
    <Select className="w-full sm:w-[130px]">{/* Select options */}</Select>
  </div>
  <div className="responsive-search-input">
    <Input className="w-full" placeholder="Search..." />
  </div>
  <div className="responsive-search-filters">
    <Button className="w-full sm:w-auto">Filter</Button>
  </div>
</div>
```

### 2. Data Tables

```tsx
// Responsive table with horizontal scroll
<div className="responsive-table-container">
  <div className="responsive-table">
    <Table>{/* Table content */}</Table>
  </div>
</div>
```

### 3. Action Bars

```tsx
// Responsive action bar
<div className="responsive-actions">
  <div className="responsive-text-base font-medium">
    {selectedCount} items selected
  </div>
  <div className="responsive-button-group">
    <Button className="responsive-button">Edit</Button>
    <Button className="responsive-button">Delete</Button>
  </div>
</div>
```

### 4. Cards and Lists

```tsx
// Responsive card grid
<div className="responsive-grid">
  {items.map((item) => (
    <div key={item.id} className="responsive-card">
      {/* Card content */}
    </div>
  ))}
</div>
```

### 5. Dialogs and Modals

```tsx
// Responsive dialog
<DialogContent className="responsive-modal-wide">
  <DialogHeader className="responsive-header-compact">
    <DialogTitle className="responsive-text-xl">Dialog Title</DialogTitle>
  </DialogHeader>

  <div className="responsive-form">{/* Form content */}</div>

  <DialogFooter className="responsive-form-buttons">
    <Button className="responsive-button">Cancel</Button>
    <Button className="responsive-button">Confirm</Button>
  </DialogFooter>
</DialogContent>
```

## Layout Guidelines

### 1. Mobile-First Approach

Always start with mobile design and progressively enhance for larger screens:

```tsx
// ❌ Desktop-first (avoid)
<div className="flex-row lg:flex-col">

// ✅ Mobile-first (preferred)
<div className="flex-col lg:flex-row">
```

### 2. Container Structure

```tsx
// Standard page layout
<div className="responsive-container">
  <div className="responsive-header">
    <h1 className="responsive-text-2xl">Page Title</h1>
    <div className="responsive-actions">{/* Action buttons */}</div>
  </div>

  <div className="responsive-content">{/* Main content */}</div>
</div>
```

### 3. Sidebar Layouts

```tsx
// Responsive sidebar layout
<div className="flex flex-col lg:flex-row">
  <aside className="responsive-sidebar">{/* Sidebar content */}</aside>
  <main className="flex-1 min-w-0">{/* Main content */}</main>
</div>
```

## Best Practices

### 1. Touch Targets

- Minimum 44px (2.75rem) touch targets on mobile
- Use `p-3` or larger for clickable elements
- Ensure adequate spacing between interactive elements

### 2. Typography Scale

```tsx
// Responsive typography hierarchy
<h1 className="responsive-text-2xl font-bold">Main Heading</h1>
<h2 className="responsive-text-xl font-semibold">Sub Heading</h2>
<p className="responsive-text-base">Body text</p>
<span className="responsive-text-sm text-muted-foreground">Helper text</span>
```

### 3. Spacing System

```tsx
// Consistent responsive spacing
<div className="responsive-spacing">
  <section className="responsive-padding">
    {/* Content with responsive padding */}
  </section>
</div>
```

### 4. Image Optimization

```tsx
// Responsive images
<img
  src="image.jpg"
  alt="Description"
  className="w-full h-auto object-cover rounded-lg"
  loading="lazy"
/>
```

### 5. Performance Considerations

- Use `loading="lazy"` for images below the fold
- Implement `backgroundAttachment: scroll` on mobile for better performance
- Use `min-w-0` to prevent flex item overflow
- Implement proper focus management for mobile navigation

## Common Patterns

### 1. Navigation Menus

```tsx
// Mobile hamburger menu with desktop inline navigation
<nav className="responsive-nav">
  <div className="mobile-only">
    <Button variant="ghost" size="sm">
      <Menu className="h-4 w-4" />
    </Button>
  </div>

  <div className="desktop-only responsive-nav-compact">
    <Link href="/home">Home</Link>
    <Link href="/about">About</Link>
    <Link href="/contact">Contact</Link>
  </div>
</nav>
```

### 2. Form Layouts

```tsx
// Responsive form with proper field grouping
<form className="responsive-form">
  <div className="responsive-form-group">
    <Label className="w-full sm:w-32">Name</Label>
    <Input className="flex-1" />
  </div>

  <div className="responsive-form-group">
    <Label className="w-full sm:w-32">Email</Label>
    <Input className="flex-1" type="email" />
  </div>

  <div className="responsive-form-buttons">
    <Button type="button" variant="outline" className="responsive-button">
      Cancel
    </Button>
    <Button type="submit" className="responsive-button">
      Submit
    </Button>
  </div>
</form>
```

### 3. Data Display

```tsx
// Responsive data cards that stack on mobile
<div className="responsive-grid-2">
  <div className="responsive-card">
    <h3 className="responsive-text-lg font-semibold mb-2">Statistics</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="responsive-text-xl font-bold">123</div>
        <div className="responsive-text-sm text-muted-foreground">Total</div>
      </div>
      <div className="text-center">
        <div className="responsive-text-xl font-bold">45</div>
        <div className="responsive-text-sm text-muted-foreground">Active</div>
      </div>
    </div>
  </div>
</div>
```

## Implementation Examples

### Example 1: User Management Page

```tsx
export function UserManagementPage() {
  return (
    <div className="responsive-container">
      {/* Header */}
      <div className="responsive-header">
        <div>
          <h1 className="responsive-text-2xl font-bold">User Management</h1>
          <p className="responsive-text-base text-muted-foreground">
            Manage users and their permissions
          </p>
        </div>
        <div className="responsive-actions">
          <Button className="responsive-button">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="responsive-card-compact mb-4">
        <div className="responsive-search">
          <div className="responsive-search-input">
            <Input placeholder="Search users..." />
          </div>
          <div className="responsive-search-filters">
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="responsive-card">
        <div className="responsive-table-container">
          <div className="responsive-table">
            <Table>{/* Table content */}</Table>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Example 2: Dashboard Page

```tsx
export function DashboardPage() {
  return (
    <div className="responsive-container">
      {/* Welcome Header */}
      <div className="responsive-header-compact">
        <h1 className="responsive-text-2xl font-bold">Dashboard</h1>
        <div className="responsive-actions-right">
          <Button variant="outline" size="sm" className="responsive-button">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="responsive-grid mb-6">
        {stats.map((stat) => (
          <div key={stat.id} className="responsive-card-compact">
            <div className="flex items-center justify-between">
              <div>
                <p className="responsive-text-sm text-muted-foreground">
                  {stat.label}
                </p>
                <p className="responsive-text-xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-primary" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="responsive-grid-2">
        <div className="responsive-card">
          <h2 className="responsive-text-lg font-semibold mb-4">
            Recent Activity
          </h2>
          {/* Chart component */}
        </div>
        <div className="responsive-card">
          <h2 className="responsive-text-lg font-semibold mb-4">
            Quick Actions
          </h2>
          {/* Quick actions */}
        </div>
      </div>
    </div>
  );
}
```

## Testing Responsive Design

### 1. Browser DevTools

- Test at common breakpoints: 375px, 768px, 1024px, 1440px
- Use device emulation for iOS and Android devices
- Test both portrait and landscape orientations

### 2. Real Device Testing

- Test on actual mobile devices when possible
- Check touch interactions and scrolling behavior
- Verify text readability and button accessibility

### 3. Accessibility Testing

- Ensure proper focus management
- Test with screen readers
- Verify color contrast at all screen sizes
- Check keyboard navigation

## Migration Strategy

To make existing pages responsive:

1. **Audit Current Layout**: Identify fixed widths and non-responsive elements
2. **Apply Container Classes**: Wrap content in responsive containers
3. **Update Typography**: Replace fixed text sizes with responsive classes
4. **Implement Responsive Grids**: Convert rigid layouts to flexible grids
5. **Add Mobile Navigation**: Implement mobile-friendly navigation patterns
6. **Test and Iterate**: Test on multiple devices and screen sizes

Remember: Always prioritize user experience and accessibility when implementing responsive design patterns.
