import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // IMPORTANT for cookie auth
});

// API.interceptors.response.use(
//     response => response,
//     error => {
//         if (error.response?.status === 401) {
//             // Do NOT scream in console
//             return Promise.reject(error);
//         }

//         return Promise.reject(error);
//     }
// );

export default API;
