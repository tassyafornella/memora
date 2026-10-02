(function () {

  "use strict";


  const PRODUCT_SLUG_ALIASES = {

    "classic-invitation":
      [
        "classic-invitation"
      ],

    "invitation":
      [
        "invitation",
        "wedding-invitation"
      ],

    "bridesmaid":
      [
        "bridesmaid",
        "bridesmaid-card"
      ],

    "keepsake":
      [
        "keepsake"
      ],

    "hangtag":
      [
        "hangtag"
      ],

    "sticker":
      [
        "sticker"
      ],

    "birthday":
      [
        "birthday",
        "birthday-card"
      ]

  };


  function getSupabase() {

    return (
      window.memoraSupabase ||
      null
    );

  }


  function getCart() {

    try {

      const value =
        JSON.parse(
          localStorage.getItem(
            "memora_cart"
          ) ||
          "[]"
        );


      return (
        Array.isArray(value)
          ? value
          : []
      );

    }
    catch (error) {

      console.warn(
        "Cart:",
        error
      );


      return [];

    }

  }


  function getCartCount() {

    return getCart()
      .reduce(
        (
          total,
          item
        ) => {

          const qty =
            Number(
              item?.quantity ||
              item?.qty ||
              1
            );


          return (
            total +
            (
              Number.isFinite(qty)
                ? Math.max(qty, 1)
                : 1
            )
          );

        },
        0
      );

  }


  function renderCartCount() {

    const count =
      getCartCount();


    document
      .querySelectorAll(
        "[data-cart-count]"
      )
      .forEach(
        function (badge) {

          badge.textContent =
            count > 99
              ? "99+"
              : String(count);


          badge.classList.toggle(
            "show",
            count > 0
          );

        }
      );

  }


  function cleanDisplayName(value) {

    const name =
      String(
        value ||
        ""
      )
        .trim()
        .split(/\s+/)[0];


    if (!name) {
      return "";
    }


    return (
      name.charAt(0)
        .toUpperCase() +
      name
        .slice(1)
        .toLowerCase()
    );

  }


  async function renderGreeting() {

    const heading =
      document.getElementById(
        "homeGreeting"
      );


    if (!heading) {
      return;
    }


    const supabase =
      getSupabase();


    if (!supabase) {

      heading.textContent =
        "Hai!";

      return;

    }


    try {

      const {
        data: sessionData
      } =
        await supabase
          .auth
          .getSession();


      const user =
        sessionData
          ?.session
          ?.user;


      if (!user) {

        heading.textContent =
          "Hai!";

        return;

      }


      let displayName =
        cleanDisplayName(
          user
            ?.user_metadata
            ?.full_name
        );


      if (!displayName) {

        try {

          const {
            data: customer
          } =
            await supabase
              .from(
                "customers"
              )
              .select(
                "full_name"
              )
              .eq(
                "auth_user_id",
                user.id
              )
              .maybeSingle();


          displayName =
            cleanDisplayName(
              customer
                ?.full_name
            );

        }
        catch (error) {

          console.warn(
            "Customer greeting:",
            error
          );

        }

      }


      heading.textContent =
        displayName
          ? `Hai, ${displayName}!`
          : "Hai!";

    }
    catch (error) {

      console.warn(
        "Greeting:",
        error
      );


      heading.textContent =
        "Hai!";

    }

  }


  function findProductImageElement(
    databaseSlug
  ) {

    const entries =
      Object.entries(
        PRODUCT_SLUG_ALIASES
      );


    for (
      const [
        uiSlug,
        aliases
      ]
      of entries
    ) {

      if (
        aliases.includes(
          databaseSlug
        )
      ) {

        return (
          document
            .querySelector(
              `[data-product-image="${uiSlug}"]`
            )
        );

      }

    }


    return null;

  }


  async function loadProductImages() {

    const supabase =
      getSupabase();


    if (!supabase) {
      return;
    }


    try {

      const {
        data,
        error
      } =
        await supabase
          .from(
            "product_gallery"
          )
          .select(`
            id,
            product_id,
            image_url,
            image_type,
            is_cover,
            is_active,
            created_at,
            products (
              id,
              slug,
              name
            )
          `)
          .eq(
            "is_active",
            true
          )
          .order(
            "created_at",
            {
              ascending:
                false
            }
          );


      if (error) {
        throw error;
      }


      if (
        !Array.isArray(data)
      ) {
        return;
      }


      const byProduct =
        new Map();


      data.forEach(
        function (item) {

          const productId =
            item.product_id;


          if (!productId) {
            return;
          }


          if (
            !byProduct.has(
              productId
            )
          ) {

            byProduct.set(
              productId,
              []
            );

          }


          byProduct
            .get(
              productId
            )
            .push(
              item
            );

        }
      );


      byProduct
        .forEach(
          function (items) {

            const preferred =
              items.find(
                item =>
                  item.is_cover ===
                  true
              ) ||
              items.find(
                item =>
                  item.image_type ===
                  "gallery"
              ) ||
              items.find(
                item =>
                  item.image_type ===
                  "variant"
              ) ||
              items[0];


            if (
              !preferred
                ?.image_url
            ) {

              return;

            }


            const databaseSlug =
              preferred
                ?.products
                ?.slug;


            if (!databaseSlug) {
              return;
            }


            const image =
              findProductImageElement(
                databaseSlug
              );


            if (!image) {
              return;
            }


            image.src =
              preferred.image_url;

          }
        );

    }
    catch (error) {

      console.error(
        "Home product images:",
        error
      );

    }

  }


  function setupImageFallbacks() {

    document
      .querySelectorAll(
        ".product-image"
      )
      .forEach(
        function (image) {

          const fallback =
            image.getAttribute(
              "src"
            );


          image.addEventListener(
            "error",
            function () {

              if (
                image.src !==
                fallback
              ) {

                image.src =
                  fallback;

              }

            },
            {
              once: true
            }
          );

        }
      );

  }


  async function initialize() {

    renderCartCount();

    setupImageFallbacks();


    await Promise.allSettled([
      renderGreeting(),
      loadProductImages()
    ]);

  }


  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );


  window.addEventListener(
    "storage",
    function (event) {

      if (
        event.key ===
        "memora_cart"
      ) {

        renderCartCount();

      }

    }
  );


  window.addEventListener(
    "pageshow",
    function () {

      renderCartCount();

    }
  );


})();
