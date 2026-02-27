import React from 'react';
import { MoreVertical, Search, Phone } from 'lucide-react';

interface ChatHeaderProps {
  name: string;
  avatar: string;
  status: string;
  isBot?: boolean;
}

export default function ChatHeader({ name, avatar, status, isBot }: ChatHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-tg-border bg-tg-sidebar px-4">
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt={name}
          className="h-10 w-10 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-tg-text">{name}</h2>
          <span className="text-xs text-tg-text-muted">
            {isBot ? 'bot' : status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-full p-2 text-tg-text-muted hover:bg-tg-sidebar-hover transition-colors">
          <Search className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-tg-text-muted hover:bg-tg-sidebar-hover transition-colors">
          <Phone className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-tg-text-muted hover:bg-tg-sidebar-hover transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
