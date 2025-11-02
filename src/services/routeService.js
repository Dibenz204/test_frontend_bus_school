import axios from "axios";
import API_BASE_URL from "../config/config.js";

const getAllRoutes = async (inputId) => {
    return axios.get(`${API_BASE_URL}/api/route/read_route`, {
        params: { id_route: inputId },
    });
};

const createNewRoute = async (routeData) => {
    return axios.post(`${API_BASE_URL}/api/route/create-new-route`, routeData);
};

const deleteRoute = async (routeId) => {
    return axios.delete(`${API_BASE_URL}/api/route/delete-route`, {
        params: { id_route: routeId },
    });
};

const updateRoute = async (routeData) => {
    return axios.put(`${API_BASE_URL}/api/route/update-route`, routeData);
};

const getBusStopsByRoute = async (routeId) => {
    return axios.get(`${API_BASE_URL}/api/route/get-busstops-by-route`, {
        params: { id_route: routeId },
    });
};

const saveRouteBusStops = async (routeId, busStops) => {
    return axios.post(`${API_BASE_URL}/api/route/save-route-busstops`, {
        id_route: routeId,
        busStops: busStops
    });
};

export { getAllRoutes, createNewRoute, deleteRoute, updateRoute, getBusStopsByRoute, saveRouteBusStops };
