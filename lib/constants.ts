export const SOLANA_PROTOCOL_IDS = ["kamino", "drift", "jupiter-lend"];

export const ETH_BLUE_CHIP_PROTOCOL_IDS = [
  "aave-v3",
  "morpho-v1",
  "compound-v3",
  "fluid-lending",
  "euler-v2",
  "spark-savings",
  "maple",
];

export const ARB_BLUE_CHIP_PROTOCOL_IDS = [
  "aave-v3",
  "compound-v3",
  "fluid-lending",
  "radiant-v2",
  "silo-v2",
];

export const BASE_BLUE_CHIP_PROTOCOL_IDS = [
  "aave-v3",
  "compound-v3",
  "moonwell",
  "morpho-v1",
  "fluid-lending",
];

export const EXCLUDED_PROTOCOLS = ["merkl"];

export const AMOUNT_PRESETS = [1_000, 5_000, 10_000, 25_000, 50_000, 100_000];

export const MIN_AMOUNT = 100;
export const MAX_AMOUNT = 10_000_000;

// Venue filters (from PRD)
export const MAX_APY = 50;
export const MIN_TVL = 10_000;

// Verdict thresholds
export const YES_MIN_APY_DELTA = 0.5;
export const YES_MAX_BREAKEVEN_DAYS = 30;

export function getProtocolIdsForChain(chain: string): string[] {
  switch (chain) {
    case "solana":
      return SOLANA_PROTOCOL_IDS;
    case "ethereum":
      return ETH_BLUE_CHIP_PROTOCOL_IDS;
    case "arbitrum":
      return ARB_BLUE_CHIP_PROTOCOL_IDS;
    case "base":
      return BASE_BLUE_CHIP_PROTOCOL_IDS;
    default:
      return ETH_BLUE_CHIP_PROTOCOL_IDS;
  }
}
