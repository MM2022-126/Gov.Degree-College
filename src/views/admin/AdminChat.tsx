'use client'

import { useState, useEffect, useRef, useCallback, memo } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, User, Clock, Check, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mergeChatMessages, normalizeAdminChatConversations } from "@/lib/chat";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat-messages/all`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load conversations");

      const data = await response.json();
      if (!Array.isArray(data)) return;

      const normalized = normalizeAdminChatConversations(data);

      setConversations(normalized);

      if (activeSessionId) {
        const selected = normalized.find((convo: Conversation) => convo.sessionId === activeSessionId);
        if (selected) {
          setActiveMessages(selected.messages);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [activeSessionId]);

  useEffect(() => {
    loadConversations();
    const interval = window.setInterval(loadConversations, 3000);
    return () => window.clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (!activeSessionId) {
      setActiveMessages([]);
      return;
    }

    const convo = conversations.find((item) => item.sessionId === activeSessionId);
    if (convo) {
      setActiveMessages(convo.messages);
      setConversations((prev) => prev.map((item) => item.sessionId === activeSessionId ? { ...item, unreadCount: 0 } : item));
    }
  }, [activeSessionId, conversations]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const sendAdminReply = useCallback(async () => {
    const text = replyText.trim();
    if (!text || !activeSessionId) return;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const optimisticMsg: Message = {
      _id: tempId,
      sessionId: activeSessionId,
      sender: "admin",
      text,
      senderDisplayName: "Admin",
      timestamp: new Date().toISOString(),
      read: true,
      tempId,
    };

    setReplyText("");
    setActiveMessages((prev) => mergeChatMessages(prev, [optimisticMsg]));
    setConversations((prev) => prev.map((convo) => convo.sessionId === activeSessionId ? { ...convo, lastMessage: optimisticMsg, messages: mergeChatMessages(convo.messages, [optimisticMsg]) } : convo));

    try {
      const response = await fetch(`/api/chat-messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          text,
          sender: "admin",
          senderDisplayName: "Admin",
          read: true,
          tempId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to send reply");

      setActiveMessages((prev) => mergeChatMessages(prev, [data]));
      setConversations((prev) => prev.map((convo) => convo.sessionId === activeSessionId ? { ...convo, lastMessage: data, messages: mergeChatMessages(convo.messages, [data]) } : convo));
    } catch (error) {
      console.error(error);
      toast({ title: "Reply not sent", description: "Please try again", variant: "destructive" });
    }
  }, [replyText, activeSessionId, toast]);

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
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void sendAdminReply()}
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
