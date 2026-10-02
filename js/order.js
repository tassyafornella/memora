/* =========================================================
   MEMORA
   CHECKOUT / ORDER JAVASCRIPT
   ========================================================= */


/* =========================================================
   CONSTANTS
   ========================================================= */

const MEMORA_CART_KEY =
  "memora_cart";


const MEMORA_LAST_ORDER_KEY =
  "memora_last_order";


const MEMORA_CHECKOUT_DRAFT_KEY =
  "memora_checkout_draft";


let checkoutCart =
  [];


let checkoutSubmitting =
  false;



/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadCheckoutCart();

    restoreCheckoutDraft();

    initCheckoutDraft();

    initCreateOrder();

    initErrorModal();

    renderCheckout();

  }
);



/* =========================================================
   LOAD CART
   ========================================================= */

function loadCheckoutCart() {

  try {

    const stored =
      localStorage.getItem(
        MEMORA_CART_KEY
      );


    if (!stored) {

      checkoutCart = [];

      return;

    }


    const parsed =
      JSON.parse(
        stored
      );


    checkoutCart =
      Array.isArray(parsed)
        ? parsed
        : [];

  }

  catch (error) {

    console.error(
      "Gagal membaca cart:",
      error
    );


    checkoutCart = [];

  }

}



/* =========================================================
   RENDER
   ========================================================= */

function renderCheckout() {

  const layout =
    document.getElementById(
      "checkoutLayout"
    );


  const empty =
    document.getElementById(
      "checkoutEmpty"
    );


  if (
    checkoutCart.length === 0
  ) {

    if (layout) {

      layout.hidden =
        true;

    }


    if (empty) {

      empty.hidden =
        false;

    }


    return;

  }


  if (layout) {

    layout.hidden =
      false;

  }


  if (empty) {

    empty.hidden =
      true;

  }


  renderCheckoutItems();

  renderCheckoutSummary();

}



/* =========================================================
   RENDER ITEMS
   ========================================================= */

