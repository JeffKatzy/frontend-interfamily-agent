import { useCallback } from 'react';

declare global {
    interface Window {
      webkitSpeechRecognition: any;
    }
  }

export function useAudio() {
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
  
    return { webkitAvailable, checkWebkitAndMicPermission, getMicrophonePermission };
}
