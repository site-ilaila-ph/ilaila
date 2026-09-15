import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface LightboxImage {
  url?: string | null;
  description?: string | null;
  source?: string | null;
}

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  image: LightboxImage | null;
  fallbackTitle?: string;
}

export function ImageLightbox({
  isOpen,
  onClose,
  image,
  fallbackTitle = "Larawan",
}: ImageLightboxProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0" showCloseButton>
        <div className="relative flex min-h-[300px] flex-1 items-center justify-center bg-black sm:min-h-[450px]">
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.description || fallbackTitle}
              fill
              unoptimized
              className="object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-white">
              <ImageIcon className="mb-4 size-16 text-muted-foreground" />
              <p className="text-lg font-medium">{image?.description || fallbackTitle}</p>
            </div>
          )}
        </div>
        {image?.description && (
          <div className="border-t border-border p-4 sm:p-6 bg-card">
            <p className="text-sm font-semibold text-foreground sm:text-base">
              {image.description}
            </p>
            {image.source && (
              <p className="mt-1 text-xs text-muted-foreground">
                Pinagmulan: {image.source}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

