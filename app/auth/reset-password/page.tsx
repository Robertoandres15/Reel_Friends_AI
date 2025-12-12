"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Film } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [supabase, setSupabase] = useState<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    async function initializeSupabase() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const client = createClient();
        setSupabase(client);
      } catch (error) {
        console.error("[v0] Failed to initialize Supabase client:", error);
      }
    }

    initializeSupabase();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    if (!supabase) return;
    console.log("[v0] Supabase client initialized");
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });
    console.log("[v0] Password reset attempt completed");

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }
    toast({
      title: "Success",
      description: "Password updated successfully",
    });

    router.push("/feed");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen pt-[var(--safe-area-inset-top)] pb-[var(--safe-area-inset-bottom)] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Film className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Reel Friends</h1>
          </div>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword}>
              <div className="grid gap-2">
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm text-slate-300">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm text-slate-300"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
              )}
              <Button
                disabled={isLoading}
                className="w-full mt-6 bg-purple-600 hover:bg-purple-500 text-white"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
