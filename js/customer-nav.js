(function () {

  "use strict";


  function getSupabase() {
    return window.memoraSupabase || null;
  }


  function getAllNavs() {

    return Array.from(
      document.querySelectorAll(".customer-nav")
    );

  }


  function clearAuthMenus(nav) {

    nav
      .querySelectorAll(
        ".customer-auth-menu"
      )
      .forEach(
        element => element.remove()
      );

  }


  function addLoggedOutMenu(nav) {

    clearAuthMenus(nav);


    const login =
      document.createElement("a");

    login.href =
      "/account/login/";

    login.textContent =
      "Login";

    login.className =
      "customer-auth-menu";


    const register =
      document.createElement("a");

    register.href =
      "/account/register/";

    register.textContent =
      "Register";

    register.className =
      "customer-auth-menu";


    nav.appendChild(login);
    nav.appendChild(register);

  }


  function addLoggedInMenu(nav) {

    clearAuthMenus(nav);


    const profile =
      document.createElement("a");

    profile.href =
      "/account/";

    profile.textContent =
      "Profile";

    profile.className =
      "customer-auth-menu";


    const logout =
      document.createElement("button");

    logout.type =
      "button";

    logout.textContent =
      "Logout";

    logout.className =
      "customer-nav-logout customer-auth-menu";

    logout.setAttribute(
      "data-customer-logout",
      ""
    );


    nav.appendChild(profile);
    nav.appendChild(logout);

  }


  async function handleLogout() {

    const supabase =
      getSupabase();


    if (!supabase) {
      return;
    }


    try {

      await supabase.auth.signOut();

    }
    catch (error) {

      console.error(
        "Logout:",
        error
      );

    }


    window.location.href =
      "/";

  }


  function bindLogoutButtons() {

    document
      .querySelectorAll(
        "[data-customer-logout]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            handleLogout
          );

        }
      );

  }


  async function initCustomerNav() {

    const navs =
      getAllNavs();


    if (!navs.length) {
      return;
    }


    const supabase =
      getSupabase();


    if (!supabase) {

      navs.forEach(
        addLoggedOutMenu
      );

      return;

    }


    try {

      const {
        data,
        error
      } =
        await supabase.auth.getUser();


      if (
        error ||
        !data?.user
      ) {

        navs.forEach(
          addLoggedOutMenu
        );

        return;

      }


      navs.forEach(
        addLoggedInMenu
      );


      bindLogoutButtons();

    }
    catch (error) {

      console.error(
        "Customer navigation:",
        error
      );


      navs.forEach(
        addLoggedOutMenu
      );

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    initCustomerNav
  );


})();
