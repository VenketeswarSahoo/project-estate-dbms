"use client";

import React from "react";
import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";
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
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        toast.error("Invalid credentials");
        setLoading(false);
      } else {
        toast.success("Welcome back!");
      }
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Estate Manager</CardTitle>
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
                <li>AGENT - bob@estate.com | password123</li>
                <li>EXECUTOR - charlie@client.com | password123</li>
                <li>BENEFICIARY - dave@client.com | password123</li>
              </ul>
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
