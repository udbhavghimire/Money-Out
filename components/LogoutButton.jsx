"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

export function LogoutButton({ className }) {
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    try {
      logout();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      className={`justify-start h-12 px-4 hover:bg-gray-100 text-red-600 hover:text-red-700 ${className}`}
      onClick={handleLogout}
    >
      Log Out
    </Button>
  );
} 