function renderCheckoutItems() {

  const container =
    document.getElementById(
      "checkoutItems"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  checkoutCart.forEach(
    item => {

      const element =
        createCheckoutItem(
          item
        );


      container.appendChild(
        element
      );

    }
  );

}



/* =========================================================
   CREATE SUMMARY ITEM
   ========================================================= */

function createCheckoutItem(
  item
) {

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "checkout-item";


  /* IMAGE */

  const imageBox =
    document.createElement(
      "div"
    );


  imageBox.className =
    "checkout-item-image";


  const image =
    document.createElement(
      "img"
    );


  image.src =
    normalizeCartImagePath(
      item.variantImage
    );


  image.alt =
    `${item.productName || "Produk Memora"} ${item.variantName || ""}`;


  image.addEventListener(
    "error",
    () => {

      imageBox.innerHTML =
        "";


      const fallback =
        document.createElement(
          "div"
        );


      fallback.className =
        "checkout-item-image-fallback";


      fallback.textContent =
        "M";


      imageBox.appendChild(
        fallback
      );

    },
    {
      once: true
    }
  );


  imageBox.appendChild(
    image
  );


  /* INFO */

  const info =
    document.createElement(
      "div"
    );


  info.className =
    "checkout-item-info";


  const title =
    document.createElement(
      "h3"
    );


  title.textContent =
    item.productName ||
    "Produk Memora";


  const packageText =
    document.createElement(
      "span"
    );


  packageText.className =
    "checkout-item-package";


  packageText.textContent =
    `${item.variantName || "Package"} Package`;


  const bottom =
    document.createElement(
      "div"
    );


  bottom.className =
    "checkout-item-bottom";


  const qty =
    document.createElement(
      "span"
    );


  qty.className =
    "checkout-item-qty";


  qty.textContent =
    `${normalizeQuantity(item.quantity)} × ${formatRupiah(item.unitPrice)}`;


  const subtotal =
    document.createElement(
      "strong"
    );


  subtotal.className =
    "checkout-item-price";


  subtotal.textContent =
    formatRupiah(
      calculateItemSubtotal(
        item
      )
    );


  bottom.append(
    qty,
    subtotal
  );


  info.append(
    title,
    packageText,
    bottom
  );


  wrapper.append(
    imageBox,
    info
  );


  return wrapper;

}



/* =========================================================
   SUMMARY
   ========================================================= */

function renderCheckoutSummary() {

  const quantity =
    checkoutCart.reduce(
      (total, item) => {

        return (
          total +
          normalizeQuantity(
            item.quantity
          )
        );

      },
      0
    );


  const subtotal =
    checkoutCart.reduce(
      (total, item) => {

        return (
          total +
          calculateItemSubtotal(
            item
          )
        );

      },
      0
    );


  setText(
    "checkoutItemCount",
    `${quantity} item`
  );


  setText(
    "checkoutSubtotal",
    formatRupiah(
      subtotal
    )
  );


  setText(
    "checkoutGrandTotal",
    formatRupiah(
      subtotal
    )
  );

}



/* =========================================================
   INIT DRAFT
   ========================================================= */

function initCheckoutDraft() {

  const fields = [

    "customerName",

    "customerWhatsapp",

    "customerEmail",

    "customerCity",

    "customerPostalCode",

    "customerAddress",

    "orderNote"

  ];


  fields.forEach(
    id => {

      const field =
        document.getElementById(
          id
        );


      if (!field) {
        return;
      }


      field.addEventListener(
        "input",
        saveCheckoutDraft
      );


      field.addEventListener(
        "change",
        saveCheckoutDraft
      );

    }
  );

}



/* =========================================================
   SAVE DRAFT
   ========================================================= */

function saveCheckoutDraft() {

  const draft = {

    customerName:
      getValue(
        "customerName"
      ),

    customerWhatsapp:
      getValue(
        "customerWhatsapp"
      ),

    customerEmail:
      getValue(
        "customerEmail"
      ),

    customerCity:
      getValue(
        "customerCity"
      ),

    customerPostalCode:
      getValue(
        "customerPostalCode"
      ),

    customerAddress:
      getValue(
        "customerAddress"
      ),

    orderNote:
      getValue(
        "orderNote"
      )

  };


  localStorage.setItem(
    MEMORA_CHECKOUT_DRAFT_KEY,
    JSON.stringify(
      draft
    )
  );

}



/* =========================================================
   RESTORE DRAFT
   ========================================================= */

function restoreCheckoutDraft() {

  try {

    const stored =
      localStorage.getItem(
        MEMORA_CHECKOUT_DRAFT_KEY
      );


    if (!stored) {
      return;
    }


    const draft =
      JSON.parse(
        stored
      );


    Object.entries(
      draft
    ).forEach(
      ([key, value]) => {

        const field =
          document.getElementById(
            key
          );


        if (field) {

          field.value =
            value || "";

        }

      }
    );

  }

  catch (error) {

    console.error(
      "Gagal memulihkan checkout draft:",
      error
    );

  }

}



/* =========================================================
   CREATE ORDER INIT
   ========================================================= */

function initCreateOrder() {

  const button =
    document.getElementById(
      "createOrderButton"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    submitOrder
  );

}



/* =========================================================
   SUBMIT ORDER
   ========================================================= */

async function submitOrder() {

  if (checkoutSubmitting) {
    return;
  }


  clearValidationErrors();


  if (
    checkoutCart.length === 0
  ) {

    showErrorModal(
      "Keranjang masih kosong. Tambahkan produk terlebih dahulu."
    );

    return;

  }


  const customer =
    getCustomerData();


  if (
    !validateCustomer(
      customer
    )
  ) {

    scrollToFirstError();

    return;

  }


  if (
    !window
      .isMemoraSupabaseConfigured ||
    !window
      .isMemoraSupabaseConfigured()
  ) {

    showErrorModal(
      "Koneksi Supabase belum dikonfigurasi. Isi Project URL dan anon key di js/supabase.js terlebih dahulu."
    );

    return;

  }


  if (
    !window.memoraSupabase
  ) {

    showErrorModal(
      "Koneksi database Memora tidak tersedia."
    );

    return;

  }


  try {

    setSubmitting(
      true
    );


    const items =
      checkoutCart.map(
        item =>
          prepareItemForDatabase(
            item
          )
      );


    const {
      data,
      error
    } =
      await window.memoraSupabase.rpc(
        "create_memora_order",
        {

          p_customer: {

            full_name:
              customer.fullName,

            whatsapp:
              customer.whatsapp,

            email:
              customer.email,

            address:
              customer.address,

            city:
              customer.city,

            postal_code:
              customer.postalCode,

            notes:
              null,

            address_id:
              (() => {

                try {

                  const selectedAddress =
                    JSON.parse(
                      localStorage.getItem(
                        "memora_checkout_address"
                      ) || "null"
                    );

                  return (
                    selectedAddress?.id ||
                    null
                  );

                }
                catch (error) {

                  console.error(
                    "Checkout address:",
                    error
                  );

                  return null;

                }

              })()

          },

          p_items:
            items,

          p_customer_note:
            getValue(
              "orderNote"
            ) || null

        }
      );


    if (error) {

      throw error;

    }


    const result =
      Array.isArray(data)
        ? data[0]
        : data;


    if (
      !result ||
      !result.order_number
    ) {

      throw new Error(
        "Order ID tidak diterima dari database."
      );

    }


    completeOrder(
      result,
      customer
    );

  }

  catch (error) {

    console.error(
      "Gagal membuat pesanan:",
      error
    );


    showErrorModal(
      getFriendlyDatabaseError(
        error
      )
    );

  }

  finally {

    setSubmitting(
      false
    );

  }

}



/* =========================================================
   CUSTOMER DATA
   ========================================================= */

function getCustomerData() {

  return {

    fullName:
      getValue(
        "customerName"
      ),

    whatsapp:
      normalizeWhatsapp(
        getValue(
          "customerWhatsapp"
        )
      ),

    email:
      getValue(
        "customerEmail"
      ),

    city:
      getValue(
        "customerCity"
      ),

    postalCode:
      getValue(
        "customerPostalCode"
      ),

    address:
      getValue(
        "customerAddress"
      )

  };

}



/* =========================================================
   VALIDATION
   ========================================================= */

function validateCustomer(
  customer
) {

  let valid =
    true;


  if (
    customer.fullName.length < 2
  ) {

    setFieldError(
      "customerName",
      "customerNameError",
      "Nama lengkap wajib diisi."
    );


    valid =
      false;

  }


  const whatsappDigits =
    customer.whatsapp.replace(
      /\D/g,
      ""
    );


  if (
    whatsappDigits.length < 9 ||
    whatsappDigits.length > 15
  ) {

    setFieldError(
      "customerWhatsapp",
      "customerWhatsappError",
      "Masukkan nomor WhatsApp yang valid."
    );


    valid =
      false;

  }


  if (
    customer.email &&
    !isValidEmail(
      customer.email
    )
  ) {

    setFieldError(
      "customerEmail",
      "customerEmailError",
      "Format email belum valid."
    );


    valid =
      false;

  }


  return valid;

}



/* =========================================================
   SET FIELD ERROR
   ========================================================= */

function setFieldError(
  fieldId,
  errorId,
  message
) {

  const field =
    document.getElementById(
      fieldId
    );


  const error =
    document.getElementById(
      errorId
    );


  field?.classList.add(
    "invalid"
  );


  if (error) {

    error.textContent =
      message;

  }

}



/* =========================================================
   CLEAR ERROR
   ========================================================= */

function clearValidationErrors() {

  document
    .querySelectorAll(
      ".invalid"
    )
    .forEach(
      field => {

        field.classList.remove(
          "invalid"
        );

      }
    );


  document
    .querySelectorAll(
      ".field-error"
    )
    .forEach(
      element => {

        element.textContent =
          "";

      }
    );

}



/* =========================================================
   SCROLL ERROR
   ========================================================= */

function scrollToFirstError() {

  const first =
    document.querySelector(
      ".invalid"
    );


  first?.scrollIntoView(
    {
      behavior:
        "smooth",

      block:
        "center"
    }
  );


  setTimeout(
    () => {

      first?.focus();

    },
    350
  );

}



/* =========================================================
   PREPARE ITEM
   ========================================================= */

function prepareItemForDatabase(
  item
) {

  return {

    product_id:
      item.productId,

    product_name:
      item.productName,

    variant:
      item.variant,

    variant_name:
      item.variantName,

    quantity:
      normalizeQuantity(
        item.quantity
      ),

    /*
      Harga dari browser sengaja tidak dipakai
      sebagai harga final oleh database.

      Database mengambil harga resmi dari
      product_variants.
    */

    unit_price:
      Number(
        item.unitPrice
      ) || 0,

    variant_image:
      cleanVariantImagePath(
        item.variantImage
      ),

    personalization:
      normalizePersonalization(
        item.personalization
      ),

    addons:
      Array.isArray(
        item.addons
      )
        ? item.addons
        : [],

    customer_note:
      getItemCustomerNote(
        item
      )

  };

}



/* =========================================================
   NORMALIZE PERSONALIZATION
   ========================================================= */

function normalizePersonalization(
  personalization
) {

  if (
    !personalization ||
    typeof personalization !==
      "object"
  ) {

    return {};

  }


  return personalization;

}



/* =========================================================
   ITEM CUSTOMER NOTE
   ========================================================= */

function getItemCustomerNote(
  item
) {

  const personalization =
    item.personalization;


  if (
    !personalization ||
    typeof personalization !==
      "object"
  ) {

    return null;

  }


  const note =
    personalization.customerNote;


  if (
    note &&
    typeof note ===
      "object"
  ) {

    return (
      note.value ||
      null
    );

  }


  if (
    typeof note ===
      "string"
  ) {

    return (
      note.trim() ||
      null
    );

  }


  return null;

}



/* =========================================================
   COMPLETE ORDER
   ========================================================= */

function completeOrder(
  result,
  customer
) {

  const orderData = {

    orderId:
      result.order_id,

    orderNumber:
      result.order_number,

    grandTotal:
      Number(
        result.grand_total
      ) || 0,

    customerName:
      customer.fullName,

    whatsapp:
      customer.whatsapp,

    createdAt:
      new Date()
        .toISOString()

  };


  localStorage.setItem(
    MEMORA_LAST_ORDER_KEY,
    JSON.stringify(
      orderData
    )
  );


  /*
    Cart hanya dihapus SETELAH
    database berhasil menyimpan order.
  */

  localStorage.removeItem(
    MEMORA_CART_KEY
  );


  localStorage.removeItem(
    MEMORA_CHECKOUT_DRAFT_KEY
  );


  window.dispatchEvent(
    new Event(
      "memora-cart-updated"
    )
  );


  window.location.href =
    `success/?order=${encodeURIComponent(
      result.order_number
    )}`;

}



/* =========================================================
   SUBMITTING STATE
   ========================================================= */

function setSubmitting(
  active
) {

  checkoutSubmitting =
    active;


  const button =
    document.getElementById(
      "createOrderButton"
    );


  const text =
    document.getElementById(
      "createOrderButtonText"
    );


  const loader =
    document.getElementById(
      "createOrderLoader"
    );


  if (button) {

    button.disabled =
      active;

  }


  if (text) {

    text.textContent =
      active
        ? "Membuat Pesanan..."
        : "Buat Pesanan";

  }


  if (loader) {

    loader.hidden =
      !active;

  }

}



/* =========================================================
   ERROR MODAL
   ========================================================= */

function initErrorModal() {

  const modal =
    document.getElementById(
      "errorModal"
    );


  if (!modal) {
    return;
  }


  modal
    .querySelectorAll(
      "[data-close-error]"
    )
    .forEach(
      element => {

        element.addEventListener(
          "click",
          closeErrorModal
        );

      }
    );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeErrorModal();

      }

    }
  );

}



