import { useState, useCallback, useRef } from "react";
import useChatStream from "./useChatStream";
import { useChat } from '@/components/providers/ChatProvider';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

type SpeechRecognition = typeof window.webkitSpeechRecognition;

export const useSpeechRecognition = () => {
  const { setMessages } = useChat();
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

  return { startRecognition, stopRecognition, transcript };
};