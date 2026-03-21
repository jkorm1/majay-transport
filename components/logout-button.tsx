"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function LogoutButton() {
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleClick = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="transition-colors hover:text-foreground/80 text-foreground/60"
    >
      Logout
    </Button>
  );
}
export { LogoutButton };
