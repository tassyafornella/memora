(function () {

  "use strict";


  function getBackTarget() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const from =
      params.get(
        "from"
      );


    if (
      from &&
      from.startsWith("/") &&
      !from.startsWith("//")
    ) {

      return from;

    }


    const path =
      window.location.pathname;


    if (
      path.startsWith(
        "/account/orders/detail"
      )
    ) {

      return "/account/orders/";

    }


    if (
      path.startsWith(
        "/account/orders"
      )
    ) {

      return "/account/";

    }


    if (
      path.startsWith(
        "/account/addresses"
      )
    ) {

      return "/account/";

    }


    if (
      path.startsWith(
        "/payment"
      )
    ) {

      const order =
        params.get(
          "order"
        );


      if (order) {

        return (
          "/account/orders/detail/?id=" +
          encodeURIComponent(
            order
          )
        );

      }


      return "/account/orders/";

    }


    if (
      path.startsWith(
        "/checkout"
      )
    ) {

      return "/cart/";

    }


    if (
      path.startsWith(
        "/cart"
      )
    ) {

      return "/#collection";

    }


    return "/";

  }


  function setupBackButtons() {

    document
      .querySelectorAll(
        "[data-memora-back]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            event => {

              event.preventDefault();


              const target =
                button.dataset
                  .memoraBack ||
                getBackTarget();


              window.location.href =
                target;

            }
          );

        }
      );

  }


  function setupContextLinks() {

    /*
     * Address dari checkout
     * harus kembali ke checkout.
     */

    document
      .querySelectorAll(
        'a[href="/account/addresses/"]'
      )
      .forEach(
        link => {

          if (
            window.location.pathname
              .startsWith(
                "/checkout"
              )
          ) {

            link.href =
              "/account/addresses/?from=" +
              encodeURIComponent(
                "/checkout/"
              );

          }

        }
      );


    /*
     * Payment dari Order Detail
     * harus kembali ke detail order.
     */

    const paymentButton =
      document.getElementById(
        "confirmPaymentButton"
      );


    if (paymentButton) {

      const current =
        window.location.pathname +
        window.location.search;


      const url =
        new URL(
          paymentButton.href,
          window.location.origin
        );


      url.searchParams.set(
        "from",
        current
      );


      paymentButton.href =
        url.pathname +
        url.search;

    }

  }


  function init() {

    setupBackButtons();

    setupContextLinks();

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