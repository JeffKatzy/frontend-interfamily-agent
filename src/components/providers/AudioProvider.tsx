'use client'
import React, { createContext, useContext, useCallback } from 'react';
import { useState, useRef } from "react";
import useChatStream from "../../../src/lib/hooks/useChatStream";
import { useChat } from '@/components/providers/ChatProvider';
import { type CoreMessage } from 'ai';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface AudioContextType {
  startRecognition: () => Promise<void>;
}

interface SpeechRecognition {
  // Define the properties and methods you need
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  lang: string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { messages, setMessages } = useChat();
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [transcript, setTranscript] = useState<string | null>(null);
  const handleStream = useChatStream(setMessages)
  
  const startRecognition = async () => {
    if ("webkitSpeechRecognition" in window) {
      const webKitRecognition = new window.webkitSpeechRecognition();
      webKitRecognition.lang = "en-US";

      webKitRecognition.start();
      const transcript = await getTranscript(webKitRecognition);
      const newMessages: CoreMessage[] = [
        ...messages,
        { content: transcript, role: 'user' },
      ];
      setMessages(newMessages);

      await handleStream(transcript)
    }
  }

  const getTranscript = (webKitRecognition: SpeechRecognition) => new Promise<string>((resolve) => {
    webKitRecognition.onresult = (event: any) => {
      if (event.results.length > 0) {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          resolve(lastResult[0].transcript);
        }
      }
    };
  });

  const stopRecognition = () => {
    if (recognition) {
      recognition.stop();
    }
  };


  return (
    <AudioContext.Provider value={{ startRecognition }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useRecognition = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};