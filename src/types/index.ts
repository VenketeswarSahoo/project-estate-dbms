export type Role = "ADMIN" | "AGENT" | "EXECUTOR" | "BENEFICIARY";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  password?: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;

  executorId: string;
  beneficiaryIds: string[];
  savedBeneficiaries?: string[];
  savedDonationRecipients?: string[];
  savedActions?: string[];
  createdAt: string;
}

export type ItemAction = "SALE" | "DISTRIBUTE" | "DONATE" | "OTHER";

export interface Item {
  id: string;
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
  id: string;
  senderId: string;
  receiverId: string;
  itemId?: string;
  content: string;
  timestamp: string;
  read: boolean;
}
