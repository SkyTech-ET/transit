export interface INotification {
  id: number;
  type: 'system' | 'alert' | 'update' | 'message';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface INotificationPayload {
  type: 'system' | 'alert' | 'update' | 'message';
  title: string;
  message: string;
  userId?: number;
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface INotificationFilters {
  page?: number;
  pageSize?: number;
  type?: string;
  isRead?: boolean;
  searchTerm?: string;
}

export interface INotificationState {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  listLoading: boolean;
}

export interface INotificationActions {
  getNotifications: (filters?: INotificationFilters) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  createNotification: (payload: INotificationPayload) => Promise<void>;
  getUnreadCount: () => Promise<void>;
}

export type INotificationStore = INotificationState & INotificationActions;