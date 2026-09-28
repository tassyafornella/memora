(function () {

  "use strict";


  /* =========================================================
     MEMORA BULK PRICING
     ========================================================= */


  const pricing = {


    /* ---------------------------------------------------------
       CLASSIC FOLDED INVITATION
       --------------------------------------------------------- */

    "classic-invitation": {

      unitLabel: "pcs",

      variants: {

        simple: {

          basePrice: 1500,

          tiers: [
            {
              min: 200,
              price: 1200
            },
            {
              min: 100,
              price: 1300
            },
            {
              min: 50,
              price: 1400
            },
            {
              min: 1,
              price: 1500
            }
          ]

        },


        signature: {

          basePrice: 2000,

          tiers: [
            {
              min: 200,
              price: 1700
            },
            {
              min: 100,
              price: 1800
            },
            {
              min: 50,
              price: 1900
            },
            {
              min: 1,
              price: 2000
            }
          ]

        },


        complete: {

          basePrice: 2500,

          tiers: [
            {
              min: 200,
              price: 2200
            },
            {
              min: 100,
              price: 2300
            },
            {
              min: 50,
              price: 2400
            },
            {
              min: 1,
              price: 2500
            }
          ]

        }

      }

    },


    /* ---------------------------------------------------------
       WEDDING INVITATION SET
       --------------------------------------------------------- */

    invitation: {

      unitLabel: "set",

      variants: {

        simple: {

          basePrice: 7500,

          tiers: [
            {
              min: 200,
              price: 6000
            },
            {
              min: 100,
              price: 6500
            },
            {
              min: 50,
              price: 7000
            },
            {
              min: 1,
              price: 7500
            }
          ]

        },


        signature: {

          basePrice: 12000,

          tiers: [
            {
              min: 200,
              price: 10500
            },
            {
              min: 100,
              price: 11000
            },
            {
              min: 50,
              price: 11500
            },
            {
              min: 1,
              price: 12000
            }
          ]

        },


        complete: {

          basePrice: 17500,

          tiers: [
            {
              min: 200,
              price: 16000
            },
            {
              min: 100,
              price: 16500
            },
            {
              min: 50,
              price: 17000
            },
            {
              min: 1,
              price: 17500
            }
          ]

        }

      }

    }

  };


  let currentProduct = null;


  function formatRupiah(value) {

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


  function detectProduct() {

    const bodyProduct =
      document.body?.dataset?.product;


    if (
      bodyProduct &&
      pricing[bodyProduct]
    ) {

      return bodyProduct;

    }


    const pathname =
      window.location.pathname.toLowerCase();


    if (
      pathname.includes(
        "/classic-invitation"
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


  function getSelectedVariant() {

    const active =
      document.querySelector(
        "[data-variant].active"
      );


    if (
      active &&
      active.dataset.variant
    ) {

      return active.dataset.variant;

    }


    return "simple";

  }


  function getQuantity() {

    const input =
      document.getElementById(
        "quantityInput"
      );


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


  function getTier(
    productKey,
    variantKey,
    quantity
  ) {

    const product =
      pricing[productKey];


    if (
      !product ||
      !product.variants[variantKey]
    ) {

      return null;

    }


    const variant =
      product.variants[
        variantKey
      ];


    const tier =
      variant.tiers.find(
        item =>
          quantity >= item.min
      );


    return {

      basePrice:
        variant.basePrice,

      unitPrice:
        tier
          ? tier.price
          : variant.basePrice,

      tierMin:
        tier
          ? tier.min
          : 1

    };

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
      document.querySelector(
        ".variant-grid"
      );


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
      pricing[currentProduct];


    const variant =
      product.variants[
        variantKey
      ];


    if (!variant) {

      return;

    }


    const unit =
      product.unitLabel;


    const tiers =
      [...variant.tiers]
        .sort(
          (a, b) =>
            a.min - b.min
        );


    box.innerHTML = `

      <div class="bulk-pricing-heading">

        <div>

          <span class="bulk-pricing-label">
            Bulk Price
          </span>

          <strong>
            Makin banyak, makin hemat
          </strong>

        </div>

      </div>


      <div class="bulk-price-grid">

        ${tiers.map(
          tier => {

            let qtyLabel;

            if (
              tier.min === 1
            ) {

              qtyLabel =
                `1–49 ${unit}`;

            }
            else if (
              tier.min === 50
            ) {

              qtyLabel =
                `50–99 ${unit}`;

            }
            else if (
              tier.min === 100
            ) {

              qtyLabel =
                `100–199 ${unit}`;

            }
            else {

              qtyLabel =
                `${tier.min}+ ${unit}`;

            }


            return `

              <div class="bulk-price-item">

                <span>
                  ${qtyLabel}
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

            `;

          }
        ).join("")}

      </div>

    `;

  }


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
      >

        <span>
          Diskon Quantity
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
      pricing[currentProduct];


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


    if (normalPrice) {

      normalPrice.textContent =
        formatRupiah(
          normalTotal
        );

    }


    const discountAmount =
      document.getElementById(
        "bulkDiscountAmount"
      );


    if (discountAmount) {

      if (
        discount > 0
      ) {

        discountAmount.textContent =
          "- " +
          formatRupiah(
            discount
          );


        discountAmount.classList.add(
          "has-discount"
        );

      }
      else {

        discountAmount.textContent =
          formatRupiah(0);


        discountAmount.classList.remove(
          "has-discount"
        );

      }

    }


    const normalRow =
      document.getElementById(
        "bulkNormalPriceRow"
      );


    const discountRow =
      document.getElementById(
        "bulkDiscountRow"
      );


    if (
      discount <= 0
    ) {

      if (normalRow) {

        normalRow.style.display =
          "none";

      }


      if (discountRow) {

        discountRow.style.display =
          "none";

      }

    }
    else {

      if (normalRow) {

        normalRow.style.display =
          "";

      }


      if (discountRow) {

        discountRow.style.display =
          "";

      }

    }

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

      cart = [];

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


    let index = -1;


    for (
      let i = cart.length - 1;
      i >= 0;
      i--
    ) {

      const item =
        cart[i];


      if (
        item.productId === currentProduct
      ) {

        index = i;

        break;

      }

    }


    if (
      index === -1
    ) {

      return;

    }


    const item =
      cart[index];


    const normalSubtotal =
      tier.basePrice *
      quantity;


    const finalSubtotal =
      tier.unitPrice *
      quantity;


    item.baseUnitPrice =
      tier.basePrice;


    item.unitPrice =
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


    item.pricingTier =
      tier.tierMin;


    item.bulkPricing =
      tier.unitPrice <
      tier.basePrice;


    cart[index] =
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


  function bindEvents() {

    const quantityInput =
      document.getElementById(
        "quantityInput"
      );


    if (quantityInput) {

      quantityInput.addEventListener(
        "input",
        () => {

          setTimeout(
            updatePricing,
            0
          );

        }
      );


      quantityInput.addEventListener(
        "change",
        () => {

          setTimeout(
            updatePricing,
            0
          );

        }
      );

    }


    const decrease =
      document.getElementById(
        "decreaseQuantity"
      );


    if (decrease) {

      decrease.addEventListener(
        "click",
        () => {

          setTimeout(
            updatePricing,
            0
          );

        }
      );

    }


    const increase =
      document.getElementById(
        "increaseQuantity"
      );


    if (increase) {

      increase.addEventListener(
        "click",
        () => {

          setTimeout(
            updatePricing,
            0
          );

        }
      );

    }


    document
      .querySelectorAll(
        "[data-variant]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              setTimeout(
                () => {

                  renderBulkTable();

                  updatePricing();

                },
                0
              );

            }
          );

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

          /*
           * product.js / classic-invitation.js
           * menyimpan Cart terlebih dahulu.
           * Setelah itu kita koreksi menggunakan bulk price.
           */

          setTimeout(
            patchLastCartItem,
            50
          );

        }
      );

    }

  }


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
        updatePricing,
        50
      );

    }
  );


})();
