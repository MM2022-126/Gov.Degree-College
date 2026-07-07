import { useState, useEffect, useRef, useCallback, memo } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { getSocket } from "@/lib/socket-client";
import TypingIndicator from "@/components/TypingIndicator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, User, Clock, Check, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  _id?: string;
  id?: string;
  sessionId: string;
  sender: "user" | "admin";
  text: string;
  senderDisplayName?: string;
  name?: string;
  timestamp: string;
  read: boolean;
  tempId?: string;
}

interface Conversation {
  sessionId: string;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  visitorName: string;
}

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const ChatBubble = memo(({ msg }: { msg: Message }) => (
  <div className={`flex flex-col ${msg.sender === "admin" ? "items-end" : "items-start"}`}>
    <div
      className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
        msg.sender === "admin"
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-accent text-accent-foreground rounded-bl-md"
      }`}
    >
      <span className="text-xs font-semibold block mb-0.5 opacity-70">
        {msg.senderDisplayName || msg.name || (msg.sender === "admin" ? "Admin" : "Visitor")}
      </span>
      {msg.text}
    </div>
    <div className="flex items-center gap-1 mt-0.5 px-1">
      <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
      {msg.sender === "admin" && (
        msg.read
          ? <CheckCheck className="h-3 w-3 text-primary" />
          : <Check className="h-3 w-3 text-muted-foreground" />
      )}
    </div>
  </div>
));
ChatBubble.displayName = "ChatBubble";

const ConversationItem = memo(({ convo, isSelected, onSelect }: {
  convo: Conversation; isSelected: boolean; onSelect: (sessionId: string) => void;
}) => (
  <button
    onClick={() => onSelect(convo.sessionId)}
    className={`w-full text-left p-3 border-b border-border hover:bg-accent transition-colors ${isSelected ? "bg-accent" : ""}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground text-sm">{convo.visitorName}</span>
      </div>
      {convo.unreadCount > 0 && (
        <Badge variant="default" className="text-[10px]">
          {convo.unreadCount}
        </Badge>
      )}
    </div>
    {convo.lastMessage && (
      <div className="flex items-center gap-1 mt-1">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground truncate">
          {convo.lastMessage.text.substring(0, 40)}...
        </span>
      </div>
    )}
  </button>
));
ConversationItem.displayName = "ConversationItem";

const AdminChat = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef(getSocket());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Socket connection and admin room join
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Remove existing listeners first
    socket.off("new_message");
    socket.off("reply_sent");
    socket.off("connect");
    socket.off("joined_admin");

    // Join admin room immediately
    const joinAdmin = () => {
      socket.emit("join_admin");
      // DEBUG: Admin joined admin_room
    };

    // Join on connect (handles reconnection too)
    if (socket.connected) {
      joinAdmin();
    }
    socket.on("connect", joinAdmin);

    // Listen for confirmation
    socket.on("joined_admin", ({ success }: { success: boolean }) => {
      if (success) {
        // DEBUG: Successfully joined admin room
      }
    });

    // Listen for new messages from users
    const handleNewMessage = (msg: Message) => {
      // DEBUG: Admin received new message
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.sessionId === msg.sessionId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            messages: [...updated[existingIndex].messages, msg],
            lastMessage: msg,
            unreadCount: updated[existingIndex].unreadCount + 1
          };
          return updated;
        } else {
          return [{
            sessionId: msg.sessionId,
            messages: [msg],
            lastMessage: msg,
            unreadCount: 1,
            visitorName: msg.senderDisplayName || msg.name || "Visitor"
          }, ...prev];
        }
      });

      // If this conversation is currently open, add message to it
      if (activeSessionId === msg.sessionId) {
        setActiveMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }

      // Play notification
      toast({ title: "New message", description: `From ${msg.senderDisplayName || msg.name || "Visitor"}` });
    };

    socket.on("new_message", handleNewMessage);

    // Listen for confirmation of admin replies
    const handleReplySent = (msg: Message) => {
      setActiveMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      // Update conversation's last message
      setConversations(prev =>
        prev.map(c =>
          c.sessionId === msg.sessionId
            ? { ...c, lastMessage: msg, messages: [...c.messages, msg] }
            : c
        )
      );
    };

    socket.on("reply_sent", handleReplySent);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("reply_sent", handleReplySent);
      socket.off("connect", joinAdmin);
      socket.off("joined_admin");
    };
  }, [activeSessionId, toast]);

  // Load conversation messages when session selected
  useEffect(() => {
    if (!activeSessionId) return;

    // Find or fetch messages for this session
    const convo = conversations.find(c => c.sessionId === activeSessionId);
    if (convo) {
      setActiveMessages(convo.messages);
      // Mark all messages as read
      setConversations(prev =>
        prev.map(c =>
          c.sessionId === activeSessionId
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
    }
  }, [activeSessionId, conversations]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const sendAdminReply = useCallback(() => {
    const text = replyText.trim();
    if (!text || !activeSessionId) return;

    setReplyText("");
    setIsAdminTyping(false);

    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("admin_reply", {
      sessionId: activeSessionId,
      text,
      sender: "admin",
      senderDisplayName: "Admin"
    });
  }, [replyText, activeSessionId]);

  const handleTyping = useCallback(() => {
    if (!isAdminTyping) {
      setIsAdminTyping(true);
      const socket = socketRef.current;
      if (socket && activeSessionId) {
        socket.emit("admin_typing", { isTyping: true, sessionId: activeSessionId });
      }
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsAdminTyping(false);
      const socket = socketRef.current;
      if (socket && activeSessionId) {
        socket.emit("admin_typing", { isTyping: false, sessionId: activeSessionId });
      }
    }, 2000);
  }, [isAdminTyping, activeSessionId]);

  const activeConvo = activeSessionId ? conversations.find(c => c.sessionId === activeSessionId) : null;

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Live Chat Support</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="md:col-span-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border">
              <p className="text-sm font-medium text-muted-foreground">
                {conversations.length} Conversation{conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  <p className="mb-2">No conversations yet</p>
                  <p className="text-xs">Messages from visitors will appear here</p>
                </div>
              ) : (
                conversations.map((convo) => (
                  <ConversationItem
                    key={convo.sessionId}
                    convo={convo}
                    isSelected={activeSessionId === convo.sessionId}
                    onSelect={setActiveSessionId}
                  />
                ))
              )}
            </div>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2 flex flex-col overflow-hidden">
            {activeSessionId && activeConvo ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{activeConvo.visitorName}</h2>
                    <p className="text-xs text-muted-foreground">Visitor Session</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No messages in this conversation
                    </div>
                  ) : (
                    <>
                      {activeMessages.map((msg) => (
                        <ChatBubble key={msg._id || msg.id} msg={msg} />
                      ))}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border flex gap-2">
                  <Input
                    placeholder="Type a reply..."
                    value={replyText}
                    onChange={(e) => {
                      setReplyText(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendAdminReply()}
                  />
                  <Button
                    onClick={sendAdminReply}
                    size="icon"
                    disabled={!replyText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChat;
