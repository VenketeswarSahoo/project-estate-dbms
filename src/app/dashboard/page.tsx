"use client";

import React from "react";
import { useAuth } from "@/providers/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/store";
import { Users, Package, DollarSign, MessageSquare } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { SectionCards } from "@/components/dashboard/section-cards";
import { ChartBarDefault } from "@/components/dashboard/chat-area-interactive";
import { ChartPieDonutText } from "@/components/dashboard/chat-pie-donut-text";
import { ChartLineDefault } from "@/components/dashboard/chat-line-default";
import { DataTable } from "@/components/dashboard/data-table";

export default function DashboardPage() {
  const { user } = useAuth();
  const { clients, items, messages } = useAppStore();

  if (!user) return null;

  const totalClients = clients.length;
  const totalItems = items.length;
  const unreadMessages = messages.filter(
    (m) => m.receiverId === user.id && !m.read
  ).length;

  const totalValue = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ChartLineDefault />
              <ChartPieDonutText />
            </div>
            <DataTable />
          </div>
        </div>
      </div>
    </div>
  );
}
