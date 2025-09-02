import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export default function AudioPlayer({ src, className }: AudioPlayerProps) {
  return (
    <audio 
      controls
      className={cn("w-full mt-4", className)}
    >
      <source src={src} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}
