"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, Lock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InvestorLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = login(password);
    if (!result.success) {
      setError("Invalid password. Please try again.");
      setIsLoading(false);
      return;
    }

    toast({
      title: "Welcome back!",
      description: `Welcome, ${result.name}!`,
    });

    setError("");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      {/* Main login card */}
      <Card className="w-[400px] shadow-2xl border-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 relative">
        <CardHeader className="space-y-6 pb-8">
          {/* Logo and title section */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div className="absolute" />
              <div className="relative h-40 w-40 rounded-full overflow-hidden bg-white shadow-lg">
                <img
                  src="/logo.png"
                  alt="Ahavor Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Majay Transport
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter your password to access the system
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Security badge */}
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure Connection</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>Password</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your secure password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className={`h-12 ${
                  error ? "border-destructive focus:border-destructive" : ""
                }`}
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-2">
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Access System"
              )}
            </Button>
          </form>

          {/* Footer decoration */}
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground pt-4 border-t border-border/50">
            <div className="h-px bg-border flex-1" />
            <span>Ahavor Management</span>
            <div className="h-px bg-border flex-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
