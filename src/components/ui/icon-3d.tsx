import Image from "next/image";
import { cn } from "@/lib/utils";

// Microsoft Fluent Emoji 3D(MIT)를 128px WebP로 줄여 public/icons/3d에 둔다. 라이선스 고지는 같은 폴더의 LICENSE.txt.
// 16px 안팎에서는 입체감이 뭉개지므로 32px 이상의 장식 자리에만 쓰고, 버튼·툴바 아이콘은 lucide를 유지한다.
export type Icon3DName =
  | "tv"
  | "desktop"
  | "link"
  | "rocket"
  | "mobile"
  | "bulb"
  | "speech"
  | "memo"
  | "antenna"
  | "compass";

interface Icon3DProps {
  name: Icon3DName;
  size?: number;
  className?: string;
}

export default function Icon3D({ name, size = 40, className }: Icon3DProps) {
  return (
    <Image
      src={`/icons/3d/${name}.webp`}
      width={size}
      height={size}
      alt=""
      aria-hidden
      // 원본이 이미 작은 WebP라 최적화 서버를 거치지 않는다.
      unoptimized
      className={cn("shrink-0 select-none drop-shadow-sm", className)}
    />
  );
}
