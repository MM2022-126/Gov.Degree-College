// Socket.io client stub for serverless deployments
// Replaces real socket connections with no-op implementations so the app
// relies on REST polling when deployed to Vercel-only environments.

export const getSocket = () => {
  console.debug('[socket-client] stub getSocket called');
  return null as any;
};

export const joinConversation = (_conversationId: string) => {
  console.debug('[socket-client] joinConversation (stub)');
};

export const leaveConversation = (_conversationId: string) => {
  console.debug('[socket-client] leaveConversation (stub)');
};

export const sendMessage = (_conversationId: string, _message: string, _senderType: 'visitor' | 'admin', _senderName: string) => {
  console.debug('[socket-client] sendMessage (stub)');
};

export const sendTyping = (_conversationId: string, _isTyping: boolean, _sender: 'visitor' | 'admin') => {
  /* no-op */
};

export const markAsRead = (_conversationId: string, _messageIds: string[]) => {
  /* no-op */
};

export const onNewMessage = (callback: (message: any) => void) => {
  console.debug('[socket-client] onNewMessage (stub)');
  return () => {};
};

export const onUserTyping = (callback: (data: any) => void) => {
  console.debug('[socket-client] onUserTyping (stub)');
  return () => {};
};

export const onMessagesRead = (callback: (data: any) => void) => {
  console.debug('[socket-client] onMessagesRead (stub)');
  return () => {};
};

export const onConversationUpdated = (callback: (data: any) => void) => {
  console.debug('[socket-client] onConversationUpdated (stub)');
  return () => {};
};

export const disconnectSocket = () => {
  console.debug('[socket-client] disconnectSocket (stub)');
};
