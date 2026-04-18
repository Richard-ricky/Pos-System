import React, { useEffect, useState } from 'react';
import { Bell, Check, X, Trash2, Mail } from 'lucide-react';
import { notificationService, Notification } from '../../services/notification';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationCenter() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Load initial notifications
    loadNotifications();

    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe(setNotifications);

    // Request notification permission
    notificationService.requestPermission();

    // Subscribe to realtime notifications
    const unsubscribeRealtime = notificationService.subscribeToRealtimeNotifications(
      currentUser.id,
      (notification) => {
        loadNotifications();
      }
    );

    return () => {
      unsubscribe();
      unsubscribeRealtime();
    };
  }, [currentUser]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadNotifications = async () => {
    if (!currentUser) return;
    const notifs = await notificationService.getUserNotifications(currentUser.id);
    setNotifications(notifs);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!currentUser) return;
    await notificationService.markAsRead(currentUser.id, notificationId);
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    await notificationService.markAllAsRead(currentUser.id);
  };

  const handleDelete = async (notificationId: string) => {
    if (!currentUser) return;
    await notificationService.deleteNotification(currentUser.id, notificationId);
  };

  const handleDeleteAll = async () => {
    if (!currentUser) return;
    await notificationService.deleteAllNotifications(currentUser.id);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      transaction: '💳',
      payment: '💰',
      transfer: '📤',
      system: '⚙️',
      alert: '🚨',
    };
    return icons[type] || '📬';
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
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 border-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md glass-card">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between glass-text">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </span>
            {notifications.length > 0 && (
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="h-8 px-2 text-xs"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAll}
                  className="h-8 px-2 text-xs text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </SheetTitle>
          <SheetDescription className="glass-text">
            Stay updated with your transaction alerts and system notifications
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] mt-4 pr-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 glass-subtle rounded-lg">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground glass-text">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1 glass-text">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      p-4 rounded-lg border transition-all cursor-pointer
                      ${notification.read 
                        ? 'glass-subtle opacity-60' 
                        : 'glass-card border-primary/20'
                      }
                      hover:border-primary/40
                    `}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm glass-text">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 glass-text">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground glass-text">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
