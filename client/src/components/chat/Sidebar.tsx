import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircleMore } from "lucide-react";
import { Conversation } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useChat } from "@/lib/chat-context";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";
import Logo from "./Logo";

interface SidebarProps {
  conversations: Conversation[];
}

/**
 * Sidebar component for displaying conversation history and theme toggle.
 * Shows conversation history regardless of API Key presence.
 * @component
 * @param {SidebarProps} props
 * @returns {JSX.Element}
 */
export default function Sidebar({ conversations }: SidebarProps) {
  const {
    currentConversationId,
    setCurrentConversationId,
    startNewConversation,
  } = useChat();
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-64 h-full flex flex-col bg-white text-sidebar-foreground border-r border-border">
      <div className="p-4 border-b border-border">
        <Logo />
      </div>
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="font-semibold text-sm text-card-foreground flex items-center gap-2">
          <MessageCircleMore className="w-4 h-4" />
          Conversations
        </h2>
        {/**
        <Button
          variant="ghost"
          size="icon"
          onClick={startNewConversation}
          className="h-6 w-6 hover:bg-sidebar-accent"
        >
          <Plus className="h-4 w-4" />
        </Button>
        */}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setCurrentConversationId(conversation.id)}
              className={cn(
                "w-full p-3 rounded-md flex flex-col items-start gap-1 hover:bg-muted transition-colors text-left border border-border bg-white",
                currentConversationId === conversation.id && "bg-muted"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-sm font-medium truncate text-card-foreground max-w-[200px]">
                  {conversation.title}
                </span>
              </div>
              <span className="text-xs text-muted-foreground pl-6">
                {format(
                  new Date(conversation.timestamp ?? Date.now()),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
      {/* Theme toggle removed as requested */}
    </div>
  );
}
