"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { UserListProps } from "@/types/new-message";
import { Search } from "lucide-react";
import UserItem from "./UserItem";

export function UserList({
  users,
  isLoading,
  onUserSelect,
  searchQuery,
}: UserListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32 sm:w-40" />
              <Skeleton className="h-3 w-24 sm:w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center">
        <div className="rounded-full bg-muted p-3 sm:p-4 mb-4">
          <Search className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base sm:text-lg mb-2">
          {searchQuery ? "No users found" : "No recipients available"}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-sm">
          {searchQuery
            ? `No users match "${searchQuery}". Try a different search term.`
            : "You don't have any available recipients based on your role and permissions."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(90vh-280px)] sm:h-[400px]">
      <ScrollArea className="h-full">
        {users.map((user) => (
          <UserItem key={user.id} user={user} onSelect={onUserSelect} />
        ))}
      </ScrollArea>
    </div>
  );
}
