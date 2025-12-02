import axios from "axios";
import API_BASE_URL from "../config/config.js";

// =========== CRUD APIs ===========
const getAllNotification = async (inputId) => {
    return axios.get(`${API_BASE_URL}/api/notification/read_notification`, {
        params: { id_notification: inputId },
    });
};

const getNotificationById = async (inputId) => {
    return axios.get(`${API_BASE_URL}/api/notification/get-notification-by-id`, {
        params: { id_notification: inputId },
    });
};

const createNewNotification = async (notificationData) => {
    return axios.post(`${API_BASE_URL}/api/notification/create-new-notification`, notificationData);
};

const deleteNotification = async (notificationId) => {
    return axios.delete(`${API_BASE_URL}/api/notification/delete-notification`, {
        params: { id_notification: notificationId },
    });
};

const getNotificationsByUser = async (userId) => {
    return axios.get(`${API_BASE_URL}/api/notification/get-by-user`, {
        params: { id_user: userId }
    });
};

const getNotificationsForAdmin = async () => {
    return axios.get(`${API_BASE_URL}/api/notification/get-for-admin`);
};

// =========== NEW APIs ===========
// Admin: Gửi thông báo theo role/user
const sendNotificationByAdmin = async (data) => {
    return axios.post(`${API_BASE_URL}/api/notification/send-by-admin`, data);
};

// Driver: Gửi thông báo sự cố
const sendIncidentNotification = async (id_driver, id_schedule, message) => {
    return axios.post(`${API_BASE_URL}/api/notification/send-incident`, {
        id_driver,
        id_schedule,
        message
    });
};

// Lấy users theo role (cho admin select)
const getUsersByRole = async (role) => {
    return axios.get(`${API_BASE_URL}/api/notification/get-users-by-role`, {
        params: { role }
    });
};

// Lấy tất cả users (cho admin select)
const getAllUsers = async () => {
    return axios.get(`${API_BASE_URL}/api/notification/get-all-users`);
};

// Đánh dấu thông báo đã đọc
const markAsRead = async (notificationId, userId) => {
    return axios.put(`${API_BASE_URL}/api/notification/mark-as-read`, {
        notificationId,
        userId
    });
};

// Lấy thống kê thông báo
const getNotificationStats = async () => {
    return axios.get(`${API_BASE_URL}/api/notification/stats`);
};

export {
    // CRUD functions
    getAllNotification,
    createNewNotification,
    deleteNotification,
    getNotificationById,
    getNotificationsByUser,
    getNotificationsForAdmin,

    // New functions
    sendNotificationByAdmin,
    sendIncidentNotification,
    getUsersByRole,
    getAllUsers,
    markAsRead,
    getNotificationStats
};


// import axios from "axios";
// import API_BASE_URL from "../config/config.js";

// const getAllNotification = async (inputId) => {
//     return axios.get(`${API_BASE_URL}/api/notification/read_notification`, {
//         params: { id_notification: inputId },
//     });
// };

// const getNotificationById = async (inputId) => {
//     return axios.get(`${API_BASE_URL}/api/notification/get-notification-by-id`, {
//         params: { id_notification: inputId },
//     });
// };

// const createNewNotification = async (notificationData) => {
//     return axios.post(`${API_BASE_URL}/api/notification/create-new-notification`, notificationData);
// };

// const deleteNotification = async (notificationId) => {
//     return axios.delete(`${API_BASE_URL}/api/notification/delete-notification`, {
//         params: { id_notification: notificationId },
//     });
// };

// const getNotificationsByUser = async (userId) => {
//     return axios.get(`${API_BASE_URL}/api/notification/get-by-user`, {
//         params: { id_user: userId }
//     });
// };

// const getNotificationsForAdmin = async () => {
//     return axios.get(`${API_BASE_URL}/api/notification/get-for-admin`);
// };

// export {
//     getAllNotification,
//     createNewNotification,
//     deleteNotification,
//     getNotificationById,
//     getNotificationsByUser,
//     getNotificationsForAdmin
// };