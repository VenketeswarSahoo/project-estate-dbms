import { FloatingScanButton } from "@/components/common/FloatingScanButton";
import { AppShell } from "@/components/layout/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estate Manager",
  description: "Estate Database Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <FloatingScanButton />
    </>
  );
}
