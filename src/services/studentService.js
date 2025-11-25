import axios from "axios";
import API_BASE_URL from "../config/config.js";

const getAllStudent = async (inputId) => {
    // Query param phải nằm trong "params"
    return axios.get(`${API_BASE_URL}/api/student/read_student`, {
        params: { id_student: inputId },
    });
};

const getStudentById = async (inputId) => {
    return axios.get(`${API_BASE_URL}/api/student/get-student-by-id`, {
        params: { id_student: inputId },
    });
};

const createNewStudent = async (studentData) => {
    return axios.post(`${API_BASE_URL}/api/student/create-new-student`, studentData);
};

const deleteStudent = async (studentId) => {
    return axios.delete(`${API_BASE_URL}/api/student/delete-student`, {
        params: { id_user: studentId },
    });
}


const updateStudent = async (studentData) => {
    return axios.put(`${API_BASE_URL}/api/student/update-student`, studentData);
};

const getStudentsByParent = async (parentId) => {
    return axios.get(`${API_BASE_URL}/api/student/get-by-parent`, {
        params: { id_user: parentId }
    });
};


export { getAllStudent, createNewStudent, deleteStudent, updateStudent, getStudentsByParent };
