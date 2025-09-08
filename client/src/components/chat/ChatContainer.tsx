import { useChat } from "@/lib/chat-context";
import type { FullMessage } from "@/lib/chat-types";
import MessageGroup from "./MessageGroup";
import ChatInput from "./ChatInput";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Sidebar from "./Sidebar";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Footer from "./Footer";
import Logo from "./Logo";
import { Badge } from "@/components/ui/badge";
import { useUserState } from "@/lib/user-state-context";
import SettingsModal from "@/components/ui/settings-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ChatContainer() {
  const { messages, conversations, clearHistory } = useChat();
  const isEmpty = messages.length === 0;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    credits,
    apiKey,
    refreshCredits,
    initialized,
    setApiKey,
    setCredits,
  } = useUserState();
  const loading = credits === null;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const hasApiKey = !!apiKey;

  // Removed auto-open settings modal on missing API Key

  const handleFinishTyping = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Set initial sidebar state based on screen width
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setSidebarOpen(!isMobile);
  }, []);

  // Group messages by type sequences
  const messageGroups = messages.reduce((groups: FullMessage[][], message) => {
    const lastGroup = groups[groups.length - 1];

    if (
      lastGroup &&
      lastGroup[0].type === message.type &&
      !lastGroup[0].isUser &&
      !message.isUser
    ) {
      lastGroup.push(message);
    } else {
      groups.push([message]);
    }

    return groups;
  }, []);

  /**
   * Logs out the user by clearing all localStorage data and resetting app state.
   * - Removes all persisted keys (API key, theme, chat data, pending actions, etc.)
   * - Resets in-memory user state and chat state
   * - Opens the settings modal to prompt reconfiguration
   * @returns {void}
   */
  const handleLogout = (): void => {
    try {
      localStorage.clear();
    } catch {}
    try {
      setApiKey("");
      setCredits(null);
    } catch {}
    try {
      clearHistory();
    } catch {}
    setSettingsOpen(false);
    refreshCredits();
  };

  if (!initialized) return null;

  return (
    <div className="flex min-h-screen bg-white text-foreground">
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About the Weather Agent</DialogTitle>
            <DialogDescription>
              Welcome to the Nevermined Weather Agent.
              <br />
              <br />
              <b>What can you do here?</b>
              <br />
              This AI provides real-time weather data, short/medium-range
              forecasts, alerts and safety guidance, and practical
              recommendations for travel and outdoor activities. Ask about
              current conditions, rain probability, wind, temperatures, and
              severe weather.
              <br />
              <br />
              <b>How does the API Key work?</b>
              <br />
              To use the system, you need a Nevermined API Key. You can
              configure it from the user menu (Settings/Login). The API Key is
              stored only in your browser and is used to authenticate all
              requests.
              <br />
              <br />
              <b>What are credits?</b>
              <br />
              Each weather query consumes credits from your Nevermined account.
              You can see your current credits at the top. If you run out of
              credits, you can purchase more directly from the chat.
              <br />
              <br />
              <b>Important Disclaimer</b>
              <br />
              This AI provides general weather information and advice. For
              emergencies or life‑threatening conditions, always follow official
              alerts and instructions from local authorities.
              <br />
              <br />
              <b>Privacy</b>
              <br />
              Your API Key is never sent to third parties; it is only used to
              authenticate you with Nevermined.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setHelpOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SettingsModal
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          refreshCredits();
        }}
        onApiKeySaved={refreshCredits}
      />
      {/* Sidebar */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out h-[calc(100vh-48px)]",
          sidebarOpen ? "w-full md:w-64" : "w-0",
          "fixed md:relative z-40"
        )}
      >
        {sidebarOpen && (
          <div className="h-full relative">
            <Sidebar conversations={conversations} />
            <Separator
              orientation="vertical"
              className="absolute right-0 top-0 h-full opacity-50 hidden md:block"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 md:right-2 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col h-[calc(100vh-48px)] main-content",
          "transition-all duration-300 ease-in-out",
          !sidebarOpen ? "w-full" : "hidden md:flex md:w-[calc(100%-16rem)]"
        )}
      >
        <div className="p-4 flex items-center justify-between bg-white border-b border-border">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="mr-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            <div className="text-lg font-semibold" style={{ color: "#0D3F48" }}>
              Weather Agent
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Available credit badge (only when logged in) */}
            {hasApiKey && (
              <Badge
                variant="secondary"
                className={
                  loading
                    ? "min-w-[60px] justify-center text-gray-400"
                    : credits === 0
                    ? "min-w-[60px] justify-center text-foreground"
                    : "min-w-[60px] justify-center text-foreground"
                }
                style={{
                  backgroundColor: credits === 0 ? "#FECACA" : "#D4F4EE",
                  color: "#18181B",
                }}
              >
                {loading ? "..." : `${credits} credits`}
              </Badge>
            )}
            {!sidebarOpen && <Logo />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer border-2 border-primary/10 hover:border-primary/20 transition-colors">
                  <AvatarFallback className="bg-primary/5">
                    <Settings className="h-4 w-4 text-primary/70" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setHelpOpen(true)}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {hasApiKey ? (
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="cursor-pointer text-primary focus:text-primary"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Login
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative bg-white text-foreground">
          {!isEmpty && (
            <div className="h-full">
              <div className="h-full px-4 overflow-y-auto">
                <div className="space-y-4 pb-12">
                  {messageGroups.map((group, index) => (
                    <MessageGroup
                      key={index}
                      messages={group}
                      isFirstGroup={index === 0}
                      onFinishTyping={handleFinishTyping}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={cn("", isEmpty ? "" : "bg-sidebar p-0")}>
          <ChatInput disabled={false} />
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Footer />
      </div>
    </div>
  );
}
