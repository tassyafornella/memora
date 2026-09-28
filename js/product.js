/* =========================================================
   MEMORA
   UNIVERSAL PRODUCT DETAIL
   ========================================================= */


/* =========================================================
   PRODUCT CONFIGURATION
   ========================================================= */

const memoraProducts = {


  /* =======================================================
     INVITATION
     ======================================================= */

  invitation: {

    productId: "invitation",

    productName: "Wedding Invitation",

    defaultQuantity: 50,

    variants: {

      simple: {

        name: "Simple",

        price: 7500,

        image:
          "../../assets/images/products/invitation/simple.jpg",

        contents: [
          "Main Invitation Card",
          "Detail / Rundown Card",
          "Basic personalized design"
        ]

      },


      signature: {

        name: "Signature",

        price: 12000,

        image:
          "../../assets/images/products/invitation/signature.jpg",

        contents: [
          "Main Invitation Card",
          "Detail / Rundown Card",
          "RSVP Card",
          "Photo Card",
          "Personalized theme design"
        ]

      },


      complete: {

        name: "Complete",

        price: 17500,

        image:
          "../../assets/images/products/invitation/complete.jpg",

        contents: [
          "Main Invitation Card",
          "Detail / Rundown Card",
          "RSVP Card",
          "Photo Card",
          "Additional personalized card",
          "Complete personalized theme design"
        ]

      }

    }

  },



  /* =======================================================
     BRIDESMAID
     ======================================================= */

  bridesmaid: {

    productId: "bridesmaid",

    productName:
      "Bridesmaid / MOH Set",

    defaultQuantity: 7,

    variants: {

      simple: {

        name: "Simple",

        price: 8000,

        image:
          "../../assets/images/products/bridesmaid/simple.jpg",

        contents: [
          "Personalized Bridesmaid / MOH Card",
          "Personalized Name",
          "Basic theme design"
        ]

      },


      signature: {

        name: "Signature",

        price: 12000,

        image:
          "../../assets/images/products/bridesmaid/signature.jpg",

        contents: [
          "Personalized Bridesmaid / MOH Card",
          "Personalized Name",
          "Message Card",
          "Wedding Detail Card",
          "Personalized theme design"
        ]

      },


      complete: {

        name: "Complete",

        price: 18000,

        image:
          "../../assets/images/products/bridesmaid/complete.jpg",

        contents: [
          "Personalized Bridesmaid / MOH Card",
          "Personalized Name",
          "Message Card",
          "Wedding Detail Card",
          "Photo / Memory Card",
          "Complete personalized theme design"
        ]

      }

    }

  },



  /* =======================================================
     KEEPSAKE
     ======================================================= */

  keepsake: {

    productId: "keepsake",

    productName:
      "Keepsake Set",

    defaultQuantity: 1,

    variants: {

      simple: {

        name: "Simple",

        price: 12000,

        image:
          "../../assets/images/products/keepsake/simple.jpg",

        contents: [
          "6 Personalized Keepsake Cards",
          "Basic personalized design",
          "Decorative sticker elements"
        ]

      },


      signature: {

        name: "Signature",

        price: 18000,

        image:
          "../../assets/images/products/keepsake/signature.jpg",

        contents: [
          "8 Personalized Keepsake Cards",
          "Personalized theme design",
          "Photo / memory card",
          "Decorative sticker elements"
        ]

      },


      complete: {

        name: "Complete",

        price: 25000,

        image:
          "../../assets/images/products/keepsake/complete.jpg",

        contents: [
          "10 Personalized Keepsake Cards",
          "Complete personalized design",
          "Photo / memory cards",
          "Message cards",
          "Decorative sticker elements"
        ]

      }

    }

  },



  /* =======================================================
     BIRTHDAY
     ======================================================= */

  birthday: {

    productId: "birthday",

    productName:
      "Birthday Card Set",

    defaultQuantity: 1,

    variants: {

      simple: {

        name: "Simple",

        price: 8000,

        image:
          "../../assets/images/products/birthday/simple.jpg",

        contents: [
          "Personalized Birthday Card",
          "Message Card",
          "Basic personalized design"
        ]

      },


      signature: {

        name: "Signature",

        price: 12000,

        image:
          "../../assets/images/products/birthday/signature.jpg",

        contents: [
          "Personalized Birthday Card",
          "Message Card",
          "Photo Card",
          "Personalized theme design"
        ]

      },


      complete: {

        name: "Complete",

        price: 18000,

        image:
          "../../assets/images/products/birthday/complete.jpg",

        contents: [
          "Personalized Birthday Card",
          "Message Card",
          "Photo Card",
          "Memory / Wish Card",
          "Complete personalized theme design"
        ]

      }

    }

  },



  /* =======================================================
     HANGTAG
     ======================================================= */

  hangtag: {

    productId: "hangtag",

    productName:
      "Hangtag Set",

    defaultQuantity: 50,

    variants: {

      simple: {

        name: "Simple",

        price: 1500,

        image:
          "../../assets/images/products/hangtag/simple.jpg",

        contents: [
          "1 Main Personalized Hangtag",
          "Basic personalized design"
        ]

      },


      signature: {

        name: "Signature",

        price: 2500,

        image:
          "../../assets/images/products/hangtag/signature.jpg",

        contents: [
          "2 Personalized Hangtags",
          "Main Event / Name Tag",
          "Date / Initial Tag",
          "Personalized theme design"
        ]

      },


      complete: {

        name: "Complete",

        price: 3500,

        image:
          "../../assets/images/products/hangtag/complete.jpg",

        contents: [
          "3 Personalized Hangtags",
          "Main Event / Name Tag",
          "Date / Initial Tag",
          "Decorative / Thank You Tag",
          "Complete personalized theme design"
        ]

      }

    }

  },


  sticker: {

    productId:
      "sticker",

    productName:
      "Sticker Set",

    defaultQuantity:
      1,

    variants: {

      simple: {

        name:
          "Simple",

        price:
          5000,

        image:
          "../../assets/images/products/sticker/simple.jpg",

        contents: [
          "1 Personalized Sticker Design",
          "Standard Shape",
          "Basic Personalized Theme"
        ]

      },


      signature: {

        name:
          "Signature",

        price:
          8000,

        image:
          "../../assets/images/products/sticker/signature.jpg",

        contents: [
          "3 Personalized Sticker Designs",
          "Personalized Name / Event",
          "Custom Color Theme",
          "Choice of Sticker Shape"
        ]

      },


      complete: {

        name:
          "Complete",

        price:
          12000,

        image:
          "../../assets/images/products/sticker/complete.jpg",

        contents: [
          "5 Personalized Sticker Designs",
          "Personalized Name / Event",
          "Mixed Sticker Shapes",
          "Decorative Sticker Set",
          "Complete Personalized Theme"
        ]

      }

    }

  }
};



