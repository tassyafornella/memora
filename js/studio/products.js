(function () {

  "use strict";


  let products = [];
  let variants = [];
  let bulkPrices = [];

  let selectedProductId = null;


  function client() {
    return window.memoraSupabase || null;
  }


  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }


  function escapeHtml(value) {

    const div =
      document.createElement("div");

    div.textContent =
      String(value ?? "");

    return div.innerHTML;

  }


  function formatRupiah(value) {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }
    ).format(Number(value) || 0);

  }


  function productVariants(productId) {

    return variants.filter(
      item =>
        String(item.product_id) ===
        String(productId)
    );

  }


  function productBulkPrices(productId) {

    return bulkPrices
      .filter(
        item =>
          String(item.product_id) ===
          String(productId)
      )
      .sort(
        (a, b) =>
          Number(a.min_quantity) -
          Number(b.min_quantity)
      );

  }


  async function loadData() {

    const supabase =
      client();


    const [
      productResult,
      variantResult,
      bulkResult
    ] =
      await Promise.all([

        supabase
          .from("products")
          .select("*")
          .order("name"),

        supabase
          .from("product_variants")
          .select("*")
          .order("created_at"),

        supabase
          .from("product_bulk_prices")
          .select("*")
          .order("min_quantity")

      ]);


    if (productResult.error) {
      throw productResult.error;
    }


    if (variantResult.error) {
      throw variantResult.error;
    }


    if (bulkResult.error) {
      throw bulkResult.error;
    }


    products =
      productResult.data || [];


    variants =
      variantResult.data || [];


    bulkPrices =
      bulkResult.data || [];

  }


  function renderStats() {

    document.getElementById(
      "productsTotal"
    ).textContent =
      products.length;


    document.getElementById(
      "productsActive"
    ).textContent =
      products.filter(
        item =>
          item.is_active !== false
      ).length;


    document.getElementById(
      "productsVariants"
    ).textContent =
      variants.length;


    document.getElementById(
      "productsBulkTiers"
    ).textContent =
      bulkPrices.length;

  }


  function filteredProducts() {

    const search =
      normalize(
        document.getElementById(
          "productsSearch"
        )?.value
      );


    const filter =
      normalize(
        document.getElementById(
          "productsFilter"
        )?.value
      );


    return products.filter(
      product => {

        const active =
          product.is_active !== false;


        if (
          filter === "active" &&
          !active
        ) {
          return false;
        }


        if (
          filter === "inactive" &&
          active
        ) {
          return false;
        }


        if (!search) {
          return true;
        }


        return [
          product.name,
          product.slug
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);

      }
    );

  }


  function renderProducts() {

    const grid =
      document.getElementById(
        "productsGrid"
      );


    const empty =
      document.getElementById(
        "productsEmpty"
      );


    const data =
      filteredProducts();


    if (!data.length) {

      grid.innerHTML = "";

      empty.hidden = false;

      return;

    }


    empty.hidden = true;


    grid.innerHTML =
      data.map(
        product => {

          const productVariantList =
            productVariants(
              product.id
            );


          const productBulkList =
            productBulkPrices(
              product.id
            );


          const active =
            product.is_active !== false;


          return `

            <article class="products-card">

              <div class="products-card-header">

                <div>

                  <h3>
                    ${escapeHtml(
                      product.name
                    )}
                  </h3>

                  <span class="products-card-slug">
                    ${escapeHtml(
                      product.slug
                    )}
                  </span>

                </div>

                <span
                  class="
                    products-status
                    ${active ? "active" : "inactive"}
                  "
                >
                  ${active ? "Aktif" : "Nonaktif"}
                </span>

              </div>


              <div class="products-card-info">

                <div>

                  <span>
                    Variant
                  </span>

                  <strong>
                    ${productVariantList.length}
                  </strong>

                </div>


                <div>

                  <span>
                    Bulk Tier
                  </span>

                  <strong>
                    ${productBulkList.length}
                  </strong>

                </div>

              </div>


              <button
                type="button"
                class="products-edit-button"
                data-edit-product="${escapeHtml(
                  product.id
                )}"
              >
                Edit Produk
              </button>

            </article>

          `;

        }
      ).join("");


    bindEditButtons();

  }


  function bindEditButtons() {

    document
      .querySelectorAll(
        "[data-edit-product]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              openProduct(
                button.dataset.editProduct
              );

            }
          );

        }
      );

  }


  function openProduct(productId) {

    const product =
      products.find(
        item =>
          String(item.id) ===
          String(productId)
      );


    if (!product) {
      return;
    }


    selectedProductId =
      productId;


    document.getElementById(
      "productModalTitle"
    ).textContent =
      product.name;


    document.getElementById(
      "productNameInput"
    ).value =
      product.name || "";


    document.getElementById(
      "productSlugInput"
    ).value =
      product.slug || "";


    document.getElementById(
      "productActiveInput"
    ).checked =
      product.is_active !== false;


    renderVariants(product);

    renderBulkPrices(product);


    document.getElementById(
      "productModal"
    ).hidden = false;

  }


  function closeProduct() {

    document.getElementById(
      "productModal"
    ).hidden = true;


    selectedProductId = null;

  }


  function renderVariants(product) {

    const container =
      document.getElementById(
        "productVariantList"
      );


    const list =
      productVariants(
        product.id
      );


    if (!list.length) {

      container.innerHTML =
        "<p>Tidak ada variant.</p>";

      return;

    }


    container.innerHTML =
      list.map(
        variant => `

          <div class="products-variant-item">

            <div class="products-variant-meta">

              <strong>
                ${escapeHtml(
                  variant.name ||
                  variant.code ||
                  "Variant"
                )}
              </strong>

              <span>
                ${escapeHtml(
                  variant.code ||
                  "-"
                )}
              </span>

            </div>


            <input
              type="number"
              class="products-variant-price"
              data-variant-price="${escapeHtml(
                variant.id
              )}"
              value="${Number(
                variant.price || 0
              )}"
              min="0"
            >


            <button
              type="button"
              class="products-row-button"
              data-save-variant="${escapeHtml(
                variant.id
              )}"
            >
              Simpan
            </button>

          </div>

        `
      ).join("");


    document
      .querySelectorAll(
        "[data-save-variant]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              saveVariantPrice(
                button.dataset.saveVariant,
                button
              );

            }
          );

        }
      );

  }


  function renderBulkPrices(product) {

    const section =
      document.getElementById(
        "productBulkSection"
      );


    const container =
      document.getElementById(
        "productBulkList"
      );


    const list =
      productBulkPrices(
        product.id
      );


    if (!list.length) {

      section.hidden = true;

      container.innerHTML = "";

      return;

    }


    section.hidden = false;


    container.innerHTML =
      list.map(
        bulk => {

          const variant =
            variants.find(
              item =>
                String(item.id) ===
                String(bulk.variant_id)
            );


          return `

            <div class="products-bulk-item">

              <div class="products-bulk-meta">

                <strong>
                  ${escapeHtml(
                    variant?.name ||
                    variant?.code ||
                    "Variant"
                  )}
                </strong>

                <span>
                  Mulai quantity
                </span>

              </div>


              <input
                type="number"
                value="${Number(
                  bulk.min_quantity || 1
                )}"
                disabled
              >


              <input
                type="number"
                class="products-bulk-price"
                data-bulk-price="${escapeHtml(
                  bulk.id
                )}"
                value="${Number(
                  bulk.unit_price || 0
                )}"
                min="0"
              >


              <button
                type="button"
                class="products-row-button"
                data-save-bulk="${escapeHtml(
                  bulk.id
                )}"
              >
                Simpan
              </button>

            </div>

          `;

        }
      ).join("");


    document
      .querySelectorAll(
        "[data-save-bulk]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              saveBulkPrice(
                button.dataset.saveBulk,
                button
              );

            }
          );

        }
      );

  }


  async function saveProduct() {

    if (!selectedProductId) {
      return;
    }


    const button =
      document.getElementById(
        "saveProductButton"
      );


    const name =
      document.getElementById(
        "productNameInput"
      ).value.trim();


    const active =
      document.getElementById(
        "productActiveInput"
      ).checked;


    if (!name) {

      alert(
        "Nama produk tidak boleh kosong."
      );

      return;

    }


    button.disabled = true;
    button.textContent = "Menyimpan...";


    try {

      const {
        error
      } =
        await client()
          .from("products")
          .update({
            name:
              name,
            is_active:
              active
          })
          .eq(
            "id",
            selectedProductId
          );


      if (error) {
        throw error;
      }


      const product =
        products.find(
          item =>
            String(item.id) ===
            String(selectedProductId)
        );


      if (product) {

        product.name =
          name;

        product.is_active =
          active;

      }


      renderStats();

      renderProducts();


      document.getElementById(
        "productModalTitle"
      ).textContent =
        name;


      alert(
        "Produk berhasil diperbarui."
      );

    }
    catch (error) {

      console.error(
        "Save product:",
        error
      );


      alert(
        error?.message ||
        "Gagal menyimpan produk."
      );

    }
    finally {

      button.disabled = false;
      button.textContent = "Simpan Produk";

    }

  }


  async function saveVariantPrice(
    variantId,
    button
  ) {

    const input =
      document.querySelector(
        `[data-variant-price="${CSS.escape(
          String(variantId)
        )}"]`
      );


    const price =
      Number(
        input?.value
      );


    if (
      !Number.isFinite(price) ||
      price < 0
    ) {

      alert(
        "Harga variant tidak valid."
      );

      return;

    }


    button.disabled = true;
    button.textContent = "...";


    try {

      const {
        error
      } =
        await client()
          .from("product_variants")
          .update({
            price:
              price
          })
          .eq(
            "id",
            variantId
          );


      if (error) {
        throw error;
      }


      const variant =
        variants.find(
          item =>
            String(item.id) ===
            String(variantId)
        );


      if (variant) {

        variant.price =
          price;

      }


      alert(
        "Harga variant berhasil diperbarui."
      );

    }
    catch (error) {

      alert(
        error?.message ||
        "Gagal menyimpan harga variant."
      );

    }
    finally {

      button.disabled = false;
      button.textContent = "Simpan";

    }

  }


  async function saveBulkPrice(
    bulkId,
    button
  ) {

    const input =
      document.querySelector(
        `[data-bulk-price="${CSS.escape(
          String(bulkId)
        )}"]`
      );


    const price =
      Number(
        input?.value
      );


    if (
      !Number.isFinite(price) ||
      price < 0
    ) {

      alert(
        "Harga bulk tidak valid."
      );

      return;

    }


    button.disabled = true;
    button.textContent = "...";


    try {

      const {
        error
      } =
        await client()
          .from("product_bulk_prices")
          .update({
            unit_price:
              price
          })
          .eq(
            "id",
            bulkId
          );


      if (error) {
        throw error;
      }


      const bulk =
        bulkPrices.find(
          item =>
            String(item.id) ===
            String(bulkId)
        );


      if (bulk) {

        bulk.unit_price =
          price;

      }


      alert(
        "Bulk price berhasil diperbarui."
      );

    }
    catch (error) {

      alert(
        error?.message ||
        "Gagal menyimpan bulk price."
      );

    }
    finally {

      button.disabled = false;
      button.textContent = "Simpan";

    }

  }


  function bindEvents() {

    document.getElementById(
      "productsSearch"
    )?.addEventListener(
      "input",
      renderProducts
    );


    document.getElementById(
      "productsFilter"
    )?.addEventListener(
      "change",
      renderProducts
    );


    document.getElementById(
      "productsResetButton"
    )?.addEventListener(
      "click",
      () => {

        document.getElementById(
          "productsSearch"
        ).value = "";

        document.getElementById(
          "productsFilter"
        ).value = "";

        renderProducts();

      }
    );


    document.getElementById(
      "productsRefreshButton"
    )?.addEventListener(
      "click",
      async () => {

        await loadData();

        renderStats();

        renderProducts();

      }
    );


    document.getElementById(
      "saveProductButton"
    )?.addEventListener(
      "click",
      saveProduct
    );


    document
      .querySelectorAll(
        "[data-close-product]"
      )
      .forEach(
        element => {

          element.addEventListener(
            "click",
            closeProduct
          );

        }
      );

  }


  function setupSidebar() {

    const button =
      document.getElementById(
        "studioMenuButton"
      );

    const sidebar =
      document.getElementById(
        "studioSidebar"
      );

    const overlay =
      document.getElementById(
        "studioMobileOverlay"
      );


    button?.addEventListener(
      "click",
      () => {

        sidebar?.classList.toggle(
          "open"
        );

        overlay?.classList.toggle(
          "show"
        );

      }
    );


    overlay?.addEventListener(
      "click",
      () => {

        sidebar?.classList.remove(
          "open"
        );

        overlay?.classList.remove(
          "show"
        );

      }
    );

  }


  async function init() {

    setupSidebar();

    bindEvents();


    try {

      await loadData();

      renderStats();

      renderProducts();

    }
    catch (error) {

      console.error(
        "Products:",
        error
      );


      document.getElementById(
        "productsGrid"
      ).innerHTML = `

        <div class="products-loading">
          ${escapeHtml(
            error?.message ||
            "Gagal memuat products."
          )}
        </div>

      `;

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    () => {

      setTimeout(
        init,
        150
      );

    }
  );


})();
