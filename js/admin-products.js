document.addEventListener(
  "DOMContentLoaded",
  async function () {

    const admin =
      await MemoraAdmin.initialize();


    if (!admin) {
      return;
    }


    const db =
      admin.db;


    const content =
      document.getElementById(
        "adminContent"
      );


    let products = [];
    let activeProduct = null;


    function esc(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    content.innerHTML = `

      <div>

        <div class="eyebrow">
          Product Management
        </div>

        <h1 class="page-title">
          Products
        </h1>

        <p class="page-description">
          Kelola informasi produk MEMORA.
        </p>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            Semua Produk
          </span>

          <strong id="productTotal">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Aktif
          </span>

          <strong id="productActive">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Nonaktif
          </span>

          <strong id="productInactive">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            TC-14
          </span>

          <strong style="font-size:15px;">
            Ready
          </strong>

        </div>

      </div>


      <div class="products-toolbar">

        <input
          type="search"
          class="input"
          id="productSearch"
          placeholder="Cari nama produk..."
        >


        <select
          class="input"
          id="productStatusFilter"
        >

          <option value="">
            Semua Status
          </option>

          <option value="active">
            Aktif
          </option>

          <option value="inactive">
            Nonaktif
          </option>

        </select>

      </div>


      <div class="products-card">

        <div class="products-table-wrap">

          <table class="products-table">

            <thead>

              <tr>

                <th>
                  Produk
                </th>

                <th>
                  Slug
                </th>

                <th>
                  Status
                </th>

                <th>
                  Aksi
                </th>

              </tr>

            </thead>


            <tbody id="productsBody">

              <tr>

                <td
                  colspan="4"
                  class="products-empty"
                >
                  Memuat produk...
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>


      <div
        class="product-message"
        id="productMessage"
      ></div>


      <div
        class="product-modal"
        id="productModal"
      >

        <div class="product-modal-card">

          <div class="product-modal-head">

            <h2>
              Edit Produk
            </h2>

            <button
              type="button"
              class="product-modal-close"
              id="closeProductModal"
            >
              ×
            </button>

          </div>


          <form id="productEditForm">

            <div class="product-modal-body">

              <div class="product-edit-field">

                <label for="editProductName">
                  Nama Produk
                </label>

                <input
                  type="text"
                  class="product-edit-input"
                  id="editProductName"
                  required
                >

              </div>


              <div class="product-edit-field">

                <label>
                  Slug
                </label>

                <input
                  type="text"
                  class="product-edit-input"
                  id="editProductSlug"
                  disabled
                >

              </div>


              <div class="product-toggle-row">

                <div>

                  <strong style="font-size:12px;">
                    Produk Aktif
                  </strong>

                  <div
                    style="
                      margin-top:3px;
                      color:#858c88;
                      font-size:10px;
                    "
                  >
                    Produk dapat ditampilkan kepada customer.
                  </div>

                </div>


                <input
                  type="checkbox"
                  id="editProductActive"
                >

              </div>

            </div>


            <div class="product-modal-foot">

              <button
                type="button"
                class="product-cancel-button"
                id="cancelProductEdit"
              >
                Batal
              </button>

              <button
                type="submit"
                class="product-save-button"
                id="saveProductButton"
              >
                Simpan Perubahan
              </button>

            </div>

          </form>

        </div>

      </div>

    `;


    const search =
      document.getElementById(
        "productSearch"
      );


    const filter =
      document.getElementById(
        "productStatusFilter"
      );


    const modal =
      document.getElementById(
        "productModal"
      );


    const form =
      document.getElementById(
        "productEditForm"
      );


    const nameInput =
      document.getElementById(
        "editProductName"
      );


    const slugInput =
      document.getElementById(
        "editProductSlug"
      );


    const activeInput =
      document.getElementById(
        "editProductActive"
      );


    const saveButton =
      document.getElementById(
        "saveProductButton"
      );


    const message =
      document.getElementById(
        "productMessage"
      );


    function showMessage(
      text,
      type
    ) {

      message.textContent =
        text;


      message.className =
        "product-message " +
        type;


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

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
          function (product) {

            return (
              product.is_active !==
              false
            );

          }
        ).length;


      document.getElementById(
        "productInactive"
      ).textContent =
        products.filter(
          function (product) {

            return (
              product.is_active ===
              false
            );

          }
        ).length;

    }


    function renderProducts() {

      const keyword =
        String(
          search.value ||
          ""
        )
          .trim()
          .toLowerCase();


      const status =
        filter.value;


      const filtered =
        products.filter(
          function (product) {

            const searchMatch =
              !keyword ||
              String(
                product.name ||
                ""
              )
                .toLowerCase()
                .includes(
                  keyword
                ) ||
              String(
                product.slug ||
                ""
              )
                .toLowerCase()
                .includes(
                  keyword
                );


            let statusMatch =
              true;


            if (
              status ===
              "active"
            ) {

              statusMatch =
                product.is_active !==
                false;

            }


            if (
              status ===
              "inactive"
            ) {

              statusMatch =
                product.is_active ===
                false;

            }


            return (
              searchMatch &&
              statusMatch
            );

          }
        );


      const tbody =
        document.getElementById(
          "productsBody"
        );


      if (!filtered.length) {

        tbody.innerHTML = `

          <tr>

            <td
              colspan="4"
              class="products-empty"
            >
              Tidak ada produk.
            </td>

          </tr>

        `;

        return;

      }


      tbody.innerHTML =
        filtered.map(
          function (product) {

            const active =
              product.is_active !==
              false;


            return `

              <tr>

                <td>

                  <div class="product-name">
                    ${esc(
                      product.name ||
                      "Produk"
                    )}
                  </div>

                </td>


                <td>

                  <div class="product-slug">
                    ${esc(
                      product.slug ||
                      "-"
                    )}
                  </div>

                </td>


                <td>

                  <span
                    class="product-status ${
                      active
                        ? ""
                        : "inactive"
                    }"
                  >
                    ${
                      active
                        ? "Aktif"
                        : "Nonaktif"
                    }
                  </span>

                </td>


                <td>

                  <button
                    type="button"
                    class="product-edit-button"
                    data-edit-product="${product.id}"
                  >
                    Edit
                  </button>

                </td>

              </tr>

            `;

          }
        ).join("");


      document
        .querySelectorAll(
          "[data-edit-product]"
        )
        .forEach(
          function (button) {

            button.addEventListener(
              "click",
              function () {

                openEdit(
                  button.dataset.editProduct
                );

              }
            );

          }
        );

    }


    function openEdit(productId) {

      activeProduct =
        products.find(
          function (product) {

            return (
              String(product.id) ===
              String(productId)
            );

          }
        );


      if (!activeProduct) {
        return;
      }


      nameInput.value =
        activeProduct.name ||
        "";


      slugInput.value =
        activeProduct.slug ||
        "";


      activeInput.checked =
        activeProduct.is_active !==
        false;


      modal.classList.add(
        "show"
      );

    }


    function closeEdit() {

      modal.classList.remove(
        "show"
      );


      activeProduct =
        null;

    }


    async function loadProducts() {

      try {

        const result =
          await db
            .from("products")
            .select("*")
            .order(
              "name",
              {
                ascending:true
              }
            );


        if (
          result.error
        ) {

          throw result.error;

        }


        products =
          result.data ||
          [];


        renderStats();
        renderProducts();

      }
      catch (error) {

        console.error(
          "PRODUCTS:",
          error
        );


        document.getElementById(
          "productsBody"
        ).innerHTML = `

          <tr>

            <td
              colspan="4"
              class="products-empty"
            >
              Produk gagal dimuat.
            </td>

          </tr>

        `;


        showMessage(
          error?.message ||
          "Produk gagal dimuat.",
          "error"
        );

      }

    }


    form.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();


        if (!activeProduct) {
          return;
        }


        saveButton.disabled =
          true;

        saveButton.textContent =
          "Menyimpan...";


        try {

          const name =
            nameInput.value
              .trim();


          if (!name) {

            throw new Error(
              "Nama produk wajib diisi."
            );

          }


          const result =
            await db
              .from("products")
              .update({

                name:
                  name,

                is_active:
                  activeInput.checked

              })
              .eq(
                "id",
                activeProduct.id
              )
              .select("*")
              .single();


          if (
            result.error
          ) {

            throw result.error;

          }


          const index =
            products.findIndex(
              function (product) {

                return (
                  String(product.id) ===
                  String(activeProduct.id)
                );

              }
            );


          if (
            index >= 0
          ) {

            products[index] =
              result.data;

          }


          closeEdit();


          renderStats();
          renderProducts();


          showMessage(
            "Perubahan informasi produk berhasil disimpan.",
            "success"
          );


          alert(
            "Perubahan informasi produk berhasil disimpan."
          );

        }
        catch (error) {

          console.error(
            "PRODUCT UPDATE:",
            error
          );


          showMessage(
            error?.message ||
            "Perubahan produk gagal disimpan.",
            "error"
          );

        }
        finally {

          saveButton.disabled =
            false;

          saveButton.textContent =
            "Simpan Perubahan";

        }

      }
    );


    search.addEventListener(
      "input",
      renderProducts
    );


    filter.addEventListener(
      "change",
      renderProducts
    );


    document
      .getElementById(
        "closeProductModal"
      )
      .addEventListener(
        "click",
        closeEdit
      );


    document
      .getElementById(
        "cancelProductEdit"
      )
      .addEventListener(
        "click",
        closeEdit
      );


    modal.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          modal
        ) {

          closeEdit();

        }

      }
    );


    await loadProducts();

  }
);