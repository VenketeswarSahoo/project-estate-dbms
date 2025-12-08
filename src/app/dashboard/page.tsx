"use client";

import React from "react";
import { useAuth } from "@/providers/auth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentItemsList } from "@/components/dashboard/RecentItemsList";
import { RecentMessagesList } from "@/components/dashboard/RecentMessagesList";
import { ChartBarDefault } from "@/components/dashboard/chat-area-interactive";
import { ChartLineDefault } from "@/components/dashboard/chat-line-default";
import { ChartPieDonutText } from "@/components/dashboard/chat-pie-donut-text";
import { SectionCards } from "@/components/dashboard/section-cards";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <SectionCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBarDefault />
        {/* <ChartLineDefault /> */}
        <ChartPieDonutText />
        <RecentMessagesList />
        <RecentItemsList />
      </div>
    </div>
  );
}
