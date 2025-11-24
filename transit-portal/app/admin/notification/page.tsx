'use client';

import React, { useEffect, useState } from 'react';
import { Card, List, Button, Space, Tag, Dropdown, Badge, Typography } from 'antd';
import { 
  BellOutlined, 
  CheckCircleOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { useNotificationStore } from '@/modules/notification';
import type { INotification } from '@/modules/notification';
//import { formatDistanceToNow } from 'date-fns';

const { Title, Text } = Typography;

const NotificationPage: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationStore();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    getNotifications();
  }, []);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const getTypeColor = (type: string) => {
    const colors = {
      system: 'blue',
      alert: 'red',
      update: 'green',
      message: 'purple'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      system: <SettingOutlined />,
      alert: <BellOutlined />,
      update: <CheckCircleOutlined />,
      message: <BellOutlined />
    };
    return icons[type as keyof typeof icons] || <BellOutlined />;
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      // Error handled in store
    }
  };

  const menuItems = (notification: INotification) => [
    {
      key: 'mark-read',
      label: 'Mark as Read',
      onClick: () => handleMarkAsRead(notification.id),
      disabled: notification.isRead,
    },
    {
      key: 'delete',
      label: 'Delete',
      onClick: () => handleDelete(notification.id),
      danger: true,
    },
  ];

  return (
    <div className="p-6">
      <Card>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2} className="!mb-1">
              Notifications
            </Title>
            <Text type="secondary">
              {unreadCount > 0 
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'
              }
            </Text>
          </div>
          
          <Space>
            <Button
              type={filter === 'all' ? 'primary' : 'default'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Badge count={unreadCount} offset={[10, -5]}>
              <Button
                type={filter === 'unread' ? 'primary' : 'default'}
                onClick={() => setFilter('unread')}
              >
                Unread
              </Button>
            </Badge>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead}>
                Mark All as Read
              </Button>
            )}
          </Space>
        </div>

        {/* Notifications List */}
        <List
          loading={loading}
          dataSource={filteredNotifications}
          renderItem={(notification) => (
            <List.Item
              className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
              actions={[
                <Dropdown 
                  menu={{ items: menuItems(notification) }} 
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={!notification.isRead}>
                    <Tag 
                      icon={getTypeIcon(notification.type)} 
                      color={getTypeColor(notification.type)}
                      className="!m-0"
                    >
                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                    </Tag>
                  </Badge>
                }
                title={
                  <div className="flex items-center justify-between">
                    <Text strong className={!notification.isRead ? 'text-blue-600' : ''}>
                      {notification.title}
                    </Text>
                    {/* <Text type="secondary" className="text-sm">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </Text> */}
                  </div>
                }
                description={
                  <div>
                    <Text className="block mb-2">{notification.message}</Text>
                    {!notification.isRead && (
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="!p-0 !h-auto"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: 'No notifications found'
          }}
        />
      </Card>
    </div>
  );
};

export default NotificationPage;