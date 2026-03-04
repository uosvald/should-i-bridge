import { NextRequest, NextResponse } from "next/server";
import { calculate } from "@/lib/bridge-calculator";
import { MIN_AMOUNT, MAX_AMOUNT } from "@/lib/constants";
import { VALID_SOURCE_CHAINS } from "@/lib/types";
import type { SourceChain, BridgeCalculatorError } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse and validate amount
  const amountStr = searchParams.get("amount");
  if (!amountStr) {
    return NextResponse.json(
      { error: "amount parameter is required", code: "INVALID_AMOUNT" } satisfies BridgeCalculatorError,
      { status: 400 }
    );
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return NextResponse.json(
      {
        error: `amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT.toLocaleString()}`,
        code: "INVALID_AMOUNT",
      } satisfies BridgeCalculatorError,
      { status: 400 }
    );
  }

  // Parse and validate source_chain
  const sourceChain = (searchParams.get("source_chain") ?? "ethereum") as SourceChain;
  if (!VALID_SOURCE_CHAINS.includes(sourceChain)) {
    return NextResponse.json(
      {
        error: `source_chain must be one of: ${VALID_SOURCE_CHAINS.join(", ")}`,
        code: "INVALID_CHAIN",
      } satisfies BridgeCalculatorError,
      { status: 400 }
    );
  }

  try {
    const result = await calculate(amount, sourceChain);

    // Check data freshness
    const lastUpdate = new Date(result.data_updated_at);
    const hoursSinceUpdate =
      (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceUpdate > 48) {
      return NextResponse.json(result, {
        status: 200,
        headers: {
          "X-Data-Stale": "true",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      });
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err) {
    console.error("Bridge calculator error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      } satisfies BridgeCalculatorError,
      { status: 500 }
    );
  }
}
