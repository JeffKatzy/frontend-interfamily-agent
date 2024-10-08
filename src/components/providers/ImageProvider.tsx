'use client'
import React, { createContext, useContext, useState, useCallback } from 'react';
import useChatStream from '@/lib/hooks/useChatStream'

interface CoreImage {
    url: string;
    description: string;
}

interface ImageContextType {
    images: CoreImage[]; 
    addAnotherImage: (e: React.FormEvent) => Promise<void>;
    setImages: React.Dispatch<React.SetStateAction<CoreImage[]>>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<CoreImage[]>([]);

  const addAnotherImage = useCallback(async (e: React.FormEvent) => {
    const newImage: CoreImage | undefined = await generateImage()
    if (newImage) {
      setImages(prevImages => [...prevImages, newImage]);
    }
  }, []);

  

  const generateImage = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API_URL}/generate-image`, {
        headers: { 'Content-Type': 'application/json' },
        method: "POST",
        cache: "no-store",
      });
      const data = await response.json();
      const url = `data:image/png;base64,${data.image}`;
      if (!response.ok) throw new Error(response.statusText);
      return { url, description: data.description }
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }, []);

  return (
    <ImageContext.Provider value={{ images, addAnotherImage, setImages }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImage must be used within a ImageProvider');
  }
  return context;
};