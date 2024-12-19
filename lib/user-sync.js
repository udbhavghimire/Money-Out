"use client";

import axios from "./axios";

export async function syncUserWithBackend(user) {
  if (!user) return;

  const userEmail = user.emailAddresses[0].emailAddress;
  const username = userEmail; // Using email as username

  // Store username immediately for subsequent requests
  window.sessionStorage.setItem("user-username", username);

  try {
    console.log("Attempting to register user:", {
      username: username,
      email: userEmail,
      first_name: user.firstName || "",
      last_name: user.lastName || "",
    });

    // Try to register new user
    const registerResponse = await fetch(
      "https://admin.sixdesign.ca/api/register/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: userEmail,
          password: "ClerkGoogleAuth123!", // More complex password
          confirm_password: "ClerkGoogleAuth123!",
          first_name: user.firstName || "",
          last_name: user.lastName || "",
        }),
      }
    );

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json().catch(() => ({}));
      console.error("Registration error response:", errorData);

      // If it's a 400 error, user might already exist
      if (registerResponse.status === 400) {
        console.log("User might already exist, continuing...");
        return { message: "User already exists" };
      }

      throw new Error(errorData.detail || "Registration failed");
    }

    const data = await registerResponse.json();
    console.log("Registration successful:", data);
    return data;
  } catch (error) {
    // Log detailed error information
    console.error("Registration error details:", {
      message: error.message,
      error: error,
    });

    if (error.message === "Failed to fetch") {
      throw new Error(
        "Network error: Unable to connect to the server. Please check your internet connection."
      );
    }

    throw error;
  }
}
