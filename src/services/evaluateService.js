import axios from "axios";
import API_BASE_URL from "../config/config.js";

const getAllEvaluates = async (inputId, filters = {}) => {
    const params = { id_evaluate: inputId };

    // Thêm filters vào params nếu có
    if (filters.id_user) params.id_user = filters.id_user;
    if (filters.id_schedule) params.id_schedule = filters.id_schedule;
    if (filters.star) params.star = filters.star;

    return axios.get(`${API_BASE_URL}/api/evaluate/get-evaluates`, { params });
};

const getEvaluateById = async (evaluateId) => {
    return axios.get(`${API_BASE_URL}/api/evaluate/get-evaluate`, {
        params: { id_evaluate: evaluateId },
    });
};

const getEvaluatesByParent = async (parentId) => {
    return axios.get(`${API_BASE_URL}/api/evaluate/get-evaluates-by-parent`, {
        params: { id_user: parentId },
    });
};

const createNewEvaluate = async (evaluateData) => {
    return axios.post(`${API_BASE_URL}/api/evaluate/create-evaluate`, evaluateData);
};

const updateEvaluate = async (evaluateData) => {
    return axios.put(`${API_BASE_URL}/api/evaluate/update-evaluate`, evaluateData);
};

const deleteEvaluate = async (evaluateId) => {
    return axios.delete(`${API_BASE_URL}/api/evaluate/delete-evaluate`, {
        params: { id_evaluate: evaluateId },
    });
};

export {
    getAllEvaluates,
    getEvaluateById,
    getEvaluatesByParent,
    createNewEvaluate,
    updateEvaluate,
    deleteEvaluate
};