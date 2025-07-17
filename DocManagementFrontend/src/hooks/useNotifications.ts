import { useCallback } from 'react';
import { notifications, type NotificationOptions } from '@/utils/notificationUtils';

/**
 * Hook for displaying notifications with duplicate prevention
 * Provides a simple interface to the notification system
 */
export function useNotifications() {
    const showSuccess = useCallback((message: string, options?: NotificationOptions) => {
        return notifications.success(message, options);
    }, []);

    const showError = useCallback((message: string, options?: NotificationOptions) => {
        return notifications.error(message, options);
    }, []);

    const showWarning = useCallback((message: string, options?: NotificationOptions) => {
        return notifications.warning(message, options);
    }, []);

    const showInfo = useCallback((message: string, options?: NotificationOptions) => {
        return notifications.info(message, options);
    }, []);

    const showLoading = useCallback((message: string, options?: NotificationOptions) => {
        return notifications.loading(message, options);
    }, []);

    const dismiss = useCallback((id: string) => {
        notifications.dismiss(id);
    }, []);

    const dismissAll = useCallback(() => {
        notifications.dismissAll();
    }, []);

    const update = useCallback((id: string, type: 'success' | 'error' | 'warning' | 'info', message: string, options?: Omit<NotificationOptions, 'id'>) => {
        notifications.update(id, type, message, options);
    }, []);

    // Promise helper for async operations
    const promise = useCallback(async <T>(
        asyncOperation: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ): Promise<T> => {
        return notifications.promise(asyncOperation, messages);
    }, []);

    return {
        success: showSuccess,
        error: showError,
        warning: showWarning,
        info: showInfo,
        loading: showLoading,
        dismiss,
        dismissAll,
        update,
        promise,
    };
}

export default useNotifications; 