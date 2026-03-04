import Decimal from "decimal.js";
import type {
  BridgeCalculatorResponse,
  BridgeVenue,
  CostBreakdown,
  VenueStat,
  ChainMetricRow,
  SourceChain,
} from "./types";
import {
  YES_MIN_APY_DELTA,
  YES_MAX_BREAKEVEN_DAYS,
} from "./constants";
import { formatProtocolName, formatVenueName } from "./utils";
import {
  getBestUsdcVenues,
  getChainGasCosts,
  getDataFreshness,
} from "./supabase/bridge-queries";

function getStability(
  volatility: number | null
): "stable" | "moderate" | "volatile" {
  if (volatility == null) return "moderate";
  if (volatility < 0.5) return "stable";
  if (volatility <= 2.0) return "moderate";
  return "volatile";
}

function calcNetApy(
  depositAmount: Decimal,
  grossApy: Decimal,
  totalGasCostUsd: Decimal
): Decimal {
  // net_yield_annual = (deposit * gross_apy / 100) - (2 * gas_cost_usd)
  // Factor of 2 accounts for deposit + future withdrawal
  const annualYield = depositAmount
    .mul(grossApy)
    .div(100)
    .minus(totalGasCostUsd.mul(2));
  // net_apy = (net_yield_annual / deposit) * 100
  return annualYield.div(depositAmount).mul(100);
}

function buildBridgeVenue(
  venue: VenueStat,
  depositAmount: Decimal,
  gasCostUsd: Decimal
): BridgeVenue {
  const grossApy = new Decimal(venue.apy_current ?? 0);
  const netApy = calcNetApy(depositAmount, grossApy, gasCostUsd);
  const annualYield = depositAmount.mul(netApy).div(100);

  return {
    venue_id: venue.venue_id,
    protocol_id: venue.protocol_id ?? "",
    protocol_name: formatProtocolName(venue.protocol_id),
    venue_name: formatVenueName(venue.name),
    gross_apy: grossApy.toNumber(),
    net_apy: parseFloat(netApy.toFixed(4)),
    annual_yield_usd: parseFloat(annualYield.toFixed(2)),
    tvl_usd: venue.tvl_current ?? 0,
    apy_avg_30d: venue.apy_avg_30d,
    apy_volatility_30d: venue.apy_volatility_30d,
    stability: getStability(venue.apy_volatility_30d),
  };
}

