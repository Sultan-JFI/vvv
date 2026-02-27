import React from 'react';
import { Menu, Search } from 'lucide-react';
import ChatList from './ChatList';

export default function Sidebar() {
  return (
    <div className="flex h-full flex-col">
      {/* Sidebar Header */}
      <div className="flex items-center gap-4 p-4 pb-2">
        <button className="rounded-full p-2 hover:bg-tg-sidebar-hover transition-colors">
          <Menu className="h-6 w-6 text-tg-text-muted" />
        </button>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-tg-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-full bg-tg-bg py-2 pl-10 pr-4 text-sm text-tg-text outline-none placeholder:text-tg-text-muted focus:ring-2 focus:ring-tg-accent/50 transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ChatList />
      </div>
    </div>
  );
}
