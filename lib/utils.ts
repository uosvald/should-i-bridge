import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatApy(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

export function formatProtocolName(id: string | null | undefined): string {
  if (!id) return "--";
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatVenueName(name: string | null | undefined): string {
  if (!name) return "--";
  let result = name.replace(/\s*\([a-z][a-z-]*\)\s*$/, "");
  result = result.replace(/^([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/, (match) =>
    match
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
  return result;
}

export function formatChain(chain: string | null | undefined): string {
  if (!chain) return "--";
  return chain.charAt(0).toUpperCase() + chain.slice(1);
}

export function buildVenueExternalUrl(
  protocolId: string | null | undefined,
  contractAddress: string | null | undefined,
  venueType: string | null | undefined,
  protocolUrl: string | null | undefined
): string | null {
  if (!protocolId) return protocolUrl ?? null;
  switch (protocolId) {
    case "kamino":
      if (venueType === "lending_pool" && contractAddress)
        return `https://app.kamino.finance/lending/market/${contractAddress}`;
      return "https://app.kamino.finance";
    case "drift":
      if (
        (venueType === "strategy_vault" ||
          venueType === "strategy_vault_verified" ||
          venueType === "strategy_vault_ecosystem") &&
        contractAddress
      )
        return `https://app.drift.trade/vaults/${contractAddress}`;
      return "https://app.drift.trade/earn";
    case "jupiter-lend":
      return "https://app.jup.ag/earn";
    default:
      return protocolUrl ?? null;
  }
}

export function formatUsdExact(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDaysAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Less than 1 hour ago";
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}
