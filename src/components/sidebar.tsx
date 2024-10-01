'use client'
import { Button } from "@/components/ui/button";
import { IconPlus } from "@/components/ui/icons";
import { useImage } from "@/components/providers/ImageProvider";

import { motion, AnimatePresence } from "framer-motion";
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
  const { images, addAnotherImage } = useImage();
  const handleClick = (e: React.FormEvent) => {
    addAnotherImage(e);
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
          <img src={image.url} alt={image.description} className="p-2"/>
        </motion.div>
      ))}
    </AnimatePresence>
    <div className="flex flex-col">
      <Button variant="outline" size="icon" onClick={handleClick} className="absolute left-4 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4 inset-x-0 bottom-10  mt-auto">
        <IconPlus />
        <span className="sr-only">New Chat</span>
      </Button>
    </div>
    </>
    )
  }