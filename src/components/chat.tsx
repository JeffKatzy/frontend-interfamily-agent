'use client';

import { Card } from "@/components/ui/card"
import { type CoreMessage } from 'ai';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconArrowUp } from '@/components/ui/icons';
import  Link from "next/link";
import AboutCard from "@/components/cards/aboutcard";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState<string>('');  

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newMessages: CoreMessage[] = [
      ...messages,
      { content: input, role: 'user' },
    ];
    setMessages(newMessages);
    let userInput = input;
    setInput('');
    
    handleStream(userInput);
  }

  const handleStream = async (userInput: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API_URL}/answer`, {
            headers: {
              'Content-Type': 'application/json',
            },
            method: "POST",
            body: JSON.stringify({message: userInput }),
            cache: "no-store",
      });
      const reader = response.body?.getReader();
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = response.body;
      if (!data) {
        return;
      }
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          let data = event.data;
          if (data.includes('[DONE]')) {
            data = data.replace('[DONE]', '');
          }
          try {
            setMessages(prevMessages => {
              const lastMessage = prevMessages[prevMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + data,
                };
                return updatedMessages;
              } else {
                return [...prevMessages, { role: 'assistant', content: data }];
              }
            });
            
          } catch (e) {
            console.error(e);
          }
        }
      };
      const parser = createParser(onParse);
      if (reader) {
        const decoder = new TextDecoder()
        
        while (true) {
          const { done, value } = await reader.read()
          const chunk = decoder.decode(value, { stream: true })
          if (done) {
            break;
          }
          parser.feed(chunk);
        }
      }
    } catch (error) {
      console.error('Error streaming data:', error)
    } finally {
      return; //update this setIsStreaming(false)
    }
  }
  
  return (    
    <div className="group w-full overflow-auto ">
      {messages.length <= 0 ? ( 
        <AboutCard />  
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
          <Card className="p-2">
            <form onSubmit={handleSubmit}>
              <div className="flex">
                <Input
                  type="text"
                  value={input}
                  onChange={event => {
                    setInput(event.target.value);
                  }}
                  className="w-[95%] mr-2 border-0 ring-offset-0 focus-visible:ring-0 focus-visible:outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:border-none border-transparent focus:border-transparent focus-visible:ring-none"
                  placeholder='Ask me anything...'
                />
                <Button disabled={!input.trim()}>
                  <IconArrowUp />
                </Button>
              </div>
              {messages.length > 1 && (
                <div className="text-center">
                  <Link href="/genui" className="text-xs text-blue-400">Try GenUI and streaming components &rarr;</Link>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
