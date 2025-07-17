import { toast } from 'sonner';

// Track active notifications to prevent duplicates
const activeNotifications = new Set<string>();
const notificationHistory = new Map<string, number>();

// Default durations for different notification types
const DEFAULT_DURATIONS = {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000,
    loading: 0, // Loading toasts don't auto-dismiss
} as const;

export type NotificationType = keyof typeof DEFAULT_DURATIONS;

export interface NotificationOptions {
    id?: string;
    duration?: number;
    preventDuplicates?: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
    description?: string;
}

// Generate a unique ID for the notification based on content
function generateNotificationId(type: NotificationType, title: string, description?: string): string {
    const content = `${type}:${title}${description ? `:${description}` : ''}`;
    return btoa(content).slice(0, 12); // Short unique ID
}

// Check if notification is a duplicate
function isDuplicate(id: string, preventDuplicates: boolean): boolean {
    if (!preventDuplicates) return false;

    const now = Date.now();
    const lastShown = notificationHistory.get(id);

    // Consider it a duplicate if shown within the last 3 seconds
    if (lastShown && (now - lastShown) < 3000) {
        return true;
    }

    return activeNotifications.has(id);
}

// Clean up notification tracking
function cleanupNotification(id: string): void {
    activeNotifications.delete(id);
    // Keep history for 10 seconds to prevent rapid duplicates
    setTimeout(() => {
        notificationHistory.delete(id);
    }, 10000);
}

// Enhanced notification function
function showNotification(
    type: NotificationType,
    title: string,
    options: NotificationOptions = {}
): string | null {
    const {
        id: customId,
        duration = DEFAULT_DURATIONS[type],
        preventDuplicates = true,
        action,
        description,
    } = options;

    // Generate or use provided ID
    const notificationId = customId || generateNotificationId(type, title, description);

    // Check for duplicates
    if (isDuplicate(notificationId, preventDuplicates)) {
        console.debug(`Prevented duplicate notification: ${title}`);
        return null;
    }

    // Track the notification
    activeNotifications.add(notificationId);
    notificationHistory.set(notificationId, Date.now());

    // Configure toast options
    const toastOptions: any = {
        id: notificationId,
        duration,
        onDismiss: () => cleanupNotification(notificationId),
        onAutoClose: () => cleanupNotification(notificationId),
    };

    if (action) {
        toastOptions.action = {
            label: action.label,
            onClick: action.onClick,
        };
    }

    if (description) {
        toastOptions.description = description;
    }

    // Show the appropriate toast type
    let toastId: string | number;

    switch (type) {
        case 'success':
            toastId = toast.success(title, toastOptions);
            break;
        case 'error':
            toastId = toast.error(title, toastOptions);
            break;
        case 'warning':
            toastId = toast.warning(title, toastOptions);
            break;
        case 'info':
            toastId = toast.info(title, toastOptions);
            break;
        case 'loading':
            toastId = toast.loading(title, toastOptions);
            break;
        default:
            toastId = toast(title, toastOptions);
    }

    return notificationId;
}

// Public notification API
export const notifications = {
    success: (title: string, options?: NotificationOptions) =>
        showNotification('success', title, options),

    error: (title: string, options?: NotificationOptions) =>
        showNotification('error', title, options),

    warning: (title: string, options?: NotificationOptions) =>
        showNotification('warning', title, options),

    info: (title: string, options?: NotificationOptions) =>
        showNotification('info', title, options),

    loading: (title: string, options?: NotificationOptions) =>
        showNotification('loading', title, options),

    // Dismiss a specific notification
    dismiss: (id: string) => {
        toast.dismiss(id);
        cleanupNotification(id);
    },

    // Dismiss all notifications
    dismissAll: () => {
        toast.dismiss();
        activeNotifications.clear();
        notificationHistory.clear();
    },

    // Update a loading notification to success/error
    update: (id: string, type: Exclude<NotificationType, 'loading'>, title: string, options?: Omit<NotificationOptions, 'id'>) => {
        const toastOptions: any = {
            duration: options?.duration || DEFAULT_DURATIONS[type],
        };

        if (options?.description) {
            toastOptions.description = options.description;
        }

        if (options?.action) {
            toastOptions.action = {
                label: options.action.label,
                onClick: options.action.onClick,
            };
        }

        switch (type) {
            case 'success':
                toast.success(title, { id, ...toastOptions });
                break;
            case 'error':
                toast.error(title, { id, ...toastOptions });
                break;
            case 'warning':
                toast.warning(title, { id, ...toastOptions });
                break;
            case 'info':
                toast.info(title, { id, ...toastOptions });
                break;
        }

        // Update tracking
        setTimeout(() => cleanupNotification(id), toastOptions.duration || DEFAULT_DURATIONS[type]);
    },

    // Promise helper for async operations
    promise: async <T>(
        promise: Promise<T>,
        {
            loading,
            success,
            error,
        }: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ): Promise<T> => {
        const loadingId = showNotification('loading', loading, { preventDuplicates: false });

        try {
            const result = await promise;
            if (loadingId) {
                const successMessage = typeof success === 'function' ? success(result) : success;
                notifications.update(loadingId, 'success', successMessage);
            }
            return result;
        } catch (err) {
            if (loadingId) {
                const errorMessage = typeof error === 'function' ? error(err) : error;
                notifications.update(loadingId, 'error', errorMessage);
            }
            throw err;
        }
    },
};

// Export default for backward compatibility
export default notifications; 