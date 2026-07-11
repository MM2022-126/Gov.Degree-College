'use client'

import { useState, useEffect, useRef, useCallback, memo } from "react";
import TypingIndicator from "@/components/TypingIndicator";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { mergeChatMessages } from "@/lib/chat";

interface ChatMessage {
  _id?: string;
  id?: string;
  sessionId: string;
  sender: "user" | "admin";
  text: string;
  name: string;
  senderDisplayName?: string;
  timestamp: string;
  read: boolean;
  tempId?: string | null;
}

// Session ID generator - uses sessionStorage so it persists during session but clears on browser close
const getSessionId = () => {
  if (typeof window === 'undefined') return 'session_ssr'
  let id = sessionStorage.getItem("chat_session_id");
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("chat_session_id", id);
  }
  return id;
};

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });

const getSenderName = (msg: ChatMessage): string => {
  if (msg.sender === "admin") return "Admin";
  if (msg.sender === "user") return msg.name || "You";
  return "Unknown";
};

const ChatBubble = memo(({ msg }: { msg: ChatMessage }) => (
  <div className={`flex flex-col mb-3 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
    <span className="text-xs text-gray-400 mb-1 px-1">
      {getSenderName(msg)} · {formatTime(msg.timestamp)}
    </span>
    <div
      className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
        msg.sender === "user"
          ? "bg-blue-600 text-white rounded-tr-sm"
          : "bg-gray-100 text-gray-800 rounded-tl-sm"
      }`}
    >
      {msg.text}
    </div>
  </div>
));
ChatBubble.displayName = "ChatBubble";

const LiveChatWidget = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showNameForm, setShowNameForm] = useState(true);
  const [visitorName, setVisitorName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<number | null>(null);
  const fetchingRef = useRef(false);
  const backoffRef = useRef(3000);
  const pausePollingUntil = useRef(0);
  const sessionId = useRef(getSessionId()).current;

  useEffect(() => {
    if (!isOpen || showNameForm) return;

    let isCancelled = false;

    const shouldPoll = () => document.visibilityState === "visible";

    const loadMessages = async () => {
      if (isCancelled) return;
      if (!shouldPoll()) return;
      if (fetchingRef.current) return; // prevent overlapping requests
      if (Date.now() < pausePollingUntil.current) return; // pause polling after send
      fetchingRef.current = true;

      try {
        const controller = new AbortController();
        const response = await fetch(`/api/chat-messages?sessionId=${encodeURIComponent(sessionId)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Failed to load messages");

        const data = await response.json();
        if (Array.isArray(data) && !isCancelled) {
          setMessages((prev) => mergeChatMessages(prev, data));
          setIsConnected(true);
          backoffRef.current = 3000; // reset backoff after success
        }
      } catch (error) {
        console.error(error);
        if (!isCancelled) {
          setIsConnected(false);
          // incremental backoff up to 30s
          backoffRef.current = Math.min(backoffRef.current * 1.5, 30000);
        }
      } finally {
        fetchingRef.current = false;
      }
    };

    const startPolling = () => {
      if (pollingRef.current) return;
      pollingRef.current = window.setInterval(() => {
        loadMessages();
      }, backoffRef.current) as unknown as number;
    };

    const stopPolling = () => {
      if (!pollingRef.current) return;
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadMessages();
        startPolling();
      } else {
        stopPolling();
      }
    };

    // initial fetch + start polling when visible
    loadMessages();
    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isCancelled = true;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isOpen, showNameForm, sessionId]);

  // Auto scroll to bottom with a small delay to ensure DOM is rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!messagesEndRef.current) return;
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, adminTyping]);

  const startChat = useCallback(() => {
    const name = visitorName.trim();
    if (!name) {
      toast({ title: "Error", description: "Please enter your name", variant: "destructive" });
      return;
    }

    setShowNameForm(false);
    setVisitorName(name);
    setIsConnected(true);

    toast({ title: "Chat started", description: "Connected to support" });
  }, [visitorName, sessionId, toast]);

  const sendMessage = useCallback(async () => {
    const text = message.trim();
    if (!text || showNameForm) return;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const optimisticMsg: ChatMessage = {
      _id: tempId,
      sessionId,
      sender: "user",
      text,
      name: visitorName,
      senderDisplayName: visitorName,
      timestamp: new Date().toISOString(),
      read: false,
      tempId,
    };

    setMessages(prev => mergeChatMessages(prev, [optimisticMsg]));
    setMessage("");

    try {
      const response = await fetch(`/api/chat-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          text,
          name: visitorName,
          sender: "user",
          senderDisplayName: visitorName,
          tempId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to send message");

      setMessages(prev => mergeChatMessages(prev, [data]));
      setIsConnected(true);
      pausePollingUntil.current = Date.now() + 2000; // pause polling for 2s to avoid race condition
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      toast({ title: "Message not sent", description: "Please try again", variant: "destructive" });
    }
  }, [message, sessionId, visitorName, showNameForm, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Name collection screen before chat
  if (showNameForm) {
    return (
      <>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
            aria-label="Open live chat"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}

        {isOpen && (
          <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display font-bold text-sm">Live Chat Support</h3>
                <p className="text-xs opacity-80">
                  {isConnected ? "Govt. Graduate College" : "Connecting..."}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-foreground/10 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Name Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              <MessageCircle className="h-12 w-12 text-primary opacity-60" />
              <h4 className="font-display font-bold text-foreground text-lg text-center">Start a conversation</h4>
              <p className="text-muted-foreground text-sm text-center">Enter your name to chat with our support team</p>
              <Input
                placeholder="Your name"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startChat()}
                className="max-w-[240px]"
                autoFocus
              />
              <Button onClick={startChat} className="w-full max-w-[240px]">
                {isConnected ? "Start Chat" : "Connecting..."}
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
          aria-label="Open live chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-display font-bold text-sm">Live Chat Support</h3>
              <p className="text-xs opacity-80">
                {isConnected ? "Govt. Graduate College" : "Connecting..."}
              </p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-foreground/10 rounded">
                <Minimize2 className="h-4 w-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-foreground/10 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 scroll-smooth" style={{ scrollBehavior: "smooth" }}>
            {messages.length === 0 && (
              <p className="text-center text-gray-400 py-4 text-sm">
                Send a message to start the conversation
              </p>
            )}
            {messages.map((msg) => (
              <ChatBubble key={msg._id || msg.id} msg={msg} />
            ))}
            {adminTyping && (
              <div className="mr-auto">
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} className="h-1 shrink-0" />
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-border shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isConnected}
                className="flex-1 text-sm"
              />
              <Button 
                onClick={sendMessage} 
                size="icon" 
                disabled={!message.trim() || !isConnected}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;
