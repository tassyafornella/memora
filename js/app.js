(function () {

  "use strict";


  const CART_KEY =
    "memora_cart";


  function readCart() {

    try {

      const raw =
        localStorage.getItem(
          CART_KEY
        );


      const data =
        raw
          ? JSON.parse(raw)
          : [];


      return Array.isArray(data)
        ? data
        : [];

    }
    catch (error) {

      console.error(
        "MEMORA cart:",
        error
      );


      return [];

    }

  }


  function cartCount() {

    /*
     * Badge menghitung jumlah item/line product.
     *
     * 1 Wedding Invitation x 50 pcs
     * tetap ditampilkan sebagai Cart 1.
     */

    return readCart().length;

  }


  function cartQuantity() {

    return readCart()
      .reduce(
        (total, item) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      );

  }


  function createHeader() {

    if (
      document.getElementById(
        "memoraSiteHeader"
      )
    ) {

      return;

    }


    const header =
      document.createElement(
        "header"
      );


    header.id =
      "memoraSiteHeader";


    header.className =
      "memora-header";


    header.innerHTML = `
      <div class="memora-header-inner">


        <a
          href="/"
          class="memora-logo"
          aria-label="MEMORA Home"
        >
          MEMORA
        </a>


        <nav
          class="memora-main-nav"
          aria-label="Main navigation"
        >

          <a
            href="/#collection"
            class="memora-nav-link"
          >
            Collection
          </a>


          <a
            href="/account/orders/"
            class="memora-nav-link"
          >
            My Orders
          </a>

        </nav>


        <div class="memora-header-actions">


          <a
            href="/account/"
            class="memora-icon-link"
            aria-label="Account"
            title="Account"
          >

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
              ></circle>

              <path
                d="M4.5 20c.8-4.1 3.3-6.2 7.5-6.2s6.7 2.1 7.5 6.2"
              ></path>
            </svg>

            <span class="memora-action-text">
              Account
            </span>

          </a>


          <a
            href="/cart/"
            class="memora-icon-link memora-cart-link"
            aria-label="Cart"
            title="Cart"
          >

            <span class="memora-cart-icon-wrap">

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20.5 8H6"
                ></path>

                <circle
                  cx="10"
                  cy="19"
                  r="1.2"
                ></circle>

                <circle
                  cx="17"
                  cy="19"
                  r="1.2"
                ></circle>
              </svg>

              <span
                class="memora-cart-badge"
                id="memoraCartBadge"
                hidden
              >
                0
              </span>

            </span>


            <span class="memora-action-text">
              Cart
            </span>

          </a>


          <button
            type="button"
            class="memora-menu-button"
            id="memoraMenuButton"
            aria-label="Open menu"
            aria-expanded="false"
          >

            <span></span>
            <span></span>
            <span></span>

          </button>


        </div>


      </div>


      <div
        class="memora-mobile-menu"
        id="memoraMobileMenu"
        hidden
      >

        <a href="/#collection">
          Collection
        </a>

        <a href="/account/orders/">
          My Orders
        </a>

        <a href="/account/">
          Account
        </a>

        <a href="/cart/">
          Cart
          <span id="memoraMobileCartCount">
            0
          </span>
        </a>

      </div>
    `;


    document.body.insertBefore(
      header,
      document.body.firstChild
    );


    bindHeader();

    updateCartBadge();

  }


  function updateCartBadge() {

    const count =
      cartCount();


    const badge =
      document.getElementById(
        "memoraCartBadge"
      );


    const mobile =
      document.getElementById(
        "memoraMobileCartCount"
      );


    if (badge) {

      badge.textContent =
        String(count);


      badge.hidden =
        count <= 0;

    }


    if (mobile) {

      mobile.textContent =
        count > 0
          ? `(${count})`
          : "";

    }


    document
      .querySelectorAll(
        "[data-memora-cart-quantity]"
      )
      .forEach(
        element => {

          element.textContent =
            String(
              cartQuantity()
            );

        }
      );

  }


  function bindHeader() {

    const button =
      document.getElementById(
        "memoraMenuButton"
      );


    const menu =
      document.getElementById(
        "memoraMobileMenu"
      );


    button
      ?.addEventListener(
        "click",
        () => {

          const opened =
            !menu.hidden;


          menu.hidden =
            opened;


          button.setAttribute(
            "aria-expanded",
            String(
              !opened
            )
          );


          document.body
            .classList
            .toggle(
              "memora-menu-open",
              !opened
            );

        }
      );


    menu
      ?.querySelectorAll(
        "a"
      )
      .forEach(
        link => {

          link.addEventListener(
            "click",
            () => {

              menu.hidden =
                true;


              button
                ?.setAttribute(
                  "aria-expanded",
                  "false"
                );


              document.body
                .classList
                .remove(
                  "memora-menu-open"
                );

            }
          );

        }
      );

  }


  function highlightCurrentPage() {

    const path =
      window.location.pathname;


    document
      .querySelectorAll(
        ".memora-header a"
      )
      .forEach(
        link => {

          link.classList.remove(
            "active"
          );

        }
      );


    if (
      path.startsWith(
        "/account/orders"
      )
    ) {

      document
        .querySelector(
          '.memora-header a[href="/account/orders/"]'
        )
        ?.classList.add(
          "active"
        );

    }
    else if (
      path.startsWith(
        "/account"
      )
    ) {

      document
        .querySelector(
          '.memora-header a[href="/account/"]'
        )
        ?.classList.add(
          "active"
        );

    }
    else if (
      path.startsWith(
        "/cart"
      )
    ) {

      document
        .querySelector(
          '.memora-header a[href="/cart/"]'
        )
        ?.classList.add(
          "active"
        );

    }

  }


  function init() {

    createHeader();

    highlightCurrentPage();

    updateCartBadge();

  }


  window.memoraUpdateCartBadge =
    updateCartBadge;


  window.addEventListener(
    "storage",
    event => {

      if (
        event.key ===
        CART_KEY
      ) {

        updateCartBadge();

      }

    }
  );


  window.addEventListener(
    "memora-cart-updated",
    updateCartBadge
  );


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  }
  else {

    init();

  }


})();