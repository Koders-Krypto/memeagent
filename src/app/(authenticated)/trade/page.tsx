"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowUpDownIcon } from "lucide-react";
// Dummy token data
const tokens = [
  { symbol: "ETH", name: "Ethereum", balance: "0.5", url: "/images/eth.png" },
  { symbol: "USDT", name: "Tether", balance: "1800.00", url: "/images/usdt.png" },
  { symbol: "BTC", name: "Bitcoin", balance: "0.02", url: "/images/btc.png" },
  { symbol: "USDC", name: "USD Coin", balance: "2000.00", url: "/images/usdc.png" },
];

export default function TradePage() {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);

  const handleSwitch = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const TokenSelector = ({
    tokens,
    show,
    onClose,
    onSelect,
    exclude,
  }: {
    tokens: any;
    show: boolean;
    onClose: () => void;
    onSelect: (token: any) => void;
    exclude: any;
  }) => {
    if (!show) return null;

    return (
      <div className="absolute mt-2 w-[200px] bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
        {tokens
          .filter((t: any) => t.symbol !== exclude.symbol)
          .map((token: any) => (
            <button
              key={token.symbol}
              className="w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => {
                onSelect(token);
                onClose();
              }}
            >
              <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full">
                <Image
                  src={token.url}
                  alt={token.symbol}
                  width={12}
                  height={12}
                />
              </div>
              <span>{token.symbol}</span>
            </button>
          ))}
      </div>
    );
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Trade</h1>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg border-primary">
          <div className="space-y-4">
            {/* From Section */}
            <div className="space-y-2 relative">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                From
              </label>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-2 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 min-w-[140px]"
                  onClick={() => setShowFromTokens(!showFromTokens)}
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full">
                    <Image
                      src={fromToken.url}
                      alt={fromToken.symbol}
                      width={12}
                      height={12}
                    />
                  </div>
                  <span>{fromToken.symbol}</span>
                  <span className="ml-auto">▼</span>
                </button>
                <input
                  type="text"
                  placeholder="0.0"
                  className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="text-sm text-gray-500">
                Balance: {fromToken.balance} {fromToken.symbol}
              </div>
              <TokenSelector
                tokens={tokens}
                show={showFromTokens}
                onClose={() => setShowFromTokens(false)}
                onSelect={setFromToken}
                exclude={toToken}
              />
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwitch}
                className="p-2 rounded-full border border-primary hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowUpDownIcon className="w-4 h-4 text-primary" />
              </button>
            </div>

            {/* To Section */}
            <div className="space-y-2 relative">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                To
              </label>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-2 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 min-w-[140px]"
                  onClick={() => setShowToTokens(!showToTokens)}
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full">
                    <Image
                      src={toToken.url}
                      alt={toToken.symbol}
                      width={12}
                      height={12}
                    />
                  </div>
                  <span>{toToken.symbol}</span>
                  <span className="ml-auto">▼</span>
                </button>
                <input
                  type="text"
                  placeholder="0.0"
                  className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="text-sm text-gray-500">
                Balance: {toToken.balance} {toToken.symbol}
              </div>
              <TokenSelector
                tokens={tokens}
                show={showToTokens}
                onClose={() => setShowToTokens(false)}
                onSelect={setToToken}
                exclude={fromToken}
              />
            </div>

            <div className="p-3 space-y-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rate</span>
                <span>1 ETH = 1,800 USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Slippage</span>
                <span>0.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Network Fee</span>
                <span>~$5.00</span>
              </div>
            </div>

            <button className="w-full p-3 bg-primary font-bold text-xl rounded-lg border border-primary hover:bg-transparent text-black hover:text-primary transition-colors">
              Swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
