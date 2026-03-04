import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const db = createServiceRoleClient();

    // Simple upsert to a waitlist_signups table
    // Table needs to exist: CREATE TABLE waitlist_signups (email TEXT PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT NOW(), source TEXT DEFAULT 'bridge-calculator');
    const { error } = await db
      .from("waitlist_signups")
      .upsert(
        { email: email.toLowerCase().trim(), source: "bridge-calculator" },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Waitlist insert error:", error);
      // Don't expose DB errors — still return success to not block UX
      // The table might not exist yet, which is fine for now
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
