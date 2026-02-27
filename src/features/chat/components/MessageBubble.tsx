import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Message } from '@/src/types';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  status?: 'sent' | 'read';
}

export default function MessageBubble({ message, isUser, status = 'read' }: MessageBubbleProps) {
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn(
      "flex w-full mb-2 px-4 gap-2",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar for Agents in Groups */}
      {!isUser && message.senderAvatar && (
        <div className="flex-shrink-0 self-end mb-1">
          <img 
            src={message.senderAvatar} 
            alt={message.senderName} 
            className="h-8 w-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      
      {/* Placeholder for spacing if no avatar */}
      {!isUser && !message.senderAvatar && <div className="w-8" />}

      <div className={cn(
        "relative max-w-[85%] md:max-w-[70%] rounded-2xl px-3 py-2 shadow-sm",
        isUser 
          ? "bg-tg-bubble-out text-tg-bubble-out-text rounded-tr-none" 
          : "bg-tg-bubble-in text-tg-bubble-in-text rounded-tl-none"
      )}>
        {/* Sender Name for Groups/Channels */}
        {!isUser && message.senderName && (
          <span className="block text-xs font-semibold text-emerald-400 mb-1">
            {message.senderName}
          </span>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none break-words">
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

        {/* Metadata: Time and Ticks */}
        <div className="flex items-center justify-end gap-1 mt-1 ml-4 h-4">
          <span className="text-[10px] opacity-60">
            {time}
          </span>
          {isUser && (
            <span className="opacity-60">
              {status === 'read' ? (
                <CheckCheck className="h-3 w-3 text-emerald-400" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
