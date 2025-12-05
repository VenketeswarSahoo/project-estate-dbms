"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MessageCenter } from "@/components/messages/MessageCenter";
import PageTransition from "@/components/layout/PageTransition";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
      <MessageCenter />
    </div>
  );
}
