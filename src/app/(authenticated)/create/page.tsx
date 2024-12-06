'use client'

export default function CreatePage() {
    return (
        <div className="container p-4">
            <h1 className="text-2xl font-bold mb-4">Create Meme Token</h1>
            <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Token Details</h2>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Token Name"
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Token Symbol"
                            className="w-full p-2 border rounded"
                        />
                        <button className="w-full p-2 bg-primary text-white rounded">
                            Create Token
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
} 