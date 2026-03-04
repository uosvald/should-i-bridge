"use client";

import { formatChain } from "@/lib/utils";
import type { BridgeCalculatorResponse } from "@/lib/types";

interface CostBreakdownProps {
  data: BridgeCalculatorResponse;
}

function CostRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div className={`flex justify-between py-2 ${bold ? "border-t border-slate-600/50 pt-3" : ""}`}>
      <span className={`text-sm ${bold ? "text-white font-semibold" : "text-slate-400"}`}>
        {label}
      </span>
      <span className={`text-sm font-mono ${bold ? "text-white font-semibold" : "text-slate-300"}`}>
        ${value.toFixed(2)}
      </span>
    </div>
  );
}

export function CostBreakdown({ data }: CostBreakdownProps) {
  const { cost_breakdown: costs } = data;

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
        <CostRow
          label={`${formatChain(data.source_chain)} gas (approve + burn)`}
          value={costs.source_gas_usd}
        />
        <CostRow label="CCTP bridging fee" value={costs.cctp_fee_usd} />
        <CostRow label="Solana deposit tx" value={costs.solana_gas_usd} />
        <CostRow
          label="Total cost to bridge"
          value={costs.total_one_way_usd}
          bold
        />
        <div className="mt-2">
          <CostRow
            label="Round-trip cost (incl. withdrawal)"
            value={costs.total_round_trip_usd}
            bold
          />
        </div>
      </div>
    </div>
  );
}
