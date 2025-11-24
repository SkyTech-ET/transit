import { create } from 'zustand';
import { INotificationStore, INotification, INotificationPayload, INotificationFilters } from './notification.types';
import * as notificationEndpoints from './notification.endpoints';
import { message } from 'antd';

export const useNotificationStore = create<INotificationStore>((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  listLoading: false,

  // Actions
  getNotifications: async (filters?: INotificationFilters) => {
    set({ listLoading: true, error: null });
    try {
      const response = await notificationEndpoints.getAllNotifications(filters);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch notifications');
      }

      const notifications = data.response?.data?.data || data.response?.data || [];
      set({ notifications, listLoading: false });
    } catch (error: any) {
      set({ error: error.message, listLoading: false });
      message.error(error.message || 'Failed to fetch notifications');
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await notificationEndpoints.getUnreadCount();
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch unread count');
      }

      const unreadCount = data.response?.data || 0;
      set({ unreadCount });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Failed to fetch unread count:', error.message);
    }
  },

  markAsRead: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await notificationEndpoints.markNotificationAsRead(id);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to mark notification as read');
      }

      // Update local state
      set(state => ({
        notifications: state.notifications.map(notification =>
          notification.id === id ? { ...notification, isRead: true } : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        loading: false,
      }));
      
      message.success('Notification marked as read');
    } catch (error: any) {
      set({ error: error.message, loading: false });
      message.error(error.message || 'Failed to mark notification as read');
    }
  },

  markAllAsRead: async () => {
    set({ loading: true, error: null });
    try {
      const response = await notificationEndpoints.markAllNotificationsAsRead();
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to mark all notifications as read');
      }

      // Update local state
      set(state => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0,
        loading: false,
      }));
      
      message.success('All notifications marked as read');
    } catch (error: any) {
      set({ error: error.message, loading: false });
      message.error(error.message || 'Failed to mark all notifications as read');
    }
  },

  deleteNotification: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await notificationEndpoints.deleteNotification(id);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to delete notification');
      }

      // Update local state
      set(state => {
        const notificationToDelete = state.notifications.find(n => n.id === id);
        return {
          notifications: state.notifications.filter(notification => notification.id !== id),
          unreadCount: notificationToDelete && !notificationToDelete.isRead 
            ? Math.max(0, state.unreadCount - 1) 
            : state.unreadCount,
          loading: false,
        };
      });
      
      message.success('Notification deleted successfully');
    } catch (error: any) {
      set({ error: error.message, loading: false });
      message.error(error.message || 'Failed to delete notification');
    }
  },

  createNotification: async (payload: INotificationPayload) => {
    set({ loading: true, error: null });
    try {
      const response = await notificationEndpoints.createNotification(payload);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to create notification');
      }

      const newNotification = data.response?.data as INotification;
      set(state => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        loading: false,
      }));
      
      message.success('Notification created successfully');
    } catch (error: any) {
      set({ error: error.message, loading: false });
      message.error(error.message || 'Failed to create notification');
    }
  },
}));