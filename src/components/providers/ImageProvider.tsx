'use client'
import React, { createContext, useContext, useState, useCallback } from 'react';
import useChatStream from '@/lib/hooks/useChatStream'

interface CoreImage {
    url: string;
    description: string;
}

interface ImageContextType {
    images: CoreImage[]; 
    addImage: (e: React.FormEvent) => Promise<void>;
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

  const addImage = useCallback(async (e: React.FormEvent) => {
    const newImages: CoreImage[] = [
      ...images,
      { url: '', description: '' },
    ];
    const newImage: CoreImage | undefined = await generateImage()
    console.log('newImage', newImage)
    if (newImage) {
      setImages(prevImages => {
        const lastImage = prevImages[prevImages.length - 1];
        const updatedImages = [...prevImages];
        updatedImages[updatedImages.length - 1] = {
            ...lastImage,
            url: newImage.url,
            description: newImage.description
        };
          return updatedImages
      });
    }
  }, [images]);

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
    <ImageContext.Provider value={{ images, addImage, addAnotherImage, setImages }}>
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