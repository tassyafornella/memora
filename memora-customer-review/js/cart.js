/* =========================================================
   MEMORA
   CART JAVASCRIPT
   ========================================================= */


/* =========================================================
   CONSTANT
   ========================================================= */

const MEMORA_CART_KEY =
  "memora_cart";


let cartItems =
  [];


let pendingDeleteId =
  null;



/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadCart();

    initClearCart();

    initDeleteModal();

    initClearModal();

    renderCart();

  }
);



/* =========================================================
   LOAD CART
   ========================================================= */

function loadCart() {

  try {

    const stored =
      localStorage.getItem(
        MEMORA_CART_KEY
      );


    if (!stored) {

      cartItems = [];

      return;

    }


    const parsed =
      JSON.parse(
        stored
      );


    cartItems =
      Array.isArray(parsed)
        ? parsed
        : [];

  }

  catch (error) {

    console.error(
      "Gagal membaca Memora cart:",
      error
    );


    cartItems = [];

  }

}



/* =========================================================
   SAVE CART
   ========================================================= */

function saveCart() {

  localStorage.setItem(
    MEMORA_CART_KEY,
    JSON.stringify(
      cartItems
    )
  );


  window.dispatchEvent(
    new Event(
      "memora-cart-updated"
    )
  );


  if (
    typeof window
      .memoraUpdateCartCount
    === "function"
  ) {

    window
      .memoraUpdateCartCount();

  }

}



/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart() {

  const cartLayout =
    document.getElementById(
      "cartLayout"
    );


  const emptyState =
    document.getElementById(
      "cartEmpty"
    );


  const clearButton =
    document.getElementById(
      "clearCartButton"
    );


  if (
    cartItems.length === 0
  ) {

    if (cartLayout) {

      cartLayout.hidden =
        true;

    }


    if (emptyState) {

      emptyState.hidden =
        false;

    }


    if (clearButton) {

      clearButton.hidden =
        true;

    }


    renderSummary();

    return;

  }


  if (cartLayout) {

    cartLayout.hidden =
      false;

  }


  if (emptyState) {

    emptyState.hidden =
      true;

  }


  if (clearButton) {

    clearButton.hidden =
      false;

  }


  renderCartItems();

  renderSummary();

}



/* =========================================================
   RENDER ITEMS
   ========================================================= */

