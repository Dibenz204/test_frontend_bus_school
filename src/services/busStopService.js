import axios from "axios";
import API_BASE_URL from "../config/config.js";

const createBusStop = async (data) => {
    return axios.post(`${API_BASE_URL}/api/bus-stop/create-bus-stop`, data);
};

const getAllBusStops = async (visibleFilter) => {
    // Thêm query param visible
    const params = visibleFilter ? { visible: visibleFilter } : {};
    return axios.get(`${API_BASE_URL}/api/bus-stop/get-all-bus-stops`, { params });
};

const deleteBusStop = async (id) => {
    return axios.delete(`${API_BASE_URL}/api/bus-stop/delete-bus-stop/${id}`);
};

export { createBusStop, getAllBusStops, deleteBusStop };