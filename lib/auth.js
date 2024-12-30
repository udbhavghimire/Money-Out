import axios from "axios";

export async function signIn(credentials) {
  try {
    const response = await axios.post("/api/auth/login", credentials);

    if (response.data.token) {
      // Store tokens
      localStorage.setItem("access_token", response.data.token);
      localStorage.setItem("refresh_token", response.data.refresh_token);

      // No need to call setAuth here since we'll do it in the signin page
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

// Store user data along with token
export const setAuth = (token, userData) => {
  localStorage.setItem("access_token", token);
  localStorage.setItem("user", JSON.stringify(userData));
};

// Get user data
export const getUser = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  console.log("Retrieved user data:", user);
  return user;
};

export const clearAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};
