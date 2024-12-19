"use client";

import { useEffect } from 'react';
import { useClerkToken } from '@/lib/client-auth';
import { useUser } from "@clerk/nextjs";

export function TokenProvider({ children }) {
  const getToken = useClerkToken();
  const { user } = useUser();

  useEffect(() => {
    const updateToken = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        const token = await getToken();
        if (token) {
          window.sessionStorage.setItem('clerk-token', token);
        }
        // Store user email
        if (user?.emailAddresses[0]?.emailAddress) {
          window.sessionStorage.setItem('user-email', user.emailAddresses[0].emailAddress);
        }
      } catch (error) {
        console.error('Error updating token:', error);
      }
    };

    updateToken();
    const interval = setInterval(updateToken, 1000 * 60 * 30); // Every 30 minutes

    return () => clearInterval(interval);
  }, [getToken, user]);

  return children;
} 