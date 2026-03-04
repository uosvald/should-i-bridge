import { createClient as createJsClient } from "@supabase/supabase-js";

// Service role client for read-only server-side queries.
// No auth needed — this is a public tool.
export function createServiceRoleClient() {
  return createJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
