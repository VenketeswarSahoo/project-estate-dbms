"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAppStore } from "@/store/useAppStore";
import { User } from "@/types";
import { ComposeMessageDialogProps } from "@/types/new-message";
import {
  Building2,
  Mail,
  Plus,
  Shield,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SearchBar from "./SearchBar";
import TabbedUserView from "./TabbedUserView";
import { UserList } from "./UserList";

// ==================== Types & Config ====================

export const roleConfig: Record<
  string,
  { label: string; shortLabel: string; icon: React.ReactNode; color: string }
> = {
  ADMIN: {
    label: "Administrator",
    shortLabel: "Admin",
    icon: <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />,
    color:
      "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  },
  AGENT: {
    label: "Estate Agent",
    shortLabel: "Agent",
    icon: <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />,
    color:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  EXECUTOR: {
    label: "Executor",
    shortLabel: "Executor",
    icon: <UserIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />,
    color:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  BENEFICIARY: {
    label: "Beneficiary",
    shortLabel: "Beneficiary",
    icon: <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />,
    color:
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  CLIENT: {
    label: "Client",
    shortLabel: "Client",
    icon: <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />,
    color:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
};

// ==================== Main Component ====================
export function ComposeMessageDialog({
  users: initialUsers = [],
  onUserSelect,
  triggerClassName = "",
}: ComposeMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAppStore();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: usersData = [], isLoading } = useUsers();
  const users = initialUsers.length > 0 ? initialUsers : usersData;

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setActiveTab("all");
    }
  }, [open]);

  // Filter and organize users
  const { filteredUsers, groupedUsers, userCounts } = useMemo(() => {
    const clients = (users || []).filter((u: User) => u.role === "CLIENT");

    // First filter based on role permissions
    const potentialReceivers = (users || []).filter((u: User) => {
      if (!user || u.id === user.id) return false;

      // Apply role-based filtering
      switch (user.role) {
        case "ADMIN":
          return true;
        case "AGENT":
          return ["EXECUTOR", "BENEFICIARY"].includes(u.role);
        case "EXECUTOR":
          if (u.role === "AGENT") return true;
          if (u.role === "BENEFICIARY") {
            const myClients = clients.filter(
              (c: User) => c.executorId === user.id
            );
            return myClients.some((c: User) =>
              c.beneficiaryIds?.includes(u.id)
            );
          }
          return false;
        case "BENEFICIARY":
          if (u.role === "EXECUTOR") {
            const myClient = clients.find((c: User) =>
              c.beneficiaryIds?.includes(user.id)
            );
            return myClient?.executorId === u.id;
          }
          return false;
        default:
          return false;
      }
    });

    // Then apply search filter
    const filtered = potentialReceivers.filter((u: User) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(query) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        u.role.toLowerCase().includes(query) ||
        roleConfig[u.role]?.label.toLowerCase().includes(query) ||
        roleConfig[u.role]?.shortLabel.toLowerCase().includes(query)
      );
    });

    // Group by role for tabs
    const grouped = filtered.reduce((acc: Record<string, User[]>, u: User) => {
      if (!acc[u.role]) acc[u.role] = [];
      acc[u.role].push(u);
      return acc;
    }, {});

    // Count by role
    const counts = Object.keys(grouped).reduce((acc, role) => {
      acc[role] = grouped[role].length;
      return acc;
    }, {} as Record<string, number>);

    return {
      filteredUsers: filtered,
      groupedUsers: grouped,
      userCounts: counts,
    };
  }, [users, user, searchQuery]);

  const handleSelectUser = (userId: string) => {
    setOpen(false);
    if (onUserSelect) {
      onUserSelect(userId);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setActiveTab("all");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const showTabs = filteredUsers.length > 0 && !searchQuery.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                size={isMobile ? "icon" : "default"}
                className={`gap-2 ${triggerClassName}`}
                variant="default"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:block">New</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Compose new message</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="p-0 gap-0 overflow-hidden border shadow-xl lg:min-w-[40vw] min-w-[90vw]">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-start">
                  New Message
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Select a recipient to start a conversation
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Search Section */}
        <div className="p-3 sm:p-4 border-b">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
          />
        </div>

        {/* Dynamic Content Section */}
        {showTabs ? (
          <TabbedUserView
            filteredUsers={filteredUsers}
            groupedUsers={groupedUsers}
            userCounts={userCounts}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onUserSelect={handleSelectUser}
            searchQuery={searchQuery}
            isLoading={isLoading}
          />
        ) : (
          <UserList
            users={filteredUsers}
            isLoading={isLoading}
            onUserSelect={handleSelectUser}
            searchQuery={searchQuery}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
