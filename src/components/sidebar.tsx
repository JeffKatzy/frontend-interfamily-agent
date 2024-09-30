export default function Sidebar() {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <div className="flex flex-col gap-2 rounded-2xl bg-zinc-50 sm:p-8 p-4 text-sm sm:text-base">
          <h1 className="text-2xl sm:text-3xl tracking-tight font-semibold max-w-fit inline-block">
            IFS Chatbot
          </h1>
          <p className="leading-normal text-zinc-900">
            This is a chatbot that simulates an IFS (Internal Family Systems) session.
          </p>
          
          <p className="leading-normal text-zinc-900">
              As you provide it information, it will guide you through the next steps.
              Feel free to ask it questions along the way.  
          </p>    
          <p className="leading-normal text-zinc-900">
              Start chatting to explore your inner world.
          </p>
        </div>
      </div>
    )
  }