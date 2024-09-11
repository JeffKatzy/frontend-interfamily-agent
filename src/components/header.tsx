import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconSeparator, IconVercel } from '@/components/ui/icons'
import EnvCard from './cards/envcard'
import { Button } from '@/components/ui/button'


export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <Link href="/new" rel="nofollow">
          <img className="size-6" src="/nature.svg" alt="IFS logo" />
        </Link>
        
        <Button variant="link" asChild className="-ml-2">
            <Link href="/">IFS Chatbot</Link>
          </Button>
        </React.Suspense>
      </div>
      <div className="flex items-center justify-end gap-2"></div>
    </header>
  )
}
