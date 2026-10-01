(function () {

  "use strict";


  /* =======================================================
     HELPERS
     ======================================================= */

  function $all(selector) {

    return Array.from(
      document.querySelectorAll(selector)
    );

  }


  function getSupabase() {

    return window.memoraSupabase || null;

  }


  function escapeText(value) {

    return String(
      value ?? ""
    ).trim();

  }



  /* =======================================================
     BODY
     ======================================================= */

  function enableProductSystem() {

    document.body.classList.add(
      "product-system-ready"
    );

  }



  /* =======================================================
     REMOVE DUPLICATE NAVBAR
     ======================================================= */

  function normalizeNavbarCount() {

    const navs =
      $all(".customer-nav");


    if (!navs.length) {

      return null;

    }


    let primary =
      document.querySelector(
        ".site-header .customer-nav"
      );


    if (!primary) {

      primary = navs[0];

    }


    navs.forEach(
      function (nav) {

        if (nav !== primary) {

          nav.remove();

        }

      }
    );


    return primary;

  }



  /* =======================================================
     CART
     ======================================================= */

  function readCart() {

    try {

      const cart =
        JSON.parse(
          localStorage.getItem(
            "memora_cart"
          ) || "[]"
        );


      return Array.isArray(cart)
        ? cart
        : [];

    }
    catch (error) {

      return [];

    }

  }


  function getCartCount() {

    return readCart()
      .reduce(
        function (
          total,
          item
        ) {

          const quantity =
            Number(
              item.quantity
            ) || 1;


          return total + quantity;

        },
        0
      );

  }



  /* =======================================================
     SHARED CUSTOMER NAV
     ======================================================= */

  async function renderCustomerNav() {

    const nav =
      normalizeNavbarCount();


    if (!nav) {

      return;

    }


    let loggedIn =
      false;


    const supabase =
      getSupabase();


    if (supabase) {

      try {

        const {
          data
        } =
          await supabase
            .auth
            .getUser();


        loggedIn =
          Boolean(
            data?.user
          );

      }
      catch (error) {

        console.warn(
          "Memora nav auth:",
          error
        );

      }

    }


    const count =
      getCartCount();


    nav.innerHTML = "";


    const home =
      document.createElement(
        "a"
      );

    home.href =
      "/";

    home.textContent =
      "Beranda";


    const collection =
      document.createElement(
        "a"
      );

    collection.href =
      "/#collection";

    collection.textContent =
      "Koleksi";


    const cart =
      document.createElement(
        "a"
      );

    cart.href =
      "/cart/";

    cart.className =
      "product-cart-link";


    const cartText =
      document.createElement(
        "span"
      );

    cartText.textContent =
      "Keranjang";


    cart.appendChild(
      cartText
    );


    if (count > 0) {

      const badge =
        document.createElement(
          "small"
        );

      badge.className =
        "product-cart-badge";

      badge.textContent =
        count;

      cart.appendChild(
        badge
      );

    }


    const account =
      document.createElement(
        "a"
      );


    account.href =
      loggedIn
        ? "/account/"
        : "/account/login/";


    account.textContent =
      "Saya";


    nav.appendChild(home);
    nav.appendChild(collection);
    nav.appendChild(cart);
    nav.appendChild(account);

  }



  /* =======================================================
     CLEAN NUMBERING
     ======================================================= */

  function removeSectionNumbers() {

    const candidates =
      $all(
        [
          ".product-section-number",
          ".section-number",
          "[data-product-section-number]"
        ].join(",")
      );


    candidates.forEach(
      function (element) {

        element.hidden =
          true;

      }
    );


    $all(
      "span, small, div"
    )
    .forEach(
      function (element) {

        if (
          element.children.length
        ) {

          return;

        }


        const text =
          escapeText(
            element.textContent
          );


        if (
          /^(0[1-9]|[1-9])$/
          .test(text)
        ) {

          const parentText =
            escapeText(
              element.parentElement
                ?.textContent
            );


          if (
            parentText.length <
            120
          ) {

            element.style.display =
              "none";

          }

        }

      }
    );

  }



  /* =======================================================
     SIMPLIFY COPY
     ======================================================= */

  function simplifyLabels() {

    const replacements = {
      "Detail Undangan":
        "Personalisasi",

      "Estimasi Total":
        "Total",

      "Bulk Price":
        "Harga Quantity",

      "Bulk Pricing":
        "Harga Quantity",

      "Quantity Discount":
        "Harga Quantity"
    };


    $all(
      "h2, h3, h4, label, span, p, summary"
    )
    .forEach(
      function (element) {

        if (
          element.children.length
        ) {

          return;

        }


        const text =
          escapeText(
            element.textContent
          );


        if (
          replacements[text]
        ) {

          element.textContent =
            replacements[text];

        }

      }
    );

  }



  /* =======================================================
     HIDE REDUNDANT PACKAGE DISPLAY
     ======================================================= */

  function simplifyPackageDisplay() {

    [
      "selectedPackageLabel",
      "previewPackageName",
      "packageContentName"
    ]
    .forEach(
      function (id) {

        const element =
          document.getElementById(
            id
          );


        if (element) {

          element.setAttribute(
            "aria-hidden",
            "true"
          );

        }

      }
    );

  }



  /* =======================================================
     IMAGE
     ======================================================= */

  function normalizeProductImage() {

    const image =
      document.getElementById(
        "productImage"
      );


    if (!image) {

      return;

    }


    image.loading =
      "eager";


    image.decoding =
      "async";


    const wrapper =
      document.getElementById(
        "productImageWrapper"
      );


    if (wrapper) {

      wrapper.classList.add(
        "product-system-image-wrapper"
      );

    }

  }



  /* =======================================================
     PACKAGE BUTTON ACCESSIBILITY
     ======================================================= */

  function normalizePackageButtons() {

    $all(
      [
        "[data-package]",
        ".package-option",
        ".package-card",
        ".variant-card"
      ].join(",")
    )
    .forEach(
      function (button) {

        if (
          !button.hasAttribute(
            "tabindex"
          )
        ) {

          button.tabIndex =
            0;

        }

      }
    );

  }



  /* =======================================================
     ADD CART NOTE
     ======================================================= */

  function addCartConfirmationNote() {

    const button =
      document.getElementById(
        "addToCartButton"
      ) ||
      document.getElementById(
        "addStickerToCart"
      );


    if (!button) {

      return;

    }


    if (
      document.querySelector(
        ".product-cart-confirmation-note"
      )
    ) {

      return;

    }


    const note =
      document.createElement(
        "p"
      );


    note.className =
      "product-cart-confirmation-note";


    note.textContent =
      "Detail pesanan akan dikonfirmasi kembali oleh tim Memora sebelum proses produksi.";


    Object.assign(
      note.style,
      {
        margin:
          "10px 4px 0",

        color:
          "#7b8982",

        fontSize:
          "10px",

        lineHeight:
          "1.6",

        textAlign:
          "center"
      }
    );


    button.insertAdjacentElement(
      "afterend",
      note
    );

  }



  /* =======================================================
     REMOVE PERSONAL BRAND DATA
     Only obvious owner references.
     ======================================================= */

  function removeOwnerIdentity() {

    const walker =
      document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );


    const nodes =
      [];


    while (
      walker.nextNode()
    ) {

      nodes.push(
        walker.currentNode
      );

    }


    nodes.forEach(
      function (node) {

        let value =
          node.nodeValue;


        if (!value) {

          return;

        }


        value =
          value
            .replace(
              /\bTassya\s*&\s*Arif\b/gi,
              "Memora"
            )
            .replace(
              /\bTassya\b/gi,
              ""
            )
            .replace(
              /\bArif\b/gi,
              ""
            )
            .replace(
              /21\s*[·.\-/]\s*05\s*[·.\-/]\s*2027/gi,
              ""
            );


        node.nodeValue =
          value;

      }
    );

  }



  /* =======================================================
     FOOTER
     ======================================================= */

  function normalizeFooter() {

    const footers =
      $all("footer");


    if (
      footers.length <= 1
    ) {

      return;

    }


    footers
      .slice(1)
      .forEach(
        function (footer) {

          footer.remove();

        }
      );

  }



  /* =======================================================
     INIT
     ======================================================= */


  async function loadVariantGalleryImages() {

    const db =
      window.memoraSupabase;


    if (!db) {

      console.warn(
        "Variant gallery: Supabase belum tersedia."
      );

      return;

    }


    const pathParts =
      window.location.pathname
        .split("/")
        .filter(Boolean);


    const productIndex =
      pathParts.indexOf("product");


    if (
      productIndex === -1 ||
      !pathParts[
        productIndex + 1
      ]
    ) {

      return;

    }


    const slug =
      pathParts[
        productIndex + 1
      ];


    try {

      const {
        data: product,
        error: productError
      } =
        await db
          .from("products")
          .select("id, slug")
          .eq("slug", slug)
          .single();


      if (productError) {
        throw productError;
      }


      if (!product) {
        return;
      }


      const {
        data: variants,
        error: variantError
      } =
        await db
          .from("product_variants")
          .select(`
            id,
            code,
            name,
            product_id,
            is_active
          `)
          .eq(
            "product_id",
            product.id
          )
          .eq(
            "is_active",
            true
          );


      if (variantError) {
        throw variantError;
      }


      const {
        data: images,
        error: imageError
      } =
        await db
          .from("product_gallery")
          .select(`
            id,
            product_id,
            variant_id,
            image_url,
            image_type,
            is_active,
            created_at
          `)
          .eq(
            "product_id",
            product.id
          )
          .eq(
            "image_type",
            "variant"
          )
          .eq(
            "is_active",
            true
          )
          .not(
            "variant_id",
            "is",
            null
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          );


      if (imageError) {
        throw imageError;
      }


      if (
        !Array.isArray(variants) ||
        !Array.isArray(images)
      ) {

        return;

      }


      const latestImageByVariant =
        new Map();


      images.forEach(
        function (item) {

          if (
            item.variant_id &&
            item.image_url &&
            !latestImageByVariant.has(
              item.variant_id
            )
          ) {

            latestImageByVariant.set(
              item.variant_id,
              item.image_url
            );

          }

        }
      );


      variants.forEach(
        function (variant) {

          const imageUrl =
            latestImageByVariant.get(
              variant.id
            );


          if (!imageUrl) {
            return;
          }


          const code =
            String(
              variant.code || ""
            )
              .trim()
              .toLowerCase();


          const button =
            document.querySelector(
              `.variant-card[data-variant="${code}"]`
            );


          if (!button) {
            return;
          }


          button.dataset.image =
            imageUrl;

        }
      );


      const activeButton =
        document.querySelector(
          ".variant-card.active"
        );


      const mainImage =
        document.getElementById(
          "productImage"
        );


      if (
        activeButton &&
        mainImage &&
        activeButton.dataset.image
      ) {

        mainImage.src =
          activeButton.dataset.image;

      }


    }
    catch (error) {

      console.error(
        "Variant gallery error:",
        error
      );

    }

  }

  async function initialize() {

    enableProductSystem();

    normalizeFooter();

    removeSectionNumbers();

    simplifyLabels();

    simplifyPackageDisplay();

    normalizeProductImage();

    await loadVariantGalleryImages();

    normalizePackageButtons();

    addCartConfirmationNote();

    removeOwnerIdentity();

    await renderCustomerNav();

  }


  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );


  window.addEventListener(
    "storage",
    function (
      event
    ) {

      if (
        event.key ===
        "memora_cart"
      ) {

        renderCustomerNav();

      }

    }
  );


})();

