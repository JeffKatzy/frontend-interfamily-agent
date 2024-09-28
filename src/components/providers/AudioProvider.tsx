'use client'
import React, { createContext, useContext } from 'react';
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
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
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
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [transcript, setTranscript] = useState<string | null>(null);
  const handleStream = useChatStream(setMessages)
  
  const startRecognition = async () => {
    if ("webkitSpeechRecognition" in window) {
      const webKitRecognition = new window.webkitSpeechRecognition();
      webKitRecognition.continuous = true;  // Keeps listening until explicitly stopped
      webKitRecognition.interimResults = true;
      webKitRecognition.lang = "en-US";


      webKitRecognition.start();
      setIsRecording(true);
      const transcript = await getTranscript(webKitRecognition);
      setIsRecording(false);
      console.log('really stopping recognition')
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
        console.log(lastResult[0].transcript)
        if (lastResult.isFinal) {
          resolve(lastResult[0].transcript);
        }
      }
    };
  });

  const stopRecognition = () => {
    if (recognition) {
      console.log('stopping recognition')
      recognition.stop();
      setIsRecording(false);
    }
  };


  return (
    <AudioContext.Provider value={{ startRecognition, isRecording, setIsRecording }}>
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