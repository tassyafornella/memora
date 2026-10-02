(function () {

  "use strict";


  const NAV_ITEMS = [
    {
      key: "home",
      label: "Home",
      href: "/"
    },
    {
      key: "cart",
      label: "Keranjang",
      href: "/cart/"
    },
    {
      key: "orders",
      label: "Pesanan",
      href: "/account/orders/"
    },
    {
      key: "account",
      label: "Akun",
      href: "/account/"
    }
  ];


  function currentPath() {

    let path =
      window.location.pathname || "/";


    path =
      path
        .replace(
          /\/index\.html$/i,
          "/"
        )
        .replace(
          /\/+/g,
          "/"
        );


    if (
      path !== "/" &&
      !path.endsWith("/")
    ) {

      path += "/";

    }


    return path;

  }


  function activeKey() {

    const path =
      currentPath();


    if (
      path === "/"
    ) {

      return "home";

    }


    if (
      path.startsWith(
        "/cart/"
      )
    ) {

      return "cart";

    }


    if (
      path.startsWith(
        "/account/orders/"
      ) ||
      path.startsWith(
        "/track/"
      )
    ) {

      return "orders";

    }


    if (
      path.startsWith(
        "/account/"
      )
    ) {

      return "account";

    }


    /*
     * Product, checkout dan halaman customer lain
     * sengaja tidak memiliki active menu.
     */
    return "";

  }


  function iconSvg(key) {

    switch (key) {

      case "home":

        return `
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M3 11l9-8 9 8"></path>
            <path d="M5 10v10h14V10"></path>
            <path d="M9 20v-6h6v6"></path>
          </svg>
        `;


      case "cart":

        return `
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M3 4h2l2.2 9.1a2 2 0 0 0 1.9 1.5h7.8a2 2 0 0 0 1.9-1.4L20 8H7"></path>
            <circle cx="10" cy="19" r="1.3"></circle>
            <circle cx="17" cy="19" r="1.3"></circle>
          </svg>
        `;


      case "orders":

        return `
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6 3h12v18H6z"></path>
            <path d="M9 7h6"></path>
            <path d="M9 11h6"></path>
            <path d="M9 15h4"></path>
          </svg>
        `;


      case "account":

        return `
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4"></circle>
            <path d="M4.8 20c.8-4 3.5-6 7.2-6s6.4 2 7.2 6"></path>
          </svg>
        `;


      default:

        return "";

    }

  }


  function removeOldCustomerNavigation() {

    const selectors = [

      /*
       * HOME APP UI
       */
      ".app-header",
      ".bottom-nav",

      /*
       * CUSTOMER NAV GENERATIONS
       */
      ".customer-header",
      ".customer-navbar",
      ".customer-nav",
      ".bottom-navigation",

      /*
       * OLD PRODUCT/CUSTOMER HEADER
       */
      "header.top-header",
      "nav.mobile-menu",

      /*
       * GENERIC OLD CUSTOMER HEADER
       * hanya dihapus kalau bukan global nav.
       */
      "header.site-header"

    ];


    selectors.forEach(
      function (selector) {

        document
          .querySelectorAll(
            selector
          )
          .forEach(
            function (element) {

              if (
                element.closest(
                  ".memora-global-header"
                ) ||
                element.closest(
                  ".memora-global-bottom-nav"
                )
              ) {

                return;

              }


              element.remove();

            }
          );

      }
    );

  }


  function buildDesktopNav(
    selected
  ) {

    const links =
      NAV_ITEMS
        .map(
          function (item) {

            const activeClass =
              selected === item.key
                ? " is-active"
                : "";


            const current =
              selected === item.key
                ? ' aria-current="page"'
                : "";


            const badge =
              item.key === "cart"
                ? `
                  <span
                    class="memora-global-badge"
                    data-global-cart-count
                  >
                    0
                  </span>
                `
                : "";


            return `
              <a
                href="${item.href}"
                class="memora-global-desktop-link${activeClass} ${item.key === "cart" ? "memora-global-cart-link" : ""}"
                data-global-nav="${item.key}"
                ${current}
              >
                <span>${item.label}</span>
                ${badge}
              </a>
            `;

          }
        )
        .join("");


    return `
      <header
        class="memora-global-header"
        data-memora-global-header
      >

        <div class="memora-global-header-inner">

          <a
            href="/"
            class="memora-global-brand"
            aria-label="Memora Home"
          >
            MEMORA
          </a>

          <nav
            class="memora-global-desktop-nav"
            aria-label="Navigasi utama"
          >
            ${links}
          </nav>

        </div>

      </header>
    `;

  }


  function buildMobileNav(
    selected
  ) {

    const links =
      NAV_ITEMS
        .map(
          function (item) {

            const activeClass =
              selected === item.key
                ? " is-active"
                : "";


            const current =
              selected === item.key
                ? ' aria-current="page"'
                : "";


            const badge =
              item.key === "cart"
                ? `
                  <span
                    class="memora-global-mobile-badge"
                    data-global-cart-count
                  >
                    0
                  </span>
                `
                : "";


            return `
              <a
                href="${item.href}"
                class="memora-global-mobile-link${activeClass}"
                data-global-nav="${item.key}"
                ${current}
              >

                <span class="memora-global-mobile-icon">
                  ${iconSvg(item.key)}
                  ${badge}
                </span>

                <span>
                  ${item.label}
                </span>

              </a>
            `;

          }
        )
        .join("");


    return `
      <nav
        class="memora-global-bottom-nav"
        data-memora-global-bottom-nav
        aria-label="Navigasi mobile"
      >
        ${links}
      </nav>
    `;

  }


  function getCartItems() {

    try {

      const value =
        JSON.parse(
          localStorage.getItem(
            "memora_cart"
          ) ||
          "[]"
        );


      return (
        Array.isArray(value)
          ? value
          : []
      );

    }
    catch (error) {

      console.warn(
        "Memora cart:",
        error
      );


      return [];

    }

  }


  function cartCount() {

    return getCartItems()
      .reduce(
        function (
          total,
          item
        ) {

          const quantity =
            Number(
              item?.quantity ??
              item?.qty ??
              1
            );


          return (
            total +
            (
              Number.isFinite(
                quantity
              )
                ? Math.max(
                    1,
                    quantity
                  )
                : 1
            )
          );

        },
        0
      );

  }


  function renderCartBadge() {

    const count =
      cartCount();


    document
      .querySelectorAll(
        "[data-global-cart-count]"
      )
      .forEach(
        function (badge) {

          badge.textContent =
            count > 99
              ? "99+"
              : String(count);


          badge.classList.toggle(
            "is-visible",
            count > 0
          );

        }
      );

  }


  function renderNavigation() {

    /*
     * Hindari inject dua kali.
     */
    document
      .querySelector(
        "[data-memora-global-header]"
      )
      ?.remove();


    document
      .querySelector(
        "[data-memora-global-bottom-nav]"
      )
      ?.remove();


    removeOldCustomerNavigation();


    const selected =
      activeKey();


    document.body
      .insertAdjacentHTML(
        "afterbegin",
        buildDesktopNav(
          selected
        )
      );


    document.body
      .insertAdjacentHTML(
        "beforeend",
        buildMobileNav(
          selected
        )
      );


    document.body
      .classList
      .add(
        "memora-global-nav-ready"
      );


    renderCartBadge();

  }


  function initialize() {

    renderNavigation();

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );

  }
  else {

    initialize();

  }


  window.addEventListener(
    "pageshow",
    renderCartBadge
  );


  window.addEventListener(
    "storage",
    function (event) {

      if (
        event.key ===
        "memora_cart"
      ) {

        renderCartBadge();

      }

    }
  );


  /*
   * Bisa dipanggil JS cart setelah quantity berubah.
   */
  window.memoraRenderCustomerNav =
    renderNavigation;


  window.memoraUpdateCartBadge =
    renderCartBadge;

})();
