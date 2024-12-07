"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Bot, User, ChevronDown, SendHorizontal } from "lucide-react";
import { useLangChain } from "@/providers/LangChainProvider";
import { useWeb3Auth } from "@/providers/Web3Provider";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { useBalance } from "@/hooks/useBalance";
import { getSystemMessages } from "@/utils/prompt";
import { getChainConfig } from "@/utils/config";
import Image from "next/image";
interface Message {
    id: string;
    role: "human" | "ai";
    content: string;
    isStreaming?: boolean;
}

// Add this helper function before the ChatPage component
const makeLinksClickable = (text: string) => {
    // Updated regex to better match URLs, including those with query params, hashes, and various endings
    const urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*[-a-zA-Z0-9@:%_\+~#?&//=])?)/g;

    // Use replace instead of split to preserve the exact matches
    return text.split(urlRegex).map((part, index, array) => {
        // Check if this part matches our URL pattern
        if (part.match(urlRegex)) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500 underline"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

export default function ChatPage() {
    const { app } = useLangChain();
    const { provider, getBalance, getAccounts, address, getChainId } =
        useWeb3Auth();

    const { balance } = useBalance();
    const [userInput, setUserInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [_balance, setBalance] = useState("0");
    const [_chainId, setChainId] = useState(0);

    const [inputMessage, setInputMessage] = useState("");
    const [threadId, setThreadId] = useState(uuidv4());
    const [initialized, setInitialized] = useState(false);

    // Initial welcome message
    useEffect(() => {
        if (balance === "0") return;
        setBalance(balance);
        getChainId().then((chainId) => {
            setChainId(chainId);
        });

        if (messages.length === 0) {
            setMessages([
                {
                    id: threadId,
                    role: "ai",
                    content: `Sup fam! 🚀 Your friendly neighborhood MEME AGENT here! 

Ready to make it rain with some dank tokens? I'm your go-to degenerate for:

🪄 Spawning fresh meme coins (wen moon?)
💦 Managing that sweet liquidity pool life
📈 Trading dem spicy meme tokens
🎯 Sniping the next 100x gem

Your wallet's currently holding ${parseFloat(balance).toFixed(
                        6
                    )} ETH to play with! 

Let's cook something legendary! What kind of meme magic shall we create today? 🔥
`,
                },
            ]);
        }
    }, [balance]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    const handleSubmit = async () => {
        if (!userInput.trim() || loading) return;

        const messageId = uuidv4();
        const aiMessageId = uuidv4();

        const systemMessages = getSystemMessages(
            address!,
            _balance,
            _chainId,
            getChainConfig().chainConfig.blockExplorerUrl
        );

        const messagesToSend = !initialized
            ? [...systemMessages, { role: "user", content: userInput }]
            : [{ role: "user", content: userInput }];
        setInitialized(true);

        try {
            setLoading(true);
            const newMessage = {
                id: messageId,
                role: "human" as const,
                content: userInput,
            };
            const aiMessage = {
                id: aiMessageId,
                role: "ai" as const,
                content: "",
                isStreaming: true,
            };
            setMessages((prev) => [...prev, newMessage, aiMessage]);
            setUserInput("");

            const result = await app.stream(
                { messages: messagesToSend },
                {
                    streamMode: "values",
                    configurable: { thread_id: threadId },
                }
            );

            let fullResponse = "";
            for await (const chunk of result) {
                const lastMessage = chunk.messages[chunk.messages.length - 1];
                if (lastMessage.content && lastMessage.content !== "") {
                    fullResponse = lastMessage.content;
                }
            }

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === aiMessageId
                        ? { ...msg, content: fullResponse, isStreaming: false }
                        : msg
                )
            );
        } catch (error) {
            console.error("Chat error:", error);
            toast.error("Failed to get response");
            // Remove the streaming message on error
            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-92px)]">
            <div className="flex-none px-4 pt-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                            <Image
                                src="/agent.svg"
                                alt="Meme Agent"
                                width={24}
                                height={24}
                                className="text-black"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Meme Agent AI</h1>
                            <p className="text-xs text-gray-500">
                                Connected to {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div
                ref={chatContainerRef}
                className="flex-1 overflow-hidden px-4 mx-auto w-full max-w-4xl"
            >
                <div className="h-full rounded-2xl bg-gray-800/50 backdrop-blur-xl border border-gray-700 relative">
                    <div className="h-full overflow-y-auto p-4">
                        <div className="space-y-6">
                            {messages.length > 0 ? (
                                messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex items-start gap-3 ${message.role === "human" ? "flex-row-reverse" : ""
                                            }`}
                                    >
                                        <div
                                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700`}
                                        >
                                            {message.role === "human" ? (
                                                <User className="w-5 h-5 text-primary" />
                                            ) : (
                                                <Image
                                                    src="/agent.svg"
                                                    alt="Meme Agent"
                                                    width={18}
                                                    height={18}
                                                    className="text-primary"
                                                />
                                            )}
                                        </div>
                                        <div
                                            className={`flex-1 max-w-full rounded-2xl break-words ${message.role !== "human"
                                                    ? "bg-gray-700 p-4 text-white rounded-tl-none"
                                                    : "rounded-tl-none text-right"
                                                }`}
                                        >
                                            {message.isStreaming ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Meeming...</span>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap">
                                                    {makeLinksClickable(message.content)}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-4">
                                    <Image
                                        src="/agent.svg"
                                        alt="Meme Agent"
                                        width={20}
                                        height={20}
                                        className="opacity-50"
                                    />
                                    <p>Ask me anything about MemeAgent</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    <button
                        onClick={scrollToBottom}
                        className="p-2 bg-gray-800 rounded-full transition-colors absolute bottom-2 right-2"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-none px-4 py-4">
                <div className="relative max-w-4xl mx-auto flex flex-row justify-between items-center bg-slate-800 border border-gray-700 rounded-full w-full  px-3 py-2.5">
                    <input
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={loading}
                        className="w-full bg-transparent rounded-2xl pl-1 focus:outline-none focus:ring-0 transition-all"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !userInput.trim()}
                        className="bg-primary text-black rounded-full p-2 hover:bg-primary/90 transition-colors"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <SendHorizontal className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
