// Socket.io client connection and event handlers
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Global connection listeners
    socket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
    });

    socket.on("error", (error) => {
      console.error("Socket.io error:", error);
    });
  }

  return socket;
};

// Chat event functions
export const joinConversation = (conversationId: string) => {
  const sock = getSocket();
  sock.emit("join_conversation", conversationId);
};

export const leaveConversation = (conversationId: string) => {
  const sock = getSocket();
  sock.emit("leave_conversation", conversationId);
};

export const sendMessage = (
  conversationId: string,
  message: string,
  senderType: "visitor" | "admin",
  senderName: string
) => {
  const sock = getSocket();
  sock.emit("send_message", {
    conversationId,
    message,
    sender_type: senderType,
    sender_name: senderName,
  });
};

export const sendTyping = (conversationId: string, isTyping: boolean, sender: "visitor" | "admin") => {
  const sock = getSocket();
  sock.emit("typing", {
    conversationId,
    isTyping,
    sender,
  });
};

export const markAsRead = (conversationId: string, messageIds: string[]) => {
  const sock = getSocket();
  sock.emit("mark_as_read", {
    conversationId,
    messageIds,
  });
};

// Listener setup functions
export const onNewMessage = (callback: (message: any) => void) => {
  const sock = getSocket();
  sock.on("new_message", callback);
  return () => sock.off("new_message", callback);
};

export const onUserTyping = (callback: (data: any) => void) => {
  const sock = getSocket();
  sock.on("user_typing", callback);
  return () => sock.off("user_typing", callback);
};

export const onMessagesRead = (callback: (data: any) => void) => {
  const sock = getSocket();
  sock.on("messages_read", callback);
  return () => sock.off("messages_read", callback);
};

export const onConversationUpdated = (callback: (data: any) => void) => {
  const sock = getSocket();
  sock.on("conversation_updated", callback);
  return () => sock.off("conversation_updated", callback);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