/* =========================================================
   SHOW ERROR
   ========================================================= */

function showErrorModal(
  message
) {

  const modal =
    document.getElementById(
      "errorModal"
    );


  const text =
    document.getElementById(
      "errorModalMessage"
    );


  if (text) {

    text.textContent =
      message;

  }


  modal?.classList.add(
    "show"
  );


  modal?.setAttribute(
    "aria-hidden",
    "false"
  );

}



/* =========================================================
   CLOSE ERROR
   ========================================================= */

function closeErrorModal() {

  const modal =
    document.getElementById(
      "errorModal"
    );


  modal?.classList.remove(
    "show"
  );


  modal?.setAttribute(
    "aria-hidden",
    "true"
  );

}



/* =========================================================
   DATABASE ERROR MESSAGE
   ========================================================= */

function getFriendlyDatabaseError(
  error
) {

  const message =
    error?.message ||
    "";


  const lower =
    message.toLowerCase();


  if (
    lower.includes(
      "produk atau paket tidak ditemukan"
    )
  ) {

    return (
      "Salah satu produk atau paket tidak lagi tersedia. Silakan kembali ke keranjang dan pilih produk kembali."
    );

  }


  if (
    lower.includes(
      "keranjang kosong"
    )
  ) {

    return (
      "Keranjang masih kosong."
    );

  }


  if (
    lower.includes(
      "whatsapp"
    )
  ) {

    return (
      "Nomor WhatsApp belum valid."
    );

  }


  if (
    lower.includes(
      "failed to fetch"
    ) ||
    lower.includes(
      "network"
    )
  ) {

    return (
      "Tidak dapat terhubung ke database. Periksa koneksi internet lalu coba kembali."
    );

  }


  if (
    lower.includes(
      "function"
    ) &&
    lower.includes(
      "create_memora_order"
    )
  ) {

    return (
      "Fungsi checkout database belum tersedia. Pastikan SQL create_memora_order sudah dijalankan di Supabase."
    );

  }


  return (
    "Terjadi kendala saat membuat pesanan. Data di keranjang belum dihapus, jadi kamu bisa mencoba kembali."
  );

}



