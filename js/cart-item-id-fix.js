(() => {

  "use strict";


  const CART_KEY =
    "memora_cart";


  function createId() {

    if (
      window.crypto &&
      typeof window.crypto.randomUUID ===
      "function"
    ) {

      return (
        "memora-" +
        window.crypto.randomUUID()
      );

    }


    return (
      "memora-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(16)
        .slice(2)
    );

  }


  function normalizeCart() {

    let cart =
      [];


    try {

      cart =
        JSON.parse(
          localStorage.getItem(
            CART_KEY
          ) ||
          "[]"
        );

    }
    catch {

      cart =
        [];

    }


    if (
      !Array.isArray(
        cart
      )
    ) {

      cart =
        [];

    }


    let changed =
      false;


    const usedIds =
      new Set();


    cart =
      cart.map(
        item => {

          if (
            !item ||
            typeof item !==
            "object"
          ) {

            return item;

          }


          let id =
            String(
              item.cartItemId ||
              ""
            )
            .trim();


          /*
            Kalau belum punya cartItemId,
            atau ID duplicate,
            buat ID baru.
          */

          if (
            !id ||
            usedIds.has(
              id
            )
          ) {

            id =
              createId();


            item.cartItemId =
              id;


            changed =
              true;

          }


          usedIds.add(
            id
          );


          return item;

        }
      );


    if (
      changed
    ) {

      localStorage.setItem(
        CART_KEY,
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


    return cart;

  }


  /*
    Jalankan langsung SEBELUM cart.js.
  */

  normalizeCart();


  /*
    Kalau custom order menambahkan item setelah page load,
    tetap normalisasi lagi.
  */

  window.addEventListener(
    "memora-cart-updated",
    () => {

      setTimeout(
        normalizeCart,
        0
      );

    }
  );


  /*
    Export kecil kalau nanti dibutuhkan script lain.
  */

  window.memoraNormalizeCartIds =
    normalizeCart;


})();
