(() => {
    "use strict";
    const SUPABASE_URL = "https://ysdhfkeeaibwvcyfmlnf.supabase.co";
    const SUPABASE_ANON_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZGhma2VlYWlid3ZjeWZtbG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0ODE1ODgsImV4cCI6MjEwNzA1NzU4OH0.13fDNjWCjanXiy8A7vhiH389NnjgpJiM8wQemwDtVkI";
    // Share one Auth session between the UI and persistent chat.
    window.messagerieSupabase =
        window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) || null;
})();
