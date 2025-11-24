import http from '@/modules/utils/axios';
import { INotification, INotificationPayload, INotificationFilters } from './notification.types';

const notificationEndpoints = Object.freeze({
  getAll: '/Notification/GetAll',
  getUnreadCount: '/Notification/GetUnreadCount',
  markAsRead: '/Notification/MarkAsRead',
  markAllAsRead: '/Notification/MarkAllAsRead',
  delete: '/Notification/Delete',
  create: '/Notification/Create',
});

export const getAllNotifications = (filters?: INotificationFilters): Promise<Response> => {
  return http.get({ 
    url: notificationEndpoints.getAll, 
    params: filters 
  });
};

export const getUnreadCount = (): Promise<Response> => {
  return http.get({ 
    url: notificationEndpoints.getUnreadCount 
  });
};

export const markNotificationAsRead = (id: number): Promise<Response> => {
  return http.put({ 
    url: `${notificationEndpoints.markAsRead}/${id}` 
  });
};

export const markAllNotificationsAsRead = (): Promise<Response> => {
  return http.put({ 
    url: notificationEndpoints.markAllAsRead 
  });
};

export const deleteNotification = (id: number): Promise<Response> => {
  return http.delete({ 
    url: `${notificationEndpoints.delete}/${id}` 
  });
};

export const createNotification = (payload: INotificationPayload): Promise<Response> => {
  return http.post({ 
    url: notificationEndpoints.create, 
    data: payload 
  });
};