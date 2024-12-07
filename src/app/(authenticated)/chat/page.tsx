'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, Send, Bot, User, ChevronDown, Wallet, ArrowRightLeft, Coins, BarChart3 } from 'lucide-react'
import { useLangChain } from '@/providers/LangChainProvider'
import { useWeb3Auth } from '@/providers/Web3Provider'
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import { useBalance } from '@/hooks/useBalance'
import { getSystemMessages } from '@/utils/prompt'
import { ethers } from 'ethers'
import { useLitProtocol } from '@/providers/LitProtocol'

interface Message {
    id: string
    role: 'human' | 'ai'
    content: string
    isStreaming?: boolean
}

export default function ChatPage() {
    const { app } = useLangChain()
    const { provider,
        getBalance,
        getAccounts,
        address,
        getChainId } = useWeb3Auth();

    const { balance } = useBalance()
    const [userInput, setUserInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)

    const [inputMessage, setInputMessage] = useState("");
    const [threadId, setThreadId] = useState(uuidv4());
    const [initialized, setInitialized] = useState(false);

    const { executeLitAction } = useLitProtocol()

    // Initial welcome message
    useEffect(() => {
        if (balance === "0") return
        if (messages.length === 0) {
            setMessages([{
                id: threadId,
                role: 'ai',
                content: `Sup fam! 🚀 Your friendly neighborhood MEME AGENT here! 

Ready to make it rain with some dank tokens? I'm your go-to degenerate for:

🪄 Spawning fresh meme coins (wen moon?)
💦 Managing that sweet liquidity pool life
📈 Trading dem spicy meme tokens
🎯 Sniping the next 100x gem

Your wallet's currently holding ${parseFloat(balance).toFixed(6)} ETH to play with! 

Let's cook something legendary! What kind of meme magic shall we create today? 🔥
`
            }])
        }
    }, [balance])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value)
    }

    const handleSubmit = async () => {
        if (!userInput.trim() || loading) return

        const messageId = uuidv4()
        const aiMessageId = uuidv4()

        const balance = await getBalance();
        const chainId = await getChainId();

        const systemMessages = getSystemMessages(address!, balance, chainId);

        const messagesToSend = !initialized
            ? [...systemMessages, { role: "user", content: userInput }]
            : [{ role: "user", content: userInput }];
        setInitialized(true);

        try {
            setLoading(true)
            const newMessage = { id: messageId, role: 'human' as const, content: userInput }
            const aiMessage = { id: aiMessageId, role: 'ai' as const, content: '', isStreaming: true }
            setMessages(prev => [...prev, newMessage, aiMessage])
            setUserInput('')

            const result = await app.stream({ messages: messagesToSend }, {
                streamMode: "values",
                configurable: { thread_id: threadId },
            })

            let fullResponse = "";
            for await (const chunk of result) {
                const lastMessage = chunk.messages[chunk.messages.length - 1];
                if (lastMessage.content && lastMessage.content !== "") {
                    fullResponse = lastMessage.content;
                }
            }

            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                    ? { ...msg, content: fullResponse, isStreaming: false }
                    : msg
            ));

        } catch (error) {
            console.error('Chat error:', error)
            toast.error('Failed to get response')
            // Remove the streaming message on error
            setMessages(prev => prev.filter(msg => msg.id !== messageId))
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            <div className="flex-none px-4 pt-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Web3 AI Assistant</h1>
                            <p className="text-sm text-gray-500">Connected to {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                        </div>
                    </div>
                    <button
                        onClick={scrollToBottom}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-blue-500" />
                        <span className="text-sm">Wallet</span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Swaps</span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm">Yield</span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <span className="text-sm">Analytics</span>
                    </div>
                </div>
            </div>


            <button onClick={() => executeLitAction(1)}>
                executeLitAction
            </button>

            <div
                ref={chatContainerRef}
                className="flex-1 overflow-hidden px-4 mx-auto w-full max-w-4xl"
            >
                <div className="h-full rounded-xl bg-gray-50 dark:bg-gray-800/50 backdrop-blur-xl border dark:border-gray-700">
                    <div
                        className="h-full overflow-y-auto p-4"
                    >
                        <div className="space-y-6">
                            {messages.length > 0 ? (
                                messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex items-start gap-3 ${message.role === 'human' ? 'flex-row-reverse' : ''
                                            }`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'human'
                                            ? 'bg-blue-500'
                                            : 'bg-gray-600 dark:bg-gray-700'
                                            }`}>
                                            {message.role === 'human'
                                                ? <User className="w-5 h-5 text-white" />
                                                : <Bot className="w-5 h-5 text-white" />
                                            }
                                        </div>
                                        <div className={`flex-1 max-w-[80%] p-4 rounded-2xl break-words ${message.role === 'human'
                                            ? 'bg-blue-500 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-700 rounded-tl-none'
                                            }`}>
                                            {message.isStreaming ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Thinking...</span>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-4">
                                    <Bot className="w-12 h-12 opacity-50" />
                                    <p>Ask me anything about SecurIQ</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-none px-4 py-4">
                <div className="relative max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={loading}
                        className="w-full p-4 pr-12 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !userInput.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-lg
                        disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
} 