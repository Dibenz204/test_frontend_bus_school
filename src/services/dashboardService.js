import axios from "axios";
import API_BASE_URL from "../config/config.js";

// Lấy tổng số học sinh
const getTotalStudents = async () => {
    return axios.get(`${API_BASE_URL}/api/dashboard/total-students`);
};

// Lấy tổng số người dùng
const getTotalUsers = async () => {
    return axios.get(`${API_BASE_URL}/api/dashboard/total-users`);
};

// Lấy tổng số trạm xe buýt
const getTotalBusStops = async () => {
    return axios.get(`${API_BASE_URL}/api/dashboard/total-busstops`);
};

// Lấy tổng số tuyến đường
const getTotalRoutes = async () => {
    return axios.get(`${API_BASE_URL}/api/dashboard/total-routes`);
};

// Lấy thống kê người dùng theo role (cho PieChart)
const getUserStatsByRole = async () => {
    return axios.get(`${API_BASE_URL}/api/dashboard/user-stats-by-role`);
};

// Lấy thống kê học sinh theo tháng (cho LineChart)
const getStudentsByMonth = async (year) => {
    return axios.get(`${API_BASE_URL}/api/dashboard/students-by-month`, {
        params: { year }
    });
};

// Lấy danh sách các năm có dữ liệu
const getAvailableYears = async () => {
    return axios.get(`${API_BASE_URL}/api/dashboard/available-years`);
};

// Lấy thống kê học sinh theo tuyến đường (cho BarChart)
const getStudentsByRoute = async () => {
    return axios.get(`${API_BASE_URL}/api/dashboard/students-by-route`);
};

// Lấy tất cả thống kê dashboard một lần (recommended)
const getAllDashboardStats = async () => {
    return axios.get(`${API_BASE_URL}/api/dashboard/all-stats`);
};

export { 
    getTotalStudents,
    getTotalUsers,
    getTotalBusStops,
    getTotalRoutes,
    getUserStatsByRole,
    getStudentsByMonth,
    getAvailableYears,
    getStudentsByRoute,
    getAllDashboardStats
};