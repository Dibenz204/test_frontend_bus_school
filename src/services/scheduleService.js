import axios from "axios";
import API_BASE_URL from "../config/config.js";


// const getAllSchedules = async (inputId, filters = {}) => {
//     const params = { id_schedule: inputId };

//     // Thêm filters vào params nếu có
//     if (filters.id_driver) params.id_driver = filters.id_driver;
//     if (filters.date) params.date = filters.date;
//     if (filters.status) params.status = filters.status;

//     return axios.get(`${API_BASE_URL}/api/schedule/get-schedules`, { params });
// };

const getAllSchedules = async (inputId, filters = {}, sortBy = {}) => {
    const params = { id_schedule: inputId };

    // Thêm filters vào params nếu có
    if (filters.id_driver) params.id_driver = filters.id_driver;
    if (filters.id_route) params.id_route = filters.id_route;
    if (filters.date) params.date = filters.date;
    if (filters.status) params.status = filters.status;

    // Thêm sort options vào params nếu có
    if (sortBy.date) params.sort_date = sortBy.date;
    if (sortBy.time) params.sort_time = sortBy.time;
    if (sortBy.status) params.sort_status = sortBy.status;

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

const getSchedulesByDriver = async (idDriver) => {
    return axios.get(`${API_BASE_URL}/api/schedule/get-schedule-by-driver`, {
        params: { id_driver: idDriver }
    });
};

const getScheduleStatuses = async () => {
    return axios.get(`${API_BASE_URL}/api/schedule/get-statuses`);
};

export {
    getAllSchedules,
    getScheduleById,
    createNewSchedule,
    updateSchedule,
    deleteSchedule,
    updateStudentPickupStatus,
    getSchedulesByDriver,
    getScheduleStatuses
};