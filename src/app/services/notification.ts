import { db } from './database';
import { supabase } from '../../../utils/supabase/client';

export interface Notification {
  id: string;
  userId: string;
  type: 'transaction' | 'payment' | 'transfer' | 'system' | 'alert';
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  data?: any;
}

class NotificationService {
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  // Subscribe to notification changes
  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  private notifyListeners(notifications: Notification[]) {
    this.listeners.forEach(callback => callback(notifications));
  }

  // Get all notifications for a user
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const notifications = await db.getByPrefix(`notification:${userId}:`);
      return notifications
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50); // Limit to 50 most recent
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getUserNotifications(userId);
    return notifications.filter(n => !n.read).length;
  }

  // Create a new notification
  async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const key = `notification:${notification.userId}:${newNotification.id}`;
    await db.set(key, newNotification);

    // Notify listeners
    const allNotifications = await this.getUserNotifications(notification.userId);
    this.notifyListeners(allNotifications);

    // Send browser notification if permitted
    this.sendBrowserNotification(newNotification);

    return newNotification;
  }

  // Mark notification as read
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const key = `notification:${userId}:${notificationId}`;
    const notification = await db.get(key);
    
    if (notification) {
      notification.read = true;
      await db.set(key, notification);
      
      const allNotifications = await this.getUserNotifications(userId);
      this.notifyListeners(allNotifications);
    }
  }

  // Mark all as read
  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.getUserNotifications(userId);
    const updates = notifications
      .filter(n => !n.read)
      .map(n => ({
        key: `notification:${userId}:${n.id}`,
        value: { ...n, read: true }
      }));

    if (updates.length > 0) {
      await db.batchSet(updates);
      const allNotifications = await this.getUserNotifications(userId);
      this.notifyListeners(allNotifications);
    }
  }

  // Delete notification
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const key = `notification:${userId}:${notificationId}`;
    await db.delete(key);
    
    const allNotifications = await this.getUserNotifications(userId);
    this.notifyListeners(allNotifications);
  }

  // Delete all notifications
  async deleteAllNotifications(userId: string): Promise<void> {
    const notifications = await this.getUserNotifications(userId);
    const keys = notifications.map(n => `notification:${userId}:${n.id}`);
    
    if (keys.length > 0) {
      await db.batchDelete(keys);
      this.notifyListeners([]);
    }
  }

  // Request browser notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  // Send browser notification
  private sendBrowserNotification(notification: Notification): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: notification.id,
        requireInteraction: false,
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => browserNotification.close(), 5000);
    } catch (error) {
      console.error('Error sending browser notification:', error);
    }
  }

  // Realtime subscription using Supabase
  subscribeToRealtimeNotifications(userId: string, callback: (notification: Notification) => void) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kv_store_45351b4f',
          filter: `key=like.notification:${userId}:%`
        },
        (payload) => {
          if (payload.new && 'value' in payload.new) {
            const notification = payload.new.value as Notification;
            callback(notification);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const notificationService = new NotificationService();
