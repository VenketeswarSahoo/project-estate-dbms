"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserItemProps } from "@/types/new-message";
import { roleConfig } from "./ComposeMessageDialog";

export default function UserItem({ user, onSelect }: UserItemProps) {
  return (
    <button
      onClick={() => onSelect(user.id)}
      className="flex items-center gap-3 p-3 sm:p-4 hover:bg-accent/50 active:bg-accent transition-all duration-200 text-left w-full border-b last:border-0 group hover:pl-4 active:scale-[0.99]"
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-11 w-11 sm:h-12 sm:w-12">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-sm sm:text-base">
            {user.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
          <h6 className="font-semibold truncate text-sm">{user.name}</h6>
        </div>
        {user.email && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {user.email}
          </p>
        )}
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {roleConfig[user.role]?.label}
        </p>
      </div>
    </button>
  );
}
