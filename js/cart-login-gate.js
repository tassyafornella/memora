(function () {

  "use strict";


  function getSupabase() {

    return window.memoraSupabase || null;

  }


  function getCheckoutLink() {

    return (
      document.querySelector(
        'a[href="/order/"]'
      ) ||
      document.querySelector(
        'a[href$="/order/"]'
      )
    );

  }


  function getModal() {

    return document.getElementById(
      "checkoutLoginModal"
    );

  }


  function openModal() {

    const modal =
      getModal();

    if (!modal) {
      return;
    }

    modal.hidden =
      false;

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "checkout-login-open"
    );

  }


  function closeModal() {

    const modal =
      getModal();

    if (!modal) {
      return;
    }

    modal.hidden =
      true;

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "checkout-login-open"
    );

  }


  async function isLoggedIn() {

    const supabase =
      getSupabase();

    if (!supabase) {
      return false;
    }

    try {

      const {
        data,
        error
      } =
        await supabase
          .auth
          .getSession();

      if (error) {
        return false;
      }

      return Boolean(
        data?.session
      );

    }
    catch (error) {

      console.error(
        "Checkout gate auth:",
        error
      );

      return false;

    }

  }


  async function handleCheckout(event) {

    event.preventDefault();

    const loggedIn =
      await isLoggedIn();

    if (loggedIn) {

      window.location.href =
        "/order/";

      return;
    }

    localStorage.setItem(
      "memora_after_auth",
      "/order/"
    );

    openModal();

  }


  function bindModalClose() {

    document
      .querySelectorAll(
        "[data-close-checkout-login]"
      )
      .forEach(
        function (element) {

          element.addEventListener(
            "click",
            closeModal
          );

        }
      );


    document.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Escape") {

          closeModal();

        }

      }
    );

  }


  function bindCheckout() {

    const checkoutLink =
      getCheckoutLink();

    if (!checkoutLink) {

      console.warn(
        "Tombol Lanjut Checkout tidak ditemukan."
      );

      return;
    }

    checkoutLink.addEventListener(
      "click",
      handleCheckout
    );

  }


  function initialize() {

    bindCheckout();
    bindModalClose();

  }


  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );


})();
