'use client'
import React, { createContext, useContext, useCallback } from 'react';


interface AudioContextType {
  checkWebkitAndMicPermission: () => Promise<string>;
  getMicrophonePermission: () => Promise<string>;
  webkitAvailable: () => boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const webkitAvailable = () => {
    return "webkitSpeechRecognition" in window;
}
  const getMicrophonePermission = async () => {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return "Microphone permission has been given.";
    } catch (error) {
        console.error("Microphone permission has not been given:", error);
        return "Microphone permission has not been given:";
    }
}
  const checkWebkitAndMicPermission = useCallback(async () => {
    if (webkitAvailable()) {
      return getMicrophonePermission();
    } else {
    return "Web Speech Recognition API is not available.";
  }
}, []);

  return (
    <AudioContext.Provider value={{ webkitAvailable, getMicrophonePermission, checkWebkitAndMicPermission }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};