import { useState, useCallback, useRef } from "react";


declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

type SpeechRecognition = typeof window.webkitSpeechRecognition;

export const useSpeechRecognition = () => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [transcript, setTranscript] = useState<string | null>(null);
  

  const startRecognition = async () => {
    if ("webkitSpeechRecognition" in window) {
      const webKitRecognition = new window.webkitSpeechRecognition();
      webKitRecognition.lang = "en-US";

      webKitRecognition.start();
      const transcript = await getTranscript(webKitRecognition);
      console.log(transcript);
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

const getAnalyzer = async () => {
    const mediaStream = useRef<MediaStream | null>(null);
    const [volume, setVolume] = useState<number>(0);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        mediaStream.current = stream;
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
    
        updateVolume(analyser, dataArray, bufferLength, setVolume);
        setTimeout(() => {
          if (audioContext) { //recognition
            audioContext.close();
            // setRecognition(null);
          }
        }, 7500);
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
      const stop = () => {
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach((track) => track.stop());
      }
    }
    return { stop }
}


export const updateVolume = (
    analyser: AnalyserNode,
    dataArray: Uint8Array,
    bufferLength: number,
    setVolume: (volume: number) => void
  ) => {
    analyser.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((a, b) => a + b) / bufferLength;
    setVolume(volume);
    requestAnimationFrame(() =>
      updateVolume(analyser, dataArray, bufferLength, setVolume)
    );
  };