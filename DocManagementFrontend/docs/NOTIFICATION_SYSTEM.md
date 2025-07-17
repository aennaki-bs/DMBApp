# Enhanced Notification System

## Overview

The enhanced notification system prevents duplicate notifications and provides a unified interface for displaying messages throughout the application.

## Features

- ✅ **Duplicate Prevention**: Automatically prevents showing the same notification multiple times
- ✅ **Unified API**: Single interface for all notification types
- ✅ **Loading States**: Built-in loading notifications with easy updates
- ✅ **Promise Helpers**: Automatic loading/success/error flow for async operations
- ✅ **Customizable**: Configure duration, actions, and descriptions
- ✅ **Type Safety**: Full TypeScript support

## Usage

### Basic Usage

```typescript
import { notifications } from '@/utils/notificationUtils';

// Simple notifications
notifications.success('Document saved successfully');
notifications.error('Failed to delete approver');
notifications.warning('This action cannot be undone');
notifications.info('New features available');
```

### Using the Hook (Recommended)

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const notify = useNotifications();

  const handleSave = async () => {
    try {
      await saveDocument();
      notify.success('Document saved successfully');
    } catch (error) {
      notify.error('Failed to save document');
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### Advanced Options

```typescript
// With custom duration and description
notifications.error('Failed to delete approver', {
  duration: 8000,
  description: 'Cannot delete approvators that are associated with 3 step(s). Remove the approvator from these steps first.',
});

// With action button
notifications.warning('Unsaved changes', {
  action: {
    label: 'Save',
    onClick: () => handleSave(),
  },
});

// Prevent duplicates manually
notifications.success('Success message', {
  preventDuplicates: false, // Allow duplicates
});
```

### Loading States

```typescript
// Manual loading control
const loadingId = notifications.loading('Deleting approvers...');

try {
  await deleteApprovers();
  notifications.update(loadingId, 'success', 'Approvers deleted successfully');
} catch (error) {
  notifications.update(loadingId, 'error', 'Failed to delete approvers');
}
```

### Promise Helper (Best for Async Operations)

```typescript
const notify = useNotifications();

// Automatic loading/success/error flow
await notify.promise(
  deleteApprovers(selectedIds),
  {
    loading: 'Deleting approvers...',
    success: (count) => `${count} approvers deleted successfully`,
    error: 'Failed to delete approvers',
  }
);
```

## API Reference

### Core Functions

- `notifications.success(message, options?)` - Show success notification
- `notifications.error(message, options?)` - Show error notification  
- `notifications.warning(message, options?)` - Show warning notification
- `notifications.info(message, options?)` - Show info notification
- `notifications.loading(message, options?)` - Show loading notification

### Control Functions

- `notifications.dismiss(id)` - Dismiss specific notification
- `notifications.dismissAll()` - Dismiss all notifications
- `notifications.update(id, type, message, options?)` - Update existing notification

### Options Interface

```typescript
interface NotificationOptions {
  id?: string;                    // Custom ID for the notification
  duration?: number;              // Duration in milliseconds
  preventDuplicates?: boolean;    // Prevent duplicate notifications (default: true)
  description?: string;           // Additional description text
  action?: {                      // Action button
    label: string;
    onClick: () => void;
  };
}
```

## Migration Guide

### From Direct Toast Usage

**Before:**
```typescript
import { toast } from 'sonner';

toast.error('Failed to delete approver');
toast.success('Approver deleted successfully');
```

**After:**
```typescript
import { useNotifications } from '@/hooks/useNotifications';

const notify = useNotifications();

notify.error('Failed to delete approver');
notify.success('Approver deleted successfully');
```

### For API Error Handlers

**Before:**
```typescript
// Multiple error handlers showing duplicate notifications
toast.error('API Error');
// Component also shows: toast.error('Failed to delete approver');
```

**After:**
```typescript
// Automatic duplicate prevention
notifications.error('API Error');
notifications.error('Failed to delete approver'); // Prevented if duplicate
```

## Best Practices

1. **Use the Hook**: Prefer `useNotifications()` hook in components
2. **Descriptive Messages**: Provide clear, actionable error messages
3. **Consistent Timing**: Use appropriate durations for different message types
4. **Loading States**: Use promise helper for async operations
5. **Context**: Include relevant context in error messages

## Examples

### Complete CRUD Operations

```typescript
function ApproversManagement() {
  const notify = useNotifications();

  const handleDelete = async (approverId: number) => {
    try {
      await notify.promise(
        approvalService.deleteApprovator(approverId),
        {
          loading: 'Deleting approver...',
          success: 'Approver deleted successfully',
          error: (error) => {
            // Custom error message based on error type
            if (error.response?.status === 409) {
              return 'Cannot delete: approver is associated with active workflows';
            }
            return 'Failed to delete approver';
          },
        }
      );
      
      // Refresh data after successful deletion
      refetchApprovers();
    } catch (error) {
      // Error notification already shown by promise helper
      console.error('Delete failed:', error);
    }
  };

  const handleBulkDelete = async (selectedIds: number[]) => {
    if (selectedIds.length === 0) {
      notify.warning('Please select approvers to delete');
      return;
    }

    try {
      const result = await notify.promise(
        bulkDeleteApprovers(selectedIds),
        {
          loading: `Deleting ${selectedIds.length} approvers...`,
          success: (deletedCount) => `${deletedCount} approvers deleted successfully`,
          error: 'Failed to delete some approvers',
        }
      );

      // Show warning if partial success
      if (result.failed.length > 0) {
        notify.warning(`${result.failed.length} approvers could not be deleted`, {
          description: 'Some approvers are associated with active workflows',
        });
      }
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };
}
```

This system eliminates the duplicate notification problem you were experiencing while providing a much better developer experience! 