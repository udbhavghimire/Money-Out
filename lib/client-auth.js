"use client";

import { useAuth } from "@clerk/nextjs";

export const useClerkToken = () => {
  const { getToken } = useAuth();
  return getToken;
};
