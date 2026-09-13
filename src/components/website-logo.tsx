import icon from "@/icon.svg";
import Image from "next/image";

interface WebsiteLogoProps
  extends Omit<React.ComponentProps<typeof Image>, "src" | "alt"> {
  alt?: string;
}

function WebsiteLogo({ alt = "Website logo", ...props }: WebsiteLogoProps) {
  return <Image src={icon.src} alt={alt} {...props} />;
}

export { WebsiteLogo };