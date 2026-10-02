(() => {

  "use strict";


  /* ============================================================
     MEMORA QUANTITY TYPING FIX

     Tujuan:
     - user bebas mengetik 70, 80, 100, 200, 300, dst.
     - jangan paksa minimum ketika masih mengetik
     - minimum dicek setelah blur
     - refresh tetap kembali ke minimum dari minimum-quantity.js
     ============================================================ */


  const PRODUCT_RULES = [

    {
      paths: [
        "/product/classic-invitation",
        "/product/invitation"
      ],
      minimum: 50
    },

    {
      paths: [
        "/product/bridesmaid"
      ],
      minimum: 5
    },

    {
      paths: [
        "/product/keepsake"
      ],
      minimum: 1
    },

    {
      paths: [
        "/product/hangtag"
      ],
      minimum: 30
    },

    {
      paths: [
        "/product/birthday"
      ],
      minimum: 5
    },

    {
      paths: [
        "/product/sticker"
      ],
      minimum: 5
    }

  ];


  let allowProgrammaticEvent =
    false;


  function getMinimum() {

    const pathname =
      window.location.pathname
        .toLowerCase();


    const rule =
      PRODUCT_RULES.find(
        item =>
          item.paths.some(
            path =>
              pathname.includes(
                path
              )
          )
      );


    return rule
      ? rule.minimum
      : 1;

  }


  function findQuantityInput() {

    return (

      document.getElementById(
        "quantityInput"
      ) ||

      document.getElementById(
        "invitationQuantity"
      ) ||

      document.getElementById(
        "hangtagQuantity"
      ) ||

      document.getElementById(
        "birthdayQuantity"
      ) ||

      document.getElementById(
        "keepsakeQuantity"
      ) ||

      document.getElementById(
        "bridesmaidQuantity"
      ) ||

      document.getElementById(
        "stickerQuantity"
      ) ||

      document.querySelector(
        'input[name="quantity"]'
      ) ||

      document.querySelector(
        '.quantity-control input'
      ) ||

      document.querySelector(
        '.quantity-selector input'
      ) ||

      document.querySelector(
        '.quantity-input input'
      )

    );

  }


  function dispatchRealUpdate(
    input
  ) {

    allowProgrammaticEvent =
      true;


    input.dispatchEvent(
      new Event(
        "input",
        {
          bubbles: true
        }
      )
    );


    input.dispatchEvent(
      new Event(
        "change",
        {
          bubbles: true
        }
      )
    );


    allowProgrammaticEvent =
      false;

  }


  function validateQuantity(
    input
  ) {

    const minimum =
      getMinimum();


    const raw =
      String(
        input.value ?? ""
      )
      .replace(
        /[^0-9]/g,
        ""
      );


    let quantity =
      parseInt(
        raw,
        10
      );


    if (
      !Number.isFinite(
        quantity
      ) ||
      quantity < minimum
    ) {

      quantity =
        minimum;

    }


    input.value =
      String(
        quantity
      );


    dispatchRealUpdate(
      input
    );

  }


  function install() {

    const input =
      findQuantityInput();


    if (!input) {

      return;

    }


    const minimum =
      getMinimum();


    /*
      HTML constraint tetap benar,
      tetapi tidak digunakan untuk memaksa user
      pada setiap karakter.
    */

    input.min =
      String(
        minimum
      );


    input.step =
      "1";


    /*
      Mempermudah user:
      klik quantity → angka lama terseleksi.
      Jadi 50 bisa langsung ditimpa 80.
    */

    input.addEventListener(
      "focus",
      () => {

        setTimeout(
          () => {

            try {

              input.select();

            }
            catch {}

          },
          0
        );

      }
    );


    /*
      Pointer/mouse click:
      select seluruh angka agar tidak menjadi
      5080 / 150 / angka gabungan lainnya.
    */

    input.addEventListener(
      "click",
      () => {

        setTimeout(
          () => {

            try {

              input.select();

            }
            catch {}

          },
          0
        );

      }
    );


    /*
      INI BAGIAN PENTING.

      Capture phase digunakan supaya script lama
      tidak sempat memaksa:
      kosong → 1
      8 → minimum
      dst.

      Selama user sedang mengetik,
      nilai input dibiarkan apa adanya.
    */

    input.addEventListener(
      "input",
      event => {

        if (
          allowProgrammaticEvent
        ) {

          return;

        }


        let value =
          String(
            input.value ?? ""
          );


        value =
          value.replace(
            /[^0-9]/g,
            ""
          );


        /*
          Hilangkan leading zero.
          Tetapi kosong tetap boleh selama mengetik.
        */

        if (
          value.length > 1
        ) {

          value =
            value.replace(
              /^0+/,
              ""
            );

        }


        input.value =
          value;


        /*
          Stop listener input lama yang biasanya
          memaksa kosong menjadi angka 1/minimum.
        */

        event.stopImmediatePropagation();

      },
      true
    );


    /*
      Setelah selesai mengetik baru validasi.
    */

    input.addEventListener(
      "blur",
      () => {

        validateQuantity(
          input
        );

      },
      true
    );


    /*
      Enter = selesai mengetik.
    */

    input.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          input.blur();

        }

      }
    );


    /*
      Pastikan initial value tidak di bawah minimum.
      Tidak mengganggu reset minimum saat refresh.
    */

    const initialValue =
      parseInt(
        input.value,
        10
      );


    if (
      !Number.isFinite(
        initialValue
      ) ||
      initialValue < minimum
    ) {

      input.value =
        String(
          minimum
        );

    }


    input.dataset.memoraTypingFixed =
      "true";

  }


  document.addEventListener(
    "DOMContentLoaded",
    () => {

      /*
        Dijalankan agak belakangan supaya
        product script + minimum script sudah selesai.
      */

      setTimeout(
        install,
        250
      );

    }
  );

})();
