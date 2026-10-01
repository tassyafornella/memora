/* =========================================================
   MEMORA
   SUPABASE CONFIGURATION
   ========================================================= */


/*
   =========================================================
   ISI 2 DATA INI DARI SUPABASE PROJECT MEMORA
   =========================================================

   Supabase Dashboard
   → Project Settings
   → API

   Project URL:
   https://xxxxxxxx.supabase.co

   Publishable / anon public key:
   eyJ...
*/


const MEMORA_SUPABASE_URL =
  "https://qjrjxwuuirfmjuxevnfl.supabase.co";


const MEMORA_SUPABASE_ANON_KEY =
  "sb_publishable_O7n-iKwNGb1VHkoV_N47Ow_7gQUv3jP";



/* =========================================================
   VALIDATE CONFIG
   ========================================================= */

function isMemoraSupabaseConfigured() {

  return (

    MEMORA_SUPABASE_URL &&
    MEMORA_SUPABASE_ANON_KEY &&

    !MEMORA_SUPABASE_URL.includes(
      "PASTE_"
    ) &&

    !MEMORA_SUPABASE_ANON_KEY.includes(
      "PASTE_"
    )

  );

}



/* =========================================================
   CREATE CLIENT
   ========================================================= */

let memoraSupabase =
  null;


if (
  isMemoraSupabaseConfigured()
) {

  if (
    typeof window.supabase ===
    "undefined"
  ) {

    console.error(
      "Supabase library belum dimuat."
    );

  }

  else {

    memoraSupabase =
      window.supabase.createClient(
        MEMORA_SUPABASE_URL,
        MEMORA_SUPABASE_ANON_KEY,
        {

          auth: {

            persistSession:
              true,

            autoRefreshToken:
              true,

            detectSessionInUrl:
              true

          }

        }
      );

  }

}

else {

  console.warn(
    "Memora Supabase belum dikonfigurasi. Isi Project URL dan anon key di js/supabase.js."
  );

}



/* =========================================================
   GLOBAL
   ========================================================= */

window.memoraSupabase =
  memoraSupabase;


window.isMemoraSupabaseConfigured =
  isMemoraSupabaseConfigured;