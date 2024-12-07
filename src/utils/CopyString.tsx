import React, { useState } from "react";

interface CopyStringProps {
  copyText: string; // The string to copy
  icon: JSX.Element; // The icon to display
}

const CopyString: React.FC<CopyStringProps> = ({ copyText, icon }) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setStatus(true);
      setTimeout(() => {
        setCopied(false);
        setStatus(false);
      }, 2000); // Reset copied state after 2 seconds
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        style={{
          display: "flex",
          alignItems: "center",
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
        title={copied ? "Copied!" : "Copy to clipboard"}
      >
        {icon}
      </button>
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm">
        {status ? "Copied!" : ""}
      </div>
    </div>
  );
};

export default CopyString;
