'use client'
import React, { createContext, useContext, useState, useCallback } from 'react';
import { type CoreMessage } from 'ai';
import useChatStream from '@/lib/hooks/useChatStream'

interface ChatContextType {
  messages: CoreMessage[];
  input: string;
  setInput: (input: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<CoreMessage[]>>;
  submitMessage: (e: React.FormEvent) => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const handleStream = useChatStream(setMessages)

  const handleKeyDown = (e: React.KeyboardEvent): Promise<void> => {
    if (e.key === 'Enter') {
      submitMessage(e);
    }
    return Promise.resolve();
  }
  
  const submitMessage = useCallback(async (e: React.FormEvent) => {
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
    <ChatContext.Provider value={{ messages, input, setInput, submitMessage, handleKeyDown, setMessages }}>
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