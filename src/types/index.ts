export type Role = "ADMIN" | "AGENT" | "EXECUTOR" | "BENEFICIARY" | "CLIENT";

export interface User {
  id: string; // Will map to _id from MongoDB
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  password?: string;

  // Client/Estate specific fields
  address?: string;
  executorId?: string;
  beneficiaryIds?: string[];
  savedBeneficiaries?: string[];
  savedDonationRecipients?: string[];
  savedActions?: string[];

  createdAt?: string;
  updatedAt?: string;
}

// Deprecated: Client is now a User with role="CLIENT"
export type Client = User;

export type ItemAction = "SALE" | "DISTRIBUTE" | "DONATE" | "OTHER";

export interface Item {
  id: string; // Will map to _id from MongoDB
  clientId: string;
  name: string;
  description: string;
  pieces: number;
  photos: string[];
  barcode: string;
  uid: string;
  isLocked: boolean;

  action?: ItemAction;
  actionNote?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string; // Will map to _id
  senderId: string;
  receiverId: string;
  itemId?: string;
  content: string;
  timestamp: string;
  read: boolean;
}