/* =========================================================
   STATE
   ========================================================= */

const currentProductKey =
  document.body.dataset.product ||
  "invitation";


const currentProduct =
  memoraProducts[currentProductKey] ||
  memoraProducts.invitation;


let selectedVariantKey =
  "simple";


let quantity =
  currentProduct.defaultQuantity ||
  1;



/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    restoreDraft();

    initVariantSelector();

    initQuantitySelector();

    initPersonalizationInputs();

    initAddToCart();

    updateActiveVariantButton();

    renderProduct();

  }
);



/* =========================================================
   VARIANT SELECTOR
   ========================================================= */

function initVariantSelector() {

  const buttons =
    document.querySelectorAll(
      ".variant-card"
    );


  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const variantKey =
            button.dataset.variant;


          if (
            !variantKey ||
            !currentProduct
              .variants[variantKey]
          ) {

            return;

          }


          selectedVariantKey =
            variantKey;


          updateActiveVariantButton();

          renderProduct();

        }
      );

    }
  );

}



/* =========================================================
   ACTIVE VARIANT
   ========================================================= */

function updateActiveVariantButton() {

  const buttons =
    document.querySelectorAll(
      ".variant-card"
    );


  buttons.forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.variant ===
          selectedVariantKey
      );

    }
  );

}



/* =========================================================
   QUANTITY
   ========================================================= */

