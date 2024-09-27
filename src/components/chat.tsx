'use client';
import Textarea from 'react-textarea-autosize'
import { CIcon } from '@coreui/icons-react';
import { cilMicrophone } from '@coreui/icons';
import { type CoreMessage } from 'ai';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FooterText } from '@/components/footer'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconMic, IconPlus } from '@/components/ui/icons';
import  Link from "next/link";
import { useSpeechRecognition } from '@/lib/hooks/recordAudio';
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { useChat } from './providers/ChatProvider';

import { useRecognition } from './providers/AudioProvider';
import { EmptyScreen } from '@/components/emptyScreen';
import { useAudio } from '@/lib/hooks/getAudioPermissions';

export default function Chat() {
  const { messages, input, setInput, handleSubmit, handleKeyDown } = useChat();
  const { checkWebkitAndMicPermission } = useAudio();
  const { startRecognition, isRecording } = useRecognition();

  useEffect(() => {
    checkWebkitAndMicPermission();
  }, []);

  return (    
    <div className="group w-full overflow-auto ">
      {messages.length <= 0 ? ( 
        <EmptyScreen />  
      ) 
      : (
        <div className="max-w-xl mx-auto mt-10 mb-24">
          {messages.map((message, index) => (
            <div key={index} className="whitespace-pre-wrap flex mb-5">
              <div className={`${message.role === 'user' ? 'bg-slate-200 ml-auto' : 'bg-transparent'} p-2 rounded-lg`}>
              <ReactMarkdown>{message.content as string}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="fixed inset-x-0 bottom-10 w-full ">
      
        <div className="w-full max-w-xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-zinc-100 px-12 sm:rounded-full sm:px-12">  
            <Button variant="outline" size="icon" className="absolute left-4 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4">
            <IconPlus />
              <span className="sr-only">New Chat</span>
            </Button>
            <Button 
              variant="outline" 
              type="button"
              size="icon" 
              className={`absolute right-4 top-[14px] size-10 rounded-full p-0 sm:right-4 ${isRecording ? 'animate-pulse bg-red-500 hover:bg-red-600' : 'bg-violet-500 hover:bg-violet-600'}`}
              title="Click to start voice input"
              onClick={startRecognition}
            >
              <IconMic />
              <span className="sr-only">Start voice input</span>
            </Button>
            
            <Textarea tabIndex={0} placeholder="Send a message."
              className="min-h-[60px] w-full bg-transparent placeholder:text-zinc-900 resize-none px-4 py-[1.3rem] focus-within:outline-none sm:text-sm" autoFocus spellCheck={false} autoComplete="off" autoCorrect="off" name="message" rows={1} value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
          </form>
        </div>
      </div>
      
    </div>
  );
}
