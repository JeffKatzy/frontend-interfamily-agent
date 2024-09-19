import { useCallback } from 'react';
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { CoreMessage } from 'ai';

const useChatStream = (setMessages: React.Dispatch<React.SetStateAction<CoreMessage[]>>) => {
  const handleStream = useCallback(async (userInput: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API_URL}/answer`, {
        headers: { 'Content-Type': 'application/json' },
        method: "POST",
        body: JSON.stringify({ message: userInput }),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(response.statusText);
      const reader = response.body?.getReader();
      if (!reader) return;

      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          let data = event.data;
          if (data.includes('[DONE]')) data = data.replace('[DONE]', '');
          
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
        }
      };

      const parser = createParser(onParse);
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        parser.feed(chunk);
      }
    } catch (error) {
      console.error('Error streaming data:', error);
    }
  }, [setMessages]);

  return handleStream;
};

export default useChatStream;