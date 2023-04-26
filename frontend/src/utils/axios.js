import axios from "axios";
import { URL } from "../config";

const axiosInstance = axios.create();
axiosInstance.defaults.baseURL = URL;
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || "Something went wrong!"
    )
);

export default axiosInstance;
