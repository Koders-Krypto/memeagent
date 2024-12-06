'use client'

export default function TokensPage() {
    return (
        <div className="container p-4">
            <h1 className="text-2xl font-bold mb-4">Meme Tokens</h1>
            <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg">
                        <h2 className="text-lg font-semibold">Sample Token #{i}</h2>
                        <p className="text-sm text-gray-600">Market Cap: $XXX,XXX</p>
                        <p className="text-sm text-gray-600">24h Volume: $XX,XXX</p>
                    </div>
                ))}
            </div>
        </div>
    )
} 