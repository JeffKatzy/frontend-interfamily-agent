'use server';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Weather } from '@/components/weather';
import { generateText } from 'ai';
import { createStreamableUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { z } from 'zod';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  display?: ReactNode;
}

export const runThread = async () => {
  let text = 'thread.init'
  const streamableStatus = createStreamableValue();

  setTimeout(() => {
    streamableStatus.update('thread.init thread.run.create');
    streamableStatus.update('thread.init thread.run.create thread.run.update');
    streamableStatus.update('thread.init thread.run.create thread.run.update thread.run.end');
    streamableStatus.done('thread.init thread.run.create thread.run.update thread.run.end');
  }, 1000);

  return {
    status: streamableStatus.value,
  };
};

// Streaming Chat 
export async function continueTextConversation(messages: CoreMessage[]) {
  let text = '';
  const stream = createStreamableValue(text);
  try {
    const response = await fetch("http://127.0.0.1:5000/answer", {
        headers: {
          "Content-Type": "text/event-stream",
        },
        method: "GET",
        cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = response.body;
  if (!data) {
    return stream.value;
  }
  const reader = response.body?.getReader();
  
  const onParse = (event: ParsedEvent | ReconnectInterval) => {
    if (event.type === "event") {
      const data = event.data;
      stream.update(data);
    }
  };
  
  const parser = createParser(onParse);

  if (reader) {
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        stream.done(text);
        break;
      }
      const chunk = decoder.decode(value, { stream: true })
      parser.feed(chunk);
    }
  }
  } catch (error) {
    console.error('Error streaming data:', error)
  }

  return stream.value
}

const startStreaming = async () => {
  let text = '';
  const stream = createStreamableValue('');
  try {
    const response = await fetch("http://127.0.0.1:5000/answer", {
        headers: {
          "Content-Type": "text/event-stream",
        },
        method: "GET",
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
      const data = event.data;
      try {
        console.log(stream.value + data);
        stream.update(stream.value + data);
        
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
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      parser.feed(chunk);
    }
  }
} catch (error) {
  console.error('Error streaming data:', error)
}
  
  return text;
  
}


// Gen UIs 
export async function continueConversation(history: Message[]) {
  const stream = createStreamableUI();

  const { text, toolResults } = await generateText({
    model: openai('gpt-3.5-turbo'),
    system: 'You are a friendly weather assistant!',
    messages: history,
    tools: {
      showWeather: {
        description: 'Show the weather for a given location.',
        parameters: z.object({
          city: z.string().describe('The city to show the weather for.'),
          unit: z
            .enum(['F'])
            .describe('The unit to display the temperature in'),
        }),
        execute: async ({ city, unit }) => {
          stream.done(<Weather city={city} unit={unit} />);
          return `Here's the weather for ${city}!`; 
        },
      },
    },
  });

  return {
    messages: [
      ...history,
      {
        role: 'assistant' as const,
        content:
          text || toolResults.map(toolResult => toolResult.result).join(),
        display: stream.value,
      },
    ],
  };
}

// Utils
export async function checkAIAvailability() {
  const envVarExists = !!process.env.OPENAI_API_KEY;
  return envVarExists;
}