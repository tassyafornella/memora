/* ==========================================================
   MEMORA - MINIMUM QUANTITY SYSTEM

   NORMAL ORDER:
   invitation = minimum 50
   others     = minimum 5

   PRIVATE CUSTOM ORDER:
   minimum_override = true
   => quantity approved by Memora is preserved.
   ========================================================== */

(function () {

  "use strict";


  const PRODUCT_RULES = [

  {
    keys: [
      "classic-invitation",
      "classic-folded-invitation",
      "classic folded invitation",
      "/product/invitation/",
      "wedding-invitation",
      "wedding invitation"
    ],
    min: 50,
    unit: "pcs"
  },

  {
    keys: [
      "bridesmaid",
      "bridesmaid-moh"
    ],
    min: 5,
    unit: "pcs"
  },

  {
    keys: [
      "keepsake"
    ],
    min: 1,
    unit: "set"
  },

  {
    keys: [
      "hangtag"
    ],
    min: 30,
    unit: "pcs"
  },

  {
    keys: [
      "sticker"
    ],
    min: 5,
    unit: "sheet"
  },

  {
    keys: [
      "birthday"
    ],
    min: 5,
    unit: "pcs"
  }

];



  function normalize(value) {

    return String(
      value || ""
    )
    .toLowerCase()
    .trim();

  }



  function number(value) {

    const parsed =
      Number.parseInt(
        String(
          value || ""
        )
        .replace(
          /[^\d]/g,
          ""
        ),
        10
      );


    return Number.isFinite(
      parsed
    )
      ? parsed
      : 0;

  }



  function getPageRule() {

    const path =
      normalize(
        location.pathname
      );


    return PRODUCT_RULES.find(
      rule =>
        rule.keys.some(
          key =>
            path.includes(
              normalize(key)
            )
        )
    ) || null;

  }



  function getItemRule(item) {

    if (
      item?.is_custom_order === true &&
      item?.minimum_override === true
    ) {

      return {
        min: 1,
        unit: "pcs"
      };

    }


    const combined =
      normalize(
        [
          item?.product,
          item?.product_id,
          item?.productSlug,
          item?.product_slug,
          item?.product_name,
          item?.productName,
          item?.name
        ]
        .filter(Boolean)
        .join(" ")
      );


    return PRODUCT_RULES.find(
      rule =>
        rule.keys.some(
          key =>
            combined.includes(
              normalize(key)
            )
        )
    ) || {
      min: 5,
      unit: "pcs"
    };

  }


  function itemMinimum(item) {

    return getItemRule(
      item
    ).min;

  }



  function findQuantityInput() {

    const selectors = [

      "#quantity",

      "#quantityInput",

      "#productQuantity",

      "#qty",

      "#qtyInput",

      "#bridesmaidQuantity",

      "#keepsakeQuantity",

      "#hangtagQuantity",

      "#birthdayQuantity",

      'input[name="quantity"]',

      'input[name="qty"]',

      ".quantity-input input",

      ".quantity-input",

      ".qty-input",

      "[data-quantity-input]"

    ];


    for (
      const selector
      of selectors
    ) {

      const element =
        document.querySelector(
          selector
        );


      if (
        element &&
        element.tagName === "INPUT"
      ) {

        return element;

      }

    }


    return null;

  }



  function fire(input) {

    input?.dispatchEvent(
      new Event(
        "input",
        {
          bubbles:
            true
        }
      )
    );


    input?.dispatchEvent(
      new Event(
        "change",
        {
          bubbles:
            true
        }
      )
    );

  }



  function resetPageQuantityToMinimum() {

    const rule =
      getPageRule();


    if (!rule) {
      return;
    }


    const input =
      findQuantityInput();


    if (!input) {
      return;
    }


    input.min =
      String(
        rule.min
      );


    /*
      Setiap halaman produk dibuka / refresh,
      quantity selalu kembali ke minimum order.
    */

    input.value =
      String(
        rule.min
      );


    fire(
      input
    );

  }



  function validateQuantityAfterTyping() {

    const rule =
      getPageRule();


    if (!rule) {
      return;
    }


    const input =
      findQuantityInput();


    if (!input) {
      return;
    }


    const raw =
      String(
        input.value ?? ""
      ).trim();


    /*
      Saat user sedang mengetik, boleh kosong sementara.
      Jangan langsung dipaksa ke minimum.
    */

    if (raw === "") {
      return;
    }


    const value =
      parseInt(
        raw,
        10
      );


    if (
      !Number.isFinite(value) ||
      value < rule.min
    ) {

      input.value =
        String(
          rule.min
        );


      fire(
        input
      );

      return;
    }


    input.value =
      String(
        value
      );

  }



  function enforcePageMinimum() {

    const rule =
      getPageRule();


    if (!rule) {
      return;
    }


    const input =
      findQuantityInput();


    if (!input) {
      return;
    }


    input.min =
      String(
        rule.min
      );


    if (
      number(
        input.value
      ) < rule.min
    ) {

      input.value =
        String(
          rule.min
        );


      fire(
        input
      );

    }


    installLabel(
      input,
      rule.min,
      rule.unit
    );

  }



  function installLabel(
    input,
    minimum,
    unit
  ) {

    const existing =
      document.getElementById(
        "memoraMinimumQuantityInfo"
      );


    if (existing) {

      existing.textContent =
        `Minimum order ${minimum} ${unit}`;

      return;

    }


    const info =
      document.createElement(
        "small"
      );


    info.id =
      "memoraMinimumQuantityInfo";


    info.textContent =
      `Minimum order ${minimum} ${unit}`;


    Object.assign(
      info.style,
      {

        display:
          "block",

        marginTop:
          "8px",

        color:
          "#7B8982",

        fontSize:
          "12px",

        fontFamily:
          '"Poppins", sans-serif'

      }
    );


    const wrapper =
      input.closest(
        ".quantity-control,.quantity-selector,.quantity-input,.qty-control,.quantity-stepper,.quantity-wrapper"
      );


    if (
      wrapper &&
      wrapper.parentNode
    ) {

      wrapper.insertAdjacentElement(
        "afterend",
        info
      );

    }
    else {

      input.insertAdjacentElement(
        "afterend",
        info
      );

    }

  }



  function normalizeCart() {

    let cart;


    try {

      cart =
        JSON.parse(
          localStorage.getItem(
            "memora_cart"
          ) || "[]"
        );

    }
    catch (_) {

      return;

    }


    if (
      !Array.isArray(cart)
    ) {

      return;

    }


    let changed =
      false;


    cart.forEach(
      item => {

        /*
          PRIVATE CUSTOM ORDER:
          NEVER force catalog minimum.
        */

        if (
          item?.is_custom_order ===
            true &&
          item?.minimum_override ===
            true
        ) {

          const locked =
            number(
              item.custom_locked_quantity
            );


          if (
            locked > 0 &&
            number(
              item.quantity
            ) !== locked
          ) {

            item.quantity =
              locked;


            changed =
              true;

          }


          return;

        }


        const minimum =
          itemMinimum(
            item
          );


        if (
          number(
            item.quantity
          ) < minimum
        ) {

          item.quantity =
            minimum;


          changed =
            true;

        }

      }
    );


    if (changed) {

      localStorage.setItem(
        "memora_cart",
        JSON.stringify(
          cart
        )
      );


      window.dispatchEvent(
        new CustomEvent(
          "memora:cart-updated",
          {
            detail:
              cart
          }
        )
      );

    }

  }



  function bindTypingValidation() {

    const input =
      findQuantityInput();


    if (!input) {
      return;
    }


    /*
      INPUT:
      jangan validasi minimum ketika user masih mengetik.
    */

    input.addEventListener(
      "input",
      () => {

        /*
          sengaja kosong:
          user bebas mengetik 70, 200, 300, dst.
        */

      }
    );


    /*
      BLUR:
      baru validasi setelah user selesai mengetik.
    */

    input.addEventListener(
      "blur",
      () => {

        validateQuantityAfterTyping();

      }
    );


    /*
      CHANGE:
      fallback browser.
    */

    input.addEventListener(
      "change",
      () => {

        validateQuantityAfterTyping();

      }
    );

  }



  function bindProductPage() {

    const rule =
      getPageRule();


    if (!rule) {
      return;
    }


    const input =
      findQuantityInput();


    if (!input) {
      return;
    }


    input.addEventListener(
      "change",
      () => {

        if (
          number(
            input.value
          ) < rule.min
        ) {

          input.value =
            String(
              rule.min
            );


          fire(
            input
          );

        }

      }
    );


    input.addEventListener(
      "blur",
      enforcePageMinimum
    );


    document.addEventListener(
      "click",
      () => {

        setTimeout(
          enforcePageMinimum,
          0
        );

      },
      true
    );

  }



  function init() {

    /*
      RESET PRODUCT PAGE
      Saat refresh selalu mulai dari minimum order.
    */

    resetPageQuantityToMinimum();

    normalizeCart();

    enforcePageMinimum();

    bindTypingValidation();

    bindProductPage();


    /*
      Cart scripts can change localStorage after clicks.
      Re-check custom locked qty.
    */

    if (
      normalize(
        location.pathname
      ).includes(
        "/cart/"
      )
    ) {

      document.addEventListener(
        "click",
        () => {

          setTimeout(
            normalizeCart,
            30
          );

        }
      );


      document.addEventListener(
        "change",
        () => {

          setTimeout(
            normalizeCart,
            30
          );

        }
      );

    }


    setTimeout(
      () => {

        /*
          Reset sekali lagi setelah script product selesai.
          Ini mencegah browser mengembalikan nilai input lama
          setelah refresh.
        */

        resetPageQuantityToMinimum();

        normalizeCart();

        enforcePageMinimum();

      },
      300
    );

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



