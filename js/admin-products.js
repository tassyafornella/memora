document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db = MemoraAdmin.db;

    const page =
      document.getElementById("adminPage");


    let products = [];

    let variants = [];

    let selectedProduct = null;


    page.innerHTML = `

      <div class="page-head">

        <div>

          <div class="eyebrow">
            Catalog
          </div>

          <h1>
            Products
          </h1>

          <p>
            Kelola informasi produk dan status produk MEMORA.
          </p>

        </div>

        <button
          type="button"
          class="btn"
          id="refreshProducts"
        >
          Refresh
        </button>

      </div>


      <div
        class="stats-grid"
        style="margin-bottom:18px;"
      >

        <div class="stat-card">
          <span>Total Products</span>
          <strong id="productTotal">0</strong>
        </div>

        <div class="stat-card">
          <span>Active</span>
          <strong id="productActive">0</strong>
        </div>

        <div class="stat-card">
          <span>Inactive</span>
          <strong id="productInactive">0</strong>
        </div>

        <div class="stat-card">
          <span>Variants</span>
          <strong id="productVariants">0</strong>
        </div>

      </div>


      <section class="panel">

        <div
          style="
            display:flex;
            gap:12px;
            align-items:center;
            justify-content:space-between;
            margin-bottom:18px;
            flex-wrap:wrap;
          "
        >

          <div>

            <h2 style="margin:0;">
              Product List
            </h2>

            <p
              style="
                margin:5px 0 0;
                color:var(--muted,#747d78);
              "
            >
              Pilih Edit untuk mengubah informasi produk.
            </p>

          </div>


          <input
            type="search"
            class="input"
            id="productSearch"
            placeholder="Cari produk..."
            style="max-width:280px;"
          >

        </div>


        <div class="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Product</th>
                <th>Slug</th>
                <th>Variant</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody id="productRows"></tbody>

          </table>

        </div>

      </section>


      <div
        class="modal"
        id="productModal"
        hidden
      >

        <div
          class="modal-card"
          style="width:min(620px,100%);"
        >

          <div class="modal-head">

            <div>

              <div class="eyebrow">
                TC-14
              </div>

              <h2 style="margin:4px 0 0;">
                Edit Product
              </h2>

            </div>

            <button
              type="button"
              class="btn"
              id="closeProductModal"
            >
              Close
            </button>

          </div>


          <div class="modal-body">

            <div class="form-grid">

              <label class="field">

                <span>
                  Nama Produk
                </span>

                <input
                  type="text"
                  class="input"
                  id="editProductName"
                  autocomplete="off"
                >

              </label>


              <label class="field">

                <span>
                  Slug
                </span>

                <input
                  type="text"
                  class="input"
                  id="editProductSlug"
                  disabled
                >

              </label>


              <label
                class="field"
                style="grid-column:1/-1;"
              >

                <span>
                  Status Produk
                </span>

                <select
                  class="input"
                  id="editProductActive"
                >
                  <option value="true">
                    Active
                  </option>

                  <option value="false">
                    Inactive
                  </option>
                </select>

              </label>

            </div>


            <div
              id="variantEditor"
              style="margin-top:22px;"
            ></div>


            <div
              id="productMessage"
              style="
                display:none;
                margin-top:18px;
                padding:12px 14px;
                border-radius:10px;
                background:#edf5ef;
                color:#315844;
                font-weight:600;
              "
            ></div>

          </div>


          <div class="modal-foot">

            <button
              type="button"
              class="btn"
              id="cancelProductEdit"
            >
              Cancel
            </button>

            <button
              type="button"
              class="btn btn-primary"
              id="saveProduct"
            >
              Simpan Perubahan
            </button>

          </div>

        </div>

      </div>

    `;


    function escapeHtml(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    function variantForProduct(productId) {

      return variants.filter(
        item =>
          String(item.product_id) ===
          String(productId)
      );

    }


    function showMessage(message) {

      const box =
        document.getElementById(
          "productMessage"
        );

      box.textContent =
        message;

      box.style.display =
        "block";

    }


    async function loadData() {

      const [
        productResult,
        variantResult
      ] =
        await Promise.all([

          db
            .from("products")
            .select("*")
            .order(
              "name",
              {
                ascending:true
              }
            ),

          db
            .from("product_variants")
            .select("*")
            .order(
              "created_at",
              {
                ascending:true
              }
            )

        ]);


      if (productResult.error) {
        throw productResult.error;
      }


      products =
        productResult.data || [];


      variants =
        variantResult.error
          ? []
          : (
              variantResult.data ||
              []
            );


      renderStats();
      renderProducts();

    }


    function renderStats() {

      document.getElementById(
        "productTotal"
      ).textContent =
        products.length;


      document.getElementById(
        "productActive"
      ).textContent =
        products.filter(
          item =>
            item.is_active !== false
        ).length;


      document.getElementById(
        "productInactive"
      ).textContent =
        products.filter(
          item =>
            item.is_active === false
        ).length;


      document.getElementById(
        "productVariants"
      ).textContent =
        variants.length;

    }


    function renderProducts() {

      const query =
        String(
          document.getElementById(
            "productSearch"
          )?.value ||
          ""
        )
          .trim()
          .toLowerCase();


      const filtered =
        products.filter(product => {

          if (!query) {
            return true;
          }

          return (
            String(
              product.name ||
              ""
            )
              .toLowerCase()
              .includes(query)

            ||

            String(
              product.slug ||
              ""
            )
              .toLowerCase()
              .includes(query)
          );

        });


      const rows =
        document.getElementById(
          "productRows"
        );


      rows.innerHTML =
        filtered.map(product => {

          const productVariants =
            variantForProduct(
              product.id
            );


          return `

            <tr>

              <td>

                <strong>
                  ${escapeHtml(
                    product.name ||
                    "-"
                  )}
                </strong>

              </td>

              <td>
                ${escapeHtml(
                  product.slug ||
                  "-"
                )}
              </td>

              <td>
                ${productVariants.length}
              </td>

              <td>

                <span class="badge">

                  ${
                    product.is_active === false
                      ? "Inactive"
                      : "Active"
                  }

                </span>

              </td>

              <td>

                <button
                  type="button"
                  class="btn"
                  data-edit-product="${product.id}"
                >
                  Edit
                </button>

              </td>

            </tr>

          `;

        }).join("") ||

        `
          <tr>

            <td
              colspan="5"
              class="empty"
            >
              Produk tidak ditemukan.
            </td>

          </tr>
        `;


      document
        .querySelectorAll(
          "[data-edit-product]"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            () => {

              openProduct(
                button.dataset.editProduct
              );

            }
          );

        });

    }


    function openProduct(productId) {

      selectedProduct =
        products.find(
          product =>
            String(product.id) ===
            String(productId)
        );


      if (!selectedProduct) {
        return;
      }


      document.getElementById(
        "editProductName"
      ).value =
        selectedProduct.name ||
        "";


      document.getElementById(
        "editProductSlug"
      ).value =
        selectedProduct.slug ||
        "";


      document.getElementById(
        "editProductActive"
      ).value =
        selectedProduct.is_active === false
          ? "false"
          : "true";


      const itemVariants =
        variantForProduct(
          selectedProduct.id
        );


      const variantEditor =
        document.getElementById(
          "variantEditor"
        );


      if (!itemVariants.length) {

        variantEditor.innerHTML =
          `
            <div
              style="
                padding:14px;
                border:1px solid #e2e5e2;
                border-radius:10px;
                color:#7a827e;
              "
            >
              Produk ini belum memiliki variant.
            </div>
          `;

      }
      else {

        variantEditor.innerHTML = `

          <div
            class="eyebrow"
            style="margin-bottom:10px;"
          >
            Product Variants
          </div>

          ${

            itemVariants.map(
              variant => `

                <div
                  style="
                    padding:12px 0;
                    border-bottom:1px solid #eceeec;
                    display:flex;
                    justify-content:space-between;
                    gap:16px;
                  "
                >

                  <div>

                    <strong>
                      ${escapeHtml(
                        variant.name ||
                        variant.code ||
                        "Variant"
                      )}
                    </strong>

                    <div
                      style="
                        margin-top:4px;
                        color:#7b837e;
                        font-size:12px;
                      "
                    >
                      ${escapeHtml(
                        variant.code ||
                        "-"
                      )}
                    </div>

                  </div>

                  <span class="badge">
                    ${
                      variant.is_active === false
                        ? "Inactive"
                        : "Active"
                    }
                  </span>

                </div>

              `
            ).join("")

          }

        `;

      }


      const message =
        document.getElementById(
          "productMessage"
        );

      message.style.display =
        "none";

      message.textContent =
        "";


      document.getElementById(
        "productModal"
      ).hidden =
        false;

    }


    function closeProduct() {

      document.getElementById(
        "productModal"
      ).hidden =
        true;

      selectedProduct =
        null;

    }


    async function saveProduct() {

      if (!selectedProduct) {
        return;
      }


      const button =
        document.getElementById(
          "saveProduct"
        );


      const name =
        String(
          document.getElementById(
            "editProductName"
          ).value ||
          ""
        ).trim();


      if (!name) {

        alert(
          "Nama produk wajib diisi."
        );

        return;
      }


      const isActive =
        document.getElementById(
          "editProductActive"
        ).value === "true";


      button.disabled =
        true;

      button.textContent =
        "Menyimpan...";


      try {

        const result =
          await db
            .from("products")
            .update({
              name:
                name,

              is_active:
                isActive
            })
            .eq(
              "id",
              selectedProduct.id
            )
            .select("*")
            .single();


        if (result.error) {
          throw result.error;
        }


        const index =
          products.findIndex(
            item =>
              String(item.id) ===
              String(selectedProduct.id)
          );


        if (index >= 0) {

          products[index] =
            result.data;

        }


        selectedProduct =
          result.data;


        renderStats();
        renderProducts();


        showMessage(
          "Perubahan informasi produk berhasil disimpan."
        );


        alert(
          "Perubahan informasi produk berhasil disimpan."
        );

      }
      catch (error) {

        console.error(
          error
        );

        alert(
          error.message ||
          "Perubahan produk gagal disimpan."
        );

      }
      finally {

        button.disabled =
          false;

        button.textContent =
          "Simpan Perubahan";

      }

    }


    document.getElementById(
      "productSearch"
    ).addEventListener(
      "input",
      renderProducts
    );


    document.getElementById(
      "refreshProducts"
    ).addEventListener(
      "click",
      loadData
    );


    document.getElementById(
      "saveProduct"
    ).addEventListener(
      "click",
      saveProduct
    );


    document.getElementById(
      "closeProductModal"
    ).addEventListener(
      "click",
      closeProduct
    );


    document.getElementById(
      "cancelProductEdit"
    ).addEventListener(
      "click",
      closeProduct
    );


    await loadData();

  });

});