function renderCartItems() {

  const container =
    document.getElementById(
      "cartItemsList"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  cartItems.forEach(
    item => {

      const element =
        createCartItemElement(
          item
        );


      container.appendChild(
        element
      );

    }
  );

}



/* =========================================================
   CREATE CART ITEM
   ========================================================= */

function createCartItemElement(
  item
) {

  const article =
    document.createElement(
      "article"
    );


  article.className =
    "cart-item";


  article.dataset.cartItemId =
    item.cartItemId;


  /* =======================================================
     IMAGE
     ======================================================= */

  const imageContainer =
    document.createElement(
      "div"
    );


  imageContainer.className =
    "cart-item-image";


  const image =
    document.createElement(
      "img"
    );


  image.src =
    getCartImagePath(
      item.variantImage
    );


  image.alt =
    `${item.productName || "Produk Memora"} ${item.variantName || ""}`;


  image.loading =
    "lazy";


  image.addEventListener(
    "error",
    () => {

      renderCartImageFallback(
        imageContainer,
        item
      );

    },
    {
      once: true
    }
  );


  imageContainer.appendChild(
    image
  );



  /* =======================================================
     CONTENT
     ======================================================= */

  const content =
    document.createElement(
      "div"
    );


  content.className =
    "cart-item-content";


  /* TOP */

  const top =
    document.createElement(
      "div"
    );


  top.className =
    "cart-item-top";


  const titleArea =
    document.createElement(
      "div"
    );


  const category =
    document.createElement(
      "span"
    );


  category.className =
    "cart-item-product-type";


  category.textContent =
    "Memora Personalized Stationery";


  const title =
    document.createElement(
      "h2"
    );


  title.className =
    "cart-item-title";


  title.textContent =
    item.productName ||
    "Produk Memora";


  const packageBadge =
    document.createElement(
      "span"
    );


  packageBadge.className =
    "cart-item-package";


  packageBadge.textContent =
    `${item.variantName || "Package"} Package`;


  titleArea.append(
    category,
    title,
    packageBadge
  );


  const removeButton =
    document.createElement(
      "button"
    );


  removeButton.type =
    "button";


  removeButton.className =
    "remove-cart-item";


  removeButton.textContent =
    "Hapus";


  removeButton.addEventListener(
    "click",
    () => {

      openDeleteModal(
        item.cartItemId,
        item.productName
      );

    }
  );


  top.append(
    titleArea,
    removeButton
  );



  /* =======================================================
     PERSONALIZATION
     ======================================================= */

  const personalization =
    createPersonalizationElement(
      item.personalization
    );



  /* =======================================================
     BOTTOM
     ======================================================= */

  const bottom =
    document.createElement(
      "div"
    );


  bottom.className =
    "cart-item-bottom";


  const priceInfo =
    document.createElement(
      "div"
    );


  priceInfo.className =
    "cart-item-price-info";


  const priceLabel =
    document.createElement(
      "span"
    );


  priceLabel.textContent =
    "Harga / Set";


  const price =
    document.createElement(
      "strong"
    );


  price.textContent =
    formatRupiah(
      item.unitPrice
    );


  priceInfo.append(
    priceLabel,
    price
  );



  const actionArea =
    document.createElement(
      "div"
    );


  actionArea.className =
    "cart-item-actions";


  /* QUANTITY */

  const quantityArea =
    document.createElement(
      "div"
    );


  quantityArea.className =
    "cart-quantity";


  const minus =
    document.createElement(
      "button"
    );


  minus.type =
    "button";


  minus.className =
    "cart-quantity-button";


  minus.textContent =
    "−";


  minus.setAttribute(
    "aria-label",
    "Kurangi jumlah"
  );


  const quantityInput =
    document.createElement(
      "input"
    );


  quantityInput.type =
    "number";


  quantityInput.min =
    "1";


  quantityInput.className =
    "cart-quantity-input";


  quantityInput.value =
    normalizeQuantity(
      item.quantity
    );


  const plus =
    document.createElement(
      "button"
    );


  plus.type =
    "button";


  plus.className =
    "cart-quantity-button";


  plus.textContent =
    "+";


  plus.setAttribute(
    "aria-label",
    "Tambah jumlah"
  );


  minus.addEventListener(
    "click",
    () => {

      updateItemQuantity(
        item.cartItemId,
        normalizeQuantity(
          item.quantity
        ) - 1
      );

    }
  );


  plus.addEventListener(
    "click",
    () => {

      updateItemQuantity(
        item.cartItemId,
        normalizeQuantity(
          item.quantity
        ) + 1
      );

    }
  );


  quantityInput.addEventListener(
    "change",
    () => {

      updateItemQuantity(
        item.cartItemId,
        quantityInput.value
      );

    }
  );


  quantityInput.addEventListener(
    "blur",
    () => {

      quantityInput.value =
        normalizeQuantity(
          quantityInput.value
        );

    }
  );


  quantityArea.append(
    minus,
    quantityInput,
    plus
  );



  /* SUBTOTAL */

  const subtotalArea =
    document.createElement(
      "div"
    );


  subtotalArea.className =
    "cart-item-subtotal";


  const subtotalLabel =
    document.createElement(
      "span"
    );


  subtotalLabel.textContent =
    "Subtotal";


  const subtotal =
    document.createElement(
      "strong"
    );


  subtotal.textContent =
    formatRupiah(
      calculateItemSubtotal(
        item
      )
    );


  subtotalArea.append(
    subtotalLabel,
    subtotal
  );


  actionArea.append(
    quantityArea,
    subtotalArea
  );


  bottom.append(
    priceInfo,
    actionArea
  );


  content.append(
    top
  );


  if (personalization) {

    content.appendChild(
      personalization
    );

  }


  content.appendChild(
    bottom
  );


  article.append(
    imageContainer,
    content
  );


  return article;

}



/* =========================================================
   PERSONALIZATION
   ========================================================= */

function createPersonalizationElement(
  personalization
) {

  const entries =
    getPersonalizationEntries(
      personalization
    );


  if (
    entries.length === 0
  ) {

    return null;

  }


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "cart-item-personalization";


  const title =
    document.createElement(
      "div"
    );


  title.className =
    "personalization-title";


  title.textContent =
    "Detail Personalization";


  const list =
    document.createElement(
      "div"
    );


  list.className =
    "personalization-list";


  entries.forEach(
    entry => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "personalization-row";


      const label =
        document.createElement(
          "span"
        );


      label.textContent =
        entry.label;


      const value =
        document.createElement(
          "strong"
        );


      value.textContent =
        formatPersonalizationValue(
          entry.key,
          entry.value
        );


      row.append(
        label,
        value
      );


      list.appendChild(
        row
      );

    }
  );


  wrapper.append(
    title,
    list
  );


  return wrapper;

}



