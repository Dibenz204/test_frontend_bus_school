import axios from "axios";
import API_BASE_URL from "../config/config.js";

const getAllUsers = async (inputId) => {
    // Query param phải nằm trong "params"
    return axios.get(`${API_BASE_URL}/user/api/read_user`, {
        params: { id_user: inputId },
    });

    // return axios.get(`http://localhost:5000/user/api/read_user?id=${inputId}`);
};

const getUserCountByRole = async () => {
    return axios.get(`${API_BASE_URL}/user/api/user-count-by-role`);
};


const getUserByRole = async (inputRole) => {
    return axios.get(`${API_BASE_URL}/user/api/users-by-role`, {
        params: { role: inputRole },
    });
}

const createNewUser = async (userData) => {
    return axios.post(`${API_BASE_URL}/user/api/create-new-user`, userData);
};

const deleteUser = async (userId) => {
    return axios.delete(`${API_BASE_URL}/user/api/delete-user`, {
        params: { id_user: userId },
    });
}


const updateUser = async (userData) => {
    return axios.put(`${API_BASE_URL}/user/api/update-user`, userData);
};

//update function for login
const loginUser = async (email, password) => {
    return axios.post(`${API_BASE_URL}/user/api/login`, {
        email,
        password
    });
};

export { getAllUsers, getUserCountByRole, getUserByRole, createNewUser, deleteUser, updateUser, loginUser };
