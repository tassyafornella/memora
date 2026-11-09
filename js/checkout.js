(function () {

  "use strict";


  const CART_KEY =
    "memora_cart";


  const ADDRESS_KEY =
    "memora_checkout_address";


  const LAST_ORDER_KEY =
    "memora_last_order";


  const db =
    window.memoraSupabase;


  let cart =
    [];


  let customer =
    null;


  let addresses =
    [];


  let selectedAddress =
    null;


  let submitting =
    false;


  /* ========================================================
     HELPERS
  ======================================================== */

  function el(id) {

    return document.getElementById(
      id
    );

  }


  function rupiah(value) {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style:
          "currency",

        currency:
          "IDR",

        maximumFractionDigits:
          0
      }
    ).format(
      Number(value) || 0
    );

  }


  function esc(value) {

    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }


  function readCart() {

    try {

      const value =
        JSON.parse(
          localStorage.getItem(
            CART_KEY
          ) || "[]"
        );


      return Array.isArray(
        value
      )
        ? value
        : [];

    }
    catch {

      return [];

    }

  }


  function message(
    text,
    type = "error"
  ) {

    const box =
      el(
        "checkoutMessage"
      );


    if (!box) {
      return;
    }


    box.textContent =
      text;


    box.className =
      `checkout-message ${type}`;

  }


  function showOnly(id) {

    [
      "checkoutLoading",
      "loginRequired",
      "checkoutEmpty",
      "checkoutLayout"
    ]
      .forEach(
        itemId => {

          const target =
            el(itemId);


          if (target) {

            target.hidden =
              itemId !== id;

          }

        }
      );

  }


  /* ========================================================
     SESSION
  ======================================================== */

  async function getUser() {

    if (!db) {

      throw new Error(
        "Koneksi Supabase belum tersedia."
      );

    }


    const {
      data,
      error
    } =
      await db.auth.getSession();


    if (error) {
      throw error;
    }


    return (
      data?.session?.user ||
      null
    );

  }


  /* ========================================================
     CUSTOMER
  ======================================================== */

  async function loadCustomer(
    user
  ) {

    const {
      data,
      error
    } =
      await db
        .from(
          "customers"
        )
        .select(
          "id, full_name, whatsapp, email"
        )
        .eq(
          "auth_user_id",
          user.id
        )
        .maybeSingle();


    if (error) {
      throw error;
    }


    if (!data) {

      throw new Error(
        "Data customer belum terhubung dengan akun ini."
      );

    }


    customer =
      data;


    el(
      "customerName"
    ).textContent =
      customer.full_name ||
      "-";


    el(
      "customerWhatsapp"
    ).textContent =
      customer.whatsapp ||
      "-";


    el(
      "customerEmail"
    ).textContent =
      customer.email ||
      user.email ||
      "-";

  }


  /* ========================================================
     ADDRESSES
  ======================================================== */

  async function loadAddresses() {

    const {
      data,
      error
    } =
      await db
        .from(
          "addresses"
        )
        .select("*")
        .eq(
          "customer_id",
          customer.id
        )
        .order(
          "is_primary",
          {
            ascending:
              false
          }
        )
        .order(
          "created_at",
          {
            ascending:
              true
          }
        );


    if (error) {
      throw error;
    }


    addresses =
      data || [];


    if (
      addresses.length ===
      0
    ) {

      el(
        "checkoutAddressList"
      ).innerHTML =
        "";


      el(
        "checkoutAddressEmpty"
      ).hidden =
        false;


      selectedAddress =
        null;


      updateButton();

      return;

    }


    el(
      "checkoutAddressEmpty"
    ).hidden =
      true;


    const storedId =
      (() => {

        try {

          return JSON.parse(
            localStorage.getItem(
              ADDRESS_KEY
            ) || "null"
          )?.id;

        }
        catch {

          return null;

        }

      })();


    selectedAddress =
      addresses.find(
        address =>
          address.id ===
          storedId
      ) ||
      addresses.find(
        address =>
          address.is_primary
      ) ||
      addresses[0];


    renderAddresses();

    saveSelectedAddress();

  }


  function renderAddresses() {

    const list =
      el(
        "checkoutAddressList"
      );


    list.innerHTML =
      addresses
        .map(
          address => {

            const selected =
              selectedAddress?.id ===
              address.id;


            const region =
              [
                address.village,
                address.district,
                address.city,
                address.province,
                address.postal_code
              ]
                .filter(Boolean)
                .join(", ");


            return `
              <label
                class="checkout-address ${selected ? "selected" : ""}"
                data-address-card="${address.id}"
              >

                <input
                  type="radio"
                  name="checkoutAddress"
                  value="${esc(address.id)}"
                  ${selected ? "checked" : ""}
                >

                <div class="address-title-row">

                  <strong>
                    ${esc(address.label || "Alamat")}
                  </strong>

                  ${
                    address.is_primary
                      ? `
                        <span class="address-primary-badge">
                          Utama
                        </span>
                      `
                      : ""
                  }

                </div>

                <p>
                  <strong>
                    ${esc(address.recipient_name)}
                  </strong>
                  <br>
                  ${esc(address.phone)}
                </p>

                <p>
                  ${esc(address.address_line)}
                  <br>
                  ${esc(region)}
                </p>

                ${
                  address.landmark
                    ? `
                      <p>
                        Patokan:
                        ${esc(address.landmark)}
                      </p>
                    `
                    : ""
                }

              </label>
            `;

          }
        )
        .join("");


    list
      .querySelectorAll(
        'input[name="checkoutAddress"]'
      )
      .forEach(
        radio => {

          radio.addEventListener(
            "change",
            () => {

              selectedAddress =
                addresses.find(
                  address =>
                    address.id ===
                    radio.value
                ) ||
                null;


              renderAddresses();

              saveSelectedAddress();

              updateButton();

            }
          );

        }
      );

  }


  function saveSelectedAddress() {

    if (!selectedAddress) {

      localStorage.removeItem(
        ADDRESS_KEY
      );

      return;

    }


    localStorage.setItem(
      ADDRESS_KEY,
      JSON.stringify(
        selectedAddress
      )
    );

  }


  /* ========================================================
     CART
  ======================================================== */

  function renderCart() {

    const container =
      el(
        "checkoutItems"
      );


    container.innerHTML =
      cart
        .map(
          item => {

            return `
              <article class="checkout-item">

                <div>

                  <strong>
                    ${esc(item.productName)}
                  </strong>

                  <p>
                    ${esc(item.packageName)}
                    ·
                    ${esc(item.design)}
                    ·
                    ${Number(item.quantity)} ${esc(item.unit || "pcs")}
                  </p>

                </div>

                <div class="checkout-item-price">
                  ${rupiah(item.subtotal)}
                </div>

              </article>
            `;

          }
        )
        .join("");


    const quantity =
      cart.reduce(
        (total, item) =>
          total +
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


    el(
      "checkoutItemCount"
    ).textContent =
      String(
        cart.length
      );


    el(
      "checkoutQuantity"
    ).textContent =
      `${quantity} pcs`;


    el(
      "checkoutTotal"
    ).textContent =
      rupiah(total);

  }


  /* ========================================================
     BUTTON
  ======================================================== */

  function updateButton() {

    const button =
      el(
        "createOrderButton"
      );


    if (!button) {
      return;
    }


    const valid =
      cart.length > 0 &&
      Boolean(
        selectedAddress
      ) &&
      Boolean(
        customer
      ) &&
      !submitting;


    button.disabled =
      !valid;


    if (
      !selectedAddress
    ) {

      button.textContent =
        "Pilih Alamat Pengiriman";

    }
    else {

      button.textContent =
        "Buat Pesanan";

    }

  }


  /* ========================================================
     DATABASE ITEMS
  ======================================================== */

  function prepareItems() {

    return cart.map(
      item => {

        return {

          product_id:
            item.productId,

          variant:
            item.packageKey,

          product_name:
            item.productName,

          variant_name:
            item.packageName,

          quantity:
            Number(
              item.quantity
            ),

          personalization:
            item.personalization ||
            {},

          addons:
            [],

          customer_note:
            item.personalization
              ?.customerNote ||
            null

        };

      }
    );

  }


  /* ========================================================
     CREATE ORDER
     TC-10
  ======================================================== */

  async function createOrder() {

    if (
      submitting ||
      !customer ||
      !selectedAddress ||
      cart.length === 0
    ) {

      return;

    }


    submitting =
      true;


    message(
      "",
      ""
    );


    const button =
      el(
        "createOrderButton"
      );


    button.disabled =
      true;


    button.textContent =
      "Memproses...";


    try {

      const {
        data,
        error
      } =
        await db.rpc(
          "create_memora_order",
          {

            p_customer: {

              full_name:
                customer.full_name ||
                selectedAddress.recipient_name,

              whatsapp:
                customer.whatsapp ||
                selectedAddress.phone,

              email:
                customer.email ||
                null,

              address:
                selectedAddress.address_line,

              city:
                selectedAddress.city,

              postal_code:
                selectedAddress.postal_code,

              notes:
                null,

              address_id:
                selectedAddress.id

            },


            p_items:
              prepareItems(),


            p_customer_note:
              el(
                "orderNote"
              ).value
                .trim() ||
              null

          }
        );


      if (error) {
        throw error;
      }


      const result =
        Array.isArray(
          data
        )
          ? data[0]
          : data;


      if (
        !result ||
        !result.order_number
      ) {

        throw new Error(
          "Nomor pesanan tidak diterima dari database."
        );

      }


      localStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify(
          result
        )
      );


      localStorage.removeItem(
        CART_KEY
      );


      localStorage.removeItem(
        ADDRESS_KEY
      );


      window.dispatchEvent(
        new Event(
          "memora-cart-updated"
        )
      );


      message(
        "Checkout berhasil diproses.",
        "success"
      );


      window.location.href =
        "/checkout/success/?number=" +
        encodeURIComponent(
          result.order_number
        );

    }
    catch (error) {

      console.error(
        "Create order:",
        error
      );


      message(
        error?.message ||
        "Pesanan belum berhasil dibuat.",
        "error"
      );

    }
    finally {

      submitting =
        false;


      updateButton();

    }

  }


  /* ========================================================
     INIT
  ======================================================== */

  async function init() {

    try {

      cart =
        readCart();


      if (
        cart.length ===
        0
      ) {

        showOnly(
          "checkoutEmpty"
        );

        return;

      }


      const user =
        await getUser();


      if (!user) {

        showOnly(
          "loginRequired"
        );

        return;

      }


      await loadCustomer(
        user
      );


      await loadAddresses();


      renderCart();


      showOnly(
        "checkoutLayout"
      );


      updateButton();


      el(
        "createOrderButton"
      )
        ?.addEventListener(
          "click",
          createOrder
        );

    }
    catch (error) {

      console.error(
        "Checkout init:",
        error
      );


      showOnly(
        "checkoutLayout"
      );


      message(
        error?.message ||
        "Checkout belum dapat dimuat.",
        "error"
      );

    }

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