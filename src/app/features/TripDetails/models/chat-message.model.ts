export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export interface ChatConversation {
  conversationId: string;
  tripId: string;
  conversationType: string;
  status: string;
  createdAt: string;
  closedAt: string | null;
  messages: ChatMessageItem[];
}
