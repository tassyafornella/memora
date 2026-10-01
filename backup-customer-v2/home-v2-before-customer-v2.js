(function () {

  "use strict";


  function supabaseClient() {

    return window.memoraSupabase || null;

  }


  function readCart() {

    try {

      const cart =
        JSON.parse(
          localStorage.getItem(
            "memora_cart"
          ) || "[]"
        );


      return Array.isArray(cart)
        ? cart
        : [];

    }
    catch (error) {

      return [];

    }

  }


  function cartQuantity() {

    return readCart()
      .reduce(
        function (
          total,
          item
        ) {

          return (
            total +
            (
              Number(
                item.quantity
              ) || 1
            )
          );

        },
        0
      );

  }


  function renderCartCount() {

    const total =
      cartQuantity();


    const top =
      document.getElementById(
        "homeCartCount"
      );


    const bottom =
      document.getElementById(
        "bottomCartCount"
      );


    if (top) {

      top.textContent =
        total;

    }


    if (bottom) {

      bottom.textContent =
        total;

    }

  }


  function openDrawer() {

    const drawer =
      document.getElementById(
        "homeDrawer"
      );


    if (!drawer) {
      return;
    }


    drawer.hidden =
      false;


    document.body
      .classList
      .add(
        "home-drawer-open"
      );

  }


  function closeDrawer() {

    const drawer =
      document.getElementById(
        "homeDrawer"
      );


    if (!drawer) {
      return;
    }


    drawer.hidden =
      true;


    document.body
      .classList
      .remove(
        "home-drawer-open"
      );

  }


  function bindDrawer() {

    document
      .getElementById(
        "homeMenuButton"
      )
      ?.addEventListener(
        "click",
        openDrawer
      );


    document
      .querySelectorAll(
        "[data-close-home-drawer]"
      )
      .forEach(
        function (
          element
        ) {

          element.addEventListener(
            "click",
            closeDrawer
          );

        }
      );


    document
      .querySelectorAll(
        ".home-drawer-nav a"
      )
      .forEach(
        function (
          link
        ) {

          link.addEventListener(
            "click",
            closeDrawer
          );

        }
      );

  }


  async function logout() {

    const supabase =
      supabaseClient();


    if (supabase) {

      try {

        await supabase
          .auth
          .signOut();

      }
      catch (error) {

        console.error(
          "Logout:",
          error
        );

      }

    }


    window.location.href =
      "./";

  }


  function setLoggedInNavigation() {

    document
      .querySelectorAll(
        "[data-home-login-link], [data-home-register-link]"
      )
      .forEach(
        function (
          element
        ) {

          element.hidden =
            true;

        }
      );


    document
      .querySelectorAll(
        "[data-home-logout]"
      )
      .forEach(
        function (
          element
        ) {

          element.hidden =
            false;

        }
      );


    const cta =
      document.querySelector(
        "[data-home-account-cta]"
      );


    if (cta) {

      cta.textContent =
        "View My Orders →";

      cta.href =
        "account/";

    }

  }


  function setLoggedOutNavigation() {

    document
      .querySelectorAll(
        "[data-home-login-link], [data-home-register-link]"
      )
      .forEach(
        function (
          element
        ) {

          element.hidden =
            false;

        }
      );


    document
      .querySelectorAll(
        "[data-home-logout]"
      )
      .forEach(
        function (
          element
        ) {

          element.hidden =
            true;

        }
      );


    document
      .querySelectorAll(
        "[data-home-profile-link]"
      )
      .forEach(
        function (
          element
        ) {

          element.href =
            "account/login/";

        }
      );


    const cta =
      document.querySelector(
        "[data-home-account-cta]"
      );


    if (cta) {

      cta.textContent =
        "Login to My Account →";

      cta.href =
        "account/login/";

    }

  }


  async function initAuthNavigation() {

    const supabase =
      supabaseClient();


    if (!supabase) {

      setLoggedOutNavigation();

      return;

    }


    try {

      const {
        data,
        error
      } =
        await supabase
          .auth
          .getUser();


      if (
        error ||
        !data?.user
      ) {

        setLoggedOutNavigation();

        return;

      }


      setLoggedInNavigation();

    }
    catch (error) {

      console.error(
        "Homepage auth:",
        error
      );


      setLoggedOutNavigation();

    }

  }


  function bindLogout() {

    document
      .querySelectorAll(
        "[data-home-logout]"
      )
      .forEach(
        function (
          button
        ) {

          button.addEventListener(
            "click",
            logout
          );

        }
      );

  }


  document.addEventListener(
    "DOMContentLoaded",
    function () {

      renderCartCount();

      bindDrawer();

      bindLogout();

      initAuthNavigation();

    }
  );


  window.addEventListener(
    "storage",
    function (
      event
    ) {

      if (
        event.key ===
        "memora_cart"
      ) {

        renderCartCount();

      }

    }
  );


})();