function initQuantitySelector() {

  const input =
    document.getElementById(
      "quantityInput"
    );


  const decrease =
    document.getElementById(
      "decreaseQuantity"
    );


  const increase =
    document.getElementById(
      "increaseQuantity"
    );


  if (!input) {
    return;
  }


  input.value =
    quantity;


  decrease?.addEventListener(
    "click",
    () => {

      quantity =
        Math.max(
          1,
          quantity - 1
        );


      input.value =
        quantity;


      renderSummary();

      saveDraft();

    }
  );


  increase?.addEventListener(
    "click",
    () => {

      quantity += 1;


      input.value =
        quantity;


      renderSummary();

      saveDraft();

    }
  );


  input.addEventListener(
    "input",
    () => {

      quantity =
        Math.max(
          1,
          Number(input.value) || 1
        );


      renderSummary();

      saveDraft();

    }
  );


  input.addEventListener(
    "blur",
    () => {

      input.value =
        quantity;

    }
  );

}



/* =========================================================
   PERSONALIZATION
   ========================================================= */

function initPersonalizationInputs() {

  const fields =
    document.querySelectorAll(
      "[data-personalization]"
    );


  fields.forEach(
    field => {

      field.addEventListener(
        "input",
        saveDraft
      );


      field.addEventListener(
        "change",
        saveDraft
      );

    }
  );

}



/* =========================================================
   GET PERSONALIZATION
   ========================================================= */

function getPersonalization() {

  const data = {};


  const fields =
    document.querySelectorAll(
      "[data-personalization]"
    );


  fields.forEach(
    field => {

      const key =
        field.id ||
        field.name;


      if (!key) {
        return;
      }


      data[key] = {

        label:
          field.dataset.label ||
          key,

        value:
          field.value?.trim() ||
          ""

      };

    }
  );


  return data;

}



/* =========================================================
   RENDER PRODUCT
   ========================================================= */

function renderProduct() {

  renderVariantImage();

  renderPackageContent();

  renderSummary();

  saveDraft();

}



/* =========================================================
   VARIANT IMAGE
   ========================================================= */

function renderVariantImage() {

  const variant =
    getSelectedVariant();


  const wrapper =
    document.getElementById(
      "productImageWrapper"
    ) ||
    document.querySelector(
      ".product-image-wrapper"
    );


  if (wrapper) {

    wrapper.innerHTML = "";


    const image =
      document.createElement(
        "img"
      );


    image.id =
      "productImage";


    image.src =
      variant.image;


    image.alt =
      `${currentProduct.productName} ${variant.name}`;


    image.addEventListener(
      "error",
      () => {

        renderImageFallback(
          wrapper,
          variant
        );

      },
      {
        once: true
      }
    );


    wrapper.appendChild(
      image
    );

  }


  setTextById(
    "previewPackageName",
    variant.name
  );


  setTextById(
    "selectedPackageLabel",
    variant.name
  );

}



/* =========================================================
   IMAGE FALLBACK
   ========================================================= */

function renderImageFallback(
  wrapper,
  variant
) {

  wrapper.innerHTML =
    "";


  const fallback =
    document.createElement(
      "div"
    );


  fallback.className =
    "variant-image-fallback";


  const title =
    document.createElement(
      "strong"
    );


  title.textContent =
    `${variant.name} Package`;


  const description =
    document.createElement(
      "span"
    );


  description.textContent =
    "Tambahkan foto contoh produk dari Canva";


  fallback.append(
    title,
    description
  );


  wrapper.appendChild(
    fallback
  );

}



/* =========================================================
   INLINE ERROR COMPATIBILITY
   ========================================================= */

function handleVariantImageError(
  image
) {

  if (!image) {
    return;
  }


  const wrapper =
    image.parentElement;


  if (!wrapper) {
    return;
  }


  renderImageFallback(
    wrapper,
    getSelectedVariant()
  );

}



/* =========================================================
   PACKAGE CONTENT
   ========================================================= */

function renderPackageContent() {

  const variant =
    getSelectedVariant();


  setTextById(
    "packageContentName",
    variant.name
  );


  const list =
    document.getElementById(
      "packageContentList"
    );


  if (!list) {
    return;
  }


  list.innerHTML =
    "";


  variant.contents.forEach(
    content => {

      const item =
        document.createElement(
          "li"
        );


      item.textContent =
        content;


      list.appendChild(
        item
      );

    }
  );

}



/* =========================================================
   SUMMARY
   ========================================================= */

