"use client";
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

instance.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;

  try {
    // Add username to headers for authorization
    const username = window.sessionStorage.getItem("user-username");
    if (username) {
      config.headers["X-User-Username"] = username;
      // Add username to params for data fetching
      if (!config.params) {
        config.params = { username: username };
      } else {
        config.params.username = username;
      }
    }
  } catch (error) {
    console.error("Error setting request headers:", error);
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === "Network Error") {
      console.error("Network Error Details:", error);
      throw new Error(
        "Unable to connect to the server. Please check your internet connection."
      );
    }
    throw error;
  }
);

export default instance;
