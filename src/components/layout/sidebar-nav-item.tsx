"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNavItemProps {
  href: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  tooltip?: string;
  isActive?: boolean;
}

export function SidebarNavItem({
  href,
  icon: Icon,
  children,
  tooltip,
  isActive,
}: SidebarNavItemProps) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMobile(false);
    router.push(href);
  };

  return (
    <div onClick={handleClick}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={tooltip}
        className="cursor-pointer"
      >
        <div>
          {Icon && <Icon />}
          <span>{children}</span>
        </div>
      </SidebarMenuButton>
    </div>
  );
}
