import axios from "axios";
import API_BASE_URL from "../config/config.js";

const getAllBuses = async (inputId, filters = {}) => {
    const params = { id_bus: inputId };

    // Thêm filters vào params nếu có
    // if (filters.id_driver) params.id_driver = filters.id_driver;
    // if (filters.id_route) params.id_route = filters.id_route;

    return axios.get(`${API_BASE_URL}/api/bus/get-buses`, { params });
};

const getBusById = async (busId) => {
    return axios.get(`${API_BASE_URL}/api/bus/get-bus`, {
        params: { id_bus: busId },
    });
};

const createNewBus = async (busData) => {
    return axios.post(`${API_BASE_URL}/api/bus/create-bus`, busData);
};

const updateBus = async (busData) => {
    return axios.put(`${API_BASE_URL}/api/bus/update-bus`, busData);
};

const deleteBus = async (busId) => {
    return axios.delete(`${API_BASE_URL}/api/bus/delete-bus`, {
        params: { id_bus: busId },
    });
};

const getRoutes = async () => {
    return axios.get(`${API_BASE_URL}/api/bus/get-routes`);
};

const getDrivers = async () => {
    return axios.get(`${API_BASE_URL}/api/bus/get-drivers`);
};

export {
    getAllBuses,
    getBusById,
    createNewBus,
    updateBus,
    deleteBus,
    getRoutes,
    getDrivers
};