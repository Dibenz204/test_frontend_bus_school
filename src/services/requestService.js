import axios from "axios";
import API_BASE_URL from "../config/config.js";

const getAllRequests = async (inputId, filters = {}) => {
    const params = { id_request: inputId };

    // Thêm filters vào params nếu có
    if (filters.id_user) params.id_user = filters.id_user;
    if (filters.request_type) params.request_type = filters.request_type;

    return axios.get(`${API_BASE_URL}/api/request/get-requests`, { params });
};

const getRequestById = async (requestId) => {
    return axios.get(`${API_BASE_URL}/api/request/get-request`, {
        params: { id_request: requestId },
    });
};

const getRequestsByParent = async (parentId) => {
    return axios.get(`${API_BASE_URL}/api/request/get-requests-by-parent`, {
        params: { id_user: parentId },
    });
};

const createNewRequest = async (requestData) => {
    return axios.post(`${API_BASE_URL}/api/request/create-request`, requestData);
};

const updateRequest = async (requestData) => {
    return axios.put(`${API_BASE_URL}/api/request/update-request`, requestData);
};

const deleteRequest = async (requestId) => {
    return axios.delete(`${API_BASE_URL}/api/request/delete-request`, {
        params: { id_request: requestId },
    });
};

export {
    getAllRequests,
    getRequestById,
    getRequestsByParent,
    createNewRequest,
    updateRequest,
    deleteRequest
};