/* =========================================================
   GET PERSONALIZATION ENTRIES
   Supports:
   New universal product.js format:
   {
     field: {
       label: "...",
       value: "..."
     }
   }

   Also supports previous Invitation format.
   ========================================================= */

function getPersonalizationEntries(
  personalization
) {

  if (
    !personalization ||
    typeof personalization !==
      "object"
  ) {

    return [];

  }


  const fallbackLabels = {

    brideName:
      "Nama Mempelai Wanita",

    groomName:
      "Nama Mempelai Pria",

    eventDate:
      "Tanggal Acara",

    themeColor:
      "Tema / Warna",

    customerNote:
      "Catatan",

    recipientName:
      "Nama",

    recipientRole:
      "Role",

    coupleName:
      "Nama Mempelai",

    personalMessage:
      "Pesan",

    occasion:
      "Occasion",

    customText:
      "Teks / Cerita",

    birthdayAge:
      "Usia",

    birthdayMessage:
      "Birthday Message",

    eventName:
      "Nama / Judul Acara",

    initialText:
      "Initial",

    hangtagShape:
      "Bentuk Hangtag"

  };


  return Object.entries(
    personalization
  )
    .map(
      ([key, data]) => {

        if (
          data &&
          typeof data ===
            "object" &&
          !Array.isArray(data)
        ) {

          return {

            key,

            label:
              data.label ||
              fallbackLabels[key] ||
              humanizeKey(key),

            value:
              data.value ?? ""

          };

        }


        return {

          key,

          label:
            fallbackLabels[key] ||
            humanizeKey(key),

          value:
            data ?? ""

        };

      }
    )
    .filter(
      entry => {

        return (
          String(
            entry.value
          ).trim() !== ""
        );

      }
    );

}



/* =========================================================
   FORMAT PERSONALIZATION
   ========================================================= */

function formatPersonalizationValue(
  key,
  value
) {

  if (!value) {
    return "-";
  }


  if (
    key.toLowerCase()
      .includes("date")
  ) {

    const formatted =
      formatDate(
        value
      );


    if (formatted) {

      return formatted;

    }

  }


  return String(value);

}



/* =========================================================
   UPDATE QUANTITY
   ========================================================= */

function updateItemQuantity(
  cartItemId,
  newQuantity
) {

  const item =
    cartItems.find(
      cartItem =>
        cartItem.cartItemId ===
        cartItemId
    );


  if (!item) {
    return;
  }


  const quantity =
    normalizeQuantity(
      newQuantity
    );


  item.quantity =
    quantity;


  item.subtotal =
    Number(
      item.unitPrice || 0
    ) * quantity;


  saveCart();

  renderCart();

}



/* =========================================================
   NORMALIZE QUANTITY
   ========================================================= */

function normalizeQuantity(
  value
) {

  const number =
    parseInt(
      value,
      10
    );


  if (
    !Number.isFinite(number) ||
    number < 1
  ) {

    return 1;

  }


  return number;

}



/* =========================================================
   CALCULATE SUBTOTAL
   ========================================================= */

function calculateItemSubtotal(
  item
) {

  const price =
    Number(
      item.unitPrice
    ) || 0;


  const quantity =
    normalizeQuantity(
      item.quantity
    );


  return price * quantity;

}



/* =========================================================
   CART SUMMARY
   ========================================================= */

