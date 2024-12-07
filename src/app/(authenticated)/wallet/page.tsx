"use client";

import { useWeb3Auth } from "@/providers/Web3Provider";
import { useBalance } from "@/hooks/useBalance";
import {
  Loader2,
  RefreshCw,
  Send,
  Wallet,
  X,
  Copy,
  ExternalLink,
  Scan,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { NumericKeyboard } from "@/components/wallet/NumericKeyboard";
import { QRCodeSVG } from "qrcode.react";
import { QRScanner } from "@/components/wallet/QRScanner";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { ethers } from "ethers";

export default function WalletPage() {
  const { address, provider } = useWeb3Auth();
  const { balance, loading: balanceLoading, refetch } = useBalance();
  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  const handleKeyPress = (key: string) => {
    if (key === "." && amount.includes(".")) return;
    if (amount.includes(".")) {
      const decimals = amount.split(".")[1];
      if (decimals?.length >= 4) return;
    }
    setAmount((prev) => prev + key);
  };

  const handleBackspace = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setAmount("");
  };

  const handleSend = async () => {
    if (!recipientAddress || !amount || !provider) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSendLoading(true);
      const ethersProvider = new ethers.providers.Web3Provider(provider as any);
      const signer = ethersProvider.getSigner();

      // Create transaction object
      const tx = {
        to: recipientAddress,
        value: ethers.utils.parseEther(amount),
      };

      // Send transaction
      const transaction = await signer.sendTransaction(tx);

      // Wait for transaction to be mined
      toast.loading("Transaction pending...", { id: "tx" });
      await transaction.wait();

      // Success
      toast.success("Transaction successful!", { id: "tx" });
      setShowSend(false);
      setAmount("");
      setRecipientAddress("");

      // Refresh balance
      await refetch();
    } catch (error: any) {
      console.error("Send error:", error);
      // Handle specific error cases
      if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Insufficient funds for transaction");
      } else if (error.code === "INVALID_ARGUMENT") {
        toast.error("Invalid address or amount");
      } else {
        toast.error("Failed to send transaction");
      }
    } finally {
      setSendLoading(false);
    }
  };

  const validateSendForm = () => {
    if (!recipientAddress || !amount) return false;
    try {
      // Check if address is valid
      ethers.utils.getAddress(recipientAddress);
      // Check if amount is valid and not greater than balance
      const amountInWei = ethers.utils.parseEther(amount);
      const balanceInWei = ethers.utils.parseEther(balance);
      return amountInWei.gt(0) && amountInWei.lte(balanceInWei);
    } catch {
      return false;
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard!");
    }
  };

  const handleScanSuccess = (address: string) => {
    setRecipientAddress(address);
    setShowScanner(false);
    toast.success("Address scanned successfully!");
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>

      <div className="space-y-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="balance-container"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Balance
            </h2>
            <button
              onClick={refetch}
              disabled={balanceLoading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-500 ${balanceLoading ? "animate-spin" : ""
                  }`}
              />
            </button>
          </div>

          <div className="balance-amount">
            {balanceLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="flex flex-row justify-start items-end gap-2">
                <span>{balance}</span>
                <span className="balance-currency mb-2">ETH</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Address Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="balance-container"
        >
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Wallet Address
          </h2>
          <div className="flex items-center space-x-2">
            <p className="wallet-address">{address || "0x..."}</p>
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => setShowSend(true)}
            className="flex items-center justify-center space-x-2 p-4 bg-primary  rounded-xl border border-primary hover:bg-transparent text-black hover:text-primary transition-colors"
          >
            <Send className="w-5 h-5" />
            <span>Send</span>
          </button>
          <button
            onClick={() => setShowReceive(true)}
            className="flex items-center justify-center space-x-2 p-4 bg-primary  rounded-xl border border-primary hover:bg-transparent text-black hover:text-primary transition-colors"
          >
            <Wallet className="w-5 h-5" />
            <span>Receive</span>
          </button>
        </motion.div>
      </div>

      {/* Send Modal */}
      <AnimatePresence>
        {showSend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-40"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="send-modal w-full max-w-md bg-background border border-primary"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Send ETH</h3>
                <button
                  onClick={() => setShowSend(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Recipient Address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full p-3 pr-12 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  onClick={() => setShowScanner(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <Scan className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center p-4 text-3xl font-bold">
                {amount || "0"} ETH
              </div>

              <div className="text-sm text-gray-500 text-center">
                Available Balance: {balance} ETH
              </div>

              <NumericKeyboard
                onKeyPress={handleKeyPress}
                onBackspace={handleBackspace}
                onClear={handleClear}
              />

              <button
                onClick={handleSend}
                disabled={!validateSendForm() || sendLoading}
                className="w-full mt-5 p-4 bg-gradient-to-r from-blue-500 to-blue-600 
                                text-white text-lg font-semibold rounded-xl shadow-lg 
                                shadow-blue-500/20 transition-all duration-200 
                                hover:translate-y-[-1px] hover:shadow-xl hover:shadow-blue-500/30 
                                active:translate-y-0 active:shadow-lg
                                disabled:opacity-50 disabled:cursor-not-allowed 
                                disabled:bg-gradient-to-r disabled:from-slate-400 disabled:to-slate-500"
              >
                {sendLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Send"
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Scanner */}
      <AnimatePresence>
        {showScanner && (
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>

      {/* Receive Modal */}
      <AnimatePresence>
        {showReceive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-40"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="send-modal w-full max-w-md bg-background border border-primary"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Receive ETH</h3>
                <button
                  onClick={() => setShowReceive(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center space-y-4">
                {/* QR Code */}
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeSVG
                    value={address || ""}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="mx-auto"
                  />
                </div>

                {/* Address */}
                <div className="w-full p-4 border rounded-lg dark:border-gray-600">
                  <p className="text-sm text-gray-500 break-all font-mono">
                    {address}
                  </p>
                </div>

                <div className="flex justify-center space-x-4 w-full">
                  <button
                    onClick={copyAddress}
                    className="flex items-center space-x-2 p-3 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                    <span>Copy</span>
                  </button>
                  <a
                    href={`https://sepolia.etherscan.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-3 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Explorer</span>
                  </a>
                </div>

                <div className="text-sm text-gray-500 text-center">
                  Scan this QR code or copy the address to receive ETH
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
