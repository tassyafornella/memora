(function () {

  "use strict";


  function getSupabase() {

    return window.memoraSupabase || null;

  }


  /* =======================================================
     CART
     ======================================================= */

  function getCart() {

    try {

      const raw =
        localStorage.getItem(
          "memora_cart"
        );


      if (!raw) {

        return [];

      }


      const cart =
        JSON.parse(raw);


      return Array.isArray(cart)
        ? cart
        : [];

    }
    catch (error) {

      console.error(
        "Cart read:",
        error
      );


      return [];

    }

  }


  function getCartCount() {

    return getCart()
      .reduce(
        function (
          total,
          item
        ) {

          const quantity =
            Number(
              item.quantity
            ) || 1;


          return total + quantity;

        },
        0
      );

  }


  function updateCartBadge() {

    const count =
      getCartCount();


    const headerBadge =
      document.getElementById(
        "headerCartBadge"
      );


    const bottomBadge =
      document.getElementById(
        "bottomCartBadge"
      );


    if (headerBadge) {

      headerBadge.textContent =
        count;


      headerBadge.style.display =
        count > 0
          ? "flex"
          : "none";

    }


    if (bottomBadge) {

      bottomBadge.textContent =
        count;


      bottomBadge.style.display =
        count > 0
          ? "flex"
          : "none";

    }

  }



  /* =======================================================
     DRAWER
     ======================================================= */

  function openDrawer() {

    const drawer =
      document.getElementById(
        "mobileDrawer"
      );


    if (!drawer) {

      return;

    }


    drawer.hidden =
      false;


    document.body
      .classList
      .add(
        "drawer-open"
      );

  }


  function closeDrawer() {

    const drawer =
      document.getElementById(
        "mobileDrawer"
      );


    if (!drawer) {

      return;

    }


    drawer.hidden =
      true;


    document.body
      .classList
      .remove(
        "drawer-open"
      );

  }


  function bindDrawer() {

    document
      .getElementById(
        "mobileMenuButton"
      )
      ?.addEventListener(
        "click",
        openDrawer
      );


    document
      .querySelectorAll(
        "[data-close-drawer]"
      )
      .forEach(
        function (
          element
        ) {

          element
            .addEventListener(
              "click",
              closeDrawer
            );

        }
      );


    document
      .querySelectorAll(
        ".mobile-drawer-navigation a"
      )
      .forEach(
        function (
          link
        ) {

          link
            .addEventListener(
              "click",
              closeDrawer
            );

        }
      );

  }



  /* =======================================================
     AUTH
     ======================================================= */

  function setLoggedOut() {

    document
      .querySelectorAll(
        "[data-account-link]"
      )
      .forEach(
        function (
          element
        ) {

          element.href =
            "/account/login/";

        }
      );


    document
      .querySelectorAll(
        "[data-guest-link]"
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
        "[data-logout]"
      )
      .forEach(
        function (
          element
        ) {

          element.hidden =
            true;

        }
      );


    const accountCTA =
      document.getElementById(
        "accountCallToAction"
      );


    if (accountCTA) {

      accountCTA.href =
        "/account/login/";


      accountCTA.textContent =
        "Login ke Akun Saya →";

    }

  }


  function setLoggedIn() {

    document
      .querySelectorAll(
        "[data-account-link]"
      )
      .forEach(
        function (
          element
        ) {

          element.href =
            "/account/";

        }
      );


    document
      .querySelectorAll(
        "[data-guest-link]"
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
        "[data-logout]"
      )
      .forEach(
        function (
          element
        ) {

          element.hidden =
            false;

        }
      );


    const accountCTA =
      document.getElementById(
        "accountCallToAction"
      );


    if (accountCTA) {

      accountCTA.href =
        "/account/";


      accountCTA.textContent =
        "Lihat Pesanan Saya →";

    }

  }


  async function initializeAuth() {

    const supabase =
      getSupabase();


    if (!supabase) {

      setLoggedOut();

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

        setLoggedOut();

        return;

      }


      setLoggedIn();

    }
    catch (error) {

      console.error(
        "Homepage auth:",
        error
      );


      setLoggedOut();

    }

  }


  async function logout() {

    const supabase =
      getSupabase();


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


    localStorage.removeItem(
      "memora_customer"
    );


    window.location.href =
      "/";

  }


  function bindLogout() {

    document
      .querySelectorAll(
        "[data-logout]"
      )
      .forEach(
        function (
          button
        ) {

          button
            .addEventListener(
              "click",
              logout
            );

        }
      );

  }



  /* =======================================================
     INIT
     ======================================================= */

  function initialize() {

    updateCartBadge();

    bindDrawer();

    bindLogout();

    initializeAuth();

  }


  document
    .addEventListener(
      "DOMContentLoaded",
      initialize
    );


  window
    .addEventListener(
      "storage",
      function (
        event
      ) {

        if (
          event.key ===
          "memora_cart"
        ) {

          updateCartBadge();

        }

      }
    );


})();
