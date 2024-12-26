import axios from "axios";

export async function signIn(credentials) {
  try {
    const response = await axios.post("/api/auth/login", credentials);

    if (response.data.token) {
      // Store both tokens
      localStorage.setItem("access_token", response.data.token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      return response.data;
    }
    throw new Error("Invalid credentials");
  } catch (error) {
    throw error;
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

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
