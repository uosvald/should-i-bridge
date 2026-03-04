import { BridgeCalculator } from "@/components/bridge/bridge-calculator";
import { calculate } from "@/lib/bridge-calculator";
import type { BridgeCalculatorResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BridgePage() {
  // SSR: pre-compute default result ($10K from Ethereum) for SEO + instant load
  let initialData: BridgeCalculatorResponse | null = null;
  try {
    initialData = await calculate(10_000, "ethereum");
  } catch (err) {
    console.error("SSR bridge calculation failed:", err);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="https://yieldy.io" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">
              Yieldy
            </span>
          </a>
          <a
            href="https://yieldy.io"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Back to Yieldy
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Should I bridge my USDC to Solana?
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Find out in 10 seconds. No wallet needed. Real yields after gas,
            bridging costs, and fees — personalized to your deposit size.
          </p>
        </div>

        <BridgeCalculator initialData={initialData} />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 mb-2">
            Data sourced from 1.8M+ venue snapshots across 274 protocols.
            Updated daily at 06:00 UTC.
          </p>
          <p className="text-xs text-slate-600">
            Bridging via Circle CCTP (burn-and-mint). Zero bridge risk. No
            wrapped tokens.
          </p>
          <p className="text-xs text-slate-600 mt-4">
            &copy; {new Date().getFullYear()} Yieldy. All rights reserved.
          </p>
        </footer>
      </main>

      {/* FAQ Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Should I bridge my USDC from Ethereum to Solana?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "It depends on your deposit size and current yield rates. Use Yieldy's free calculator to see your personalized answer including net yield after gas costs, breakeven timeline, and yield stability comparison.",
                },
              },
              {
                "@type": "Question",
                name: "How much does it cost to bridge USDC from Ethereum to Solana?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Bridging USDC via Circle CCTP costs the Ethereum gas fee (approve + burn transaction) plus a small CCTP transfer fee plus the Solana deposit transaction. Total costs vary by network conditions but are typically under $5.",
                },
              },
              {
                "@type": "Question",
                name: "What is Circle CCTP?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Circle's Cross-Chain Transfer Protocol (CCTP) enables native USDC transfers between blockchains using a burn-and-mint mechanism. Unlike bridges that use wrapped tokens, CCTP burns USDC on the source chain and mints native USDC on the destination chain, eliminating bridge risk.",
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
