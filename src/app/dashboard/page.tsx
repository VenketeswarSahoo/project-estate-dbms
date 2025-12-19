"use client";
import HeadingText from "@/components/common/HeadingText";
import { RecentItemsList } from "@/components/dashboard/RecentItemsList";
import { RecentMessagesList } from "@/components/dashboard/RecentMessagesList";
import { ChartAreaGradient } from "@/components/dashboard/chat-line-multiple";
import { ChartPieDonutText } from "@/components/dashboard/chat-pie-donut-text";
import { SectionCards } from "@/components/dashboard/section-cards";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const { user } = useAppStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <HeadingText
        title="Dashboard"
        subtitle="Seamlessly manage your data and activities."
      />
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
