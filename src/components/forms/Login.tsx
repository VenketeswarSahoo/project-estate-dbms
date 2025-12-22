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
import { useAuthQuery } from "@/lib/hooks/useAuthQuery";
import React from "react";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuthQuery();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    login({ email, password });
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
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLocaleLowerCase())}
                required
                disabled={isLoggingIn}
                minLength={5}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoggingIn}
                minLength={8}
                maxLength={50}
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
              disabled={isLoggingIn}
              loading={isLoggingIn}
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
