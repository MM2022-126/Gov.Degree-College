// Hook for using Socket.io in React components
import { useEffect, useCallback, useRef } from "react";
import { getSocket, onNewMessage, onUserTyping, onMessagesRead, joinConversation, leaveConversation, sendMessage as emitMessage, sendTyping as emitTyping, markAsRead as emitMarkAsRead } from "@/lib/socket-client";

interface ChatMessage {
  _id?: string;
  conversation_id: string;
  sender_type: "visitor" | "admin" | "system";
  sender_name: string;
  message: string;
  read_at?: Date | null;
  created_at: string;
}

interface UseSocketOptions {
  conversationId?: string | null;
  currentUserType?: "visitor" | "admin"; // Add this to know who current user is
  onMessageReceived?: (message: ChatMessage) => void;
  onUserTypingChange?: (isTyping: boolean, sender?: string) => void; // Add sender info
  onMessagesReadChange?: (messageIds: string[]) => void;
}

export const useSocket = (options: UseSocketOptions) => {
  const { conversationId, currentUserType, onMessageReceived, onUserTypingChange, onMessagesReadChange } = options;
  const unsubscribeRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    // Join conversation
    joinConversation(conversationId);

    // Setup listeners
    const unsubscribeMessage = onNewMessage((message) => {
      onMessageReceived?.(message);
    });

    const unsubscribeTyping = onUserTyping((data) => {
      // Only show typing indicator if it's from the OTHER person
      const isOtherTyping = data.senderType && data.senderType !== currentUserType ? data.isTyping : false;
      onUserTypingChange?.(isOtherTyping, data.senderType);
    });

    const unsubscribeRead = onMessagesRead((data) => {
      onMessagesReadChange?.(data.messageIds);
    });

    unsubscribeRef.current = [unsubscribeMessage, unsubscribeTyping, unsubscribeRead];

    return () => {
      // Cleanup listeners
      unsubscribeRef.current.forEach((unsubscribe) => unsubscribe());
      leaveConversation(conversationId);
    };
  }, [conversationId, onMessageReceived, onUserTypingChange, onMessagesReadChange]);

  const sendMessage = useCallback((message: string, senderType: "visitor" | "admin", senderName: string) => {
    if (conversationId) {
      emitMessage(conversationId, message, senderType, senderName);
    }
  }, [conversationId]);

  const sendTyping = useCallback((isTyping: boolean, sender: "visitor" | "admin") => {
    if (conversationId) {
      emitTyping(conversationId, isTyping, sender);
    }
  }, [conversationId]);

  const markAsRead = useCallback((messageIds: string[]) => {
    if (conversationId) {
      emitMarkAsRead(conversationId, messageIds);
    }
  }, [conversationId]);

  return {
    socket: getSocket(),
    sendMessage,
    sendTyping,
    markAsRead,
  };
};

export default useSocket;
