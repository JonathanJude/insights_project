import {
    BellIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    TrashIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { useUIStore } from '../../stores/uiStore';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, removeNotification, clearNotifications } = useUIStore();

  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };



  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md transform bg-card shadow-xl transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-default px-6 py-4">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">Notifications</h2>
            {notifications.length > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-secondary hover:text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close notifications panel"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <BellIcon className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-lg font-medium text-primary mb-2">No notifications</h3>
              <p className="text-sm text-secondary">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Clear all button */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-secondary">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearNotifications}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Clear all</span>
                </button>
              </div>

              {/* Notifications list */}
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative rounded-lg border p-4 ${getNotificationBgColor(notification.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-primary">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-secondary mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-secondary mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="ml-2 flex-shrink-0 rounded-md p-1 text-secondary hover:text-primary hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Dismiss notification"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-default px-6 py-4">
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;