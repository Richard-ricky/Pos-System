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
  data?: Record<string, unknown>;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
// db.getByPrefix may return raw stored values OR { key, value } pairs depending
// on the DB adapter. This normaliser handles both shapes safely.
function extractNotifications(raw: unknown[]): Notification[] {
  return raw
    .map((item) => {
      if (item && typeof item === 'object') {
        // { key, value } shape
        if ('value' in item && item.value && typeof item.value === 'object') {
          return item.value as Notification;
        }
        // Direct stored value shape
        if ('id' in item && 'userId' in item) {
          return item as Notification;
        }
      }
      return null;
    })
    .filter((n): n is Notification => n !== null);
}

// ─── Service ──────────────────────────────────────────────────────────────────

class NotificationService {
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(notifications: Notification[]) {
    this.listeners.forEach((cb) => cb(notifications));
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const raw = await db.getByPrefix(`notification:${userId}:`);
      return extractNotifications(raw)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getUserNotifications(userId);
    return notifications.filter((n) => !n.read).length;
  }

  async createNotification(
    notification: Omit<Notification, 'id' | 'timestamp'>,
  ): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const key = `notification:${notification.userId}:${newNotification.id}`;
    await db.set(key, newNotification);

    const allNotifications = await this.getUserNotifications(notification.userId);
    this.notifyListeners(allNotifications);
    this.sendBrowserNotification(newNotification);

    return newNotification;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const key = `notification:${userId}:${notificationId}`;
    const raw = await db.get(key);

    // Normalise whatever the DB returns
    const notification = raw && typeof raw === 'object'
      ? ('value' in raw ? (raw.value as Notification) : (raw as Notification))
      : null;

    if (!notification) return;

    await db.set(key, { ...notification, read: true });

    const allNotifications = await this.getUserNotifications(userId);
    this.notifyListeners(allNotifications);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.getUserNotifications(userId);
    const updates = notifications
      .filter((n) => !n.read)
      .map((n) => ({
        key: `notification:${userId}:${n.id}`,
        value: { ...n, read: true },
      }));

    if (updates.length > 0) {
      await db.batchSet(updates);
      const allNotifications = await this.getUserNotifications(userId);
      this.notifyListeners(allNotifications);
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const key = `notification:${userId}:${notificationId}`;
    await db.delete(key);

    const allNotifications = await this.getUserNotifications(userId);
    this.notifyListeners(allNotifications);
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    const notifications = await this.getUserNotifications(userId);
    const keys = notifications.map((n) => `notification:${userId}:${n.id}`);

    if (keys.length > 0) {
      await db.batchDelete(keys);
      this.notifyListeners([]);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission !== 'denied') {
      return Notification.requestPermission();
    }
    return Notification.permission;
  }

  private sendBrowserNotification(notification: Notification): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      const n = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: notification.id,
        requireInteraction: false,
      });
      n.onclick = () => { window.focus(); n.close(); };
      setTimeout(() => n.close(), 5000);
    } catch (error) {
      console.error('Error sending browser notification:', error);
    }
  }

  /**
   * Subscribe to realtime notifications via Supabase.
   * Returns an unsubscribe function — MUST be called in useEffect cleanup:
   *
   *   useEffect(() => {
   *     const unsub = notificationService.subscribeToRealtimeNotifications(userId, cb);
   *     return unsub;   // ← cleanup on unmount
   *   }, [userId]);
   */
  subscribeToRealtimeNotifications(
    userId: string,
    callback: (notification: Notification) => void,
  ) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kv_store_45351b4f',
          filter: `key=like.notification:${userId}:%`,
        },
        (payload) => {
          if (payload.new && 'value' in payload.new) {
            const notification = payload.new.value as Notification;
            callback(notification);
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }
}

export const notificationService = new NotificationService();