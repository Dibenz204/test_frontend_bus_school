import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getNotificationsByUser, markAsRead } from '../../services/notificationService';

const DriverNotificationPanel = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Lấy thông tin driver từ localStorage
  const getDriverInfo = () => {
    try {
      const driverInfo = JSON.parse(localStorage.getItem("userInfo"));
      console.log("🔍 Driver info từ localStorage:", driverInfo);
      return driverInfo;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin driver:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Lấy danh sách thông báo từ API
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const driverInfo = getDriverInfo();

      if (!driverInfo) {
        setError(t('driver_notifications.login_required'));
        setIsLoading(false);
        return;
      }

      if (driverInfo.role !== "Tài xế") {
        setError(t('driver_notifications.driver_only'));
        setIsLoading(false);
        return;
      }

      console.log("📋 Lấy thông báo cho driver ID:", driverInfo.id_user);

      const response = await getNotificationsByUser(driverInfo.id_user);

      if (response.data.errCode === 0 && response.data.notifications) {
        // Sắp xếp thông báo mới nhất lên đầu
        const sortedNotifications = response.data.notifications
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(noti => ({
            ...noti,
            id: noti.id_notification || noti.id,
            read: noti.read || false
          }));

        setNotifications(sortedNotifications);

        // Đếm số thông báo chưa đọc
        const unread = sortedNotifications.filter(noti => !noti.read).length;
        setUnreadCount(unread);
      } else {
        setError(response.data.message || t('driver_notifications.no_notifications'));
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông báo:", error);
      setError(t('driver_notifications.load_error'));

      // Dữ liệu mẫu để test khi API chưa sẵn sàng
      const mockNotifications = [
        {
          id: 1,
          id_notification: 1,
          message: t('driver_notifications.mock.messages.schedule_change'),
          read: false,
          createdAt: new Date().toISOString(),
          notification_type: "Lịch trình",
          user: { name: t('driver_notifications.mock.senders.admin') }
        },
        {
          id: 2,
          id_notification: 2,
          message: t('driver_notifications.mock.messages.new_schedule'),
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          notification_type: "Lịch trình",
          user: { name: t('driver_notifications.mock.senders.admin') }
        },
        {
          id: 3,
          id_notification: 3,
          message: t('driver_notifications.mock.messages.important_notice'),
          read: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          notification_type: "Sự cố",
          user: { name: t('driver_notifications.mock.senders.parent') }
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(2);
    } finally {
      setIsLoading(false);
    }
  };

  // Đánh dấu đã đọc
  const handleMarkAsRead = async (notificationId) => {
    try {
      const driverInfo = getDriverInfo();

      if (driverInfo) {
        // Gọi API đánh dấu đã đọc
        await markAsRead(notificationId, driverInfo.id_user);
      }

      // Cập nhật UI
      setNotifications(prev =>
        prev.map(noti =>
          noti.id === notificationId || noti.id_notification === notificationId
            ? { ...noti, read: true }
            : noti
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(noti => ({ ...noti, read: true })));
    setUnreadCount(0);
  };

  // Định dạng thời gian
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--:--';
    }
  };

  // Định dạng ngày
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '--/--/----';
    }
  };

  // Lấy icon theo loại thông báo
  const getNotificationIcon = (type) => {
    const iconMap = {
      'Trạm': '📍',
      'Lịch trình': '🕒',
      'Sự cố': '⚠️',
      'Khác': '📢'
    };
    return iconMap[type] || '📌';
  };

  // Lấy màu border theo loại thông báo
  const getBorderColor = (type, read) => {
    if (read) return 'border-gray-300';

    const colorMap = {
      'Trạm': 'border-purple-500',
      'Lịch trình': 'border-green-500',
      'Sự cố': 'border-red-500',
      'Khác': 'border-blue-500'
    };
    return colorMap[type] || 'border-orange-500';
  };

  // Lấy màu background theo trạng thái đọc/chưa đọc
  const getBackgroundColor = (read) => {
    return read ? 'bg-gray-50' : 'bg-blue-50';
  };

  // Lấy tên loại thông báo dịch
  const getTranslatedType = (type) => {
    const typeMap = {
      'Trạm': t('driver_notifications.types.bus_stop'),
      'Lịch trình': t('driver_notifications.types.schedule'),
      'Sự cố': t('driver_notifications.types.incident'),
      'Khác': t('driver_notifications.types.other')
    };
    return typeMap[type] || type;
  };

  if (error && notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchNotifications}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t('driver_notifications.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-800">
            {t('driver_notifications.title')}
          </h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
              {unreadCount} {t('driver_notifications.new')}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {t('driver_notifications.mark_all_read')}
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            title={t('driver_notifications.refresh')}
          >
            🔄
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 mt-2">
            {t('driver_notifications.loading')}
          </p>
        </div>
      )}

      {/* Danh sách thông báo */}
      {!isLoading && (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-700">
                {t('driver_notifications.empty')}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {t('driver_notifications.empty_subtitle')}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id || notification.id_notification}
                className={`border-l-4 p-4 rounded-r-lg transition-all duration-200 cursor-pointer hover:shadow-sm ${getBorderColor(notification.notification_type, notification.read)} ${getBackgroundColor(notification.read)}`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id || notification.id_notification)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start mb-2">
                      <span className="text-xl mr-3 mt-1">
                        {getNotificationIcon(notification.notification_type)}
                      </span>
                      <div className="flex-1">
                        <p className={`text-gray-800 ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.message}
                        </p>
                        <div className="flex flex-wrap items-center mt-2 gap-3">
                          <span className="text-xs text-gray-600">
                            🕒 {formatTime(notification.createdAt)} - {formatDate(notification.createdAt)}
                          </span>
                          {notification.user && (
                            <span className="text-xs text-gray-600">
                              👤 {notification.user.name}
                            </span>
                          )}
                          {notification.notification_type && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              {getTranslatedType(notification.notification_type)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id || notification.id_notification);
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                      title={t('driver_notifications.mark_as_read')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tổng số thông báo */}
      {notifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            {t('driver_notifications.showing_count', { count: notifications.length })}
          </p>
        </div>
      )}
    </div>
  );
};

export default DriverNotificationPanel;