import { describe, expect, it } from 'vitest';
import { mergeChatMessages, normalizeAdminChatConversations } from './chat';

describe('mergeChatMessages', () => {
  it('keeps the newest message data and avoids duplicate entries', () => {
    const existing = [
      {
        _id: 'msg-1',
        sessionId: 'session-1',
        sender: 'user' as const,
        text: 'Hello',
        name: 'Visitor',
        timestamp: '2024-01-01T00:00:00.000Z',
        read: false,
      },
    ];

    const incoming = [
      {
        _id: 'msg-1',
        sessionId: 'session-1',
        sender: 'user' as const,
        text: 'Hello there',
        name: 'Visitor',
        timestamp: '2024-01-01T00:01:00.000Z',
        read: false,
      },
      {
        _id: 'msg-2',
        sessionId: 'session-1',
        sender: 'admin' as const,
        text: 'Welcome',
        name: 'Admin',
        timestamp: '2024-01-01T00:02:00.000Z',
        read: true,
      },
    ];

    expect(mergeChatMessages(existing, incoming)).toEqual(incoming);
  });
});

describe('normalizeAdminChatConversations', () => {
  it('maps backend grouped chat payloads into the admin conversation shape', () => {
    const conversations = normalizeAdminChatConversations([
      {
        _id: 'session-1',
        lastMessage: {
          sessionId: 'session-1',
          sender: 'user' as const,
          text: 'Hello',
          name: 'Visitor',
          timestamp: '2024-01-01T00:00:00.000Z',
          read: false,
        },
        messages: [
          {
            sessionId: 'session-1',
            sender: 'user' as const,
            text: 'Hello',
            name: 'Visitor',
            timestamp: '2024-01-01T00:00:00.000Z',
            read: false,
          },
        ],
        unreadCount: 1,
        visitorName: 'Visitor',
      },
    ]);

    expect(conversations).toEqual([
      {
        sessionId: 'session-1',
        messages: [
          {
            sessionId: 'session-1',
            sender: 'user',
            text: 'Hello',
            name: 'Visitor',
            timestamp: '2024-01-01T00:00:00.000Z',
            read: false,
          },
        ],
        lastMessage: {
          sessionId: 'session-1',
          sender: 'user',
          text: 'Hello',
          name: 'Visitor',
          timestamp: '2024-01-01T00:00:00.000Z',
          read: false,
        },
        unreadCount: 1,
        visitorName: 'Visitor',
      },
    ]);
  });
});
