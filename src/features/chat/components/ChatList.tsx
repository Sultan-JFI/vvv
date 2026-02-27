import React from 'react';
import { cn } from '@/src/lib/utils';

// Dummy Data
const DUMMY_CHATS = [
  {
    id: '1',
    name: 'GPT-4o Agent',
    avatar: 'https://picsum.photos/seed/gpt/100/100',
    lastMessage: 'How can I assist you today with your code?',
    time: '12:45 PM',
    unreadCount: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Claude 3.5 Sonnet',
    avatar: 'https://picsum.photos/seed/claude/100/100',
    lastMessage: 'I have analyzed the architectural patterns you mentioned.',
    time: '10:20 AM',
    unreadCount: 0,
    online: false,
  },
  {
    id: '3',
    name: 'AI Research Group',
    avatar: 'https://picsum.photos/seed/group/100/100',
    lastMessage: 'Llama 3: The benchmarks are looking promising.',
    time: 'Yesterday',
    unreadCount: 15,
    online: true,
    isGroup: true,
  },
  {
    id: '4',
    name: 'Tech Broadcast',
    avatar: 'https://picsum.photos/seed/channel/100/100',
    lastMessage: 'New agent models released on Hugging Face.',
    time: 'Monday',
    unreadCount: 0,
    isChannel: true,
  },
];

export default function ChatList() {
  return (
    <div className="flex flex-col py-2">
      {DUMMY_CHATS.map((chat) => (
        <button
          key={chat.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-tg-sidebar-hover text-left",
            chat.id === '1' && "bg-tg-accent" // Mock active state
          )}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={chat.avatar}
              alt={chat.name}
              className="h-12 w-12 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            {chat.online && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-tg-sidebar bg-emerald-500" />
            )}
          </div>

          {/* Info */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between">
              <h3 className="truncate font-medium text-tg-text">
                {chat.name}
              </h3>
              <span className="text-xs text-tg-text-muted">
                {chat.time}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="truncate text-sm text-tg-text-muted">
                {chat.lastMessage}
              </p>
              {chat.unreadCount > 0 && (
                <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-tg-accent-hover px-1 text-[10px] font-bold text-white">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
