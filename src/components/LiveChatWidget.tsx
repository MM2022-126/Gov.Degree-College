import { useState, useEffect, useRef, useCallback, memo } from "react";
import { getSocket } from "@/lib/socket-client";
import TypingIndicator from "@/components/TypingIndicator";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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
}

// Session ID generator - uses sessionStorage so it persists during session but clears on browser close
const getSessionId = () => {
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
  const sessionId = useRef(getSessionId()).current;
  const socketRef = useRef(getSocket());

  // Socket event handlers - remove listeners first to prevent duplicates
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Remove any existing listeners FIRST (prevents duplicates on re-mount/re-render)
    socket.off("connect");
    socket.off("disconnect");
    socket.off("message_received");
    socket.off("reply_sent");
    socket.off("admin_typing");

    // Register listeners ONCE
    socket.on("connect", () => {
      setIsConnected(true);
      // DEBUG: Chat connected
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      // DEBUG: Chat disconnected
    });

    // Receive messages from server - handles both optimistic replacements and new messages
    const handleMessageReceived = (msg: ChatMessage) => {
      setMessages((prev) => {
        // CRITICAL: Check for duplicates by _id and tempId before adding
        const exists = prev.some(m => 
          m._id === msg._id || 
          (m._id?.startsWith('temp_') && m._id === msg._id) ||
          (msg.tempId && m._id?.startsWith('temp_') && prev.some(tm => tm._id?.includes(msg.tempId!)))
        );
        
        if (exists) {
          // Replace optimistic message with server-confirmed one
          return prev.map(m => {
            if (m._id?.startsWith('temp_') && msg.tempId && m._id?.includes(msg.tempId)) {
              return msg;
            }
            if (m._id === msg._id) {
              return msg;
            }
            return m;
          });
        }
        return [...prev, msg];
      });
    };

    socket.on("message_received", handleMessageReceived);

    // Receive admin replies
    socket.on("reply_sent", (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("admin_typing", ({ isTyping }: { isTyping: boolean }) => {
      setAdminTyping(isTyping);
    });

    return () => {
      socket.off("message_received", handleMessageReceived);
      socket.off("reply_sent");
      socket.off("admin_typing");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  // Join room on mount (for receiving messages in this session)
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && sessionId && showNameForm === false) {
      socket.emit("join_room", sessionId);
    }
  }, [sessionId, showNameForm]);

  // Load message history when chat opens
  useEffect(() => {
    if (isOpen && showNameForm === false) {
      fetch(`${import.meta.env.VITE_API_URL}/chat-messages?sessionId=${sessionId}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMessages(data);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, showNameForm, sessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, adminTyping]);

  const startChat = useCallback(() => {
    const name = visitorName.trim();
    if (!name) {
      toast({ title: "Error", description: "Please enter your name", variant: "destructive" });
      return;
    }

    setShowNameForm(false);
    setVisitorName(name);
    
    // Join the room
    const socket = socketRef.current;
    if (socket) {
      socket.emit("join_room", sessionId);
    }

    toast({ title: "Chat started", description: "Connected to support" });
  }, [visitorName, sessionId, toast]);

  const sendMessage = useCallback(() => {
    const text = message.trim();
    if (!text) return;

    const socket = socketRef.current;
    if (!socket || showNameForm) return;

    // Generate unique tempId for optimistic message deduplication
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Optimistic UI - show message immediately with tempId
    const optimisticMsg: ChatMessage = {
      _id: tempId,
      sessionId,
      sender: "user",
      text,
      name: visitorName,
      senderDisplayName: visitorName,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setMessage("");

    // Emit to server — include tempId so server echoes it back
    socket.emit("user_message", {
      sessionId,
      text,
      name: visitorName,
      sender: "user",
      tempId  // Server must include this in the saved document and broadcast
    });
  }, [message, sessionId, visitorName, showNameForm]);

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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
            <div ref={messagesEndRef} />
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
