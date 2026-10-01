(function () {

  "use strict";


  function getSupabase() {
    return window.memoraSupabase || null;
  }


  function getCart() {

    try {

      const cart = JSON.parse(
        localStorage.getItem("memora_cart") || "[]"
      );

      return Array.isArray(cart)
        ? cart
        : [];

    }
    catch (error) {

      console.error(
        "Memora cart:",
        error
      );

      return [];
    }

  }


  function getCartCount() {

    return getCart().reduce(
      function (total, item) {

        const quantity =
          Number(item.quantity) || 1;

        return total + quantity;

      },
      0
    );

  }


  function removeDuplicateNavs() {

    const navs =
      Array.from(
        document.querySelectorAll(
          ".customer-nav"
        )
      );


    if (!navs.length) {
      return null;
    }


    let primary =
      document.querySelector(
        ".site-header .customer-nav"
      );


    if (!primary) {
      primary = navs[0];
    }


    navs.forEach(
      function (nav) {

        if (nav !== primary) {
          nav.remove();
        }

      }
    );


    return primary;
  }


  function createLink(
    href,
    text,
    className
  ) {

    const link =
      document.createElement("a");

    link.href = href;
    link.textContent = text;

    if (className) {
      link.className = className;
    }

    return link;
  }


  async function renderNavigation() {

    const nav =
      removeDuplicateNavs();


    if (!nav) {
      return;
    }


    let loggedIn = false;

    const supabase =
      getSupabase();


    if (supabase) {

      try {

        const { data } =
          await supabase.auth.getUser();

        loggedIn =
          Boolean(data?.user);

      }
      catch (error) {

        console.error(
          "Memora navigation:",
          error
        );

      }

    }


    nav.innerHTML = "";


    nav.appendChild(
      createLink(
        "/",
        "Beranda"
      )
    );


    nav.appendChild(
      createLink(
        "/#collection",
        "Koleksi"
      )
    );


    const cart =
      createLink(
        "/cart/",
        "Keranjang",
        "customer-cart-link"
      );


    const count =
      getCartCount();


    if (count > 0) {

      const badge =
        document.createElement(
          "span"
        );

      badge.className =
        "customer-cart-badge";

      badge.textContent =
        count;

      cart.appendChild(
        badge
      );
    }


    nav.appendChild(cart);


    nav.appendChild(
      createLink(
        loggedIn
          ? "/account/"
          : "/account/login/",
        "Saya"
      )
    );

  }


  document.addEventListener(
    "DOMContentLoaded",
    renderNavigation
  );


  window.addEventListener(
    "storage",
    function (event) {

      if (
        event.key ===
        "memora_cart"
      ) {

        renderNavigation();

      }

    }
  );


})();
