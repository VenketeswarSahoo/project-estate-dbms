import { User } from "./index";

export interface ComposeMessageDialogProps {
  users?: User[];
  onUserSelect?: (userId: string) => void;
  triggerClassName?: string;
}

export interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export interface UserItemProps {
  user: User;
  onSelect: (userId: string) => void;
}

export interface UserListProps {
  users: User[];
  isLoading: boolean;
  onUserSelect: (userId: string) => void;
  searchQuery: string;
}

export interface TabbedUserViewProps {
  filteredUsers: User[];
  groupedUsers: Record<string, User[]>;
  userCounts: Record<string, number>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUserSelect: (userId: string) => void;
  searchQuery: string;
  isLoading: boolean;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarkMessagesReadParams {
  ids: string[];
  update: { read: boolean };
}
