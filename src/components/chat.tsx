'use client';
import ReactMarkdown from 'react-markdown';
import { ChatInput } from './chatInput';
import { useChat } from './providers/ChatProvider';
import { EmptyScreen } from '@/components/emptyScreen';
import { useRef, useEffect } from 'react';

export default function Chat() {
  const { messages } = useChat();
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (    
    <div className="group w-full h-full flex flex-col">
      {messages.length <= 0 ? ( 
        <EmptyScreen />  
      ) 
      : (
        <div ref={messagesContainerRef} className="flex-grow max-w-xl mx-auto overflow-auto w-full">
          {messages.map((message, index) => (
            <div key={index} className="whitespace-pre-wrap mb-5 flex flex-col">
              <div className={`${message.role === 'user' ? 'bg-slate-200 ml-auto' : 'bg-transparent'} p-2 rounded-lg`}>
                <ReactMarkdown>{message.content as string}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
      <ChatInput />     
    </div>
  );
}