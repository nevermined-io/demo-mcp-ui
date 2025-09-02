import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Moon, Sun } from "lucide-react";
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
    <div className="w-64 h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-4 border-b border-sidebar-border/50">
        <Logo />
      </div>
      <div className="p-4 border-b border-sidebar-border/50 flex justify-between items-center">
        <h2 className="font-semibold text-sm">Conversations</h2>
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
                "w-full p-3 rounded-lg flex flex-col items-start gap-1 hover:bg-sidebar-accent transition-colors text-left",
                currentConversationId === conversation.id && "bg-sidebar-accent"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium truncate">
                  {conversation.title}
                </span>
              </div>
              <span className="text-xs text-sidebar-foreground/70 pl-6">
                {format(
                  new Date(conversation.timestamp ?? Date.now()),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-sidebar-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center gap-2 hover:bg-sidebar-accent"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4" />
              <span>Light mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              <span>Dark mode</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
