'use client';
import ReactMarkdown from 'react-markdown';
import { ChatInput } from './chatInput';
import { useChat } from './providers/ChatProvider';
import { EmptyScreen } from '@/components/emptyScreen';


export default function Chat() {
  const { messages } = useChat();

  return (    
    <div className="group w-full overflow-auto h-full flex flex-col">
      {messages.length <= 0 ? ( 
        <EmptyScreen />  
      ) 
      : (
        <div className="max-w-xl mx-auto w-full">
          {messages.map((message, index) => (
            <div key={index} className="whitespace-pre-wrap mb-5 flex flex-col">
              <div className={`${message.role === 'user' ? 'bg-slate-200 ml-auto' : 'bg-transparent'} p-2 rounded-lg`}>
              <ReactMarkdown>{message.content as string}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
      <ChatInput />     
    </div>
  );
}