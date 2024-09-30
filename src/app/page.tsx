import Chat from "@/components/chat";
import Sidebar from "@/components/sidebar";

export default function Home() {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden pb-10">
      <div className="flex flex-row w-full">
        <div className="w-1/4">
          <Sidebar />
        </div>
        <div className="flex-1">
          <Chat />
        </div>
      </div>
    </div>
  );
}
