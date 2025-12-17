// lib/hooks/useMessageUtils.ts
import { useAuth } from "@/providers/auth";
import { useMemo } from "react";
import { useMessageMutation, useMessages } from "../hooks/useMessages";
import { useUsers } from "../hooks/useUsers";

// Hook to get messages for current user
export function useUserMessages() {
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages();

  const userMessages = useMemo(() => {
    if (!user) return [];
    return messages.filter(
      (msg: any) => msg.senderId === user.id || msg.recipientId === user.id
    );
  }, [messages, user]);

  return { messages: userMessages, isLoading };
}

// Hook to get unread message count for current user
export function useUnreadMessageCount() {
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages();

  const unreadCount = useMemo(() => {
    if (!user) return 0;
    return messages.filter(
      (msg: any) => msg.recipientId === user.id && !msg.read
    ).length;
  }, [messages, user]);

  return { count: unreadCount, isLoading };
}

// Hook to get conversations for current user
export function useUserConversations() {
  const { user } = useAuth();
  const { data: messages = [], isLoading: messagesLoading } = useMessages();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const conversations = useMemo(() => {
    if (!user || messagesLoading || usersLoading) return [];

    // Group messages by conversation partner
    const conversationsMap = new Map();

    messages.forEach((msg: any) => {
      if (msg.senderId === user.id || msg.recipientId === user.id) {
        const otherUserId =
          msg.senderId === user.id ? msg.recipientId : msg.senderId;
        const otherUser = users.find((u: any) => u.id === otherUserId);

        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            user: otherUser,
            lastMessage: msg,
            unreadCount: msg.recipientId === user.id && !msg.read ? 1 : 0,
            messages: [msg],
          });
        } else {
          const conversation = conversationsMap.get(otherUserId);
          conversation.messages.push(msg);
          if (msg.createdAt > conversation.lastMessage.createdAt) {
            conversation.lastMessage = msg;
          }
          if (msg.recipientId === user.id && !msg.read) {
            conversation.unreadCount += 1;
          }
        }
      }
    });

    return Array.from(conversationsMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );
  }, [user, messages, users, messagesLoading, usersLoading]);

  return { conversations, isLoading: messagesLoading || usersLoading };
}

// Hook to mark messages as read
export function useMarkAsRead() {
  const { data: messages = [] } = useMessages();
  const messageMutation = useMessageMutation();

  const markAsRead = async (messageIds: string[]) => {
    const updates = messageIds.map((id) => ({
      id,
      read: true,
      readAt: new Date().toISOString(),
    }));

    await Promise.all(
      updates.map((update) => messageMutation.mutateAsync(update))
    );
  };

  const markConversationAsRead = async (
    otherUserId: string,
    currentUserId: string
  ) => {
    const unreadMessages = messages.filter(
      (msg: any) =>
        msg.senderId === otherUserId &&
        msg.recipientId === currentUserId &&
        !msg.read
    );

    if (unreadMessages.length > 0) {
      await markAsRead(unreadMessages.map((msg: any) => msg.id));
    }
  };

  return {
    markAsRead,
    markConversationAsRead,
    isPending: messageMutation.isPending,
  };
}
