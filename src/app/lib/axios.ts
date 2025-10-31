import axios from "axios";

const axiosInstance = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosInstance;


