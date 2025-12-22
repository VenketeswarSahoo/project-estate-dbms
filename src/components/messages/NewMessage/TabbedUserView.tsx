"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabbedUserViewProps } from "@/types/new-message";
import { roleConfig } from "./ComposeMessageDialog";
import { UserList } from "./UserList";

export default function TabbedUserView({
  filteredUsers,
  groupedUsers,
  userCounts,
  activeTab,
  onTabChange,
  onUserSelect,
  searchQuery,
  isLoading,
}: TabbedUserViewProps) {
  return (
    <div className="border-b">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="px-3 sm:px-4 pt-2">
          <TabsList className="w-full h-auto flex flex-wrap gap-1 p-1 bg-muted/50">
            <TabsTrigger
              value="all"
              className="flex-1 h-8 text-xs px-2 data-[state=active]:bg-background"
            >
              <span className="truncate">All ({filteredUsers.length})</span>
            </TabsTrigger>
            {Object.entries(userCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([role, count]) => (
                <TabsTrigger
                  key={role}
                  value={role}
                  className="flex-1 h-8 text-xs px-4 data-[state=active]:bg-background"
                >
                  <div className="flex items-center justify-center gap-1">
                    {roleConfig[role]?.icon}
                    <span>{roleConfig[role]?.shortLabel}</span>
                    <span className="text-muted-foreground">({count})</span>
                  </div>
                </TabsTrigger>
              ))}
          </TabsList>
        </div>

        {/* All Users Tab */}
        <TabsContent value="all" className="m-0">
          <UserList
            users={filteredUsers}
            isLoading={isLoading}
            onUserSelect={onUserSelect}
            searchQuery={searchQuery}
          />
        </TabsContent>

        {/* Role-specific Tabs */}
        {Object.entries(groupedUsers).map(([role, roleUsers]) => (
          <TabsContent key={role} value={role} className="m-0">
            <UserList
              users={roleUsers}
              isLoading={isLoading}
              onUserSelect={onUserSelect}
              searchQuery={searchQuery}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
