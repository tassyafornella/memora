(() => {

  "use strict";


  const STORAGE_KEY =
    "memora_catalog_selection";


  let selection =
    null;


  let imageObserver =
    null;


  /* ==========================================================
     READ
     ========================================================== */

  function normalizePath(
    value
  ) {

    return String(
      value || ""
    )
    .replace(
      /index\.html$/i,
      ""
    )
    .replace(
      /\/+$/,
      "/"
    );

  }


  function readSelection() {

    let raw =
      null;


    try {

      raw =
        sessionStorage.getItem(
          STORAGE_KEY
        );

    }
    catch {

      return null;

    }


    if (!raw) {

      return null;

    }


    try {

      const data =
        JSON.parse(
          raw
        );


      if (
        !data ||
        !data.locked ||
        !data.variant ||
        !data.designImage ||
        !data.productPath
      ) {

        return null;

      }


      const age =
        Date.now() -
        Number(
          data.createdAt ||
          0
        );


      if (
        age >
        6 * 60 * 60 * 1000
      ) {

        sessionStorage.removeItem(
          STORAGE_KEY
        );


        return null;

      }


      if (
        normalizePath(
          window.location.pathname
        ) !==
        normalizePath(
          data.productPath
        )
      ) {

        return null;

      }


      return data;

    }
    catch {

      return null;

    }

  }


  /* ==========================================================
     BUTTON HELPERS
     ========================================================== */

  function getVariantButtons() {

    return Array.from(
      document.querySelectorAll(
        [
          ".variant-card[data-variant]",
          "[data-package]",
          "[data-folded-package]"
        ].join(",")
      )
    );

  }


  function getButtonVariant(
    button
  ) {

    return String(
      button.dataset.variant ||
      button.dataset.package ||
      button.dataset.foldedPackage ||
      ""
    )
    .trim()
    .toLowerCase();

  }


  function getSelectedVariantButton() {

    return getVariantButtons()
      .find(
        button =>
          getButtonVariant(
            button
          ) ===
          selection.variant
      );

  }


  /* ==========================================================
     SELECT PACKAGE FIRST
     ========================================================== */

  function selectPackage() {

    const button =
      getSelectedVariantButton();


    if (!button) {

      return;

    }


    /*
      Biarkan script produk existing menjalankan
      update price, isi paket, summary dan bulk pricing.
    */

    if (
      !button.classList.contains(
        "active"
      )
    ) {

      button.click();

    }

  }


  /* ==========================================================
     LOCK
     ========================================================== */

  function lockPackages() {

    getVariantButtons()
      .forEach(
        button => {

          const variant =
            getButtonVariant(
              button
            );


          if (
            variant ===
            selection.variant
          ) {

            button.classList.remove(
              "memora-package-locked"
            );


            button.classList.add(
              "memora-package-selected"
            );


            button.removeAttribute(
              "disabled"
            );


            button.setAttribute(
              "aria-disabled",
              "false"
            );

          }
          else {

            button.classList.add(
              "memora-package-locked"
            );


            button.classList.remove(
              "memora-package-selected"
            );


            button.setAttribute(
              "aria-disabled",
              "true"
            );


            if (
              button.tagName ===
              "BUTTON"
            ) {

              button.disabled =
                true;

            }

          }

        }
      );

  }


  /* ==========================================================
     SAME CATALOG IMAGE AS MAIN IMAGE
     ========================================================== */

  function setCatalogImage() {

    const image =
      document.getElementById(
        "productImage"
      );


    if (!image) {

      return;

    }


    const target =
      selection.designImage;


    if (
      image.getAttribute(
        "src"
      ) !==
      target
    ) {

      image.src =
        target;

    }


    image.alt =
      `${selection.designTitle} - Memora`;


    /*
      Product-system dapat mengganti foto setelah
      membaca gallery variant dari Supabase.

      Karena produk dikunci ke desain katalog,
      foto utama tetap desain yang dipilih customer.
    */

    if (
      !imageObserver
    ) {

      imageObserver =
        new MutationObserver(
          () => {

            if (
              image.getAttribute(
                "src"
              ) !==
              target
            ) {

              image.src =
                target;

            }

          }
        );


      imageObserver.observe(
        image,
        {
          attributes:
            true,

          attributeFilter:
            [
              "src"
            ]
        }
      );

    }

  }


  /* ==========================================================
     REFERENCE INFO
     ========================================================== */

  function findProductInfo() {

    return (
      document.querySelector(
        ".product-heading"
      ) ||
      document.querySelector(
        ".product-info"
      ) ||
      document.querySelector(
        ".product-configurator"
      )
    );

  }


  function createSelectionCard() {

    if (
      document.getElementById(
        "memoraCatalogSelection"
      )
    ) {

      return;

    }


    const target =
      findProductInfo();


    if (!target) {

      return;

    }


    const box =
      document.createElement(
        "div"
      );


    box.id =
      "memoraCatalogSelection";


    box.className =
      "memora-catalog-selection";


    box.innerHTML = `

      <div class="memora-catalog-selection-head">

        <span class="memora-catalog-selection-label">
          Desain yang dipilih
        </span>


        <button
          type="button"
          class="memora-change-catalog-design"
          id="memoraChangeCatalogDesign"
        >
          Ganti desain
        </button>

      </div>


      <div class="memora-catalog-selection-body">

        <img
          src="${selection.designImage}"
          alt="${selection.designTitle}"
          class="memora-catalog-selection-thumb"
        >


        <div class="memora-catalog-selection-copy">

          <strong>
            ${selection.designTitle}
          </strong>


          <span>
            ${selection.variantLabel} Package
          </span>

        </div>

      </div>


      <p class="memora-catalog-selection-note">
        Foto di atas adalah desain yang kamu pilih dari katalog.
        Paket sudah dikunci, tetapi jumlah dan data personalisasi
        masih dapat diubah.
      </p>

    `;


    target.insertAdjacentElement(
      "afterend",
      box
    );


    document.getElementById(
      "memoraChangeCatalogDesign"
    )
    ?.addEventListener(
      "click",
      () => {

        const url =
          new URL(
            "/collection/",
            window.location.origin
          );


        url.searchParams.set(
          "category",
          selection.category
        );


        if (
          selection.productKey
        ) {

          url.searchParams.set(
            "product",
            selection.productKey
          );

        }


        url.searchParams.set(
          "variant",
          selection.variant
        );


        window.location.href =
          url.pathname +
          url.search;

      }
    );

  }


  /* ==========================================================
     LOCK NOTE
     ========================================================== */

  function createLockNote() {

    if (
      document.getElementById(
        "memoraPackageLockNote"
      )
    ) {

      return;

    }


    const selected =
      getSelectedVariantButton();


    if (!selected) {

      return;

    }


    const parent =
      selected.parentElement;


    if (!parent) {

      return;

    }


    const note =
      document.createElement(
        "p"
      );


    note.id =
      "memoraPackageLockNote";


    note.className =
      "memora-package-lock-note";


    note.textContent =
      `${selection.variantLabel} dipilih dari katalog. ` +
      `Untuk mengganti paket, pilih desain lain melalui menu Ganti desain.`;


    parent.insertAdjacentElement(
      "afterend",
      note
    );

  }


  /* ==========================================================
     PROTECT LOCKED PACKAGE
     ========================================================== */

  function protectPackages() {

    document.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            [
              ".variant-card[data-variant]",
              "[data-package]",
              "[data-folded-package]"
            ].join(",")
          );


        if (!button) {

          return;

        }


        if (
          getButtonVariant(
            button
          ) !==
          selection.variant
        ) {

          event.preventDefault();

          event.stopImmediatePropagation();

        }

      },
      true
    );

  }


  /* ==========================================================
     CART REFERENCE
     ========================================================== */

  function patchCart() {

    let cart =
      [];


    try {

      cart =
        JSON.parse(
          localStorage.getItem(
            "memora_cart"
          )
        ) || [];

    }
    catch {

      return;

    }


    if (
      !Array.isArray(
        cart
      ) ||
      !cart.length
    ) {

      return;

    }


    const index =
      cart.length - 1;


    const item =
      cart[
        index
      ];


    if (!item) {

      return;

    }


    const reference = {

      source:
        "memora_catalog",

      category:
        selection.category,

      product_key:
        selection.productKey,

      product_slug:
        selection.productSlug,

      variant:
        selection.variant,

      variant_label:
        selection.variantLabel,

      design_id:
        selection.designId,

      design_title:
        selection.designTitle,

      design_image:
        selection.designImage,

      locked_variant:
        true

    };


    item.catalog_reference =
      reference;


    item.catalogReference =
      reference;


    item.reference_image =
      selection.designImage;


    item.referenceImage =
      selection.designImage;


    item.reference_title =
      selection.designTitle;


    item.referenceTitle =
      selection.designTitle;


    item.locked_variant =
      selection.variant;


    item.lockedVariant =
      selection.variant;


    if (
      !item.personalization ||
      typeof item.personalization !==
      "object" ||
      Array.isArray(
        item.personalization
      )
    ) {

      item.personalization =
        {};

    }


    item.personalization.catalog_reference =
      reference;


    cart[
      index
    ] =
      item;


    try {

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
    catch {}

  }


  function bindCart() {

    const button =
      document.getElementById(
        "addToCartButton"
      );


    if (!button) {

      return;

    }


    button.addEventListener(
      "click",
      () => {

        /*
          Product script existing menyimpan item dahulu.
          Setelah itu reference katalog ditambahkan.
        */

        setTimeout(
          patchCart,
          300
        );

      }
    );

  }


  /* ==========================================================
     INIT
     ========================================================== */

  function init() {

    selection =
      readSelection();


    /*
      Direct product page:
      semua paket tetap normal.
    */

    if (!selection) {

      return;

    }


    createSelectionCard();

    protectPackages();

    bindCart();


    /*
      Tunggu product.js / product-system.js selesai bind.
    */

    setTimeout(
      () => {

        selectPackage();

      },
      250
    );


    setTimeout(
      () => {

        selectPackage();

        lockPackages();

        setCatalogImage();

        createLockNote();

      },
      650
    );


    /*
      product-system melakukan async gallery Supabase.
      pastikan hasil akhirnya tetap desain katalog customer.
    */

    setTimeout(
      () => {

        lockPackages();

        setCatalogImage();

      },
      1500
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
