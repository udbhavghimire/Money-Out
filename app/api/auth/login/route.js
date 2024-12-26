import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const body = await request.json();

    // Make request to your backend API
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/token/`,
      body
    );

    const { access, refresh } = response.data;

    // Return the token in the response
    return NextResponse.json({
      token: access,
      refresh_token: refresh,
      status: "success",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: error.response?.data?.detail || "Authentication failed",
      },
      {
        status: 401,
      }
    );
  }
}
