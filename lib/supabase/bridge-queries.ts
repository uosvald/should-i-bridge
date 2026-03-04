import { createServiceRoleClient } from "./client";
import type { VenueStat, ChainMetricRow } from "@/lib/types";
import {
  EXCLUDED_PROTOCOLS,
  MAX_APY,
  MIN_TVL,
  getProtocolIdsForChain,
} from "@/lib/constants";

function getDb() {
  return createServiceRoleClient();
}

/**
 * Get best USDC venues for a chain, filtered to blue-chip protocols.
 * Returns venues sorted by APY descending (best yield first).
 */
export async function getBestUsdcVenues(
  chain: string,
  limit: number = 5
): Promise<VenueStat[]> {
  const protocolIds = getProtocolIdsForChain(chain);

  const { data, error } = await getDb()
    .from("mv_venue_stats")
    .select(
      "venue_id, name, protocol_id, chain, venue_type, apy_current, tvl_current, apy_avg_30d, apy_volatility_30d, stablecoin, symbol, active"
    )
    .eq("chain", chain)
    .in("protocol_id", protocolIds)
    .eq("stablecoin", true)
    .eq("symbol", "USDC")
    .neq("venue_type", "dex_pool")
    .not("protocol_id", "in", `(${EXCLUDED_PROTOCOLS.join(",")})`)
    .gt("apy_current", 0)
    .lt("apy_current", MAX_APY)
    .gt("tvl_current", MIN_TVL)
    .eq("active", true)
    .order("apy_current", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as VenueStat[];
}

/**
 * Get latest gas costs + CCTP costs for specified chains.
 */
export async function getChainGasCosts(
  chains: string[]
): Promise<Map<string, ChainMetricRow>> {
  const { data, error } = await getDb()
    .from("chain_metrics")
    .select("chain, avg_tx_cost_usd, cctp_transfer_cost_usd, snapshot_at")
    .in("chain", chains)
    .order("snapshot_at", { ascending: false })
    .limit(chains.length * 5); // fetch extra to handle multiple snapshots per chain

  if (error) throw error;

  // Deduplicate: keep only the most recent per chain
  const map = new Map<string, ChainMetricRow>();
  for (const row of data ?? []) {
    if (!map.has(row.chain)) {
      map.set(row.chain, row as ChainMetricRow);
    }
  }
  return map;
}

/**
 * Get the timestamp of the most recent data update.
 */
export async function getDataFreshness(): Promise<string | null> {
  const { data, error } = await getDb()
    .from("chain_metrics")
    .select("snapshot_at")
    .order("snapshot_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0]?.snapshot_at ?? null;
}
