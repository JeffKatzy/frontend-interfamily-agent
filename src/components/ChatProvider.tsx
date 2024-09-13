'use client'
import React, { createContext, useContext, useState, useCallback } from 'react';
import { type CoreMessage } from 'ai';
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

interface ChatContextType {
  messages: CoreMessage[];
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState<string>('');
  

  const handleKeyDown = (e: React.KeyboardEvent): Promise<void> => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
    return Promise.resolve();
  }
  const handleStream = useCallback(async (userInput: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API_URL}/answer`, {
        headers: { 'Content-Type': 'application/json' },
        method: "POST",
        body: JSON.stringify({ message: userInput }),
        cache: "no-store",
      });

      if (!response.ok) throw new Error(response.statusText);
      const reader = response.body?.getReader();
      if (!reader) return;

      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          let data = event.data;
          if (data.includes('[DONE]')) data = data.replace('[DONE]', '');
          
          setMessages(prevMessages => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              const updatedMessages = [...prevMessages];
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + data,
              };
              return updatedMessages;
            } else {
              return [...prevMessages, { role: 'assistant', content: data }];
            }
          });
        }
      };

      const parser = createParser(onParse);
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        parser.feed(chunk);
      }
    } catch (error) {
      console.error('Error streaming data:', error);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const newMessages: CoreMessage[] = [
      ...messages,
      { content: input, role: 'user' },
    ];
    setMessages(newMessages);
    const userInput = input;
    setInput('');
    await handleStream(userInput);
  }, [input, messages, handleStream]);

  return (
    <ChatContext.Provider value={{ messages, input, setInput, handleSubmit, handleKeyDown }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};