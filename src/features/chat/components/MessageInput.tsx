import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Smile, Mic, Send } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    // Auto-expand
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-tg-bg">
      <div className="flex flex-1 items-end gap-2 rounded-2xl bg-tg-sidebar px-3 py-2 shadow-sm">
        <button className="mb-1 rounded-full p-1 text-tg-text-muted hover:bg-tg-sidebar-hover transition-colors">
          <Smile className="h-6 w-6" />
        </button>
        
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          className="flex-1 resize-none bg-transparent py-1 text-sm text-tg-text outline-none placeholder:text-tg-text-muted max-h-[200px]"
        />

        <button className="mb-1 rounded-full p-1 text-tg-text-muted hover:bg-tg-sidebar-hover transition-colors">
          <Paperclip className="h-6 w-6" />
        </button>
      </div>

      <button
        onClick={handleSend}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200",
          text.trim() 
            ? "bg-tg-accent text-white scale-100" 
            : "bg-tg-sidebar text-tg-text-muted hover:bg-tg-sidebar-hover"
        )}
      >
        {text.trim() ? (
          <Send className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
