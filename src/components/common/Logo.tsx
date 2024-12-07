import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  animate?: boolean;
}

export function Logo({
  className = "",
  width = 564,
  height = 564,
  animate = true,
}: LogoProps) {
  return (
    <Link href="/" className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.div
        initial={animate ? { scale: 0, rotate: -180 } : false}
        animate={animate ? { scale: 1, rotate: 0 } : false}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 1.5,
        }}
      >
        <Image
          src="/logo.svg"
          alt="MemeAgent Logo"
          width={width}
          height={height}
          className="object-contain"
        />
      </motion.div>
    </Link>
  );
}
