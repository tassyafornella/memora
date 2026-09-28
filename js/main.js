/* =========================================================
   MEMORA
   MAIN JAVASCRIPT
   ========================================================= */


document.addEventListener(
  "DOMContentLoaded",
  () => {

    initMobileNavigation();

    updateCartCount();

    initSmoothLinks();

    listenCartChanges();

  }
);



/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initMobileNavigation() {

  const button =
    document.getElementById(
      "mobileMenuButton"
    );


  const navigation =
    document.getElementById(
      "mobileNav"
    );


  if (!button || !navigation) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      const opened =
        navigation.classList.toggle(
          "open"
        );


      document.body.classList.toggle(
        "menu-open",
        opened
      );


      button.setAttribute(
        "aria-expanded",
        String(opened)
      );


      button.textContent =
        opened
          ? "✕"
          : "☰";

    }
  );


  navigation
    .querySelectorAll("a")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          closeMobileNavigation(
            button,
            navigation
          );

        }
      );

    });


  window.addEventListener(
    "resize",
    () => {

      if (
        window.innerWidth > 800 &&
        navigation.classList.contains(
          "open"
        )
      ) {

        closeMobileNavigation(
          button,
          navigation
        );

      }

    }
  );

}



/* =========================================================
   CLOSE MOBILE NAVIGATION
   ========================================================= */

function closeMobileNavigation(
  button,
  navigation
) {

  navigation.classList.remove(
    "open"
  );


  document.body.classList.remove(
    "menu-open"
  );


  button.setAttribute(
    "aria-expanded",
    "false"
  );


  button.textContent =
    "☰";

}



/* =========================================================
   CART
   ========================================================= */

function getCart() {

  try {

    const storedCart =
      localStorage.getItem(
        "memora_cart"
      );


    if (!storedCart) {
      return [];
    }


    const cart =
      JSON.parse(
        storedCart
      );


    return Array.isArray(cart)
      ? cart
      : [];

  }

  catch (error) {

    console.error(
      "Gagal membaca Memora cart:",
      error
    );


    return [];

  }

}



/* =========================================================
   CART COUNT
   ========================================================= */

function updateCartCount() {

  const cart =
    getCart();


  const totalQuantity =
    cart.reduce(
      (total, item) => {

        const quantity =
          Number(
            item.quantity
          ) || 1;


        return total + quantity;

      },
      0
    );


  const desktopCount =
    document.getElementById(
      "cartCount"
    );


  const mobileCount =
    document.getElementById(
      "mobileCartCount"
    );


  if (desktopCount) {

    desktopCount.textContent =
      totalQuantity;

  }


  if (mobileCount) {

    mobileCount.textContent =
      totalQuantity;

  }

}



/* =========================================================
   LISTEN CART CHANGES
   ========================================================= */

function listenCartChanges() {

  window.addEventListener(
    "storage",
    event => {

      if (
        event.key ===
        "memora_cart"
      ) {

        updateCartCount();

      }

    }
  );


  window.addEventListener(
    "memora-cart-updated",
    () => {

      updateCartCount();

    }
  );

}



/* =========================================================
   SMOOTH INTERNAL LINKS
   ========================================================= */

function initSmoothLinks() {

  const links =
    document.querySelectorAll(
      'a[href^="#"]'
    );


  links.forEach(
    link => {

      link.addEventListener(
        "click",
        event => {

          const href =
            link.getAttribute(
              "href"
            );


          if (
            !href ||
            href === "#"
          ) {

            return;

          }


          const target =
            document.querySelector(
              href
            );


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }
      );

    }
  );

}



/* =========================================================
   PRODUCT IMAGE FALLBACK
   ========================================================= */

function handleProductImageError(
  image,
  productName
) {

  if (!image) {
    return;
  }


  const container =
    image.parentElement;


  if (!container) {
    return;
  }


  image.remove();


  const fallback =
    document.createElement(
      "div"
    );


  fallback.className =
    "product-image-fallback";


  fallback.textContent =
    `${productName} — tambahkan foto dari Canva`;


  container.appendChild(
    fallback
  );

}



/* =========================================================
   GLOBAL HELPERS
   ========================================================= */

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



/* =========================================================
   EXPOSE GLOBAL FUNCTIONS
   ========================================================= */

window.handleProductImageError =
  handleProductImageError;


window.memoraUpdateCartCount =
  updateCartCount;


window.memoraFormatRupiah =
  formatRupiah;
/* =========================================================
   MEMORA CUSTOMER GALLERY
   Load product covers from Supabase
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  if (!window.memoraSupabase) {
    console.warn("Supabase belum tersedia untuk gallery customer.");
    return;
  }

  try {

    const { data, error } =
      await window.memoraSupabase
        .from("product_gallery")
        .select(`
          id,
          product_id,
          image_url,
          is_cover,
          is_active,
          products (
            id,
            slug,
            name
          )
        `)
        .eq("is_cover", true)
        .eq("is_active", true);


    if (error) {
      console.error("Gagal load cover gallery:", error);
      return;
    }


    if (!Array.isArray(data)) {
      return;
    }


    data.forEach(item => {

      const slug =
        item.products?.slug;

      const imageUrl =
        item.image_url;


      if (!slug || !imageUrl) {
        return;
      }


      const image =
        document.querySelector(
          `[data-product-cover="${slug}"]`
        );


      if (image) {

        image.src =
          imageUrl;

        image.removeAttribute(
          "onerror"
        );

      }

    });

  }
  catch (error) {

    console.error(
      "Customer gallery error:",
      error
    );

  }

});


/* Classic Folded Invitation Gallery Display */

document.addEventListener("DOMContentLoaded", () => {

  const classicImage =
    document.querySelector(
      '[data-product-cover="classic-invitation"]'
    );

  if (!classicImage) {
    return;
  }


  const observer =
    new MutationObserver(() => {

      const src =
        classicImage.getAttribute("src");


      if (
        src &&
        src.trim() !== ""
      ) {

        classicImage.style.display =
          "block";


        const placeholder =
          document.querySelector(
            '[data-product-placeholder="classic-invitation"]'
          );


        if (placeholder) {

          placeholder.style.display =
            "none";

        }

      }

    });


  observer.observe(
    classicImage,
    {
      attributes: true,
      attributeFilter: ["src"]
    }
  );


  const currentSrc =
    classicImage.getAttribute("src");


  if (
    currentSrc &&
    currentSrc.trim() !== ""
  ) {

    classicImage.style.display =
      "block";


    const placeholder =
      document.querySelector(
        '[data-product-placeholder="classic-invitation"]'
      );


    if (placeholder) {

      placeholder.style.display =
        "none";

    }

  }

});

