(function () {

  "use strict";


  const supabase =
    window.memoraSupabase;


  async function init() {

    if (!supabase) {
      return;
    }


    const {
      data,
      error
    } =
      await supabase.auth.getSession();


    if (
      error ||
      !data?.session
    ) {
      return;
    }


    const user =
      data.session.user;


    let name =
      user.user_metadata?.full_name ||
      "";


    try {

      const {
        data: customer
      } =
        await supabase
          .from("customers")
          .select("full_name")
          .eq(
            "auth_user_id",
            user.id
          )
          .maybeSingle();


      if (
        customer?.full_name
      ) {

        name =
          customer.full_name;

      }

    }
    catch (error) {

      console.error(
        "Load account name:",
        error
      );

    }


    const greeting =
      document.getElementById(
        "accountHubGreeting"
      );


    if (
      greeting &&
      name
    ) {

      const firstName =
        name
          .trim()
          .split(/\s+/)[0];


      greeting.textContent =
        `Halo, ${firstName}`;

    }


    const logout =
      document.getElementById(
        "accountHubLogout"
      );


    if (logout) {

      logout.addEventListener(
        "click",
        async function () {

          const confirmed =
            window.confirm(
              "Keluar dari akun Memora?"
            );


          if (!confirmed) {
            return;
          }


          await supabase
            .auth
            .signOut();


          localStorage.removeItem(
            "memora_after_auth"
          );


          window.location.href =
            "/account/login/";

        }
      );

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );

})();
