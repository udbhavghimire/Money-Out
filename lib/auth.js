import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function signIn(credentials) {
  try {
    const response = await axios.post(`${API_URL}/api/token/`, credentials);
    const data = response.data;

    if (!data.access || !data.refresh || !data.user) {
      throw new Error("Invalid response from server");
    }

    // Store tokens in localStorage
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error("SignIn Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Authentication failed"
    );
  }
}

export async function refreshToken() {
  try {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) throw new Error("No refresh token available");

    const response = await axios.post(`${API_URL}/api/token/refresh/`, {
      refresh: refresh,
    });

    const { access } = response.data;
    localStorage.setItem("access_token", access);
    return access;
  } catch (error) {
    signOut();
    throw error;
  }
}

export async function signOut() {
  try {
    const refresh_token = localStorage.getItem("refresh_token");
    if (refresh_token) {
      // Optional: Call backend to blacklist the token
      await axios.post(`${API_URL}/api/logout/`, {
        refresh_token: refresh_token,
      });
    }
  } catch (error) {
    console.error("Logout Error:", error);
  } finally {
    // Always clear localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }
}

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("access_token");
  return !!token;
}

export function getAuthHeader() {
  const token = localStorage.getItem("access_token");
  return token ? `Bearer ${token}` : "";
}
