import axios from "axios";
import API_BASE_URL from "../config/config.js";

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

export {
    getAllNotification,
    createNewNotification,
    deleteNotification,
    getNotificationById,
    getNotificationsByUser,
    getNotificationsForAdmin
};