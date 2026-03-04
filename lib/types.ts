// API response types for the bridge calculator

export interface BridgeVenue {
  venue_id: string;
  protocol_id: string;
  protocol_name: string;
  venue_name: string;
  gross_apy: number;
  net_apy: number;
  annual_yield_usd: number;
  tvl_usd: number;
  apy_avg_30d: number | null;
  apy_volatility_30d: number | null;
  stability: "stable" | "moderate" | "volatile";
}

export interface CostBreakdown {
  source_gas_usd: number;
  cctp_fee_usd: number;
  solana_gas_usd: number;
  total_one_way_usd: number;
  total_round_trip_usd: number;
}

export interface BridgeCalculatorResponse {
  verdict: "yes" | "maybe" | "no";
  verdict_reason: string;
  deposit_amount: number;
  source_chain: string;

  source_best_venue: BridgeVenue;
  solana_best_venue: BridgeVenue;

  cost_breakdown: CostBreakdown;

  comparison: {
    annual_yield_difference_usd: number;
    net_apy_delta: number;
    breakeven_days: number | null;
  };

  top_solana_venues: Array<{
    venue_id: string;
    protocol_name: string;
    venue_name: string;
    gross_apy: number;
    net_apy: number;
    tvl_usd: number;
    stability: "stable" | "moderate" | "volatile";
  }>;

  data_updated_at: string;
}

export interface BridgeCalculatorError {
  error: string;
  code: "INVALID_AMOUNT" | "INVALID_CHAIN" | "STALE_DATA" | "INTERNAL_ERROR";
}

// DB types (subset needed for bridge calculator)

export interface VenueStat {
  venue_id: string;
  name: string | null;
  protocol_id: string | null;
  chain: string;
  venue_type: string;
  apy_current: number | null;
  tvl_current: number | null;
  apy_avg_30d: number | null;
  apy_volatility_30d: number | null;
  stablecoin: boolean;
  symbol: string;
  active: boolean;
}

export interface ChainMetricRow {
  chain: string;
  avg_tx_cost_usd: number | null;
  cctp_transfer_cost_usd: number | null;
  snapshot_at: string;
}

export interface GasAdjustedYieldRow {
  venue_id: string;
  name: string | null;
  chain: string;
  protocol_id: string | null;
  venue_type: string;
  apy_total: number | null;
  tvl_usd: number | null;
  gas_cost: number | null;
  net_apy_1k: number | null;
  net_apy_5k: number | null;
  net_apy_25k: number | null;
  net_apy_100k: number | null;
}

export type SourceChain = "ethereum" | "arbitrum" | "base";

export const VALID_SOURCE_CHAINS: SourceChain[] = ["ethereum", "arbitrum", "base"];
