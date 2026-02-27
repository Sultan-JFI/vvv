import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Message } from '@/src/types';

interface ChannelPostProps {
  message: Message;
}

export default function ChannelPost({ message }: ChannelPostProps) {
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mx-auto mb-4 max-w-2xl px-4">
      <div className="relative overflow-hidden rounded-2xl bg-tg-sidebar shadow-md">
        {/* Channel Name Header (Optional for posts) */}
        <div className="flex items-center gap-2 px-4 pt-3">
          <span className="text-sm font-bold text-tg-accent-hover">
            {message.senderName || 'TeleGen Channel'}
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none break-words px-4 py-2">
          <ReactMarkdown
            components={{
              pre: ({ node, ...props }) => (
                <pre className="bg-black/30 rounded p-2 overflow-x-auto my-1" {...props} />
              ),
              code: ({ node, ...props }) => (
                <code className="bg-black/20 rounded px-1" {...props} />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Footer: Views, Reactions, Time */}
        <div className="flex items-center justify-between border-t border-tg-border/30 bg-black/10 px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-tg-text-muted">
              <Eye className="h-4 w-4" />
              <span className="text-xs">{message.views || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-tg-text-muted hover:text-red-400 cursor-pointer transition-colors">
              <Heart className="h-4 w-4" />
              <span className="text-xs">12</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <span className="text-[10px] text-tg-text-muted">
              {time}
            </span>
            <Share2 className="h-4 w-4 text-tg-text-muted cursor-pointer hover:text-tg-text transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
