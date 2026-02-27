import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChannelPost from './ChannelPost';
import MessageInput from './MessageInput';
import { Message } from '@/src/types';

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I am your AI assistant. How can I help you today?',
    timestamp: Date.now() - 1000 * 60 * 5,
    senderName: 'GPT-4o',
    senderAvatar: 'https://picsum.photos/seed/gpt/100/100',
  },
  {
    id: '2',
    role: 'user',
    content: 'Can you explain how to build a Telegram clone with React?',
    timestamp: Date.now() - 1000 * 60 * 4,
  },
  {
    id: '100',
    role: 'assistant',
    content: '### 🚀 New AI Model Released!\n\nWe are excited to announce the release of **Llama 3.1 405B**. This is the first open-weights model that rivals GPT-4o in performance.\n\nKey features:\n- 128k context window\n- Multilingual support\n- Advanced reasoning capabilities\n\nStay tuned for more updates! #AI #Llama3',
    timestamp: Date.now() - 1000 * 60 * 10,
    senderName: 'TeleGen News',
    views: 1240,
  }
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [chatType, setChatType] = useState<'PRIVATE' | 'GROUP' | 'CHANNEL'>('GROUP');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    if (chatType === 'CHANNEL') return; // Channels are read-only for users

    // In a GROUP, we might want multiple agents to respond
    const agents = chatType === 'GROUP' 
      ? [
          { name: 'Philosopher AI', avatar: 'https://picsum.photos/seed/phil/100/100', model: 'openai/gpt-4o' },
          { name: 'Scientist AI', avatar: 'https://picsum.photos/seed/sci/100/100', model: 'anthropic/claude-3.5-sonnet' }
        ]
      : [{ name: 'GPT-4o', avatar: 'https://picsum.photos/seed/gpt/100/100', model: 'openai/gpt-4o' }];

    for (const agent of agents) {
      const aiMessageId = Math.random().toString(36).substring(7);
      const aiPlaceholder: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        senderName: agent.name,
        senderAvatar: agent.avatar,
      };
      setMessages((prev) => [...prev, aiPlaceholder]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
            provider: 'openrouter',
            modelId: agent.model,
          }),
        });

        if (!response.ok) throw new Error('Failed to connect to AI service');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        if (!reader) throw new Error('No reader available');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const json = JSON.parse(data);
                if (json.error) throw new Error(json.error);
                if (json.content) {
                  accumulatedContent += json.content;
                  setMessages((prev) => 
                    prev.map((m) => 
                      m.id === aiMessageId ? { ...m, content: accumulatedContent } : m
                    )
                  );
                }
              } catch (e) {
                console.error('Error parsing stream chunk', e);
              }
            }
          }
        }
        
        // Advanced: Chain of thought - wait a bit before next agent responds
        if (chatType === 'GROUP') {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error: any) {
        setMessages((prev) => 
          prev.map((m) => 
            m.id === aiMessageId 
              ? { ...m, content: `⚠️ Error: ${error.message}.` } 
              : m
          )
        );
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-tg-bg">
      {/* Header */}
      <ChatHeader
        name={chatType === 'CHANNEL' ? 'TeleGen News' : chatType === 'GROUP' ? 'AI Research Group' : 'GPT-4o Agent'}
        avatar={chatType === 'CHANNEL' ? 'https://picsum.photos/seed/news/100/100' : chatType === 'GROUP' ? 'https://picsum.photos/seed/group/100/100' : 'https://picsum.photos/seed/gpt/100/100'}
        status={chatType === 'CHANNEL' ? '1.2k subscribers' : chatType === 'GROUP' ? '3 agents online' : 'online'}
        isBot={chatType !== 'CHANNEL'}
      />

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar py-4"
        style={{
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundSize: '400px',
          backgroundRepeat: 'repeat',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="mx-auto max-w-3xl">
          {messages.map((msg) => (
            chatType === 'CHANNEL' ? (
              <ChannelPost key={msg.id} message={msg} />
            ) : (
              <MessageBubble
                key={msg.id}
                message={msg}
                isUser={msg.role === 'user'}
              />
            )
          ))}
        </div>
      </div>

      {/* Input Area */}
      {chatType !== 'CHANNEL' && (
        <div className="mx-auto w-full max-w-3xl">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      )}
      
      {chatType === 'CHANNEL' && (
        <div className="flex h-12 items-center justify-center bg-tg-sidebar text-xs text-tg-text-muted">
          Mute
        </div>
      )}
    </div>
  );
}
