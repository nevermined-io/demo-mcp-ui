import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageGridProps {
  images: string[];
  className?: string;
}

export default function ImageGrid({ images, className }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div
        className={cn(
          "grid gap-2 mt-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
          className
        )}
      >
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
          >
            <img
              src={image}
              alt={`Generated image ${index + 1}`}
              className="w-full h-full object-cover max-w-[180px] max-h-[180px] mx-auto"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl w-[90vw] p-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full size view"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
