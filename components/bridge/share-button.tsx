"use client";

import { useState } from "react";
import { formatChain } from "@/lib/utils";
import type { BridgeCalculatorResponse } from "@/lib/types";
import { Copy, Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  data: BridgeCalculatorResponse;
}

export function ShareButton({ data }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `I'd earn $${Math.abs(data.comparison.annual_yield_difference_usd).toFixed(2)} ${data.comparison.annual_yield_difference_usd >= 0 ? "more" : "less"} per year moving my USDC from ${formatChain(data.source_chain)} to Solana (after all costs).\nBreakeven: ${data.comparison.breakeven_days ?? "N/A"} days. Best venue: ${data.solana_best_venue.protocol_name} at ${data.solana_best_venue.net_apy.toFixed(2)}% net APY.\nCheck yours: yieldy.io/bridge`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors text-sm"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Result
          </>
        )}
      </button>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors text-sm"
      >
        <Share2 className="w-4 h-4" />
        Share on X
      </a>
    </div>
  );
}
