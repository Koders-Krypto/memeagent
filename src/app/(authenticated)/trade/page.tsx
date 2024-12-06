'use client'

export default function TradePage() {
    return (
        <div className="container p-4">
            <h1 className="text-2xl font-bold mb-4">Trade</h1>
            <div className="space-y-4">
                <div className="p-4 border rounded-lg dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-2">Swap Tokens</h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">From</label>
                            <input
                                type="text"
                                placeholder="0.0"
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">To</label>
                            <input
                                type="text"
                                placeholder="0.0"
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <button className="w-full p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                            Swap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
} 