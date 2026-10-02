(() => {
  "use strict";


  function getElements() {

    return {

      product:
        document.getElementById(
          "uploadProduct"
        ),

      variant:
        document.getElementById(
          "uploadVariant"
        ),

      variantRadio:
        document.querySelector(
          'input[name="imageTarget"][value="variant"]'
        ),

      galleryRadio:
        document.querySelector(
          'input[name="imageTarget"][value="gallery"]'
        ),

      modal:
        document.getElementById(
          "uploadModal"
        )

    };

  }


  function getSelectedProductSlug() {

    const {
      product
    } = getElements();


    if (
      !product ||
      !product.value
    ) {
      return "";
    }


    const option =
      product.options[
        product.selectedIndex
      ];


    if (!option) {
      return "";
    }


    /*
     * Coba ambil slug dari dataset jika existing HTML
     * menyimpannya di option.
     */

    const datasetSlug =
      option.dataset.slug ||
      option.dataset.productSlug ||
      "";


    if (datasetSlug) {

      return String(
        datasetSlug
      ).toLowerCase();

    }


    /*
     * Fallback dari text.
     */

    return String(
      option.textContent || ""
    )
      .toLowerCase()
      .trim();

  }


  function isSticker() {

    const slug =
      getSelectedProductSlug();


    return (
      slug === "sticker" ||
      slug.includes("sticker")
    );

  }


  function revealVariantField() {

    const {
      variant,
      variantRadio
    } = getElements();


    if (!variant) {
      return;
    }


    /*
     * Pastikan select memang bisa digunakan.
     */

    variant.disabled = false;

    variant.removeAttribute(
      "disabled"
    );

    variant.style.removeProperty(
      "pointer-events"
    );

    variant.style.removeProperty(
      "opacity"
    );

    variant.style.removeProperty(
      "visibility"
    );

    variant.style.removeProperty(
      "display"
    );


    /*
     * Cari container variant yang disembunyikan
     * oleh gallery.js dengan class .hidden.
     */

    let current =
      variant.parentElement;


    let depth =
      0;


    while (
      current &&
      depth < 5 &&
      current !== document.body
    ) {

      if (
        current.classList.contains(
          "hidden"
        )
      ) {

        current.classList.remove(
          "hidden"
        );

      }


      /*
       * Hapus style yang mungkin menghalangi click.
       */

      if (
        current.style
      ) {

        current.style.removeProperty(
          "pointer-events"
        );

        current.style.removeProperty(
          "visibility"
        );

        current.style.removeProperty(
          "opacity"
        );

      }


      current =
        current.parentElement;

      depth++;

    }


    /*
     * Aktifkan radio variant.
     */

    if (
      variantRadio &&
      !variantRadio.checked
    ) {

      variantRadio.checked =
        true;


      variantRadio.dispatchEvent(
        new Event(
          "change",
          {
            bubbles: true
          }
        )
      );

    }


    /*
     * Setelah gallery.js selesai populate,
     * paksa dropdown aktif sekali lagi.
     */

    setTimeout(
      () => {

        variant.disabled =
          false;

        variant.removeAttribute(
          "disabled"
        );

        variant.style.pointerEvents =
          "auto";

        variant.style.opacity =
          "1";

      },
      80
    );

  }


  function handleProduct() {

    const {
      product,
      variant,
      variantRadio,
      galleryRadio
    } = getElements();


    if (
      !product ||
      !variant
    ) {
      return;
    }


    /*
     * Belum pilih produk.
     */

    if (
      !product.value
    ) {

      variant.value =
        "";

      return;

    }


    /*
     * Sticker memang tidak memakai variant.
     */

    if (
      isSticker()
    ) {

      if (galleryRadio) {

        galleryRadio.checked =
          true;


        galleryRadio.dispatchEvent(
          new Event(
            "change",
            {
              bubbles: true
            }
          )
        );

      }


      variant.value =
        "";

      return;

    }


    /*
     * Produk lain memakai variant/package.
     */

    if (variantRadio) {

      variantRadio.checked =
        true;


      variantRadio.dispatchEvent(
        new Event(
          "change",
          {
            bubbles: true
          }
        )
      );

    }


    /*
     * Existing gallery.js akan menjalankan
     * populateVariants setelah event change.
     */

    setTimeout(
      revealVariantField,
      40
    );


    setTimeout(
      revealVariantField,
      150
    );

  }


  function fixRadioClicks() {

    const {
      variantRadio,
      galleryRadio
    } = getElements();


    if (variantRadio) {

      variantRadio.disabled =
        false;

      variantRadio.removeAttribute(
        "disabled"
      );


      const label =
        variantRadio.closest(
          "label"
        );


      if (label) {

        label.style.pointerEvents =
          "auto";

        label.style.cursor =
          "pointer";

      }

    }


    if (galleryRadio) {

      galleryRadio.disabled =
        false;

      galleryRadio.removeAttribute(
        "disabled"
      );

    }

  }


  function bind() {

    const {
      product,
      variant,
      variantRadio
    } = getElements();


    if (!product) {

      setTimeout(
        bind,
        300
      );

      return;

    }


    /*
     * Jangan bind berulang.
     */

    if (
      product.dataset.memoraVariantFix ===
      "1"
    ) {

      fixRadioClicks();

      return;

    }


    product.dataset.memoraVariantFix =
      "1";


    fixRadioClicks();


    product.addEventListener(
      "change",
      () => {

        /*
         * gallery.js existing dipersilakan jalan dulu.
         */

        setTimeout(
          handleProduct,
          20
        );

      }
    );


    if (variantRadio) {

      variantRadio.addEventListener(
        "click",
        () => {

          setTimeout(
            revealVariantField,
            10
          );

        }
      );


      variantRadio.addEventListener(
        "change",
        () => {

          if (
            variantRadio.checked &&
            !isSticker()
          ) {

            setTimeout(
              revealVariantField,
              20
            );

          }

        }
      );

    }


    /*
     * Pastikan select tidak tertutup elemen lain.
     */

    if (variant) {

      variant.style.position =
        "relative";

      variant.style.zIndex =
        "2";

      variant.style.pointerEvents =
        "auto";

    }


    /*
     * Kalau modal sudah terbuka dan produk sudah dipilih.
     */

    if (
      product.value
    ) {

      setTimeout(
        handleProduct,
        100
      );

    }

  }


  /*
   * Upload modal bisa dibuka-tutup berkali-kali.
   */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "button"
        );


      if (!button) {
        return;
      }


      const text =
        String(
          button.textContent || ""
        )
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();


      if (
        text.includes("upload") ||
        text.includes("tambah foto") ||
        text.includes("tambah desain")
      ) {

        setTimeout(
          () => {

            fixRadioClicks();

            const {
              product
            } = getElements();


            if (
              product?.value
            ) {

              handleProduct();

            }

          },
          200
        );

      }

    }
  );


  /*
   * Mutation observer:
   * kalau gallery.js mengubah field variant,
   * kita cek kembali supaya tetap clickable.
   */

  const observer =
    new MutationObserver(
      () => {

        const {
          product,
          variant
        } = getElements();


        if (
          product?.value &&
          variant &&
          !isSticker()
        ) {

          variant.disabled =
            false;

          variant.removeAttribute(
            "disabled"
          );

        }

      }
    );


  document.addEventListener(
    "DOMContentLoaded",
    () => {

      setTimeout(
        bind,
        250
      );


      observer.observe(
        document.body,
        {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: [
            "class",
            "disabled",
            "style"
          ]
        }
      );

    }
  );

})();
