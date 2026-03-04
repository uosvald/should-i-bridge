"use client";

import { cn, formatApy, formatChain } from "@/lib/utils";
import type { BridgeCalculatorResponse } from "@/lib/types";

interface StabilityComparisonProps {
  data: BridgeCalculatorResponse;
}

const stabilityColors = {
  stable: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  moderate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  volatile: "bg-red-500/20 text-red-400 border-red-500/30",
};

function StabilityCard({
  label,
  venue,
}: {
  label: string;
  venue: BridgeCalculatorResponse["source_best_venue"];
}) {
  const avg = venue.apy_avg_30d;
  const vol = venue.apy_volatility_30d;

  // APY range: avg +/- 2*stddev, floored at 0
  const rangeMin =
    avg != null && vol != null ? Math.max(0, avg - 2 * vol) : null;
  const rangeMax = avg != null && vol != null ? avg + 2 * vol : null;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">{label}</p>
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
            stabilityColors[venue.stability]
          )}
        >
          {venue.stability.charAt(0).toUpperCase() + venue.stability.slice(1)}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-slate-400">30d Avg APY</span>
          <span className="text-sm text-white font-mono">
            {formatApy(avg)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-400">30d Volatility</span>
          <span className="text-sm text-white font-mono">
            {vol != null ? vol.toFixed(2) : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-400">APY Range</span>
          <span className="text-sm text-white font-mono">
            {rangeMin != null && rangeMax != null
              ? `${rangeMin.toFixed(2)}% – ${rangeMax.toFixed(2)}%`
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function StabilityComparison({ data }: StabilityComparisonProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        Yield Stability (30 days)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StabilityCard
          label={formatChain(data.source_chain)}
          venue={data.source_best_venue}
        />
        <StabilityCard label="Solana" venue={data.solana_best_venue} />
      </div>
    </div>
  );
}