export async function calculate(
  amount: number,
  sourceChain: SourceChain
): Promise<BridgeCalculatorResponse> {
  const depositAmount = new Decimal(amount);

  // Fetch all data in parallel
  const [sourceVenues, solanaVenues, gasCosts, dataUpdatedAt] =
    await Promise.all([
      getBestUsdcVenues(sourceChain, 5),
      getBestUsdcVenues("solana", 10),
      getChainGasCosts([sourceChain, "solana"]),
      getDataFreshness(),
    ]);

  if (sourceVenues.length === 0) {
    throw new Error(`No USDC venues found on ${sourceChain}`);
  }
  if (solanaVenues.length === 0) {
    throw new Error("No USDC venues found on Solana");
  }

  // Extract gas costs
  const sourceMetrics = gasCosts.get(sourceChain);
  const solanaMetrics = gasCosts.get("solana");

  const sourceGas = new Decimal(sourceMetrics?.avg_tx_cost_usd ?? 0);
  const cctpFee = new Decimal(sourceMetrics?.cctp_transfer_cost_usd ?? 0);
  const solanaGas = new Decimal(solanaMetrics?.avg_tx_cost_usd ?? 0);

  // Total gas for one-way: source gas + CCTP + solana gas
  const totalOneWay = sourceGas.plus(cctpFee).plus(solanaGas);
  const totalRoundTrip = totalOneWay.mul(2);

  // Gas cost per chain for net APY calc
  // Source chain: only its own gas costs
  const sourceChainGas = sourceGas;
  // Solana: full bridge cost (source gas + cctp + solana gas)
  const solanaChainGas = totalOneWay;

  // Build best venue for each chain (by net APY at user's deposit)
  const sourceBridgeVenues = sourceVenues.map((v) =>
    buildBridgeVenue(v, depositAmount, sourceChainGas)
  );
  const solanaBridgeVenues = solanaVenues.map((v) =>
    buildBridgeVenue(v, depositAmount, solanaChainGas)
  );

  // Best = highest net APY
  sourceBridgeVenues.sort((a, b) => b.net_apy - a.net_apy);
  solanaBridgeVenues.sort((a, b) => b.net_apy - a.net_apy);

  const sourceBest = sourceBridgeVenues[0];
  const solanaBest = solanaBridgeVenues[0];

  // Comparison
  const netApyDelta = new Decimal(solanaBest.net_apy).minus(sourceBest.net_apy);
  const annualYieldDiff = new Decimal(solanaBest.annual_yield_usd).minus(
    sourceBest.annual_yield_usd
  );

  // Breakeven calculation
  let breakevenDays: number | null = null;
  if (netApyDelta.gt(0)) {
    const dailyAdvantage = depositAmount
      .mul(netApyDelta)
      .div(100)
      .div(365);
    if (dailyAdvantage.gt(0)) {
      breakevenDays = Math.ceil(
        totalRoundTrip.div(dailyAdvantage).toNumber()
      );
    }
  }

  // Verdict logic
  let verdict: "yes" | "maybe" | "no";
  let verdictReason: string;

  if (netApyDelta.lte(0)) {
    verdict = "no";
    verdictReason = `Solana yields are currently lower than ${sourceChain}. Costs exceed the yield advantage at this deposit size.`;
  } else if (
    netApyDelta.gte(YES_MIN_APY_DELTA) &&
    breakevenDays !== null &&
    breakevenDays <= YES_MAX_BREAKEVEN_DAYS
  ) {
    verdict = "yes";
    verdictReason = `You'd earn $${annualYieldDiff.toFixed(2)} more per year on Solana, and break even in just ${breakevenDays} days.`;
  } else {
    verdict = "maybe";
    if (breakevenDays !== null && breakevenDays > 365) {
      verdictReason = `There's a small yield advantage, but it would take over a year to break even. Consider waiting for a larger spread.`;
    } else if (breakevenDays !== null) {
      verdictReason = `There's a yield advantage of ${netApyDelta.toFixed(2)}%, but breakeven takes ${breakevenDays} days. Worth it if you plan to stay deployed for a while.`;
    } else {
      verdictReason = `The yield difference is marginal. Monitor rates and consider bridging when the spread widens.`;
    }
  }

  // Cost breakdown
  const costBreakdown: CostBreakdown = {
    source_gas_usd: parseFloat(sourceGas.toFixed(4)),
    cctp_fee_usd: parseFloat(cctpFee.toFixed(4)),
    solana_gas_usd: parseFloat(solanaGas.toFixed(4)),
    total_one_way_usd: parseFloat(totalOneWay.toFixed(4)),
    total_round_trip_usd: parseFloat(totalRoundTrip.toFixed(4)),
  };

  // Top 5 Solana venues
  const topSolanaVenues = solanaBridgeVenues.slice(0, 5).map((v) => ({
    venue_id: v.venue_id,
    protocol_name: v.protocol_name,
    venue_name: v.venue_name,
    gross_apy: v.gross_apy,
    net_apy: v.net_apy,
    tvl_usd: v.tvl_usd,
    stability: v.stability,
  }));

  return {
    verdict,
    verdict_reason: verdictReason,
    deposit_amount: amount,
    source_chain: sourceChain,
    source_best_venue: sourceBest,
    solana_best_venue: solanaBest,
    cost_breakdown: costBreakdown,
    comparison: {
      annual_yield_difference_usd: parseFloat(annualYieldDiff.toFixed(2)),
      net_apy_delta: parseFloat(netApyDelta.toFixed(4)),
      breakeven_days: breakevenDays,
    },
    top_solana_venues: topSolanaVenues,
    data_updated_at: dataUpdatedAt ?? new Date().toISOString(),
  };
}
