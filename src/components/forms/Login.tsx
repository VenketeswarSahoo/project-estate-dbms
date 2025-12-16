"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth";
import React from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        toast.error("Invalid credentials");
        setLoading(false);
      } else {
        toast.success("Welcome back!");
      }
    } catch (error) {
      toast.error("An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleLogin}
            className="grid w-full items-center gap-4"
          >
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              <p>Demo Credentials:</p>
              <ul className="list-disc ml-4">
                <li>ADMIN - alice@estate.com | password123</li>
                <li>AGENT 1 - bob@estate.com | password123</li>
                <li>AGENT 2 - sarah@estate.com | password123</li>
                <li>EXECUTOR 1 - charlie@smith.com | password123</li>
                <li>EXECUTOR 2 - diana@wayne.com | password123</li>
                <li>BENEFICIARY 1 - dave@smith.com | password123</li>
                <li>BENEFICIARY 2 - eve@smith.com | password123</li>
              </ul>
            </div>
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full mt-2"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