/* =========================================================
   NORMALIZE WHATSAPP
   ========================================================= */

function normalizeWhatsapp(
  value
) {

  let number =
    String(value || "")
      .trim()
      .replace(
        /[\s\-().]/g,
        ""
      );


  if (
    number.startsWith(
      "+62"
    )
  ) {

    return (
      "0" +
      number.slice(3)
    );

  }


  if (
    number.startsWith(
      "62"
    )
  ) {

    return (
      "0" +
      number.slice(2)
    );

  }


  return number;

}



/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(
  email
) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      email
    );

}



/* =========================================================
   ITEM SUBTOTAL
   ========================================================= */

function calculateItemSubtotal(
  item
) {

  return (

    (Number(
      item.unitPrice
    ) || 0)

    *

    normalizeQuantity(
      item.quantity
    )

  );

}



/* =========================================================
   QUANTITY
   ========================================================= */

function normalizeQuantity(
  value
) {

  const quantity =
    parseInt(
      value,
      10
    );


  if (
    !Number.isFinite(quantity) ||
    quantity < 1
  ) {

    return 1;

  }


  return quantity;

}



/* =========================================================
   IMAGE PATH FOR CHECKOUT DISPLAY
   ========================================================= */

function normalizeCartImagePath(
  path
) {

  if (!path) {
    return "";
  }


  if (
    path.startsWith(
      "http://"
    ) ||
    path.startsWith(
      "https://"
    ) ||
    path.startsWith(
      "data:"
    )
  ) {

    return path;

  }


  const cleaned =
    path
      .replace(
        /^(\.\.\/)+/,
        ""
      )
      .replace(
        /^\.?\//,
        ""
      );


  return (
    `../${cleaned}`
  );

}



/* =========================================================
   IMAGE PATH SAVED TO DB
   ========================================================= */

function cleanVariantImagePath(
  path
) {

  if (!path) {
    return null;
  }


  if (
    path.startsWith(
      "http://"
    ) ||
    path.startsWith(
      "https://"
    )
  ) {

    return path;

  }


  return path
    .replace(
      /^(\.\.\/)+/,
      ""
    )
    .replace(
      /^\.?\//,
      ""
    );

}



/* =========================================================
   VALUE
   ========================================================= */

function getValue(
  id
) {

  const element =
    document.getElementById(
      id
    );


  return (
    element?.value
      ?.trim()
    ||
    ""
  );

}



/* =========================================================
   TEXT
   ========================================================= */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      value;

  }

}



/* =========================================================
   RUPIAH
   ========================================================= */

function formatRupiah(
  value
) {

  if (
    typeof window
      .memoraFormatRupiah
    === "function"
  ) {

    return window
      .memoraFormatRupiah(
        value
      );

  }


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

