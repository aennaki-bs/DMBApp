# DocManagementFrontend

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-teal.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A modern, enterprise-grade **Document Management System Frontend** built with React 18, TypeScript, and cutting-edge web technologies. Featuring a beautiful UI with shadcn/ui components, comprehensive document workflow management, and seamless integration with the DocManagement backend.

## 🚀 Key Features

- **📱 Modern React Architecture**: Built with React 18, TypeScript, and modern hooks
- **🎨 Beautiful UI/UX**: shadcn/ui components with Radix UI primitives and Tailwind CSS
- **📄 Document Management**: Complete document lifecycle from creation to approval
- **🔄 Workflow Systems**: Visual circuit-based approval workflows with drag-and-drop
- **👥 User Management**: Role-based access control with comprehensive user administration
- **📊 Interactive Dashboard**: Real-time analytics with beautiful charts (Recharts)
- **🔍 Advanced Search**: Powerful filtering and search capabilities
- **📱 Responsive Design**: Mobile-first design that works on all devices
- **🌙 Dark/Light Mode**: Complete theming system with multiple color schemes
- **🔐 Secure Authentication**: JWT-based authentication with protected routes
- **⚡ Performance Optimized**: Vite for fast builds, React Query for efficient data fetching
- **🎭 Animations**: Smooth animations with Framer Motion
- **🌐 Internationalization**: Multi-language support with translation system

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Technology Stack](#technology-stack)
6. [Features Overview](#features-overview)
7. [Development Guide](#development-guide)
8. [Component Library](#component-library)
9. [State Management](#state-management)
10. [Styling & Theming](#styling--theming)
11. [Building & Deployment](#building--deployment)
12. [Troubleshooting](#troubleshooting)
13. [Contributing](#contributing)
14. [Support](#support)

## 🛠 Prerequisites

Before setting up the DocManagementFrontend, ensure you have the following installed:

- **Node.js** 18+ or **Bun** 1.0+ ([Download Node.js](https://nodejs.org/) | [Download Bun](https://bun.sh/))
- **npm** 9+, **yarn** 1.22+, or **bun** (package managers)
- **Git** for version control
- **VS Code** (recommended) with suggested extensions

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### System Requirements

- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 1GB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/DMBApp.git
cd DMBApp/DocManagementFrontend
```

### 2. Install Dependencies

Choose your preferred package manager:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using bun (recommended for faster installs)
bun install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5001
VITE_API_TIMEOUT=30000

# Authentication
VITE_JWT_EXPIRY_MINUTES=180

# Firebase Configuration (Optional)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id

# Feature Flags
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEBUG_MODE=false

# External Services
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ANALYTICS_ID=your-analytics-id
```

## 🏗️ Development Setup

### Start Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using bun
bun dev
```

The application will be available at:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5001` (make sure backend is running)

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:host     # Start with network access

# Building
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

## 📁 Project Structure

```
DocManagementFrontend/
├── 📁 public/                    # Static assets
│   ├── favicon.ico              # App favicon
│   ├── robots.txt               # SEO robots file
│   └── placeholder.svg          # Placeholder images
├── 📁 src/                      # Source code
│   ├── 📁 components/           # React components
│   │   ├── 📁 ui/              # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx      # Button component
│   │   │   ├── dialog.tsx      # Dialog/Modal component
│   │   │   ├── form.tsx        # Form components
│   │   │   └── ...             # Other UI primitives
│   │   ├── 📁 admin/           # Admin-specific components
│   │   ├── 📁 approval/        # Approval system components
│   │   ├── 📁 circuits/        # Workflow circuit components
│   │   ├── 📁 dashboard/       # Dashboard components
│   │   ├── 📁 document/        # Document management components
│   │   ├── 📁 document-flow/   # Document workflow components
│   │   ├── 📁 navigation/      # Navigation components
│   │   └── ...                 # Feature-specific components
│   ├── 📁 pages/               # Page components (routes)
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Login.tsx          # Authentication
│   │   ├── Documents.tsx      # Document management
│   │   ├── Admin.tsx          # Admin panel
│   │   └── ...                # Other pages
│   ├── 📁 hooks/               # Custom React hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useDocuments.ts    # Document management
│   │   ├── useApiConnection.ts # API connection monitoring
│   │   └── ...                # Other custom hooks
│   ├── 📁 services/            # API services
│   │   ├── 📁 api/            # Core API utilities
│   │   ├── authService.ts     # Authentication API
│   │   ├── documentService.ts # Document API
│   │   ├── adminService.ts    # Admin API
│   │   └── ...                # Other services
│   ├── 📁 context/             # React contexts
│   │   ├── AuthContext.tsx    # Authentication state
│   │   ├── ThemeContext.tsx   # Theme management
│   │   ├── SettingsContext.tsx # App settings
│   │   └── ...                # Other contexts
│   ├── 📁 models/              # TypeScript types & interfaces
│   │   ├── auth.ts           # Authentication types
│   │   ├── document.ts       # Document types
│   │   ├── user.ts           # User types
│   │   └── ...               # Other model definitions
│   ├── 📁 lib/                 # Utility libraries
│   │   ├── utils.ts          # General utilities
│   │   ├── themes.ts         # Theme utilities
│   │   └── ...               # Other utilities
│   ├── 📁 utils/               # Helper functions
│   │   ├── errorHandling.ts  # Error utilities
│   │   ├── formatters.ts     # Data formatters
│   │   └── ...               # Other utilities
│   ├── 📁 styles/              # Global styles
│   │   ├── globals.css       # Global CSS
│   │   ├── components.css    # Component styles
│   │   └── themes.css        # Theme definitions
│   ├── 📁 translations/        # Internationalization
│   │   └── index.ts          # Translation definitions
│   ├── App.tsx                 # Main app component
│   ├── main.tsx               # App entry point
│   ├── index.css              # Global styles
│   └── vite-env.d.ts          # Vite type definitions
├── 📄 package.json              # Dependencies & scripts
├── 📄 vite.config.ts           # Vite configuration
├── 📄 tailwind.config.ts       # Tailwind CSS configuration
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 eslint.config.js         # ESLint configuration
├── 📄 components.json          # shadcn/ui configuration
└── 📄 README.md               # This file
```

## 🔧 Technology Stack

### Core Technologies

- **[React 18.3.1](https://reactjs.org/)** - UI library with concurrent features
- **[TypeScript 5.5.3](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite 6.2.4](https://vitejs.dev/)** - Next-generation frontend build tool
- **[React Router 6.26.2](https://reactrouter.com/)** - Declarative routing

### UI & Styling

- **[Tailwind CSS 3.4.11](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[Lucide React](https://lucide.dev/)** - Beautiful SVG icons
- **[Framer Motion 12.11.0](https://www.framer.com/motion/)** - Production-ready motion library

### State Management

- **[TanStack React Query 5.56.2](https://tanstack.com/query)** - Powerful data synchronization
- **[React Context](https://reactjs.org/docs/context.html)** - Global state management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management (if needed)

### Form Management

- **[React Hook Form 7.53.0](https://react-hook-form.com/)** - Performant forms with easy validation
- **[Zod 3.23.8](https://zod.dev/)** - TypeScript-first schema validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Validation resolvers

### Data Visualization

- **[Recharts 2.12.7](https://recharts.org/)** - Composable charting library
- **[React Flow Renderer](https://reactflow.dev/)** - Interactive node-based diagrams

### Developer Experience

- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[TypeScript ESLint](https://typescript-eslint.io/)** - TypeScript-specific linting

### Additional Libraries

- **[Axios 1.8.4](https://axios-http.com/)** - HTTP client
- **[date-fns 3.6.0](https://date-fns.org/)** - Date utility library
- **[clsx](https://github.com/lukeed/clsx)** - Conditional className utility
- **[Lodash 4.17.21](https://lodash.com/)** - Utility library
- **[React DnD](https://react-dnd.github.io/react-dnd/)** - Drag and drop

## 🎯 Features Overview

### 🔐 Authentication & Security

- **JWT-based Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based route protection
- **Password Management**: Secure password reset and update
- **Session Management**: Automatic token refresh and logout
- **Multi-factor Authentication**: Email verification support

**Key Components:**
- `Login.tsx` - Login page with form validation
- `Register.tsx` - Multi-step registration process
- `ProtectedRoute.tsx` - Route protection wrapper
- `AuthContext.tsx` - Authentication state management

### 📄 Document Management

- **Document Lifecycle**: Create, edit, view, and manage documents
- **Document Types**: Configurable document types and sub-types
- **Version Control**: Document versioning and history
- **File Attachments**: Upload and manage document attachments
- **Bulk Operations**: Select and perform bulk actions on documents

**Key Components:**
- `Documents.tsx` - Document listing and management
- `CreateDocument.tsx` - Document creation wizard
- `ViewDocument.tsx` - Document viewer with metadata
- `DocumentTypes.tsx` - Document type management

### 🔄 Workflow & Approvals

- **Circuit-based Workflows**: Visual workflow designer
- **Multi-level Approvals**: Configurable approval chains
- **Approval Groups**: Manage groups of approvers
- **Status Tracking**: Real-time workflow status updates
- **Deadline Management**: Approval deadlines and notifications

**Key Components:**
- `Circuits.tsx` - Workflow circuit management
- `ApprovalGroupsManagement.tsx` - Approval group configuration
- `PendingApprovals.tsx` - Pending approval tasks
- `WorkflowService.ts` - Workflow API integration

### 👥 User Management

- **User Administration**: Complete user lifecycle management
- **Role-based Access**: Granular permission system
- **Responsibility Centers**: Organizational structure management
- **Bulk User Operations**: Efficient user management tools
- **User Profiles**: Comprehensive user profile management

**Key Components:**
- `Admin.tsx` - Admin dashboard
- `UserManagement.tsx` - User administration interface
- `Profile.tsx` - User profile management
- `ResponsibilityCentreManagement.tsx` - Org structure management

### 📊 Dashboard & Analytics

- **Real-time Metrics**: Live dashboard with key metrics
- **Interactive Charts**: Beautiful charts with Recharts
- **Activity Monitoring**: User and system activity tracking
- **Custom Widgets**: Configurable dashboard widgets
- **Export Capabilities**: Data export and reporting

**Key Components:**
- `Dashboard.tsx` - Main dashboard
- `DashboardService.ts` - Dashboard data fetching
- Various chart components in `dashboard/` folder

### 🏢 Reference Data Management

- **Customer Management**: Customer master data
- **Vendor Management**: Vendor master data
- **Item Management**: Product/service catalog
- **Location Management**: Office/warehouse locations
- **General Accounts**: Chart of accounts management

**Key Components:**
- `CustomerManagement.tsx` - Customer data management
- `VendorManagement.tsx` - Vendor data management
- `ItemsPage.tsx` - Item catalog management
- `LocationsManagement.tsx` - Location management

## 🎨 Component Library

### Base UI Components (shadcn/ui)

The application uses a comprehensive set of accessible, customizable components:

```typescript
// Button variants
<Button variant="default | destructive | outline | secondary | ghost | link">
  Click me
</Button>

// Form components
<Form>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="Enter email" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>

// Dialog/Modal
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### Custom Components

#### Document Components
```typescript
// Document card display
<DocumentCard 
  document={document}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
/>

// Document status indicator
<DocumentStatusBadge status={document.status} />

// Document workflow progress
<WorkflowProgress currentStep={step} totalSteps={total} />
```

#### Dashboard Components
```typescript
// Metric cards
<MetricCard
  title="Total Documents"
  value={1234}
  change={+12}
  icon={<FileIcon />}
/>

// Chart components
<DocumentChart data={chartData} />
<ApprovalChart data={approvalData} />
```

#### Form Components
```typescript
// Multi-step wizard
<MultiStepWizard
  steps={steps}
  currentStep={currentStep}
  onStepChange={handleStepChange}
/>

// Advanced search form
<AdvancedSearchForm
  onSearch={handleSearch}
  filters={availableFilters}
/>
```

## 🔄 State Management

### React Query for Server State

```typescript
// Document queries
const { data: documents, isLoading, error } = useQuery({
  queryKey: ['documents', filters],
  queryFn: () => documentService.getDocuments(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutations with optimistic updates
const createDocumentMutation = useMutation({
  mutationFn: documentService.createDocument,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    toast.success('Document created successfully');
  },
  onError: (error) => {
    toast.error('Failed to create document');
  },
});
```

### Context for Global State

```typescript
// Authentication context
const { user, isAuthenticated, login, logout } = useAuth();

// Theme context
const { theme, setTheme, themes } = useTheme();

// Settings context
const { settings, updateSettings } = useSettings();
```

### Custom Hooks

```typescript
// Document management hook
const useDocuments = (filters?: DocumentFilters) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentService.getDocuments(filters),
  });

  const createDocument = useMutation({
    mutationFn: documentService.createDocument,
    onSuccess: () => queryClient.invalidateQueries(['documents']),
  });

  return {
    documents: data,
    isLoading,
    error,
    createDocument: createDocument.mutate,
    isCreating: createDocument.isPending,
  };
};
```

## 🎨 Styling & Theming

### Tailwind CSS Configuration

The application uses a custom Tailwind configuration with:

- **Custom Color Palette**: DocuVerse brand colors
- **Dark/Light Mode**: Complete theming system
- **Custom Animations**: Smooth transitions and effects
- **Responsive Breakpoints**: Mobile-first design

```typescript
// Custom colors
colors: {
  docuBlue: {
    DEFAULT: '#2563eb',
    50: '#eff6ff',
    100: '#dbeafe',
    // ... full color scale
  },
  sidebar: {
    DEFAULT: 'hsl(var(--sidebar-background))',
    foreground: 'hsl(var(--sidebar-foreground))',
    // ... sidebar color system
  }
}
```

### CSS Custom Properties

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... other CSS variables */
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme variables */
}
```

### Theme Usage

```typescript
// Theme selector component
<ThemeSelector
  themes={['light', 'dark', 'system']}
  value={currentTheme}
  onValueChange={setTheme}
/>

// Conditional styling based on theme
<div className={cn(
  "bg-background text-foreground",
  "dark:bg-gray-900 dark:text-white",
  "transition-colors duration-200"
)}>
  Content
</div>
```

### Responsive Design

```typescript
// Mobile-first responsive classes
<div className={cn(
  "grid grid-cols-1",      // Mobile: 1 column
  "md:grid-cols-2",        // Tablet: 2 columns
  "lg:grid-cols-3",        // Desktop: 3 columns
  "xl:grid-cols-4",        // Large: 4 columns
  "gap-4 p-4"
)}>
  {/* Content */}
</div>
```

## 🔨 Development Guide

### Adding New Features

#### 1. Create a New Page

```typescript
// src/pages/NewFeature.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const NewFeature = () => {
  const [filters, setFilters] = useState({});
  
  const { data, isLoading } = useQuery({
    queryKey: ['new-feature', filters],
    queryFn: () => newFeatureService.getData(filters),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">New Feature</h1>
        <Button>Add New</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Feature Content</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Feature content */}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewFeature;
```

#### 2. Add Routes

```typescript
// src/App.tsx
import NewFeature from './pages/NewFeature';

// Add to routes
<Route path="/new-feature" element={
  <ProtectedRoute requiredRole="User">
    <NewFeature />
  </ProtectedRoute>
} />
```

#### 3. Create API Service

```typescript
// src/services/newFeatureService.ts
import { apiClient } from './api/core';

export interface NewFeatureData {
  id: number;
  name: string;
  // ... other properties
}

export const newFeatureService = {
  getData: async (filters?: any): Promise<NewFeatureData[]> => {
    const response = await apiClient.get('/new-feature', { params: filters });
    return response.data;
  },

  createItem: async (data: Omit<NewFeatureData, 'id'>): Promise<NewFeatureData> => {
    const response = await apiClient.post('/new-feature', data);
    return response.data;
  },

  updateItem: async (id: number, data: Partial<NewFeatureData>): Promise<NewFeatureData> => {
    const response = await apiClient.put(`/new-feature/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/new-feature/${id}`);
  },
};
```

#### 4. Create Custom Hook

```typescript
// src/hooks/useNewFeature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newFeatureService, NewFeatureData } from '@/services/newFeatureService';
import { toast } from '@/hooks/use-toast';

export const useNewFeature = (filters?: any) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['new-feature', filters],
    queryFn: () => newFeatureService.getData(filters),
  });

  const createMutation = useMutation({
    mutationFn: newFeatureService.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-feature'] });
      toast({ title: 'Success', description: 'Item created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create item', variant: 'destructive' });
    },
  });

  return {
    data,
    isLoading,
    error,
    createItem: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};
```

### Code Style Guidelines

#### TypeScript Best Practices

```typescript
// Use proper typing
interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Viewer';
}

// Use const assertions for immutable data
const DOCUMENT_STATUSES = ['draft', 'pending', 'approved', 'rejected'] as const;
type DocumentStatus = typeof DOCUMENT_STATUSES[number];

// Use generics for reusable components
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

const Table = <T,>({ data, columns, onRowClick }: TableProps<T>) => {
  // Component implementation
};
```

#### Component Patterns

```typescript
// Use forwardRef for components that need ref access
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

// Use composition for flexible components
const Card = ({ children, className, ...props }) => (
  <div className={cn("card-base", className)} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className, ...props }) => (
  <div className={cn("card-header", className)} {...props}>
    {children}
  </div>
);
```

### Testing Guidelines

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Button from './Button';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

test('renders button with text', () => {
  const queryClient = createTestQueryClient();
  
  render(
    <QueryClientProvider client={queryClient}>
      <Button>Click me</Button>
    </QueryClientProvider>
  );
  
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
});

// Hook testing
import { renderHook, waitFor } from '@testing-library/react';
import { useDocuments } from './useDocuments';

test('fetches documents successfully', async () => {
  const { result } = renderHook(() => useDocuments());
  
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
    expect(result.current.documents).toHaveLength(3);
  });
});
```

## 🚀 Building & Deployment

### Production Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size
npm run build -- --analyze
```

### Environment-specific Builds

```bash
# Development build (with debug info)
npm run build:dev

# Staging build
VITE_APP_ENV=staging npm run build

# Production build
VITE_APP_ENV=production npm run build
```

### Docker Deployment

#### Dockerfile

```dockerfile
# Multi-stage build for optimal image size
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://api:5000
    depends_on:
      - api
    networks:
      - app-network

  api:
    image: docmanagement-backend
    ports:
      - "5000:80"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### Deployment Platforms

#### Vercel Deployment

```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api-url"
  }
}
```

#### Netlify Deployment

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## 🛠️ Troubleshooting

### Common Development Issues

#### Build Errors

**Problem**: `Module not found` errors during build
```
Module not found: Error: Can't resolve '@/components/ui/button'
```

**Solutions**:
1. **Check Path Aliases**: Ensure `@` alias is configured in `vite.config.ts`
2. **Verify File Exists**: Check if the imported file exists at the specified path
3. **Clear Cache**: Delete `node_modules` and reinstall dependencies

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

#### TypeScript Errors

**Problem**: TypeScript compilation errors
```
Property 'X' does not exist on type 'Y'
```

**Solutions**:
1. **Update Type Definitions**: Ensure all types are properly defined
2. **Check Imports**: Verify correct import paths and types
3. **Regenerate Types**: If using generated types, regenerate them

```bash
# Type checking
npm run type-check

# Fix auto-fixable TypeScript issues
npx tsc --noEmit --pretty
```

#### Styling Issues

**Problem**: Tailwind styles not applying
```
Class 'bg-blue-500' not working
```

**Solutions**:
1. **Check Tailwind Config**: Ensure content paths include your files
2. **Import Tailwind**: Verify Tailwind is imported in your CSS
3. **Purge Issues**: Check if classes are being purged incorrectly

```typescript
// tailwind.config.ts
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest of config
}
```

#### API Connection Issues

**Problem**: API requests failing
```
Network Error: Failed to fetch
```

**Solutions**:
1. **Check API URL**: Verify `VITE_API_BASE_URL` environment variable
2. **CORS Issues**: Ensure backend CORS is properly configured
3. **Network Issues**: Check if backend server is running

```typescript
// Check API configuration
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// Test API connection
const testConnection = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`);
    console.log('API Status:', response.status);
  } catch (error) {
    console.error('API Connection Error:', error);
  }
};
```

### Performance Issues

#### Slow Initial Load

**Problem**: App takes long time to load initially

**Solutions**:
1. **Code Splitting**: Implement lazy loading for routes
2. **Bundle Analysis**: Analyze and optimize bundle size
3. **Image Optimization**: Optimize images and assets

```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Documents = lazy(() => import('./pages/Documents'));

// In routes
<Route path="/dashboard" element={
  <Suspense fallback={<LoadingSpinner />}>
    <Dashboard />
  </Suspense>
} />
```

#### Memory Leaks

**Problem**: App becomes slow over time

**Solutions**:
1. **Cleanup Effects**: Properly cleanup useEffect subscriptions
2. **Query Cleanup**: Configure React Query garbage collection
3. **Component Optimization**: Use React.memo for expensive components

```typescript
// Proper effect cleanup
useEffect(() => {
  const subscription = api.subscribe(handleUpdate);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);

// React Query optimization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 1 * 60 * 1000, // 1 minute
    },
  },
});
```

### Browser Compatibility

#### Internet Explorer Support

**Problem**: App not working in older browsers

**Solutions**:
1. **Polyfills**: Add necessary polyfills for older browsers
2. **Browser Detection**: Show upgrade message for unsupported browsers
3. **Progressive Enhancement**: Ensure basic functionality works everywhere

```typescript
// Browser compatibility check
const BrowserCheck = () => {
  const isSupported = 'fetch' in window && 'Promise' in window;
  
  if (!isSupported) {
    return (
      <div className="browser-warning">
        <h2>Browser Not Supported</h2>
        <p>Please upgrade to a modern browser for the best experience.</p>
      </div>
    );
  }
  
  return null;
};
```

### Development Tools

#### Debugging Tools

```typescript
// React Query Devtools (development only)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      {/* Your app */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  );
}

// Error Boundary for better error handling
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

#### Performance Monitoring

```typescript
// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);

// React Performance Profiler
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
};

<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

## 🤝 Contributing

We welcome contributions to improve the DocManagementFrontend! Please follow these guidelines:

### Development Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** coding standards and add tests
4. **Commit** your changes (`git commit -m 'Add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

### Code Standards

#### Component Guidelines

```typescript
// ✅ Good: Proper component structure
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  children,
  onClick 
}) => {
  return (
    <button
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ❌ Bad: Poor component structure
const Button = (props) => {
  return <button style={{color: props.color}}>{props.text}</button>;
};
```

#### Naming Conventions

- **Components**: PascalCase (`UserProfile`, `DocumentCard`)
- **Hooks**: camelCase starting with 'use' (`useDocuments`, `useAuth`)
- **Services**: camelCase ending with 'Service' (`documentService`, `authService`)
- **Types/Interfaces**: PascalCase (`User`, `DocumentData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `DEFAULT_PAGE_SIZE`)

#### File Organization

```
components/
├── ui/                 # Base UI components
├── feature-name/       # Feature-specific components
│   ├── FeatureList.tsx
│   ├── FeatureForm.tsx
│   └── index.ts       # Export file
└── shared/            # Shared components
```

### Testing Requirements

- **Unit Tests**: All utility functions must have unit tests
- **Component Tests**: Interactive components should have basic tests
- **Integration Tests**: Key user flows should have integration tests
- **Accessibility Tests**: Components should pass accessibility tests

### Pull Request Guidelines

- **Clear Description**: Explain what the PR does and why
- **Screenshots**: Include screenshots for UI changes
- **Tests**: Ensure all tests pass
- **Documentation**: Update documentation if needed
- **Small PRs**: Keep PRs focused and small for easier review

## 📞 Support

### Documentation

- **Component Documentation**: Storybook documentation for all components
- **API Documentation**: Complete API integration guide
- **Setup Guide**: Detailed setup and configuration guide
- **Troubleshooting**: Common issues and solutions

### Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and community support
- **Wiki**: Comprehensive project documentation
- **Email Support**: Contact the development team

### Frequently Asked Questions

**Q: How do I add a new page to the application?**
A: Create a new component in `src/pages/`, add the route in `App.tsx`, and update the navigation if needed.

**Q: How do I customize the theme colors?**
A: Update the color definitions in `tailwind.config.ts` and the CSS custom properties in `src/index.css`.

**Q: How do I add a new API service?**
A: Create a new service file in `src/services/`, follow the existing pattern with proper TypeScript types, and use React Query for data fetching.

**Q: Why are my Tailwind styles not working?**
A: Check that your file is included in the `content` array in `tailwind.config.ts` and that you've imported the CSS file properly.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing React library
- **Vercel** for the incredible Vite build tool
- **shadcn** for the beautiful UI component library
- **Tailwind Labs** for Tailwind CSS
- **Open Source Community** for all the excellent libraries

---

**Built with ❤️ by the DocManagement Team**

For more information, visit our [Documentation](docs/) or contact our development team.

---

### 🎯 Quick Start Checklist

- [ ] Clone the repository
- [ ] Install dependencies (`npm install`)
- [ ] Set up environment variables (`.env.local`)
- [ ] Start development server (`npm run dev`)
- [ ] Open `http://localhost:3000`
- [ ] Start building amazing features! 🚀 