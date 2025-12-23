"use client";

import { MessageList } from "@/components/messages/MessageList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/useIs-tablet";
import { useItems } from "@/lib/hooks/useItems";
import { useMessages } from "@/lib/hooks/useMessages";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAppStore } from "@/store/useAppStore";
import { Loader } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageDetail } from "./MessageDetail";
import { ComposeMessageDialog } from "./NewMessage/ComposeMessageDialog";

export default function MessagesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAppStore();
  const isMobile = useIsMobile();
  const isTab = useIsTablet();

  const { data: messages = [], isLoading: isMessagesLoading } = useMessages();
  const { data: items = [], isLoading: isItemsLoading } = useItems();
  const { data: users = [], isLoading: isUsersLoading } = useUsers();

  const [selectedThread, setSelectedThread] = useState<{
    userId: string | null;
  }>({
    userId: null,
  });

  // Sync with URL params on initial load and changes
  useEffect(() => {
    const userId = searchParams.get("userId");
    setSelectedThread({ userId: userId || null });
  }, [searchParams]);

  const handleSelectThread = (itemId: string | null, userId: string) => {
    setSelectedThread({ userId });

    if (!isMobile) {
      // Update URL for desktop without navigation
      const newUrl = `/dashboard/messages?userId=${userId}`;
      window.history.pushState({}, "", newUrl);
    } else {
      // For mobile, navigate to detail page
      router.push(`/dashboard/messages/user/${userId}`);
    }
  };

  const handleCloseThread = () => {
    setSelectedThread({ userId: null });
    if (!isMobile) {
      // Update URL for desktop
      const newUrl = `/dashboard/messages`;
      window.history.pushState({}, "", newUrl);
    }
  };

  const isLoading = isMessagesLoading || isItemsLoading || isUsersLoading;

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Mobile view - show list or detail
  if (isMobile || isTab) {
    return selectedThread.userId ? (
      <div className="h-full">
        <MessageDetail targetUserId={selectedThread.userId} />
      </div>
    ) : (
      <div className="h-full">
        <div className="p-4 border-b flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-sm text-muted-foreground">Your conversations</p>
          </div>
          <ComposeMessageDialog
            users={users}
            onUserSelect={(userId) => handleSelectThread(null, userId)}
          />
        </div>
        <div className="h-[calc(100vh-7rem)]">
          <MessageList
            messages={messages}
            users={users}
            selectedUserId={selectedThread.userId}
            onSelectThread={handleSelectThread}
          />
        </div>
      </div>
    );
  }

  // Desktop view - show both side by side
  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b flex justify-between">
          <div>
            <h1 className="text-xl font-semibold">Messages</h1>
            <p className="text-sm text-muted-foreground">Your conversations</p>
          </div>
          <ComposeMessageDialog
            users={users}
            onUserSelect={(userId) => handleSelectThread(null, userId)}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            users={users}
            selectedUserId={selectedThread.userId}
            onSelectThread={handleSelectThread}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="w-2/3 flex flex-col">
        {selectedThread.userId ? (
          <div className="h-full">
            <MessageDetail
              targetUserId={selectedThread.userId}
              onClose={handleCloseThread}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Select a conversation
            </h2>
            <p className="text-muted-foreground max-w-md text-sm">
              Choose a conversation from the list to view messages, or start a
              new conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
