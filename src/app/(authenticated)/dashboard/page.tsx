"use client";

import { useGraphData } from "@/providers/GraphData";
import { useMemeFactory } from "@/providers/MemeFactory";
import { useWeb3Auth } from "@/providers/Web3Provider";
import CopyString from "@/utils/CopyString";

import { Truncate } from "@/utils/truncate";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { address, usdBalance } = useWeb3Auth();

  const { memeCoins: memeCoinsData } = useGraphData();

  const [memeCoinCount, setMemeCoinCount] = useState(0);

  const { provider } = useWeb3Auth();

  const { getMemeCoinCount } = useMemeFactory();

  useEffect(() => {
    if (!provider) {
      return;
    }
    getMemeCoinCount().then((count) => {
      console.log("meme count", count);
      setMemeCoinCount(parseInt(count));
    });
  }, [provider]);

  return (
    <div className=" p-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4">
        <div className="p-4 border border-primary rounded-lg">
          <h2 className="text-base font-semibold mb-2">Account</h2>
          <div className="flex flex-row justify-start items-center gap-2">
            <p className="text-lg font-mono text-gray-600 break-all">
              {(address && Truncate(address, 18, "...")) || "Not connected"}
            </p>
            <CopyString
              copyText={address || ""}
              icon={<Copy className="h-5 w-5" />}
            />
          </div>
        </div>
        <div className="p-4 border border-primary rounded-lg">
          <h2 className="text-base font-semibold mb-2">Your Token Balance</h2>
          <p className="text-gray-600 text-xl font-bold">{usdBalance} USDT</p>
        </div>
        <div className="p-4 border border-primary rounded-lg">
          <h2 className="text-base font-semibold mb-2">Your Meme Tokens</h2>
          {memeCoinsData && memeCoinsData.memeCoins.length > 0 ? (
            <p className="text-gray-600 text-xl font-bold">
              {memeCoinsData.memeCoins.length} tokens created
            </p>
          ) : (
            <p className="text-gray-600 text-xl font-bold">
              {memeCoinCount} tokens created
            </p>
          )}
        </div>
        <div className="p-4 border border-primary rounded-lg">
          <h2 className="text-base font-semibold mb-2">Recent Activity</h2>
          <p className="text-gray-600 text-xl font-bold">No recent activity</p>
        </div>
      </div>
    </div>
  );
}
