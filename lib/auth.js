import axios from "axios";

export async function signIn(credentials) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/token/`,
      credentials
    );

    const { access, refresh } = response.data;

    // Store tokens
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to sign in");
  }
}

export async function refreshToken() {
  try {
    const refresh = localStorage.getItem("refresh_token");

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/token/refresh/`,
      {
        refresh,
      }
    );

    const { access } = response.data;
    localStorage.setItem("access_token", access);

    return access;
  } catch (error) {
    throw new Error("Failed to refresh token");
  }
}

export function signOut() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}

export function getAuthHeader() {
  const token = localStorage.getItem("access_token");
  return token ? `Bearer ${token}` : "";
}
