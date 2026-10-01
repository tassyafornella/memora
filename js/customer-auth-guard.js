(function () {

  "use strict";

  async function protectPage() {

    const supabase =
      window.memoraSupabase || null;

    if (!supabase) {
      console.error("Supabase customer client belum tersedia.");
      return;
    }

    try {

      const { data, error } =
        await supabase.auth.getSession();

      const session =
        data?.session || null;

      if (error || !session) {

        const currentPage =
          window.location.pathname +
          window.location.search +
          window.location.hash;

        localStorage.setItem(
          "memora_after_auth",
          currentPage
        );

        const loginUrl =
          "/account/login/?next=" +
          encodeURIComponent(currentPage);

        window.location.replace(loginUrl);

        return;
      }

      document.documentElement
        .classList
        .add("customer-auth-ready");

    }
    catch (error) {

      console.error(
        "Customer auth guard:",
        error
      );

    }

  }

  document.addEventListener(
    "DOMContentLoaded",
    protectPage
  );

})();
