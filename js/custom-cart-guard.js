/* ============================================================
   MEMORA CUSTOM CART GUARD

   Keeps private custom quantity locked even if normal cart UI
   tries to modify it.
   ============================================================ */

(function () {

  "use strict";


  const KEY =
    "memora_cart";


  const nativeSetItem =
    localStorage.setItem.bind(
      localStorage
    );


  function protect(value) {

    let cart;


    try {

      cart =
        JSON.parse(
          value
        );

    }
    catch (_) {

      return value;

    }


    if (
      !Array.isArray(cart)
    ) {

      return value;

    }


    cart.forEach(
      item => {

        if (
          item?.is_custom_order !==
            true ||
          item?.minimum_override !==
            true
        ) {

          return;

        }


        const locked =
          Number(
            item.custom_locked_quantity ||
            item.quantity ||
            1
          );


        item.quantity =
          Math.max(
            locked,
            1
          );

      }
    );


    return JSON.stringify(
      cart
    );

  }



  localStorage.setItem =
    function (
      key,
      value
    ) {

      if (
        key === KEY
      ) {

        return nativeSetItem(
          key,
          protect(value)
        );

      }


      return nativeSetItem(
        key,
        value
      );

    };



  function protectCurrent() {

    const value =
      localStorage.getItem(
        KEY
      );


    if (!value) {
      return;
    }


    nativeSetItem(
      KEY,
      protect(value)
    );

  }



  protectCurrent();


  document.addEventListener(
    "click",
    () => {

      setTimeout(
        protectCurrent,
        20
      );

    },
    true
  );


  document.addEventListener(
    "change",
    () => {

      setTimeout(
        protectCurrent,
        20
      );

    },
    true
  );

})();
