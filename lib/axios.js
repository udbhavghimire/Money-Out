import axios from "axios";
import { getAuthHeader } from "./auth";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = getAuthHeader();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
