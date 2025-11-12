import axios from "axios";
import API_BASE_URL from "../config/config.js";

// const getAllSchedules = async (inputId) => {
//     return axios.get(`${API_BASE_URL}/api/schedule/get-schedules`, {
//         params: { id_schedule: inputId },
//     });
// };

const getAllSchedules = async (inputId, filters = {}) => {
    const params = { id_schedule: inputId };

    // Thêm filters vào params nếu có
    if (filters.id_driver) params.id_driver = filters.id_driver;
    if (filters.date) params.date = filters.date;
    if (filters.status) params.status = filters.status;

    return axios.get(`${API_BASE_URL}/api/schedule/get-schedules`, { params });
};

const getScheduleById = async (scheduleId) => {
    return axios.get(`${API_BASE_URL}/api/schedule/get-schedule`, {
        params: { id_schedule: scheduleId },
    });
};

const createNewSchedule = async (scheduleData) => {
    return axios.post(`${API_BASE_URL}/api/schedule/create-schedule`, scheduleData);
};

const updateSchedule = async (scheduleData) => {
    return axios.put(`${API_BASE_URL}/api/schedule/update-schedule`, scheduleData);
};

const deleteSchedule = async (scheduleId) => {
    return axios.delete(`${API_BASE_URL}/api/schedule/delete-schedule`, {
        params: { id_schedule: scheduleId },
    });
};

// Thêm hàm mới
const updateStudentPickupStatus = async (scheduleId, studentId, status) => {
    return axios.put(`${API_BASE_URL}/api/schedule/update-student-status`, {
        id_schedule: scheduleId,
        id_student: studentId,
        status: status
    });
};

export {
    getAllSchedules,
    getScheduleById,
    createNewSchedule,
    updateSchedule,
    deleteSchedule,
    updateStudentPickupStatus
};