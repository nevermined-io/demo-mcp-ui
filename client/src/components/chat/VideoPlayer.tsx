import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export default function VideoPlayer({ src, className }: VideoPlayerProps) {
  return (
    <video
      controls
      className={cn("w-full max-w-md mx-auto rounded-lg mt-4", className)}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
