import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/lib/utils'
import { Header } from "@/components/header";
import { ThemeProvider } from 'next-themes';
const inter = Inter({ subsets: ["latin"] });
import { ChatProvider } from '@/components/ChatProvider';


export const metadata = {
  metadataBase: new URL('https://internalfamilysystems.ai'),
  title: {
    default: 'Internal Family Systems Chatbot',
    template: `%s - Internal Family Systems Chatbot`
  },
  description:
    'Internal Family Systems chatbot that conducts IFS sessions.',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/nature-2.png' },
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
          'font-sans antialiased',
          GeistSans.variable,
          GeistMono.variable
        )}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Header />
        <main className="flex h-100vh flex-1 flex-col">
        <ChatProvider>
          {children}
        </ChatProvider>
        </main>
        </ThemeProvider>
      </body>
    </html>
  );
}