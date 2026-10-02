(() => {

  "use strict";


  /* ============================================================
     MEMORA BULK PRICING
     ============================================================ */

  const pricing = {

    "bridesmaid-moh": {

      unitLabel:
        "pcs",

      variants: {

        simple: {
          basePrice: 8000,
          tiers: [
            { min: 5,   max: 9,    price: 8000 },
            { min: 10,  max: 19,   price: 7500 },
            { min: 20,  max: null, price: 7000 }
          ]
        },

        signature: {
          basePrice: 12000,
          tiers: [
            { min: 5,   max: 9,    price: 12000 },
            { min: 10,  max: 19,   price: 11500 },
            { min: 20,  max: null, price: 11000 }
          ]
        },

        complete: {
          basePrice: 15000,
          tiers: [
            { min: 5,   max: 9,    price: 15000 },
            { min: 10,  max: 19,   price: 14500 },
            { min: 20,  max: null, price: 14000 }
          ]
        }

      }

    },


    keepsake: {

      unitLabel:
        "set",

      variants: {

        simple: {
          basePrice: 50000,
          tiers: [
            { min: 1, max: 2,    price: 50000 },
            { min: 3, max: 4,    price: 47500 },
            { min: 5, max: null, price: 45000 }
          ]
        },

        signature: {
          basePrice: 80000,
          tiers: [
            { min: 1, max: 2,    price: 80000 },
            { min: 3, max: 4,    price: 76000 },
            { min: 5, max: null, price: 72000 }
          ]
        },

        complete: {
          basePrice: 100000,
          tiers: [
            { min: 1, max: 2,    price: 100000 },
            { min: 3, max: 4,    price: 95000 },
            { min: 5, max: null, price: 90000 }
          ]
        }

      }

    },


    hangtag: {

      unitLabel:
        "pcs",

      variants: {

        simple: {
          basePrice: 500,
          tiers: [
            { min: 30,  max: 49,   price: 500 },
            { min: 50,  max: 99,   price: 450 },
            { min: 100, max: 199,  price: 400 },
            { min: 200, max: null, price: 350 }
          ]
        },

        signature: {
          basePrice: 1500,
          tiers: [
            { min: 30,  max: 49,   price: 1500 },
            { min: 50,  max: 99,   price: 1400 },
            { min: 100, max: 199,  price: 1300 },
            { min: 200, max: null, price: 1200 }
          ]
        },

        complete: {
          basePrice: 2000,
          tiers: [
            { min: 30,  max: 49,   price: 2000 },
            { min: 50,  max: 99,   price: 1900 },
            { min: 100, max: 199,  price: 1800 },
            { min: 200, max: null, price: 1700 }
          ]
        }

      }

    },


    birthday: {

      unitLabel:
        "pcs",

      variants: {

        simple: {
          basePrice: 8000,
          tiers: [
            { min: 5,   max: 9,    price: 8000 },
            { min: 10,  max: 19,   price: 7500 },
            { min: 20,  max: null, price: 7000 }
          ]
        },

        signature: {
          basePrice: 12000,
          tiers: [
            { min: 5,   max: 9,    price: 12000 },
            { min: 10,  max: 19,   price: 11500 },
            { min: 20,  max: null, price: 11000 }
          ]
        },

        complete: {
          basePrice: 15000,
          tiers: [
            { min: 5,   max: 9,    price: 15000 },
            { min: 10,  max: 19,   price: 14500 },
            { min: 20,  max: null, price: 14000 }
          ]
        }

      }

    },


    "classic-invitation": {

      unitLabel:
        "pcs",

      variants: {

        simple: {
          basePrice: 1500,
          tiers: [
            { min: 50,  max: 99,   price: 1500 },
            { min: 100, max: 199,  price: 1400 },
            { min: 200, max: 499,  price: 1300 },
            { min: 500, max: null, price: 1200 }
          ]
        },

        signature: {
          basePrice: 2000,
          tiers: [
            { min: 50,  max: 99,   price: 2000 },
            { min: 100, max: 199,  price: 1900 },
            { min: 200, max: 499,  price: 1800 },
            { min: 500, max: null, price: 1700 }
          ]
        },

        complete: {
          basePrice: 2500,
          tiers: [
            { min: 50,  max: 99,   price: 2500 },
            { min: 100, max: 199,  price: 2400 },
            { min: 200, max: 499,  price: 2300 },
            { min: 500, max: null, price: 2200 }
          ]
        }

      }

    },


    invitation: {

      unitLabel:
        "set",

      variants: {

        simple: {
          basePrice: 5500,
          tiers: [
            { min: 50,  max: 99,   price: 5500 },
            { min: 100, max: 199,  price: 5250 },
            { min: 200, max: 499,  price: 5000 },
            { min: 500, max: null, price: 4750 }
          ]
        },

        signature: {
          basePrice: 7500,
          tiers: [
            { min: 50,  max: 99,   price: 7500 },
            { min: 100, max: 199,  price: 7250 },
            { min: 200, max: 499,  price: 7000 },
            { min: 500, max: null, price: 6750 }
          ]
        },

        complete: {
          basePrice: 10500,
          tiers: [
            { min: 50,  max: 99,   price: 10500 },
            { min: 100, max: 199,  price: 10000 },
            { min: 200, max: 499,  price: 9500 },
            { min: 500, max: null, price: 9000 }
          ]
        }

      }

    }

  };


  let currentProduct =
    null;


  /* ============================================================
     FORMAT
     ============================================================ */

  function formatRupiah(value) {

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


  /* ============================================================
     DETECT PRODUCT
     ============================================================ */

  function detectProduct() {

    const pathname =
      window.location.pathname
        .toLowerCase();


    if (
      pathname.includes(
        "/product/bridesmaid"
      )
    ) {

      return "bridesmaid-moh";

    }


    if (
      pathname.includes(
        "/product/keepsake"
      )
    ) {

      return "keepsake";

    }


    if (
      pathname.includes(
        "/product/hangtag"
      )
    ) {

      return "hangtag";

    }


    if (
      pathname.includes(
        "/product/birthday"
      )
    ) {

      return "birthday";

    }


    if (
      pathname.includes(
        "/product/classic-invitation"
      )
    ) {

      return "classic-invitation";

    }


    if (
      pathname.includes(
        "/product/invitation"
      )
    ) {

      return "invitation";

    }


    return null;

  }


  /* ============================================================
     SELECTED VARIANT
     ============================================================ */

  function getSelectedVariant() {

    const variantCard =
      document.querySelector(
        "[data-variant].active"
      );


    if (
      variantCard &&
      variantCard.dataset.variant
    ) {

      return variantCard.dataset.variant;

    }


    const packageCard =
      document.querySelector(
        "[data-package].active"
      );


    if (
      packageCard &&
      packageCard.dataset.package
    ) {

      return packageCard.dataset.package;

    }


    const foldedCard =
      document.querySelector(
        "[data-folded-package].active"
      );


    if (
      foldedCard &&
      foldedCard.dataset.foldedPackage
    ) {

      return foldedCard.dataset.foldedPackage;

    }


    return "simple";

  }


  /* ============================================================
     QUANTITY
     ============================================================ */

  function getQuantityInput() {

    return (
      document.getElementById(
        "quantityInput"
      ) ||
      document.getElementById(
        "invitationQuantity"
      ) ||
      document.querySelector(
        'input[name="quantity"]'
      )
    );

  }


  function getQuantity() {

    const input =
      getQuantityInput();


    if (!input) {

      return 1;

    }


    let quantity =
      parseInt(
        input.value,
        10
      );


    if (
      !Number.isFinite(quantity) ||
      quantity < 1
    ) {

      quantity = 1;

    }


    return quantity;

  }


  /* ============================================================
     GET TIER
     ============================================================ */

  function getTier(
    productKey,
    variantKey,
    quantity
  ) {

    const product =
      pricing[
        productKey
      ];


    if (
      !product ||
      !product.variants[
        variantKey
      ]
    ) {

      return null;

    }


    const variant =
      product.variants[
        variantKey
      ];


    let activeTier =
      variant.tiers[0];


    variant.tiers.forEach(
      tier => {

        if (
          quantity >= tier.min &&
          (
            tier.max === null ||
            quantity <= tier.max
          )
        ) {

          activeTier =
            tier;

        }

      }
    );


    return {

      basePrice:
        variant.basePrice,

      unitPrice:
        activeTier.price,

      tierMin:
        activeTier.min,

      tierMax:
        activeTier.max

    };

  }


  /* ============================================================
     BULK BOX
     ============================================================ */

  function findVariantGrid() {

    return (
      document.querySelector(
        ".variant-grid"
      ) ||
      document.querySelector(
        ".package-grid"
      ) ||
      document.querySelector(
        ".invitation-package-grid"
      )
    );

  }


  function createBulkPriceBox() {

    if (
      document.getElementById(
        "memoraBulkPricing"
      )
    ) {

      return;

    }


    const variantGrid =
      findVariantGrid();


    if (!variantGrid) {

      return;

    }


    const box =
      document.createElement(
        "div"
      );


    box.id =
      "memoraBulkPricing";


    box.className =
      "memora-bulk-pricing";


    variantGrid.insertAdjacentElement(
      "afterend",
      box
    );

  }


  /* ============================================================
     BULK TABLE
     ============================================================ */

  function makeQtyLabel(
    tier,
    unit
  ) {

    if (
      tier.max === null
    ) {

      return (
        `${tier.min}+ ${unit}`
      );

    }


    return (
      `${tier.min}–${tier.max} ${unit}`
    );

  }


  function renderBulkTable() {

    const box =
      document.getElementById(
        "memoraBulkPricing"
      );


    if (
      !box ||
      !currentProduct
    ) {

      return;

    }


    const variantKey =
      getSelectedVariant();


    const product =
      pricing[
        currentProduct
      ];


    const variant =
      product.variants[
        variantKey
      ];


    if (!variant) {

      return;

    }


    const unit =
      product.unitLabel;


    box.innerHTML = `

      <div class="bulk-pricing-heading">

        <div>

          <span class="bulk-pricing-label">
            Harga Quantity
          </span>

          <strong>
            Makin banyak, makin hemat
          </strong>

        </div>

      </div>


      <div class="bulk-price-grid">

        ${variant.tiers.map(
          tier => `

            <div class="bulk-price-item">

              <span>
                ${makeQtyLabel(
                  tier,
                  unit
                )}
              </span>

              <strong>
                ${formatRupiah(
                  tier.price
                )}
              </strong>

              <small>
                / ${unit}
              </small>

            </div>

          `
        ).join("")}

      </div>

    `;

  }


  /* ============================================================
     SUMMARY DISCOUNT
     ============================================================ */

  function createDiscountRows() {

    const summary =
      document.querySelector(
        ".product-summary"
      );


    if (!summary) {

      return;

    }


    if (
      document.getElementById(
        "bulkNormalPriceRow"
      )
    ) {

      return;

    }


    const total =
      summary.querySelector(
        ".summary-total"
      );


    if (!total) {

      return;

    }


    const html = `

      <div
        class="summary-row bulk-summary-row"
        id="bulkNormalPriceRow"
        style="display:none;"
      >

        <span>
          Harga Normal
        </span>

        <strong
          id="bulkNormalPrice"
        >
          -
        </strong>

      </div>


      <div
        class="summary-row bulk-summary-row"
        id="bulkDiscountRow"
        style="display:none;"
      >

        <span>
          Hemat
        </span>

        <strong
          id="bulkDiscountAmount"
          class="bulk-discount-value"
        >
          -
        </strong>

      </div>

    `;


    total.insertAdjacentHTML(
      "beforebegin",
      html
    );

  }


  /* ============================================================
     UPDATE PRICE
     ============================================================ */

  function updatePricing() {

    if (!currentProduct) {

      return;

    }


    const variantKey =
      getSelectedVariant();


    const quantity =
      getQuantity();


    const tier =
      getTier(
        currentProduct,
        variantKey,
        quantity
      );


    if (!tier) {

      return;

    }


    const product =
      pricing[
        currentProduct
      ];


    const unit =
      product.unitLabel;


    const normalTotal =
      tier.basePrice *
      quantity;


    const finalTotal =
      tier.unitPrice *
      quantity;


    const discount =
      normalTotal -
      finalTotal;


    const summaryUnitPrice =
      document.getElementById(
        "summaryUnitPrice"
      );


    if (summaryUnitPrice) {

      summaryUnitPrice.textContent =
        formatRupiah(
          tier.unitPrice
        );

    }


    const summaryQuantity =
      document.getElementById(
        "summaryQuantity"
      );


    if (summaryQuantity) {

      summaryQuantity.textContent =
        `${quantity} ${unit}`;

    }


    const summaryTotal =
      document.getElementById(
        "summaryTotal"
      );


    if (summaryTotal) {

      summaryTotal.textContent =
        formatRupiah(
          finalTotal
        );

    }


    const normalPrice =
      document.getElementById(
        "bulkNormalPrice"
      );


    const discountAmount =
      document.getElementById(
        "bulkDiscountAmount"
      );


    const normalRow =
      document.getElementById(
        "bulkNormalPriceRow"
      );


    const discountRow =
      document.getElementById(
        "bulkDiscountRow"
      );


    if (normalPrice) {

      normalPrice.textContent =
        formatRupiah(
          normalTotal
        );

    }


    if (discountAmount) {

      discountAmount.textContent =
        "- " +
        formatRupiah(
          discount
        );

    }


    if (
      discount > 0
    ) {

      if (normalRow) {
        normalRow.style.display = "";
      }


      if (discountRow) {
        discountRow.style.display = "";
      }

    }
    else {

      if (normalRow) {
        normalRow.style.display = "none";
      }


      if (discountRow) {
        discountRow.style.display = "none";
      }

    }

  }


  /* ============================================================
     CART PATCH
     ============================================================ */

  function normalizeValue(value) {

    return String(
      value || ""
    )
      .toLowerCase()
      .trim();

  }


  function cartMatchesProduct(
    item,
    productKey
  ) {

    const combined =
      normalizeValue(
        [
          item?.productId,
          item?.product_id,
          item?.product,
          item?.productSlug,
          item?.product_slug,
          item?.productName,
          item?.product_name
        ]
        .filter(Boolean)
        .join(" ")
      );


    if (
      productKey ===
      "bridesmaid-moh"
    ) {

      return (
        combined.includes(
          "bridesmaid"
        )
      );

    }


    if (
      productKey ===
      "classic-invitation"
    ) {

      return (
        combined.includes(
          "classic"
        ) &&
        combined.includes(
          "invitation"
        )
      );

    }


    return combined.includes(
      normalizeValue(
        productKey
      )
    );

  }


  function patchLastCartItem() {

    if (!currentProduct) {

      return;

    }


    let cart;


    try {

      cart =
        JSON.parse(
          localStorage.getItem(
            "memora_cart"
          )
        ) || [];

    }
    catch {

      cart =
        [];

    }


    if (
      !Array.isArray(cart) ||
      !cart.length
    ) {

      return;

    }


    const variantKey =
      getSelectedVariant();


    const quantity =
      getQuantity();


    const tier =
      getTier(
        currentProduct,
        variantKey,
        quantity
      );


    if (!tier) {

      return;

    }


    let index =
      -1;


    for (
      let i =
        cart.length - 1;
      i >= 0;
      i--
    ) {

      if (
        cartMatchesProduct(
          cart[i],
          currentProduct
        )
      ) {

        index =
          i;

        break;

      }

    }


    if (
      index === -1
    ) {

      return;

    }


    const item =
      cart[
        index
      ];


    const normalSubtotal =
      tier.basePrice *
      quantity;


    const finalSubtotal =
      tier.unitPrice *
      quantity;


    item.baseUnitPrice =
      tier.basePrice;

    item.base_unit_price =
      tier.basePrice;


    item.unitPrice =
      tier.unitPrice;

    item.unit_price =
      tier.unitPrice;

    item.price =
      tier.unitPrice;


    item.quantity =
      quantity;


    item.normalSubtotal =
      normalSubtotal;


    item.discountPerUnit =
      tier.basePrice -
      tier.unitPrice;


    item.discountAmount =
      normalSubtotal -
      finalSubtotal;


    item.subtotal =
      finalSubtotal;

    item.total =
      finalSubtotal;

    item.totalPrice =
      finalSubtotal;


    item.pricingTier =
      tier.tierMin;


    item.bulkPricing =
      tier.unitPrice <
      tier.basePrice;


    cart[
      index
    ] =
      item;


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

  }


  /* ============================================================
     EVENTS
     ============================================================ */

  function bindEvents() {

    const quantityInput =
      getQuantityInput();


    if (quantityInput) {

      [
        "input",
        "change"
      ]
      .forEach(
        eventName => {

          quantityInput.addEventListener(
            eventName,
            () => {

              setTimeout(
                updatePricing,
                0
              );

            }
          );

        }
      );

    }


    [
      "decreaseQuantity",
      "increaseQuantity"
    ]
    .forEach(
      id => {

        const button =
          document.getElementById(
            id
          );


        if (button) {

          button.addEventListener(
            "click",
            () => {

              setTimeout(
                updatePricing,
                0
              );

            }
          );

        }

      }
    );


    document.addEventListener(
      "click",
      event => {

        const variant =
          event.target.closest(
            "[data-variant], [data-package], [data-folded-package]"
          );


        if (variant) {

          setTimeout(
            () => {

              renderBulkTable();

              updatePricing();

            },
            0
          );

        }

      }
    );


    const addToCart =
      document.getElementById(
        "addToCartButton"
      );


    if (addToCart) {

      addToCart.addEventListener(
        "click",
        () => {

          setTimeout(
            patchLastCartItem,
            80
          );

        }
      );

    }

  }


  /* ============================================================
     INIT
     ============================================================ */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      currentProduct =
        detectProduct();


      if (!currentProduct) {

        return;

      }


      createBulkPriceBox();

      createDiscountRows();

      renderBulkTable();

      bindEvents();


      setTimeout(
        () => {

          renderBulkTable();

          updatePricing();

        },
        100
      );

    }
  );


})();
