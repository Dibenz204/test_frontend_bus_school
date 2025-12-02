import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';

const NotificationPanel = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Lấy thông tin user từ localStorage
  const getUserInfo = () => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch (error) {
      console.error(t("notification_panel.get_user_info_error"), error);
      return null;
    }
  };

  useEffect(() => {
    const userInfo = getUserInfo();
    if (!userInfo || userInfo.role !== "Phụ huynh") {
      console.log(t("notification_panel.not_parent_or_not_logged_in"));
      return;
    }

    const SOCKET_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:5001'
      : 'https://be-bus-school.onrender.com';

    console.log(t("notification_panel.connecting_socket", { userId: userInfo.id_user }));

    const socket = io(`${SOCKET_URL}/gps`, {
      transports: ['websocket', 'polling']
    });

    // Socket events
    socket.on('connect', () => {
      console.log(t("notification_panel.socket_connected"));
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log(t("notification_panel.socket_disconnected"));
      setIsConnected(false);
    });

    // LẮNG NGHE THÔNG BÁO REAL-TIME CHO USER CỤ THỂ
    socket.on(`notification_user_${userInfo.id_user}`, (newNotification) => {
      console.log(t("notification_panel.new_notification_received"), newNotification);

      // Thêm thông báo mới vào đầu danh sách
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Hiển thị thông báo hệ thống
      showSystemNotification(newNotification);
    });

    // Lấy danh sách thông báo cũ từ API
    fetchNotifications(userInfo.id_user);

    // Yêu cầu quyền thông báo trình duyệt
    requestNotificationPermission();

    return () => {
      socket.disconnect();
    };
  }, [t]);

  // Lấy danh sách thông báo từ API
  const fetchNotifications = async (userId) => {
    try {
      const response = await fetch(`/api/notification/get-by-user?id_user=${userId}`);
      const data = await response.json();

      if (data.errCode === 0) {
        setNotifications(data.notifications);
        // Đếm số thông báo chưa đọc (có thể thêm logic đánh dấu đã đọc)
        setUnreadCount(data.notifications.filter(noti => !noti.read).length);
      }
    } catch (error) {
      console.error(t("notification_panel.fetch_notifications_error"), error);
    }
  };

  // Hiển thị thông báo hệ thống
  const showSystemNotification = (notification) => {
    // Thông báo trình duyệt
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(t("notification_panel.bus_notification"), {
        body: notification.message,
        icon: "/bus-icon.png",
        badge: "/bus-badge.png"
      });
    }

    // Thông báo trong app (toast)
    showToast(notification.message);
  };

  // Hiển thị toast notification
  const showToast = (message) => {
    // Tạo toast element
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    toast.innerHTML = `
            <div class="flex items-center">
                <span class="text-xl mr-2">🚌</span>
                <div>
                    <p class="font-semibold">${t("notification_panel.bus_notification")}</p>
                    <p class="text-sm">${message}</p>
                </div>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    ✕
                </button>
            </div>
        `;
    document.body.appendChild(toast);

    // Tự động xóa sau 5 giây
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  };

  // Yêu cầu quyền thông báo
  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log(t("notification_panel.notification_permission_granted"));
        }
      });
    }
  };

  // Đánh dấu đã đọc
  const markAsRead = async (notificationId) => {
    try {
      // Gọi API đánh dấu đã đọc (nếu có)
      // await fetch(`/api/notification/mark-read?id_notification=${notificationId}`, { method: 'PUT' });

      setNotifications(prev =>
        prev.map(noti =>
          noti.id_notification === notificationId
            ? { ...noti, read: true }
            : noti
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(t("notification_panel.mark_read_error"), error);
    }
  };

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(noti => ({ ...noti, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-800">{t("notification_panel.notifications")}</h2>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">
              {isConnected ? t("notification_panel.connected") : t("notification_panel.disconnected")}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount} {t("notification_panel.new")}
            </span>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {t("notification_panel.mark_all_as_read")}
            </button>
          )}
        </div>
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📭</div>
            <p>{t("notification_panel.no_notifications")}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id_notification}
              className={`border-l-4 p-4 rounded-r-lg transition-colors ${notification.read
                ? 'border-gray-300 bg-gray-50'
                : 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">
                    {notification.message}
                  </p>
                  <div className="flex items-center text-sm text-gray-600 mt-2 space-x-4">
                    <span className="flex items-center">
                      🕒 {new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="flex items-center">
                      📍 {notification.busstop?.name_station}
                    </span>
                    {notification.driver?.user && (
                      <span className="flex items-center">
                        👨‍✈️ {notification.driver.user.name}
                      </span>
                    )}
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id_notification)}
                    className="text-gray-400 hover:text-gray-600 ml-2 text-sm"
                    title={t("notification_panel.mark_as_read")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer - Enable notifications */}
      {"Notification" in window && Notification.permission === "default" && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 font-medium">{t("notification_panel.enable_notifications")}</p>
              <p className="text-yellow-600 text-sm">{t("notification_panel.enable_notifications_description")}</p>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {t("notification_panel.enable_now")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;


// import React, { useState, useEffect } from 'react';
// import { io } from 'socket.io-client';

// const NotificationPanel = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);

//   // Lấy thông tin user từ localStorage
//   const getUserInfo = () => {
//     try {
//       return JSON.parse(localStorage.getItem("userInfo"));
//     } catch (error) {
//       console.error("❌ Lỗi lấy thông tin user:", error);
//       return null;
//     }
//   };

//   useEffect(() => {
//     const userInfo = getUserInfo();
//     if (!userInfo || userInfo.role !== "Phụ huynh") {
//       console.log("❌ Không phải phụ huynh hoặc chưa đăng nhập");
//       return;
//     }

//     const SOCKET_URL = window.location.hostname === 'localhost'
//       ? 'http://localhost:5001'
//       : 'https://be-bus-school.onrender.com';

//     console.log(`🔌 Kết nối socket cho phụ huynh: ${userInfo.id_user}`);

//     const socket = io(`${SOCKET_URL}/gps`, {
//       transports: ['websocket', 'polling']
//     });

//     // Socket events
//     socket.on('connect', () => {
//       console.log('✅ Đã kết nối socket cho thông báo');
//       setIsConnected(true);
//     });

//     socket.on('disconnect', () => {
//       console.log('❌ Mất kết nối socket');
//       setIsConnected(false);
//     });

//     // LẮNG NGHE THÔNG BÁO REAL-TIME CHO USER CỤ THỂ
//     socket.on(`notification_user_${userInfo.id_user}`, (newNotification) => {
//       console.log('📨 Nhận thông báo mới:', newNotification);

//       // Thêm thông báo mới vào đầu danh sách
//       setNotifications(prev => [newNotification, ...prev]);
//       setUnreadCount(prev => prev + 1);

//       // Hiển thị thông báo hệ thống
//       showSystemNotification(newNotification);
//     });

//     // Lấy danh sách thông báo cũ từ API
//     fetchNotifications(userInfo.id_user);

//     // Yêu cầu quyền thông báo trình duyệt
//     requestNotificationPermission();

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   // Lấy danh sách thông báo từ API
//   const fetchNotifications = async (userId) => {
//     try {
//       const response = await fetch(`/api/notification/get-by-user?id_user=${userId}`);
//       const data = await response.json();

//       if (data.errCode === 0) {
//         setNotifications(data.notifications);
//         // Đếm số thông báo chưa đọc (có thể thêm logic đánh dấu đã đọc)
//         setUnreadCount(data.notifications.filter(noti => !noti.read).length);
//       }
//     } catch (error) {
//       console.error('❌ Lỗi lấy thông báo:', error);
//     }
//   };

//   // Hiển thị thông báo hệ thống
//   const showSystemNotification = (notification) => {
//     // Thông báo trình duyệt
//     if ("Notification" in window && Notification.permission === "granted") {
//       new Notification("🚌 Thông báo xe bus", {
//         body: notification.message,
//         icon: "/bus-icon.png",
//         badge: "/bus-badge.png"
//       });
//     }

//     // Thông báo trong app (toast)
//     showToast(notification.message);
//   };

//   // Hiển thị toast notification
//   const showToast = (message) => {
//     // Tạo toast element
//     const toast = document.createElement('div');
//     toast.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
//     toast.innerHTML = `
//             <div class="flex items-center">
//                 <span class="text-xl mr-2">🚌</span>
//                 <div>
//                     <p class="font-semibold">Thông báo xe bus</p>
//                     <p class="text-sm">${message}</p>
//                 </div>
//                 <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
//                     ✕
//                 </button>
//             </div>
//         `;
//     document.body.appendChild(toast);

//     // Tự động xóa sau 5 giây
//     setTimeout(() => {
//       if (toast.parentElement) {
//         toast.remove();
//       }
//     }, 5000);
//   };

//   // Yêu cầu quyền thông báo
//   const requestNotificationPermission = () => {
//     if ("Notification" in window && Notification.permission === "default") {
//       Notification.requestPermission().then(permission => {
//         if (permission === "granted") {
//           console.log("✅ Đã cấp quyền thông báo");
//         }
//       });
//     }
//   };

//   // Đánh dấu đã đọc
//   const markAsRead = async (notificationId) => {
//     try {
//       // Gọi API đánh dấu đã đọc (nếu có)
//       // await fetch(`/api/notification/mark-read?id_notification=${notificationId}`, { method: 'PUT' });

//       setNotifications(prev =>
//         prev.map(noti =>
//           noti.id_notification === notificationId
//             ? { ...noti, read: true }
//             : noti
//         )
//       );
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     } catch (error) {
//       console.error('❌ Lỗi đánh dấu đã đọc:', error);
//     }
//   };

//   // Đánh dấu tất cả đã đọc
//   const markAllAsRead = () => {
//     setNotifications(prev => prev.map(noti => ({ ...noti, read: true })));
//     setUnreadCount(0);
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <div className="flex items-center space-x-3">
//           <h2 className="text-xl font-bold text-gray-800">Thông báo</h2>
//           <div className="flex items-center space-x-2">
//             <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
//             <span className="text-sm text-gray-600">
//               {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
//             </span>
//           </div>
//         </div>
//         <div className="flex items-center space-x-2">
//           {unreadCount > 0 && (
//             <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
//               {unreadCount} mới
//             </span>
//           )}
//           {unreadCount > 0 && (
//             <button
//               onClick={markAllAsRead}
//               className="text-blue-600 hover:text-blue-800 text-sm"
//             >
//               Đánh dấu tất cả đã đọc
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Danh sách thông báo */}
//       <div className="space-y-3 max-h-96 overflow-y-auto">
//         {notifications.length === 0 ? (
//           <div className="text-center text-gray-500 py-8">
//             <div className="text-4xl mb-2">📭</div>
//             <p>Chưa có thông báo nào</p>
//           </div>
//         ) : (
//           notifications.map((notification) => (
//             <div
//               key={notification.id_notification}
//               className={`border-l-4 p-4 rounded-r-lg transition-colors ${notification.read
//                   ? 'border-gray-300 bg-gray-50'
//                   : 'border-blue-500 bg-blue-50 hover:bg-blue-100'
//                 }`}
//             >
//               <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                   <p className="text-gray-800 font-medium">
//                     {notification.message}
//                   </p>
//                   <div className="flex items-center text-sm text-gray-600 mt-2 space-x-4">
//                     <span className="flex items-center">
//                       🕒 {new Date(notification.createdAt).toLocaleTimeString()}
//                     </span>
//                     <span className="flex items-center">
//                       📍 {notification.busstop?.name_station}
//                     </span>
//                     {notification.driver?.user && (
//                       <span className="flex items-center">
//                         👨‍✈️ {notification.driver.user.name}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 {!notification.read && (
//                   <button
//                     onClick={() => markAsRead(notification.id_notification)}
//                     className="text-gray-400 hover:text-gray-600 ml-2 text-sm"
//                     title="Đánh dấu đã đọc"
//                   >
//                     ✕
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Footer - Enable notifications */}
//       {"Notification" in window && Notification.permission === "default" && (
//         <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-yellow-800 font-medium">Bật thông báo</p>
//               <p className="text-yellow-600 text-sm">Nhận thông báo khi xe bus đến gần</p>
//             </div>
//             <button
//               onClick={requestNotificationPermission}
//               className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
//             >
//               Bật ngay
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationPanel;