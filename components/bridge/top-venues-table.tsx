"use client";

import { cn, formatApy, formatUsd } from "@/lib/utils";
import type { BridgeCalculatorResponse } from "@/lib/types";

interface TopVenuesTableProps {
  data: BridgeCalculatorResponse;
}

const stabilityColors = {
  stable: "bg-emerald-500/20 text-emerald-400",
  moderate: "bg-amber-500/20 text-amber-400",
  volatile: "bg-red-500/20 text-red-400",
};

export function TopVenuesTable({ data }: TopVenuesTableProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        Top Solana USDC Venues
      </h3>
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">
                  Protocol
                </th>
                <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">
                  Venue
                </th>
                <th className="text-right text-xs text-slate-400 font-medium px-4 py-3">
                  Gross APY
                </th>
                <th className="text-right text-xs text-slate-400 font-medium px-4 py-3">
                  Net APY
                </th>
                <th className="text-right text-xs text-slate-400 font-medium px-4 py-3">
                  TVL
                </th>
                <th className="text-center text-xs text-slate-400 font-medium px-4 py-3">
                  Stability
                </th>
              </tr>
            </thead>
            <tbody>
              {data.top_solana_venues.map((venue, i) => (
                <tr
                  key={venue.venue_id}
                  className={cn(
                    "border-b border-slate-700/30 last:border-0",
                    i === 0 && "bg-slate-700/20"
                  )}
                >
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {venue.protocol_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {venue.venue_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-300 font-mono">
                    {formatApy(venue.gross_apy)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-white font-mono font-semibold">
                    {formatApy(venue.net_apy)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-300 font-mono">
                    {formatUsd(venue.tvl_usd)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        stabilityColors[venue.stability]
                      )}
                    >
                      {venue.stability.charAt(0).toUpperCase() +
                        venue.stability.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
