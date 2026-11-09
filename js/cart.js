(function () {

  "use strict";


  const CART_KEY =
    "memora_cart";


  const MINIMUM = {
    invitation: 50,
    bridesmaid: 5,
    keepsake: 1
  };


  function rupiah(value) {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }
    ).format(
      Number(value) || 0
    );

  }


  function readCart() {

    try {

      const parsed =
        JSON.parse(
          localStorage.getItem(
            CART_KEY
          ) || "[]"
        );


      return Array.isArray(parsed)
        ? parsed
        : [];

    }
    catch {

      return [];

    }

  }


  function saveCart(cart) {

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );


    window.dispatchEvent(
      new Event(
        "memora-cart-updated"
      )
    );

  }


  function escapeHtml(value) {

    return String(
      value ?? ""
    )
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function productLabel(item) {

    const key =
      String(
        item.productId || ""
      );


    if (
      key === "invitation"
    ) {

      return "Invitation";

    }


    if (
      key === "bridesmaid"
    ) {

      return "Bridesmaid";

    }


    if (
      key === "keepsake"
    ) {

      return "Keepsake";

    }


    return "MEMORA";

  }


  function personalizationText(item) {

    const data =
      item.personalization || {};


    const entries =
      Object.entries(data)
        .filter(
          ([, value]) =>
            String(value || "")
              .trim() !== ""
        );


    if (
      entries.length === 0
    ) {

      return "Tidak ada catatan personalisasi.";

    }


    return entries
      .map(
        ([key, value]) => {

          const labels = {

            firstName:
              "Nama Pertama",

            secondName:
              "Nama Kedua",

            eventDate:
              "Tanggal",

            theme:
              "Tema",

            customerNote:
              "Catatan"

          };


          const label =
            labels[key] ||
            key;


          return `${label}: ${value}`;

        }
      )
      .join(" ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚- ");

  }


  function itemTemplate(item) {

    const id =
      escapeHtml(
        item.cartItemId
      );


    const productId =
      escapeHtml(
        item.productId
      );


    return `
      <article
        class="cart-item"
        data-cart-id="${id}"
      >

        <div class="cart-item-image">

          <div class="cart-item-paper">
            MEMORA
          </div>

        </div>


        <div class="cart-item-content">

          <span class="cart-item-category">
            ${escapeHtml(productLabel(item))}
          </span>

          <h2 class="cart-item-name">
            ${escapeHtml(item.productName)}
          </h2>


          <div class="cart-item-meta">

            <span>
              Package:
              <strong>
                ${escapeHtml(item.packageName)}
              </strong>
            </span>

            <span>
              Design:
              <strong>
                ${escapeHtml(item.design)}
              </strong>
            </span>

          </div>


          <div class="personalization-summary">
            ${escapeHtml(personalizationText(item))}
          </div>


          <div class="cart-item-bottom">

            <div class="cart-quantity">

              <button
                type="button"
                data-action="decrease"
                data-id="${id}"
                aria-label="Kurangi jumlah"
              >-</button>

              <input
                type="number"
                value="${Number(item.quantity) || 0}"
                min="1"
                data-action="quantity"
                data-id="${id}"
                data-product="${productId}"
              >

              <button
                type="button"
                data-action="increase"
                data-id="${id}"
                aria-label="Tambah jumlah"
              >+</button>

            </div>


            <button
              type="button"
              class="remove-item-button"
              data-action="remove"
              data-id="${id}"
            >
              Remove
            </button>

          </div>

        </div>


        <div class="cart-item-price">

          <div class="cart-item-unit-price">
            ${rupiah(item.unitPrice)}
            / ${escapeHtml(item.unit || "pcs")}
          </div>

          <div class="cart-item-subtotal">
            ${rupiah(item.subtotal)}
          </div>

        </div>

      </article>
    `;

  }


  function render() {

    const cart =
      readCart();


    const layout =
      document.getElementById(
        "cartLayout"
      );


    const empty =
      document.getElementById(
        "cartEmpty"
      );


    const items =
      document.getElementById(
        "cartItems"
      );


    const clearButton =
      document.getElementById(
        "clearCartButton"
      );


    if (
      cart.length === 0
    ) {

      layout.hidden =
        true;


      empty.hidden =
        false;


      clearButton.hidden =
        true;


      return;

    }


    layout.hidden =
      false;


    empty.hidden =
      true;


    clearButton.hidden =
      false;


    items.innerHTML =
      cart
        .map(itemTemplate)
        .join("");


    updateSummary(cart);

  }


  function updateSummary(cart) {

    const totalQuantity =
      cart.reduce(
        (sum, item) =>
          sum +
          Number(
            item.quantity || 0
          ),
        0
      );


    const total =
      cart.reduce(
        (sum, item) =>
          sum +
          Number(
            item.subtotal || 0
          ),
        0
      );


    document.getElementById(
      "summaryItemCount"
    ).textContent =
      String(cart.length);


    document.getElementById(
      "summaryQuantity"
    ).textContent =
      `${totalQuantity} pcs`;


    document.getElementById(
      "summaryTotal"
    ).textContent =
      rupiah(total);

  }


  function showToast(message) {

    const toast =
      document.getElementById(
        "cartToast"
      );


    toast.textContent =
      message;


    toast.hidden =
      false;


    clearTimeout(
      showToast.timer
    );


    showToast.timer =
      setTimeout(
        () => {

          toast.hidden =
            true;

        },
        2200
      );

  }


  function findItem(cart, id) {

    return cart.find(
      item =>
        String(
          item.cartItemId
        ) ===
        String(id)
    );

  }


  function setQuantity(
    id,
    requested
  ) {

    const cart =
      readCart();


    const item =
      findItem(
        cart,
        id
      );


    if (!item) {

      return;

    }


    const minimum =
      MINIMUM[
        item.productId
      ] || 1;


    let quantity =
      Number(requested);


    if (
      !Number.isFinite(
        quantity
      )
    ) {

      quantity =
        minimum;

    }


    if (
      quantity <
      minimum
    ) {

      quantity =
        minimum;


      showToast(
        `Pembelian minimal ${minimum} pcs`
      );

    }


    item.quantity =
      quantity;


    item.subtotal =
      Number(
        item.unitPrice || 0
      ) *
      quantity;


    saveCart(cart);

    render();

  }


  function changeQuantity(
    id,
    delta
  ) {

    const cart =
      readCart();


    const item =
      findItem(
        cart,
        id
      );


    if (!item) {

      return;

    }


    setQuantity(
      id,
      Number(
        item.quantity || 0
      ) + delta
    );

  }


  function removeItem(id) {

    const cart =
      readCart()
        .filter(
          item =>
            String(
              item.cartItemId
            ) !==
            String(id)
        );


    saveCart(cart);

    render();


    showToast(
      "Produk dihapus dari keranjang."
    );

  }


  function clearCart() {

    localStorage.removeItem(
      CART_KEY
    );


    window.dispatchEvent(
      new Event(
        "memora-cart-updated"
      )
    );


    render();


    showToast(
      "Keranjang berhasil dikosongkan."
    );

  }


  function bindEvents() {

    document.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            "[data-action]"
          );


        if (!button) {

          return;

        }


        const action =
          button.dataset.action;


        const id =
          button.dataset.id;


        if (
          action === "increase"
        ) {

          changeQuantity(
            id,
            1
          );

        }


        if (
          action === "decrease"
        ) {

          changeQuantity(
            id,
            -1
          );

        }


        if (
          action === "remove"
        ) {

          removeItem(id);

        }

      }
    );


    document.addEventListener(
      "change",
      event => {

        const input =
          event.target.closest(
            '[data-action="quantity"]'
          );


        if (!input) {

          return;

        }


        setQuantity(
          input.dataset.id,
          input.value
        );

      }
    );


    document
      .getElementById(
        "clearCartButton"
      )
      ?.addEventListener(
        "click",
        clearCart
      );

  }


  function init() {

    render();

    bindEvents();

  }


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