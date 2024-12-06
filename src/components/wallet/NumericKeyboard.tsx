'use client'

import { ArrowBigLeft } from 'lucide-react'

interface NumericKeyboardProps {
    onKeyPress: (key: string) => void
    onBackspace: () => void
    onClear: () => void
}

export function NumericKeyboard({ onKeyPress, onBackspace, onClear }: NumericKeyboardProps) {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0']

    return (
        <div className="grid grid-cols-3 gap-2">
            {keys.map((key) => (
                <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    className="p-4 text-xl font-semibold bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {key}
                </button>
            ))}
            <button
                onClick={onBackspace}
                className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
                <ArrowBigLeft className="w-6 h-6 mx-auto" />
            </button>
        </div>
    )
} 