import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useChat } from "@/lib/chat-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Chat input component for sending messages.
 * @component
 * @param {boolean} disabled - Whether the input is disabled
 * @returns {JSX.Element}
 */
export default function ChatInput({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");
  const { sendMessage, messages } = useChat();

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      sendMessage(input);
      setInput("");
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <motion.div
      initial={isEmpty ? { y: 0 } : false}
      animate={{ y: 0 }}
      className={cn(
        "p-4 bg-muted/80",
        isEmpty ? "h-[calc(100vh-64px)] flex flex-col justify-center" : ""
      )}
    >
      <div className="relative w-full max-w-2xl mx-auto">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            disabled
              ? "Enter your API Key in settings to start..."
              : "Type your message..."
          }
          className="resize-none pr-12 bg-sidebar text-muted-foreground border-input"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={disabled}
        />
        <Button
          onClick={handleSubmit}
          size="icon"
          variant="ghost"
          className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-background/50"
          disabled={disabled || !input.trim()}
        >
          <Send className="w-4 h-4" style={{ color: "#277577" }} />
        </Button>
      </div>
      {isEmpty && (
        <div className="mt-4 text-center w-full max-w-2xl mx-auto">
          <p className="text-xs text-muted-foreground">
            Ask me about cryptocurrency prices, stock market analysis,
            investment opportunities, or any financial advice you need.
          </p>
        </div>
      )}
    </motion.div>
  );
}
