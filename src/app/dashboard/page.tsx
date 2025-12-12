"use client";
import { RecentItemsList } from "@/components/dashboard/RecentItemsList";
import { RecentMessagesList } from "@/components/dashboard/RecentMessagesList";
import { ChartAreaGradient } from "@/components/dashboard/chat-line-multiple";
import { ChartPieDonutText } from "@/components/dashboard/chat-pie-donut-text";
import { SectionCards } from "@/components/dashboard/section-cards";
import { useAuth } from "@/providers/auth";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <SectionCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartAreaGradient />
        <ChartPieDonutText />
        <RecentMessagesList />
        <RecentItemsList />
      </div>
    </div>
  );
}
