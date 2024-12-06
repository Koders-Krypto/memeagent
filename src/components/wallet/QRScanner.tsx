'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X } from 'lucide-react'

interface QRScannerProps {
    onScanSuccess: (address: string) => void
    onClose: () => void
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const [isScanning, setIsScanning] = useState(false)

    useEffect(() => {
        const initializeScanner = async () => {
            try {
                if (!scannerRef.current && !isScanning) {
                    // Create scanner instance
                    scannerRef.current = new Html5Qrcode("qr-reader")
                    setIsScanning(true)

                    // Get available cameras
                    const devices = await Html5Qrcode.getCameras()

                    // Try to find back camera
                    const backCamera = devices.find(device =>
                        device.label.toLowerCase().includes('back') ||
                        device.label.toLowerCase().includes('rear')
                    )

                    // Use back camera if available, otherwise use the first available camera
                    const deviceId = backCamera ? backCamera.id : devices[0]?.id

                    if (deviceId && scannerRef.current) {
                        await scannerRef.current.start(
                            deviceId,
                            {
                                fps: 10,
                                qrbox: { width: 250, height: 250 },
                                aspectRatio: 1.0,
                            },
                            (decodedText) => {
                                handleSuccess(decodedText)
                            },
                            (error) => {
                                console.warn(`QR scan error: ${error}`)
                            }
                        )
                    } else {
                        console.error('No cameras found')
                    }
                }
            } catch (error) {
                console.error('Error initializing scanner:', error)
                setIsScanning(false)
            }
        }

        initializeScanner()

        // Cleanup function
        return () => {
            handleCleanup()
        }
    }, [])

    const handleSuccess = async (decodedText: string) => {
        try {
            await handleCleanup()
            onScanSuccess(decodedText)
            onClose()
        } catch (error) {
            console.error('Error handling success:', error)
        }
    }

    const handleCleanup = async () => {
        try {
            if (scannerRef.current && isScanning) {
                await scannerRef.current.stop()
                scannerRef.current = null
                setIsScanning(false)
            }
        } catch (error) {
            console.error('Error during cleanup:', error)
        }
    }

    const handleClose = async () => {
        try {
            await handleCleanup()
            onClose()
        } catch (error) {
            console.error('Error closing scanner:', error)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Scan QR Code</h3>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div id="qr-reader" className="w-full" />
                <p className="text-sm text-gray-500 text-center mt-4">
                    Position the QR code within the frame to scan
                </p>
            </div>
        </div>
    )
} 