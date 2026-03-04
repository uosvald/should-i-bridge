"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { BridgeCalculatorResponse, SourceChain } from "@/lib/types";
import { VALID_SOURCE_CHAINS } from "@/lib/types";
import { AMOUNT_PRESETS } from "@/lib/constants";
import { formatChain } from "@/lib/utils";
import { VerdictCard } from "./verdict-card";
import { YieldComparison } from "./yield-comparison";
import { CostBreakdown } from "./cost-breakdown";
import { BreakevenTimeline } from "./breakeven-timeline";
import { StabilityComparison } from "./stability-comparison";
import { TopVenuesTable } from "./top-venues-table";
import { WaitlistCta } from "./waitlist-cta";
import { ShareButton } from "./share-button";
import { formatDaysAgo } from "@/lib/utils";

interface BridgeCalculatorProps {
  initialData: BridgeCalculatorResponse | null;
}

export function BridgeCalculator({ initialData }: BridgeCalculatorProps) {
  const [amount, setAmount] = useState(initialData?.deposit_amount ?? 10_000);
  const [amountInput, setAmountInput] = useState(
    (initialData?.deposit_amount ?? 10_000).toLocaleString()
  );
  const [sourceChain, setSourceChain] = useState<SourceChain>(
    (initialData?.source_chain as SourceChain) ?? "ethereum"
  );
  const [data, setData] = useState<BridgeCalculatorResponse | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCalculation = useCallback(
    async (amt: number, chain: SourceChain) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/bridge-calculator?amount=${amt}&source_chain=${chain}`
        );
        if (!res.ok) {
          const err = await res.json();
          setError(err.error ?? "Something went wrong");
          return;
        }
        setIsStale(res.headers.get("X-Data-Stale") === "true");
        const result: BridgeCalculatorResponse = await res.json();
        setData(result);
      } catch {
        setError("Failed to fetch. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced recalculation on amount or chain change
  useEffect(() => {
    // Skip initial render if we have SSR data
    if (
      data &&
      data.deposit_amount === amount &&
      data.source_chain === sourceChain
    ) {
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (amount >= 100) {
        fetchCalculation(amount, sourceChain);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [amount, sourceChain, fetchCalculation]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAmountChange = (value: string) => {
    setAmountInput(value);
    const parsed = parseFloat(value.replace(/,/g, ""));
    if (!isNaN(parsed) && parsed >= 0) {
      setAmount(parsed);
    }
  };

  const handlePreset = (preset: number) => {
    setAmount(preset);
    setAmountInput(preset.toLocaleString());
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Deposit Amount (USDC)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountInput}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    amount === preset
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  ${(preset / 1000).toFixed(0)}K
                </button>
              ))}
            </div>
          </div>

          {/* Chain Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Source Chain
            </label>
            <select
              value={sourceChain}
              onChange={(e) => setSourceChain(e.target.value as SourceChain)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 appearance-none cursor-pointer"
            >
              {VALID_SOURCE_CHAINS.map((chain) => (
                <option key={chain} value={chain}>
                  {formatChain(chain)}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              Destination: Solana (via Circle CCTP)
            </p>
          </div>
        </div>

        {amount < 500 && amount >= 100 && (
          <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-sm text-amber-400">
              At this deposit size, gas costs eat most of the yield advantage.
              Consider waiting until you have more to deploy.
            </p>
          </div>
        )}
      </div>

      {/* Stale Data Warning */}
      {isStale && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
          <p className="text-amber-400 font-medium">
            Data may be stale. Results should be verified.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 mt-3">Calculating...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && !error && (
        <div className="space-y-8">
          <VerdictCard data={data} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <YieldComparison data={data} />
            <CostBreakdown data={data} />
          </div>

          <BreakevenTimeline data={data} />
          <StabilityComparison data={data} />
          <TopVenuesTable data={data} />

          <div className="flex items-center justify-between flex-wrap gap-4">
            <ShareButton data={data} />
            <p className="text-xs text-slate-500">
              Data updated {formatDaysAgo(data.data_updated_at)}
            </p>
          </div>

          <WaitlistCta />
        </div>
      )}
    </div>
  );
}
