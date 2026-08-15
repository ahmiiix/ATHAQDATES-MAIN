const SUPABASE_URL = "https://bqgjphokruwobxyqcyv.supabase.co";

const SUPABASE_ANON_KEY = "YAHAN_TUMHARI_SB_PUBLISHABLE_KEY_HOGI";

window.ATHAQ_SUPABASE =
    (window.supabase &&
     SUPABASE_URL.startsWith("https://") &&
     !SUPABASE_URL.includes("YOUR_"))
        ? window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
          )
        : null;
