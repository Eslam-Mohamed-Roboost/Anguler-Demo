export type MessageSender = 'user' | 'agent';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  senderName: string;
  text: string;
  timestamp: string;
}
