
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Notification, useNotifications } from '@/hooks/useNotifications';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function NotificationsMenu() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    return format(date, 'dd MMMM à HH:mm', { locale: fr });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 relative" title="Notifications">
        <Bell className="h-6 w-6 text-gray-600 dark:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="font-medium">Notifications</span>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs text-numa-500 hover:text-numa-600"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        
        <div className="max-h-96 overflow-auto py-1">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <DropdownMenuItem key={notification.id} className="focus:bg-gray-100 dark:focus:bg-gray-800 p-0">
                {notification.link ? (
                  <Link 
                    to={notification.link} 
                    className={`w-full p-3 flex flex-col ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatNotificationDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-numa-500 rounded-full flex-shrink-0 mt-1.5"></div>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div 
                    className={`w-full p-3 flex flex-col ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatNotificationDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-numa-500 rounded-full flex-shrink-0 mt-1.5"></div>
                      )}
                    </div>
                  </div>
                )}
                <Separator />
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune notification</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
