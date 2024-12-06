import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface LogoProps {
    className?: string
    width?: number
    height?: number
    showText?: boolean
    animate?: boolean
}

export function Logo({
    className = '',
    width = 64,
    height = 64,
    showText = true,
    animate = false
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
                    duration: 1.5
                }}
            >
                <Image
                    src="/logo.png"
                    alt="SecurIQ Logo"
                    width={width}
                    height={height}
                    className="object-contain"
                />
            </motion.div>
            {showText && (
                <motion.span
                    className="font-bold text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                    initial={animate ? { opacity: 0, y: 20 } : false}
                    animate={animate ? { opacity: 1, y: 0 } : false}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    SecurIQ
                </motion.span>
            )}
        </Link>
    )
} 