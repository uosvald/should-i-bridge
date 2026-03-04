"use client";

import type { BridgeCalculatorResponse } from "@/lib/types";

interface BreakevenTimelineProps {
  data: BridgeCalculatorResponse;
}

export function BreakevenTimeline({ data }: BreakevenTimelineProps) {
  const days = data.comparison.breakeven_days;

  if (days === null || data.comparison.net_apy_delta <= 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Breakeven Timeline
        </h3>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 text-center">
          <p className="text-slate-400">
            Solana yields are currently lower than your source chain. No
            advantage to bridging.
          </p>
        </div>
      </div>
    );
  }

  const maxDays = 365;
  const progress = Math.min(days / maxDays, 1);
  const isOverYear = days > 365;

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        Breakeven Timeline
      </h3>
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
        {isOverYear ? (
          <p className="text-amber-400 text-center">
            It would take over a year to break even at current rates. Not
            recommended.
          </p>
        ) : (
          <>
            <p className="text-white text-center mb-4">
              Your higher Solana yield covers bridging costs in{" "}
              <span className="text-emerald-400 font-bold text-xl">
                {days} days
              </span>
            </p>
            <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Day 0</span>
              <span>Breakeven: Day {days}</span>
              <span>1 year</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
