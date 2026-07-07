import { useState, useEffect, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket-client";

const TYPING_TIMEOUT = 3000;

export const useTypingIndicator = (conversationId: string | null, senderType: "visitor" | "admin") => {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();

    const handleUserTyping = (data: any) => {
      if (data.sender !== senderType && data.conversationId === conversationId) {
        setIsOtherTyping(data.isTyping);
        if (data.isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), TYPING_TIMEOUT);
        }
      }
    };

    socket.on("user_typing", handleUserTyping);

    return () => {
      socket.off("user_typing", handleUserTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, senderType]);

  const sendTyping = useCallback(() => {
    if (!conversationId) return;
    const socket = getSocket();
    socket.emit("typing", {
      conversationId,
      isTyping: true,
      sender: senderType,
    });
  }, [conversationId, senderType]);

  return { isOtherTyping, sendTyping };
};