function renderSummary() {

  const variant =
    getSelectedVariant();


  const total =
    variant.price *
    quantity;


  setTextById(
    "summaryPackage",
    variant.name
  );


  setTextById(
    "summaryUnitPrice",
    formatRupiah(
      variant.price
    )
  );


  setTextById(
    "summaryQuantity",
    `${quantity} set`
  );


  setTextById(
    "summaryTotal",
    formatRupiah(
      total
    )
  );

}



/* =========================================================
   ADD TO CART
   ========================================================= */

function initAddToCart() {

  const button =
    document.getElementById(
      "addToCartButton"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      const cartItem =
        buildCartItem();


      const cart =
        getStoredCart();


      cart.push(
        cartItem
      );


      localStorage.setItem(
        "memora_cart",
        JSON.stringify(
          cart
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


      showCartToast();

    }
  );

}



/* =========================================================
   BUILD CART ITEM
   ========================================================= */

function buildCartItem() {

  const variant =
    getSelectedVariant();


  return {

    cartItemId:
      generateCartItemId(),

    productId:
      currentProduct.productId,

    productName:
      currentProduct.productName,

    variant:
      selectedVariantKey,

    variantName:
      variant.name,

    variantImage:
      variant.image,

    packageContents:
      [...variant.contents],

    unitPrice:
      variant.price,

    quantity:
      quantity,

    subtotal:
      variant.price *
      quantity,

    personalization:
      getPersonalization(),

    addedAt:
      new Date()
        .toISOString()

  };

}



/* =========================================================
   STORED CART
   ========================================================= */

function getStoredCart() {

  try {

    const stored =
      localStorage.getItem(
        "memora_cart"
      );


    if (!stored) {
      return [];
    }


    const parsed =
      JSON.parse(
        stored
      );


    return Array.isArray(
      parsed
    )
      ? parsed
      : [];

  }

  catch (error) {

    console.error(
      "Gagal membaca cart:",
      error
    );


    return [];

  }

}



/* =========================================================
   SAVE DRAFT
   ========================================================= */

function saveDraft() {

  const draft = {

    variant:
      selectedVariantKey,

    quantity:
      quantity,

    personalization:
      getPersonalization()

  };


  localStorage.setItem(
    getDraftKey(),
    JSON.stringify(
      draft
    )
  );

}



/* =========================================================
   RESTORE DRAFT
   ========================================================= */

function restoreDraft() {

  try {

    const stored =
      localStorage.getItem(
        getDraftKey()
      );


    if (!stored) {
      return;
    }


    const draft =
      JSON.parse(
        stored
      );


    if (
      draft.variant &&
      currentProduct
        .variants[draft.variant]
    ) {

      selectedVariantKey =
        draft.variant;

    }


    if (
      Number(draft.quantity) > 0
    ) {

      quantity =
        Number(
          draft.quantity
        );

    }


    const personalization =
      draft.personalization ||
      {};


    Object.entries(
      personalization
    ).forEach(
      ([key, item]) => {

        const field =
          document.getElementById(
            key
          );


        if (!field) {
          return;
        }


        if (
          typeof item === "object" &&
          item !== null
        ) {

          field.value =
            item.value || "";

        }

        else {

          field.value =
            item || "";

        }

      }
    );

  }

  catch (error) {

    console.error(
      "Gagal memulihkan draft:",
      error
    );

  }

}



/* =========================================================
   DRAFT KEY
   ========================================================= */

function getDraftKey() {

  return (
    `memora_${currentProductKey}_draft`
  );

}



/* =========================================================
   SELECTED VARIANT
   ========================================================= */

function getSelectedVariant() {

  return (
    currentProduct
      .variants[selectedVariantKey]
    ||
    currentProduct
      .variants.simple
  );

}



/* =========================================================
   TOAST
   ========================================================= */

let cartToastTimer =
  null;


function showCartToast() {

  const toast =
    document.getElementById(
      "cartToast"
    );


  if (!toast) {
    return;
  }


  toast.classList.add(
    "show"
  );


  clearTimeout(
    cartToastTimer
  );


  cartToastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3200
    );

}



/* =========================================================
   TEXT
   ========================================================= */

function setTextById(
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



/* =========================================================
   CART ITEM ID
   ========================================================= */

function generateCartItemId() {

  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {

    return (
      "cart-" +
      crypto.randomUUID()
    );

  }


  return (
    "cart-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 9)
  );

}



/* =========================================================
   GLOBAL
   ========================================================= */

window.handleVariantImageError =
  handleVariantImageError;
