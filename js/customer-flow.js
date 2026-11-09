(function () {

  "use strict";


  const path =
    window.location.pathname;


  /* ========================================================
     FLOW STEPS
  ======================================================== */

  const steps = [
    {
      key: "product",
      label: "Product"
    },
    {
      key: "cart",
      label: "Cart"
    },
    {
      key: "checkout",
      label: "Checkout"
    },
    {
      key: "orders",
      label: "My Orders"
    },
    {
      key: "detail",
      label: "Order Detail"
    }
  ];


  function currentStep() {

    if (
      path.startsWith(
        "/product/"
      )
    ) {
      return "product";
    }


    if (
      path.startsWith(
        "/cart"
      )
    ) {
      return "cart";
    }


    if (
      path.startsWith(
        "/checkout"
      )
    ) {
      return "checkout";
    }


    if (
      path.startsWith(
        "/account/orders/detail"
      )
    ) {
      return "detail";
    }


    if (
      path.startsWith(
        "/account/orders"
      )
    ) {
      return "orders";
    }


    return null;

  }


  function insertFlowBar() {

    const active =
      currentStep();


    if (!active) {
      return;
    }


    if (
      document.getElementById(
        "memoraCustomerFlow"
      )
    ) {
      return;
    }


    const header =
      document.getElementById(
        "memoraSiteHeader"
      );


    const bar =
      document.createElement(
        "div"
      );


    bar.id =
      "memoraCustomerFlow";


    bar.className =
      "memora-customer-flow";


    bar.innerHTML = `
      <div class="memora-customer-flow-inner">

        ${steps
          .map(
            (step, index) => {

              const activeClass =
                step.key === active
                  ? "active"
                  : "";


              return `
                <div
                  class="memora-flow-step ${activeClass}"
                >

                  <span class="memora-flow-number">
                    ${index + 1}
                  </span>

                  <span class="memora-flow-label">
                    ${step.label}
                  </span>

                </div>
              `;

            }
          )
          .join("")}

      </div>
    `;


    if (header) {

      header.insertAdjacentElement(
        "afterend",
        bar
      );

    }
    else {

      document.body.insertBefore(
        bar,
        document.body.firstChild
      );

    }

  }


  /* ========================================================
     ADD TO CART SUCCESS
  ======================================================== */

  function createCartToast() {

    if (
      document.getElementById(
        "memoraCartToast"
      )
    ) {

      return document.getElementById(
        "memoraCartToast"
      );

    }


    const toast =
      document.createElement(
        "div"
      );


    toast.id =
      "memoraCartToast";


    toast.className =
      "memora-cart-toast";


    toast.hidden =
      true;


    toast.innerHTML = `
      <div class="memora-cart-toast-content">

        <div>

          <strong>
            Produk masuk ke keranjang
          </strong>

          <span>
            Lanjutkan ke keranjang untuk checkout.
          </span>

        </div>


        <a href="/cart/">
          Lihat Keranjang
        </a>

      </div>
    `;


    document.body.appendChild(
      toast
    );


    return toast;

  }


  let toastTimer =
    null;


  function showCartToast() {

    if (
      !path.startsWith(
        "/product/"
      )
    ) {
      return;
    }


    const toast =
      createCartToast();


    toast.hidden =
      false;


    window.clearTimeout(
      toastTimer
    );


    toastTimer =
      window.setTimeout(
        () => {

          toast.hidden =
            true;

        },
        5000
      );

  }


  /* ========================================================
     CART PAGE NEXT STEP
  ======================================================== */

  function enhanceCart() {

    if (
      !path.startsWith(
        "/cart"
      )
    ) {
      return;
    }


    /*
     * Cari link checkout yang sudah ada.
     * Tidak membuat checkout kedua jika halaman
     * memang sudah mempunyai tombol.
     */

    const checkoutLink =
      document.querySelector(
        'a[href="/checkout/"]'
      );


    if (checkoutLink) {

      checkoutLink.classList.add(
        "memora-flow-primary-action"
      );

    }

  }


  /* ========================================================
     CHECKOUT SUCCESS
  ======================================================== */

  function enhanceCheckoutSuccess() {

    if (
      !path.startsWith(
        "/checkout/success"
      )
    ) {
      return;
    }


    if (
      document.getElementById(
        "memoraSuccessNextStep"
      )
    ) {
      return;
    }


    const main =
      document.querySelector(
        "main"
      );


    if (!main) {
      return;
    }


    const next =
      document.createElement(
        "section"
      );


    next.id =
      "memoraSuccessNextStep";


    next.className =
      "memora-success-next";


    next.innerHTML = `
      <span>
        Langkah Selanjutnya
      </span>

      <h2>
        Cek pesanan kamu
      </h2>

      <p>
        Pesanan yang baru dibuat dapat dilihat melalui My Orders.
      </p>

      <div class="memora-success-actions">

        <a
          href="/account/orders/"
          class="memora-success-primary"
        >
          Lihat Pesanan Saya
        </a>

        <a
          href="/"
          class="memora-success-secondary"
        >
          Kembali ke Home
        </a>

      </div>
    `;


    main.appendChild(
      next
    );

  }


  /* ========================================================
     ORDERS
  ======================================================== */

  function enhanceOrders() {

    if (
      !path.startsWith(
        "/account/orders"
      ) ||
      path.startsWith(
        "/account/orders/detail"
      )
    ) {
      return;
    }


    const heading =
      document.querySelector(
        ".account-heading"
      );


    if (!heading) {
      return;
    }


    if (
      document.getElementById(
        "ordersFlowHint"
      )
    ) {
      return;
    }


    const hint =
      document.createElement(
        "div"
      );


    hint.id =
      "ordersFlowHint";


    hint.className =
      "memora-orders-hint";


    hint.textContent =
      "Klik Detail untuk melihat produk, pembayaran, alamat, dan perkembangan pesanan.";


    heading.insertAdjacentElement(
      "afterend",
      hint
    );

  }


  /* ========================================================
     ORDER DETAIL
  ======================================================== */

  function enhanceOrderDetail() {

    if (
      !path.startsWith(
        "/account/orders/detail"
      )
    ) {
      return;
    }


    const paymentButton =
      document.getElementById(
        "confirmPaymentButton"
      );


    if (paymentButton) {

      paymentButton.classList.add(
        "memora-detail-payment-action"
      );

    }

  }


  /* ========================================================
     INIT
  ======================================================== */

  function init() {

    insertFlowBar();

    enhanceCart();

    enhanceCheckoutSuccess();

    enhanceOrders();

    enhanceOrderDetail();


    window.addEventListener(
      "memora-cart-updated",
      showCartToast
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