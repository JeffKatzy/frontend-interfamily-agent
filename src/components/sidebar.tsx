'use client'
import { Button } from "@/components/ui/button";
import { IconPlus } from "@/components/ui/icons";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
interface CoreImage {
  url: string;
  description: string;
}

interface ImageContextType {
  images: CoreImage[]; 
  addImage: (e: React.FormEvent) => Promise<void>;
  setImages: React.Dispatch<React.SetStateAction<CoreImage[]>>;
}

export default function Sidebar() {
  const [images, setImages] = useState<CoreImage[]>([]);
  

  useEffect(() => {
    streamImages();
  }, []);

  const streamImages = () => {
    let userId = sessionStorage.getItem('userId');
    let sessionId = sessionStorage.getItem('sessionId');
    if (!userId || !sessionId) {
      const sessionId = uuidv4();
      const userId = uuidv4();
      sessionStorage.setItem('userId', userId);
      sessionStorage.setItem('sessionId', sessionId);
      console.log('userId', userId)
      console.log('sessionId', sessionId)
    }
    const eventSource = new EventSource(`http://localhost:8000/events?user_id=${userId}&session_id=${sessionId}`);

    eventSource.onmessage = (event) => {
      if (event.data === 'keep-alive') {
        console.log('Received keep-alive message');
        return;
      }
      const image = JSON.parse(event.data);
      const url = `data:image/png;base64,${image.image}`;
      setImages((images) => [...images, { url, description: image.description }]);
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection failed:', error);
    };

    return () => {
      eventSource.close();
    };
  }

  return (<>
  <AnimatePresence>
      {images.map((image, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <img src={image.url} alt={image.description} className="p-2 w-full h-auto object-contain"/>
        </motion.div>
      ))}
    </AnimatePresence>
    
    </>
    )
  }