import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Message } from "@shared/schema";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [displayText, setDisplayText] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const words = message.content.split(" ");

  // Function to convert URLs in text to clickable links
  const createClickableLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        let target: undefined | string = "_blank";
        try {
          const u = new URL(part);
          if (
            u.hostname.endsWith("nevermined.dev") ||
            u.hostname.endsWith("nevermined.app")
          ) {
            target = undefined;
          }
        } catch {}
        return (
          <a
            key={index}
            href={part}
            target={target}
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    if (!message.isUser) {
      let currentWordIndex = 0;
      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          setDisplayText(words.slice(0, currentWordIndex + 1).join(" "));
          currentWordIndex++;
        } else {
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    } else {
      setDisplayText(message.content);
    }
  }, [message.content]);

  if (isCollapsed && !message.isUser && message.type === "reasoning") {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => setIsCollapsed(false)}
      >
        <ChevronDown className="w-4 h-4" />
        Show reasoning
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "max-w-[80%] rounded-lg p-4",
        message.isUser
          ? "ml-auto bg-primary text-primary-foreground"
          : "mr-auto",
        !message.isUser && message.type === "reasoning"
          ? "bg-muted text-muted-foreground"
          : !message.isUser && message.type === "answer"
          ? "bg-card text-card-foreground"
          : !message.isUser && message.type === "notice"
          ? "bg-white/60 text-foreground border border-border backdrop-blur"
          : ""
      )}
    >
      {!message.isUser && message.type === "reasoning" && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -mt-2 -ml-2 hover:bg-transparent"
          onClick={() => setIsCollapsed(true)}
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      )}
      <div>{createClickableLinks(displayText)}</div>
    </motion.div>
  );
}
