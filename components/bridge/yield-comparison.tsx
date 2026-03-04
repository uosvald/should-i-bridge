"use client";

import { formatApy, formatUsd, formatUsdExact, formatChain } from "@/lib/utils";
import type { BridgeCalculatorResponse } from "@/lib/types";

interface YieldComparisonProps {
  data: BridgeCalculatorResponse;
}

function VenueCard({
  label,
  venue,
}: {
  label: string;
  venue: BridgeCalculatorResponse["source_best_venue"];
}) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
      <p className="text-sm text-slate-400 mb-3">{label}</p>
      <p className="text-lg font-semibold text-white">{venue.protocol_name}</p>
      <p className="text-sm text-slate-400 mb-4">{venue.venue_name}</p>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-slate-400">Gross APY</span>
          <span className="text-sm text-white font-mono">
            {formatApy(venue.gross_apy)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-400">Net APY</span>
          <span className="text-sm text-white font-mono font-semibold">
            {formatApy(venue.net_apy)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-400">Annual Yield</span>
          <span className="text-sm text-white font-mono">
            {formatUsdExact(venue.annual_yield_usd)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-400">TVL</span>
          <span className="text-sm text-slate-300 font-mono">
            {formatUsd(venue.tvl_usd)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function YieldComparison({ data }: YieldComparisonProps) {
  const diff = data.comparison.annual_yield_difference_usd;
  const isPositive = diff > 0;

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        Net Yield Comparison
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VenueCard
          label={`Best yield on ${formatChain(data.source_chain)}`}
          venue={data.source_best_venue}
        />
        <VenueCard label="Best yield on Solana" venue={data.solana_best_venue} />
      </div>
      <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 text-center">
        <p className="text-sm text-slate-400">Annual difference</p>
        <p
          className={`text-2xl font-bold font-mono ${
            isPositive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isPositive ? "+" : ""}
          {formatUsdExact(diff)} /year on Solana
        </p>
      </div>
    </div>
  );
}
