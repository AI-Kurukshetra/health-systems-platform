export interface ChatContact {
  id: string;
  fullName: string;
  email?: string;
  role: "patient" | "provider";
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}
