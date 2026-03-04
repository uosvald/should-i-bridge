"use client";

import { cn, formatUsdExact } from "@/lib/utils";
import type { BridgeCalculatorResponse } from "@/lib/types";

interface VerdictCardProps {
  data: BridgeCalculatorResponse;
}

const verdictConfig = {
  yes: {
    bg: "bg-emerald-950/50 border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-400",
    headline: "Yes, bridge your USDC.",
    icon: "↗",
  },
  maybe: {
    bg: "bg-amber-950/50 border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-400",
    headline: "It depends on your timeline.",
    icon: "→",
  },
  no: {
    bg: "bg-slate-800/50 border-slate-600/30",
    badge: "bg-slate-500/20 text-slate-400",
    headline: "Not right now.",
    icon: "↘",
  },
};

export function VerdictCard({ data }: VerdictCardProps) {
  const config = verdictConfig[data.verdict];

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 md:p-8",
        config.bg
      )}
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl md:text-5xl">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider",
                config.badge
              )}
            >
              {data.verdict}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {config.headline}
          </h2>
          <p className="text-slate-300 text-lg">{data.verdict_reason}</p>
          {data.verdict === "yes" && (
            <div className="mt-4 flex flex-wrap gap-6">
              <div>
                <p className="text-sm text-slate-400">Extra annual yield</p>
                <p className="text-2xl font-bold text-emerald-400">
                  +{formatUsdExact(data.comparison.annual_yield_difference_usd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Breakeven</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {data.comparison.breakeven_days} days
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
