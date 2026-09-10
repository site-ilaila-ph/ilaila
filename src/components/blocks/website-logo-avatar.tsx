import icon from "@/icon.svg";
import Image from "next/image";

interface WebsiteLogoProps extends Omit<
  React.ComponentProps<typeof Image>,
  "src" | "alt"
> {
  /** internal radius — border-radius applied to the icon itself */
  ir: number;
  /** padding radius — border-radius applied to the wrapping container */
  pr?: number;
  alt?: string;
  containerClassName?: string;
}

function WebsiteLogoAvatar({
  alt = "Website logo",
  ir,
  pr,
  className,
  containerClassName,
  style,
  ...props
}: WebsiteLogoProps) {
  return (
    <div
      className={containerClassName}
      style={{
        display: "inline-flex",
        borderRadius: pr,
        overflow: "hidden",
      }}
    >
      <Image
        src={icon.src}
        alt={alt}
        className={className}
        style={{ borderRadius: ir, ...style }}
        {...props}
      />
    </div>
  );
}

export { WebsiteLogoAvatar };
