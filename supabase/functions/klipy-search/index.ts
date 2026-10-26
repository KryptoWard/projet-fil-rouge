import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  const token = req.headers.get("Authorization")?.replace(/^Bearer /i, "");
  if (!token) return reply({ error: "Unauthorized" }, 401);
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return reply({ error: "Unauthorized" }, 401);
    const key = Deno.env.get("KLIPY_API_KEY");
    if (!key) return reply({ error: "Missing configuration" }, 500);
    let input;
    try { input = await req.json(); } catch { return reply({ error: "Invalid JSON" }, 400); }
    const { q, pos = "", locale = "fr" } = input || {};
    if (typeof q !== "string" || !q.trim() || q.length > 200 || typeof pos !== "string" || pos.length > 1000) {
      return reply({ error: "Invalid search" }, 400);
    }
    const url = new URL("https://api.klipy.com/v2/search");
    url.search = new URLSearchParams({ key, q: q.trim(), pos, locale: locale === "en" ? "en" : "fr", client_key: "projet_fil_rouge", contentfilter: "high", media_filter: "gif,tinygif", limit: "12" }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return reply({ error: "KLIPY unavailable" }, 502);
    const data = await response.json();
    if (!Array.isArray(data.results)) return reply({ error: "Invalid provider response" }, 502);
    return reply({ results: data.results, next: data.next });
  } catch { return reply({ error: "Search failed" }, 502); }
});
