"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchBarProps } from "@/types/new-message";
import { Search, X } from "lucide-react";

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onClearSearch,
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by name, email, or role..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-10 sm:h-11 text-sm sm:text-base pr-10"
        autoFocus
      />
      {searchQuery && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
          onClick={onClearSearch}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
