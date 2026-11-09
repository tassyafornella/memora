(function () {

  "use strict";


  const CART_KEY =
    "memora_cart";


  const PRODUCTS = {

    invitation: {

      name:
        "Wedding Invitation",

      category:
        "Invitation",

      minimum:
        50,

      unit:
        "pcs",

      description:
        "Personalized wedding invitation untuk momen pernikahan dengan pilihan paket dan desain yang dapat disesuaikan.",

      previewEyebrow:
        "THE WEDDING OF",

      previewTitle:
        "Amora",

      previewSmall:
        "Wedding Invitation",

      packages: {

        simple: {
          name:
            "Simple",

          price:
            5500,

          description:
            "Main invitation card + personalized design"
        },

        signature: {
          name:
            "Signature",

          price:
            7500,

          description:
            "Invitation set dengan detail lebih lengkap"
        }

      }

    },


    bridesmaid: {

      name:
        "Bridesmaid Card",

      category:
        "Bridesmaid",

      minimum:
        5,

      unit:
        "pcs",

      description:
        "Personalized bridesmaid card untuk mengajak orang terdekat menjadi bagian dari hari spesialmu.",

      previewEyebrow:
        "WILL YOU BE MY",

      previewTitle:
        "Bridesmaid?",

      previewSmall:
        "With Love",

      packages: {

        simple: {
          name:
            "Simple",

          price:
            8000,

          description:
            "Personalized name + basic card design"
        },

        signature: {
          name:
            "Signature",

          price:
            12000,

          description:
            "Card set dengan message dan wedding details"
        }

      }

    },


    keepsake: {

      name:
        "Keepsake",

      category:
        "Keepsake",

      minimum:
        1,

      unit:
        "pcs",

      description:
        "Personalized keepsake untuk menyimpan detail dan kenangan dalam bentuk stationery yang lebih personal.",

      previewEyebrow:
        "MEMORA",

      previewTitle:
        "Keepsake",

      previewSmall:
        "Made to Remember",

      packages: {

        simple: {
          name:
            "Simple",

          price:
            12000,

          description:
            "Basic personalized keepsake"
        },

        signature: {
          name:
            "Signature",

          price:
            18000,

          description:
            "Complete personalized keepsake set"
        }

      }

    }

  };


  let productKey =
    "";

  let product =
    null;

  let selectedPackage =
    "simple";

  let selectedDesign =
    "Design 01";

  let quantity =
    20;


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


  function detectProduct() {

    const fromBody =
      String(
        document.body.dataset.product ||
        ""
      )
      .trim()
      .toLowerCase();


    if (
      PRODUCTS[fromBody]
    ) {

      return fromBody;

    }


    const path =
      location.pathname
        .toLowerCase();


    return Object.keys(
      PRODUCTS
    ).find(
      key =>
        path.includes(
          `/product/${key}/`
        )
    ) || "";

  }


  function currentPackage() {

    return product
      .packages[
        selectedPackage
      ];

  }


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


  function renderProduct() {

    setText(
      "productCategory",
      product.category
    );


    setText(
      "productName",
      product.name
    );


    setText(
      "productDescription",
      product.description
    );


    setText(
      "previewEyebrow",
      product.previewEyebrow
    );


    setText(
      "previewTitle",
      product.previewTitle
    );


    setText(
      "previewSmall",
      product.previewSmall
    );


    setText(
      "minimumValue",
      `${product.minimum} ${product.unit}`
    );


    const simple =
      product.packages.simple;


    const signature =
      product.packages.signature;


    setText(
      "simplePrice",
      rupiah(
        simple.price
      )
    );


    setText(
      "simpleDescription",
      simple.description
    );


    setText(
      "signaturePrice",
      rupiah(
        signature.price
      )
    );


    setText(
      "signatureDescription",
      signature.description
    );


    quantity =
      product.minimum;


    const quantityInput =
      document.getElementById(
        "quantityInput"
      );


    if (quantityInput) {

      quantityInput.value =
        String(quantity);

    }


    renderSummary();

    validateQuantity();

  }


  function renderSummary() {

    const pkg =
      currentPackage();


    const total =
      pkg.price *
      quantity;


    setText(
      "summaryPackage",
      pkg.name
    );


    setText(
      "summaryDesign",
      selectedDesign
    );


    setText(
      "summaryQuantity",
      `${quantity} ${product.unit}`
    );


    setText(
      "summaryUnitPrice",
      rupiah(
        pkg.price
      )
    );


    setText(
      "summaryTotal",
      rupiah(total)
    );


    setText(
      "productPrice",
      `${rupiah(pkg.price)} / ${product.unit}`
    );

  }


  function selectPackage(
    packageKey
  ) {

    if (
      !product.packages[
        packageKey
      ]
    ) {

      return;

    }


    selectedPackage =
      packageKey;


    document
      .querySelectorAll(
        "[data-package]"
      )
      .forEach(
        button => {

          button
            .classList
            .toggle(
              "active",
              button.dataset.package ===
                packageKey
            );

        }
      );


    renderSummary();

  }


  function selectDesign(
    design
  ) {

    selectedDesign =
      design;


    document
      .querySelectorAll(
        "[data-design]"
      )
      .forEach(
        button => {

          button
            .classList
            .toggle(
              "active",
              button.dataset.design ===
                design
            );

        }
      );


    renderSummary();

  }


  function validateQuantity() {

    const warning =
      document.getElementById(
        "minimumWarning"
      );


    const addButton =
      document.getElementById(
        "addToCartButton"
      );


    const valid =
      Number.isFinite(
        quantity
      ) &&
      quantity >=
        product.minimum;


    warning
      ?.classList
      .toggle(
        "show",
        !valid
      );


    if (warning) {

      warning.querySelector(
        "[data-minimum]"
      ).textContent =
        `${product.minimum} ${product.unit}`;

    }


    if (addButton) {

      addButton.disabled =
        !valid;


      addButton.textContent =
        valid
          ? "Tambah ke Keranjang"
          : `Pembelian minimal ${product.minimum} ${product.unit}`;

    }


    return valid;

  }


  function updateQuantity(
    value
  ) {

    quantity =
      Number(value);


    if (
      !Number.isFinite(
        quantity
      )
    ) {

      quantity =
        0;

    }


    renderSummary();

    validateQuantity();

  }


  function personalization() {

    const fields =
      document.querySelectorAll(
        "[data-personalization]"
      );


    const result =
      {};


    fields.forEach(
      field => {

        result[
          field.name ||
          field.id
        ] =
          field.value.trim();

      }
    );


    return result;

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


  function addToCart() {

    if (
      !validateQuantity()
    ) {

      return;

    }


    const pkg =
      currentPackage();


    const cart =
      readCart();


    cart.push({

      cartItemId:
        `${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`,

      productId:
        productKey,

      productName:
        product.name,

      packageKey:
        selectedPackage,

      packageName:
        pkg.name,

      design:
        selectedDesign,

      quantity:
        quantity,

      unit:
        product.unit,

      unitPrice:
        pkg.price,

      subtotal:
        pkg.price *
        quantity,

      personalization:
        personalization(),

      addedAt:
        new Date()
          .toISOString()

    });


    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );


    window.dispatchEvent(
      new Event(
        "memora-cart-updated"
      )
    );


    setText(
      "cartSuccess",
      "Produk berhasil ditambahkan ke keranjang."
    );


    setTimeout(
      () => {

        setText(
          "cartSuccess",
          ""
        );

      },
      2800
    );

  }


  function bindEvents() {

    document
      .querySelectorAll(
        "[data-package]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              selectPackage(
                button.dataset.package
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-design]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              selectDesign(
                button.dataset.design
              );

            }
          );

        }
      );


    const quantityInput =
      document.getElementById(
        "quantityInput"
      );


    quantityInput
      ?.addEventListener(
        "input",
        () => {

          updateQuantity(
            quantityInput.value
          );

        }
      );


    document
      .getElementById(
        "decreaseQuantity"
      )
      ?.addEventListener(
        "click",
        () => {

          const next =
            Math.max(
              1,
              quantity - 1
            );


          quantityInput.value =
            String(next);


          updateQuantity(next);

        }
      );


    document
      .getElementById(
        "increaseQuantity"
      )
      ?.addEventListener(
        "click",
        () => {

          const next =
            Math.max(
              1,
              quantity + 1
            );


          quantityInput.value =
            String(next);


          updateQuantity(next);

        }
      );


    document
      .getElementById(
        "addToCartButton"
      )
      ?.addEventListener(
        "click",
        addToCart
      );

  }


  function init() {

    productKey =
      detectProduct();


    product =
      PRODUCTS[
        productKey
      ];


    if (!product) {

      return;

    }


    renderProduct();

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