function renderSummary() {

  const totalQuantity =
    cartItems.reduce(
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


  const totalSubtotal =
    cartItems.reduce(
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
    "cartItemLabel",
    `${cartItems.length} item`
  );


  setText(
    "summaryItemCount",
    `${totalQuantity} item`
  );


  setText(
    "summarySubtotal",
    formatRupiah(
      totalSubtotal
    )
  );


  setText(
    "summaryGrandTotal",
    formatRupiah(
      totalSubtotal
    )
  );


  const checkoutButton =
    document.getElementById(
      "checkoutButton"
    );


  if (checkoutButton) {

    checkoutButton.classList.toggle(
      "disabled",
      cartItems.length === 0
    );


    checkoutButton.setAttribute(
      "aria-disabled",
      cartItems.length === 0
        ? "true"
        : "false"
    );

  }


  if (
    typeof window
      .memoraUpdateCartCount
    === "function"
  ) {

    window
      .memoraUpdateCartCount();

  }

}



/* =========================================================
   DELETE ITEM MODAL
   ========================================================= */

function initDeleteModal() {

  const modal =
    document.getElementById(
      "deleteModal"
    );


  const confirmButton =
    document.getElementById(
      "confirmDeleteButton"
    );


  if (!modal) {
    return;
  }


  modal
    .querySelectorAll(
      "[data-close-modal]"
    )
    .forEach(
      element => {

        element.addEventListener(
          "click",
          closeDeleteModal
        );

      }
    );


  confirmButton?.addEventListener(
    "click",
    () => {

      if (!pendingDeleteId) {
        return;
      }


      cartItems =
        cartItems.filter(
          item =>
            item.cartItemId !==
            pendingDeleteId
        );


      pendingDeleteId =
        null;


      saveCart();

      closeDeleteModal();

      renderCart();

    }
  );

}



/* =========================================================
   OPEN DELETE MODAL
   ========================================================= */

function openDeleteModal(
  cartItemId,
  productName
) {

  pendingDeleteId =
    cartItemId;


  const modal =
    document.getElementById(
      "deleteModal"
    );


  const description =
    document.getElementById(
      "deleteModalDescription"
    );


  if (description) {

    description.textContent =
      `${productName || "Produk ini"} akan dihapus dari keranjang.`;

  }


  if (modal) {

    modal.classList.add(
      "show"
    );


    modal.setAttribute(
      "aria-hidden",
      "false"
    );

  }

}



/* =========================================================
   CLOSE DELETE MODAL
   ========================================================= */

function closeDeleteModal() {

  const modal =
    document.getElementById(
      "deleteModal"
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
   CLEAR CART
   ========================================================= */

function initClearCart() {

  const button =
    document.getElementById(
      "clearCartButton"
    );


  button?.addEventListener(
    "click",
    openClearModal
  );

}



/* =========================================================
   CLEAR MODAL
   ========================================================= */

function initClearModal() {

  const modal =
    document.getElementById(
      "clearModal"
    );


  if (!modal) {
    return;
  }


  modal
    .querySelectorAll(
      "[data-close-clear-modal]"
    )
    .forEach(
      element => {

        element.addEventListener(
          "click",
          closeClearModal
        );

      }
    );


  const confirmButton =
    document.getElementById(
      "confirmClearButton"
    );


  confirmButton?.addEventListener(
    "click",
    () => {

      cartItems = [];


      saveCart();

      closeClearModal();

      renderCart();

    }
  );

}



/* =========================================================
   OPEN CLEAR MODAL
   ========================================================= */

function openClearModal() {

  if (
    cartItems.length === 0
  ) {

    return;

  }


  const modal =
    document.getElementById(
      "clearModal"
    );


  modal?.classList.add(
    "show"
  );


  modal?.setAttribute(
    "aria-hidden",
    "false"
  );

}



/* =========================================================
   CLOSE CLEAR MODAL
   ========================================================= */

function closeClearModal() {

  const modal =
    document.getElementById(
      "clearModal"
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
   ESC CLOSE MODAL
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeDeleteModal();

      closeClearModal();

    }

  }
);



/* =========================================================
   IMAGE PATH
   ========================================================= */

function getCartImagePath(
  path
) {

  if (!path) {
    return "";
  }


  /* Absolute / hosted URL */

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {

    return path;

  }


  /*
    Product page stores paths such as:
    ../../assets/images/products/...

    Cart page is:
    /cart/index.html

    Therefore cart needs:
    ../assets/images/products/...
  */


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


  return `../${cleaned}`;

}



/* =========================================================
   IMAGE FALLBACK
   ========================================================= */

function renderCartImageFallback(
  container,
  item
) {

  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const fallback =
    document.createElement(
      "div"
    );


  fallback.className =
    "cart-image-fallback";


  const title =
    document.createElement(
      "strong"
    );


  title.textContent =
    item.variantName
      ? `${item.variantName} Package`
      : "Memora Product";


  const description =
    document.createElement(
      "span"
    );


  description.textContent =
    "Preview belum tersedia";


  fallback.append(
    title,
    description
  );


  container.appendChild(
    fallback
  );

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



/* =========================================================
   DATE
   ========================================================= */

function formatDate(
  value
) {

  if (!value) {
    return "";
  }


  const parts =
    String(value)
      .split("-");


  if (
    parts.length !== 3
  ) {

    return value;

  }


  const [
    year,
    month,
    day
  ] = parts;


  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value;

  }


  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day:
        "numeric",

      month:
        "long",

      year:
        "numeric"
    }
  ).format(
    date
  );

}



/* =========================================================
   HUMANIZE KEY
   ========================================================= */

function humanizeKey(
  key
) {

  return String(key)
    .replace(
      /([A-Z])/g,
      " $1"
    )
    .replace(
      /^./,
      char =>
        char.toUpperCase()
    )
    .trim();

}



/* =========================================================
   SET TEXT
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