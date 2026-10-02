(() => {

  "use strict";


  const STORAGE_KEY =
    "memora_catalog_selection";


  const config = {

    invitation: {

      title:
        "Invitation",

      description:
        "Temukan inspirasi undangan dan pilih desain yang paling sesuai dengan konsep acaramu.",

      products: {

        wedding: {

          title:
            "Wedding Invitation",

          description:
            "Invitation set dengan beberapa card dalam satu tema.",

          slug:
            "invitation",

          productPath:
            "/product/invitation/",

          unit:
            "set",

          prices: {

            simple:
              5500,

            signature:
              7500,

            complete:
              10500

          },

          fallbackFolder:
            "/assets/images/products/invitation"

        },


        classic: {

          title:
            "Classic Folded Invitation",

          description:
            "Undangan cetak lipat personalized untuk wedding dan special occasion.",

          slug:
            "classic-invitation",

          productPath:
            "/product/classic-invitation/",

          unit:
            "pcs",

          prices: {

            simple:
              1500,

            signature:
              2000,

            complete:
              2500

          },

          fallbackFolder:
            "/assets/images/products/classic-invitation"

        }

      }

    },


    bridesmaid: {

      title:
        "Bridesmaid / MOH",

      description:
        "Personalized stationery untuk bridesmaid dan Maid of Honor.",

      products: {

        main: {

          title:
            "Bridesmaid / MOH Set",

          slug:
            "bridesmaid-moh",

          productPath:
            "/product/bridesmaid/",

          unit:
            "pcs",

          prices: {

            simple:
              8000,

            signature:
              12000,

            complete:
              15000

          },

          fallbackFolder:
            "/assets/images/products/bridesmaid"

        }

      }

    },


    keepsake: {

      title:
        "Keepsake",

      description:
        "Koleksi little memories yang dibuat untuk disimpan dan dikenang.",

      products: {

        main: {

          title:
            "Keepsake",

          slug:
            "keepsake",

          productPath:
            "/product/keepsake/",

          unit:
            "set",

          prices: {

            simple:
              50000,

            signature:
              80000,

            complete:
              100000

          },

          fallbackFolder:
            "/assets/images/products/keepsake"

        }

      }

    },


    hangtag: {

      title:
        "Hangtag",

      description:
        "Personalized hangtag untuk souvenir, gift, hampers, dan packaging.",

      products: {

        main: {

          title:
            "Personalized Hangtag",

          slug:
            "hangtag",

          productPath:
            "/product/hangtag/",

          unit:
            "pcs",

          prices: {

            simple:
              500,

            signature:
              1500,

            complete:
              2000

          },

          fallbackFolder:
            "/assets/images/products/hangtag"

        }

      }

    },


    sticker: {

      title:
        "Sticker",

      description:
        "Custom sticker untuk souvenir, packaging, brand, dan special occasion.",

      products: {

        main: {

          title:
            "Custom Sticker",

          slug:
            "sticker",

          productPath:
            "/product/sticker/",

          unit:
            "sheet",

          prices: {

            simple:
              null,

            signature:
              null,

            complete:
              null

          },

          fallbackFolder:
            "/assets/images/products/sticker"

        }

      }

    },


    birthday: {

      title:
        "Birthday",

      description:
        "Personalized birthday stationery untuk setiap little chapter.",

      products: {

        main: {

          title:
            "Birthday Card",

          slug:
            "birthday",

          productPath:
            "/product/birthday/",

          unit:
            "pcs",

          prices: {

            simple:
              8000,

            signature:
              12000,

            complete:
              15000

          },

          fallbackFolder:
            "/assets/images/products/birthday"

        }

      }

    }

  };


  const variantLabels = {

    simple:
      "Simple",

    signature:
      "Signature",

    complete:
      "Complete"

  };


  const params =
    new URLSearchParams(
      window.location.search
    );


  let categoryKey =
    (
      params.get(
        "category"
      ) ||
      "bridesmaid"
    )
    .toLowerCase();


  if (
    !config[
      categoryKey
    ]
  ) {

    categoryKey =
      "bridesmaid";

  }


  const category =
    config[
      categoryKey
    ];


  let productKey =
    null;


  let currentProduct =
    null;


  let selectedVariant =
    null;


  let selectedDesign =
    null;


  let galleryCache =
    {};


  /* ==========================================================
     FORMAT
     ========================================================== */

  function rupiah(
    value
  ) {

    if (
      value === null ||
      value === undefined
    ) {

      return "Harga custom";

    }


    return new Intl.NumberFormat(
      "id-ID",
      {
        style:
          "currency",

        currency:
          "IDR",

        maximumFractionDigits:
          0
      }
    ).format(
      Number(
        value
      ) || 0
    );

  }


  function safe(
    value
  ) {

    return String(
      value || ""
    )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

  }


  function prettyTitle(
    value
  ) {

    let text =
      String(
        value || ""
      );


    text =
      text.split("/")
        .pop()
        .split("?")[0]
        .replace(
          /\.[^.]+$/,
          ""
        )
        .replace(
          /^(simple|signature|complete)[-_]*/i,
          ""
        )
        .replace(
          /^\d+[-_]?/,
          ""
        )
        .replace(
          /[-_]+/g,
          " "
        )
        .trim();


    if (!text) {

      return "Memora Design";

    }


    return text
      .split(
        " "
      )
      .map(
        word =>
          word
            ? word[0].toUpperCase() +
              word.slice(1)
            : word
      )
      .join(
        " "
      );

  }


  /* ==========================================================
     HERO
     ========================================================== */

  document.title =
    `${category.title} Collection — Memora`;


  document.getElementById(
    "catalogEyebrow"
  ).textContent =
    `${category.title.toUpperCase()} COLLECTION`;


  document.getElementById(
    "catalogTitle"
  ).textContent =
    category.title;


  document.getElementById(
    "catalogDescription"
  ).textContent =
    category.description;


  /* ==========================================================
     PRODUCT TYPE
     ========================================================== */

  const productEntries =
    Object.entries(
      category.products
    );


  function renderProductTypes() {

    const step =
      document.getElementById(
        "productTypeStep"
      );


    const packageStep =
      document.getElementById(
        "packageStep"
      );


    if (
      productEntries.length ===
      1
    ) {

      productKey =
        productEntries[0][0];


      currentProduct =
        productEntries[0][1];


      step.hidden =
        true;


      packageStep.hidden =
        false;


      renderPackages();

      return;

    }


    step.hidden =
      false;


    packageStep.hidden =
      true;


    document.getElementById(
      "packageStepNumber"
    ).textContent =
      "02";


    document.getElementById(
      "designStepNumber"
    ).textContent =
      "03";


    const grid =
      document.getElementById(
        "catalogProductTypeGrid"
      );


    grid.innerHTML =
      "";


    productEntries.forEach(
      ([key, item]) => {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "catalog-product-type";


        button.innerHTML = `

          <strong>
            ${safe(
              item.title
            )}
          </strong>

          <span>
            ${safe(
              item.description || ""
            )}
          </span>

        `;


        button.addEventListener(
          "click",
          () => {

            chooseProduct(
              key
            );

          }
        );


        grid.appendChild(
          button
        );

      }
    );

  }


  function chooseProduct(
    key
  ) {

    productKey =
      key;


    currentProduct =
      category.products[
        key
      ];


    document.getElementById(
      "productTypeStep"
    ).hidden =
      true;


    document.getElementById(
      "packageStep"
    ).hidden =
      false;


    document.getElementById(
      "changeProductButton"
    ).hidden =
      productEntries.length <=
      1;


    renderPackages();

  }


  /* ==========================================================
     PACKAGES
     ========================================================== */

  function renderPackages() {

    if (!currentProduct) {

      return;

    }


    const grid =
      document.getElementById(
        "catalogPackageGrid"
      );


    grid.innerHTML =
      "";


    [
      "simple",
      "signature",
      "complete"
    ]
    .forEach(
      variant => {

        const price =
          currentProduct.prices[
            variant
          ];


        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "catalog-package-card";


        button.innerHTML = `

          <strong>
            ${variantLabels[
              variant
            ]}
          </strong>


          <div>

            <span class="catalog-package-price">
              ${rupiah(
                price
              )}
            </span>


            <span class="catalog-package-unit">
              ${
                price === null
                  ? "sesuai ukuran & kebutuhan"
                  : `/ ${currentProduct.unit}`
              }
            </span>

          </div>

        `;


        button.addEventListener(
          "click",
          () => {

            chooseVariant(
              variant
            );

          }
        );


        grid.appendChild(
          button
        );

      }
    );

  }


  function chooseVariant(
    variant
  ) {

    selectedVariant =
      variant;


    document.getElementById(
      "packageStep"
    ).hidden =
      true;


    document.getElementById(
      "designStep"
    ).hidden =
      false;


    document.getElementById(
      "designTitle"
    ).textContent =
      `${variantLabels[
        variant
      ]} Collection`;


    renderDesigns();

  }


  /* ==========================================================
     SUPABASE GALLERY
     ========================================================== */

  function getDB() {

    return (
      window.memoraSupabase ||
      window.supabaseClient ||
      window.db ||
      null
    );

  }


  async function fetchDesigns() {

    if (
      !currentProduct ||
      !selectedVariant
    ) {

      return [];

    }


    const cacheKey =
      `${currentProduct.slug}:${selectedVariant}`;


    if (
      galleryCache[
        cacheKey
      ]
    ) {

      return galleryCache[
        cacheKey
      ];

    }


    const result =
      [];


    const db =
      getDB();


    if (db) {

      try {

        const productResult =
          await db
            .from(
              "products"
            )
            .select(
              "id,slug"
            )
            .eq(
              "slug",
              currentProduct.slug
            )
            .maybeSingle();


        const productRow =
          productResult.data;


        if (
          productRow?.id
        ) {

          const variantsResult =
            await db
              .from(
                "product_variants"
              )
              .select(
                "id,code,name"
              )
              .eq(
                "product_id",
                productRow.id
              )
              .eq(
                "is_active",
                true
              );


          const variants =
            variantsResult.data ||
            [];


          const variant =
            variants.find(
              item =>
                String(
                  item.code || ""
                )
                .toLowerCase() ===
                selectedVariant
            );


          if (
            variant?.id
          ) {

            const galleryResult =
              await db
                .from(
                  "product_gallery"
                )
                .select(
                  "id,image_url,variant_id,image_type,is_active,created_at"
                )
                .eq(
                  "product_id",
                  productRow.id
                )
                .eq(
                  "variant_id",
                  variant.id
                )
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


            (
              galleryResult.data ||
              []
            )
            .forEach(
              item => {

                if (
                  !item.image_url
                ) {

                  return;

                }


                result.push(
                  {

                    id:
                      item.id,

                    image:
                      item.image_url,

                    title:
                      prettyTitle(
                        item.image_url
                      ),

                    variant:
                      selectedVariant

                  }
                );

              }
            );

          }

        }

      }
      catch (
        error
      ) {

        console.warn(
          "Memora gallery fallback:",
          error
        );

      }

    }


    /*
      FALLBACK:
      pakai foto variant existing product page.
    */

    if (
      !result.length
    ) {

      result.push(
        {

          id:
            `${currentProduct.slug}-${selectedVariant}-fallback`,

          image:
            `${currentProduct.fallbackFolder}/${selectedVariant}.jpg`,

          title:
            `${variantLabels[
              selectedVariant
            ]} Design`,

          variant:
            selectedVariant

        }
      );

    }


    galleryCache[
      cacheKey
    ] =
      result;


    return result;

  }


  /* ==========================================================
     DESIGNS
     ========================================================== */

  async function renderDesigns() {

    const grid =
      document.getElementById(
        "catalogDesignGrid"
      );


    const empty =
      document.getElementById(
        "catalogEmpty"
      );


    grid.innerHTML =
      "";


    empty.hidden =
      true;


    const designs =
      await fetchDesigns();


    if (
      !designs.length
    ) {

      empty.hidden =
        false;

      return;

    }


    designs.forEach(
      design => {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "catalog-design-card";


        button.innerHTML = `

          <div class="catalog-design-image-wrap">

            <img
              src="${safe(
                design.image
              )}"
              alt="${safe(
                design.title
              )}"
              class="catalog-design-image"
              loading="lazy"
            >

          </div>


          <strong>
            ${safe(
              design.title
            )}
          </strong>


          <span>
            ${variantLabels[
              selectedVariant
            ]} Package
          </span>

        `;


        button.addEventListener(
          "click",
          () => {

            openPreview(
              design
            );

          }
        );


        grid.appendChild(
          button
        );

      }
    );

  }


  /* ==========================================================
     PREVIEW
     ========================================================== */

  function openPreview(
    design
  ) {

    selectedDesign =
      design;


    const image =
      document.getElementById(
        "catalogPreviewImage"
      );


    image.src =
      design.image;


    image.alt =
      design.title;


    document.getElementById(
      "catalogPreviewTitle"
    ).textContent =
      design.title;


    document.getElementById(
      "catalogPreviewPackage"
    ).textContent =
      `${variantLabels[
        selectedVariant
      ]} Package`;


    const modal =
      document.getElementById(
        "catalogPreviewModal"
      );


    modal.classList.add(
      "open"
    );


    modal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "catalog-preview-open"
    );

  }


  function closePreview() {

    const modal =
      document.getElementById(
        "catalogPreviewModal"
      );


    modal.classList.remove(
      "open"
    );


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.classList.remove(
      "catalog-preview-open"
    );

  }


  document
    .querySelectorAll(
      "[data-close-preview]"
    )
    .forEach(
      element => {

        element.addEventListener(
          "click",
          closePreview
        );

      }
    );


  /* ==========================================================
     ORDER
     ========================================================== */

  document.getElementById(
    "catalogOrderButton"
  )
  .addEventListener(
    "click",
    () => {

      if (
        !currentProduct ||
        !selectedVariant ||
        !selectedDesign
      ) {

        return;

      }


      const selection = {

        category:
          categoryKey,

        productKey:
          productKey,

        productSlug:
          currentProduct.slug,

        productPath:
          currentProduct.productPath,

        productTitle:
          currentProduct.title,

        variant:
          selectedVariant,

        variantLabel:
          variantLabels[
            selectedVariant
          ],

        designId:
          selectedDesign.id,

        designTitle:
          selectedDesign.title,

        designImage:
          selectedDesign.image,

        locked:
          true,

        createdAt:
          Date.now()

      };


      try {

        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            selection
          )
        );

      }
      catch {

        return;

      }


      window.location.href =
        currentProduct.productPath;

    }
  );


  /* ==========================================================
     BACK BUTTONS
     ========================================================== */

  document.getElementById(
    "changePackageButton"
  )
  .addEventListener(
    "click",
    () => {

      selectedVariant =
        null;


      selectedDesign =
        null;


      document.getElementById(
        "designStep"
      ).hidden =
        true;


      document.getElementById(
        "packageStep"
      ).hidden =
        false;

    }
  );


  document.getElementById(
    "changeProductButton"
  )
  .addEventListener(
    "click",
    () => {

      productKey =
        null;


      currentProduct =
        null;


      selectedVariant =
        null;


      selectedDesign =
        null;


      document.getElementById(
        "designStep"
      ).hidden =
        true;


      document.getElementById(
        "packageStep"
      ).hidden =
        true;


      document.getElementById(
        "productTypeStep"
      ).hidden =
        false;

    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closePreview();

      }

    }
  );


  /* ==========================================================
     PRESELECT
     untuk tombol Ganti desain
     ========================================================== */

  async function handlePreselection() {

    const requestedProduct =
      params.get(
        "product"
      );


    const requestedVariant =
      (
        params.get(
          "variant"
        ) ||
        ""
      )
      .toLowerCase();


    if (
      requestedProduct &&
      category.products[
        requestedProduct
      ]
    ) {

      chooseProduct(
        requestedProduct
      );

    }


    if (
      [
        "simple",
        "signature",
        "complete"
      ]
      .includes(
        requestedVariant
      ) &&
      currentProduct
    ) {

      chooseVariant(
        requestedVariant
      );

    }

  }


  /* ==========================================================
     INIT
     ========================================================== */

  renderProductTypes();

  handlePreselection();

})();
