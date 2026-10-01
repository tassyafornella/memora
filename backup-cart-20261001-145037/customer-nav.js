(function () {

  "use strict";


  function getSupabase() {
    return window.memoraSupabase || null;
  }


  function getNavs() {
    return Array.from(
      document.querySelectorAll(".customer-nav")
    );
  }


  function removeExistingAuthMenus(nav) {

    Array.from(nav.children).forEach(function (element) {

      const text =
        String(element.textContent || "")
          .trim()
          .toLowerCase();

      const href =
        element.getAttribute("href") || "";


      if (
        text === "profile" ||
        text === "logout" ||
        text === "login" ||
        text === "register" ||
        href.includes("/account/")
      ) {
        element.remove();
      }

    });

  }


  function renderLoggedIn(nav) {

    removeExistingAuthMenus(nav);


    const profile =
      document.createElement("a");

    profile.href =
      "/account/";

    profile.textContent =
      "Profile";


    const logout =
      document.createElement("button");

    logout.type =
      "button";

    logout.textContent =
      "Logout";

    logout.className =
      "customer-nav-logout";

    logout.addEventListener(
      "click",
      async function () {

        const supabase =
          getSupabase();

        if (supabase) {
          await supabase.auth.signOut();
        }

        window.location.href =
          "/";

      }
    );


    nav.appendChild(profile);
    nav.appendChild(logout);

  }


  function renderLoggedOut(nav) {

    removeExistingAuthMenus(nav);


    const login =
      document.createElement("a");

    login.href =
      "/account/login/";

    login.textContent =
      "Login";


    const register =
      document.createElement("a");

    register.href =
      "/account/register/";

    register.textContent =
      "Register";


    nav.appendChild(login);
    nav.appendChild(register);

  }


  async function init() {

    const navs =
      getNavs();

    if (!navs.length) {
      return;
    }


    const supabase =
      getSupabase();


    if (!supabase) {

      navs.forEach(
        renderLoggedOut
      );

      return;

    }


    try {

      const {
        data
      } =
        await supabase.auth.getUser();


      if (data?.user) {

        navs.forEach(
          renderLoggedIn
        );

      }
      else {

        navs.forEach(
          renderLoggedOut
        );

      }

    }
    catch (error) {

      console.error(
        "Navbar:",
        error
      );

      navs.forEach(
        renderLoggedOut
      );

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );

})();
