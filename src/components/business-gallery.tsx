import Image from "next/image";
import { Camera, Image as ImageIcon, ZoomIn } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { LightboxImage } from "./image-lightbox";

interface BusinessGalleryProps {
  images: LightboxImage[];
  businessName: string;
  onSelectImage: (index: number) => void;
}

export function BusinessGallery({
  images,
  businessName,
  onSelectImage,
}: BusinessGalleryProps) {
  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Camera className="size-6 text-primary" />
          Mga Larawan ng Negosyo
        </h2>
        {images.length > 0 && (
          <span className="text-xs font-medium text-muted-foreground">
            {images.length} {images.length === 1 ? "larawan" : "mga larawan"}
          </span>
        )}
      </div>

      {images.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((image, index) => (
            <Card
              key={index}
              onClick={() => onSelectImage(index)}
              className="group cursor-pointer gap-0 overflow-hidden rounded-xl p-0 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              {image.url ? (
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <Image
                    src={image.url}
                    alt={image.description || businessName}
                    width={640}
                    height={360}
                    unoptimized
                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xs">
                      <ZoomIn className="size-4" /> Lumaki
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 p-4 text-center">
                  <ImageIcon className="mb-2 size-8 text-primary/60" />
                  <p className="line-clamp-2 text-xs font-medium text-muted-foreground">
                    {image.description || businessName}
                  </p>
                </div>
              )}
              {image.description && (
                <div className="border-t border-border/50 p-3">
                  <p className="line-clamp-2 text-xs font-medium text-foreground">{image.description}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <Camera className="mx-auto mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            Wala pang mga opisyal na larawan ang negosyong ito.
          </p>
        </div>
      )}
    </section>
  );
}

