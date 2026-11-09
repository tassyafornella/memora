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
    let gallery = [];


    function esc(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    function getProduct(productId) {

      return products.find(
        function (product) {

          return (
            String(product.id) ===
            String(productId)
          );

        }
      ) || null;

    }


    content.innerHTML = `

      <div>

        <div class="eyebrow">
          Product Gallery
        </div>

        <h1 class="page-title">
          Gallery
        </h1>

        <p class="page-description">
          Kelola gambar katalog produk MEMORA.
        </p>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            Total Foto
          </span>

          <strong id="galleryTotal">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Produk
          </span>

          <strong id="galleryProducts">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Cover
          </span>

          <strong id="galleryCover">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Aktif
          </span>

          <strong id="galleryActive">
            0
          </strong>

        </div>

      </div>


      <div class="gallery-toolbar">

        <input
          type="search"
          class="input"
          id="gallerySearch"
          placeholder="Cari judul atau produk..."
        >


        <select
          class="input"
          id="galleryProductFilter"
        >

          <option value="">
            Semua Produk
          </option>

        </select>

      </div>


      <section class="gallery-add-card">

        <div class="eyebrow">
          Add Image
        </div>

        <h2
          style="
            margin:6px 0 0;
            font-size:18px;
          "
        >
          Tambah Foto Gallery
        </h2>

        <p
          style="
            color:#77807b;
            font-size:12px;
          "
        >
          Gunakan URL gambar yang sudah tersedia di storage atau website.
        </p>


        <form
          class="gallery-form"
          id="galleryForm"
        >

          <div class="gallery-field">

            <label for="galleryProduct">
              Produk
            </label>

            <select
              class="input"
              id="galleryProduct"
              required
            ></select>

          </div>


          <div class="gallery-field">

            <label for="galleryTitle">
              Judul
            </label>

            <input
              type="text"
              class="input"
              id="galleryTitle"
              required
            >

          </div>


          <div class="gallery-field full">

            <label for="galleryUrl">
              Image URL
            </label>

            <input
              type="url"
              class="input"
              id="galleryUrl"
              placeholder="https://..."
              required
            >

          </div>


          <div class="gallery-field">

            <label for="galleryType">
              Tipe
            </label>

            <select
              class="input"
              id="galleryType"
            >

              <option value="catalog">
                Catalog
              </option>

              <option value="detail">
                Detail
              </option>

              <option value="reference">
                Reference
              </option>

            </select>

          </div>


          <div class="gallery-field">

            <label>
              Opsi
            </label>

            <div
              style="
                min-height:46px;
                display:flex;
                align-items:center;
                gap:18px;
                padding:0 12px;
                border:1px solid #d5d8d4;
                border-radius:8px;
              "
            >

              <label
                style="
                  display:flex;
                  align-items:center;
                  gap:7px;
                  font-size:11px;
                "
              >
                <input
                  type="checkbox"
                  id="galleryCoverInput"
                >
                Cover
              </label>

              <label
                style="
                  display:flex;
                  align-items:center;
                  gap:7px;
                  font-size:11px;
                "
              >
                <input
                  type="checkbox"
                  id="galleryActiveInput"
                  checked
                >
                Aktif
              </label>

            </div>

          </div>


          <div class="gallery-field full">

            <button
              type="submit"
              class="gallery-button"
              id="gallerySaveButton"
            >
              Simpan Foto
            </button>

          </div>

        </form>


        <div
          class="gallery-message"
          id="galleryMessage"
        ></div>

      </section>


      <div
        class="gallery-grid"
        id="galleryGrid"
      >

        <div class="gallery-empty">
          Memuat gallery...
        </div>

      </div>

    `;


    const search =
      document.getElementById(
        "gallerySearch"
      );


    const filter =
      document.getElementById(
        "galleryProductFilter"
      );


    const productInput =
      document.getElementById(
        "galleryProduct"
      );


    const message =
      document.getElementById(
        "galleryMessage"
      );


    const saveButton =
      document.getElementById(
        "gallerySaveButton"
      );


    function showMessage(
      text,
      type
    ) {

      message.textContent =
        text;

      message.className =
        "gallery-message " +
        type;

    }


    function renderStats() {

      document.getElementById(
        "galleryTotal"
      ).textContent =
        gallery.length;


      document.getElementById(
        "galleryProducts"
      ).textContent =
        products.length;


      document.getElementById(
        "galleryCover"
      ).textContent =
        gallery.filter(
          function (item) {

            return (
              item.is_cover ===
              true
            );

          }
        ).length;


      document.getElementById(
        "galleryActive"
      ).textContent =
        gallery.filter(
          function (item) {

            return (
              item.is_active !==
              false
            );

          }
        ).length;

    }


    function renderProductOptions() {

      const options =
        products.map(
          function (product) {

            return `

              <option
                value="${product.id}"
              >
                ${esc(
                  product.name ||
                  "Produk"
                )}
              </option>

            `;

          }
        ).join("");


      productInput.innerHTML =
        options;


      filter.innerHTML =
        `

          <option value="">
            Semua Produk
          </option>

        ` +
        options;

    }


    function renderGallery() {

      const keyword =
        String(
          search.value ||
          ""
        )
          .trim()
          .toLowerCase();


      const selectedProduct =
        filter.value;


      const filtered =
        gallery.filter(
          function (item) {

            const product =
              getProduct(
                item.product_id
              );


            const searchable =
              [
                item.title,
                item.image_type,
                product?.name
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const searchMatch =
              !keyword ||
              searchable.includes(
                keyword
              );


            const productMatch =
              !selectedProduct ||
              String(
                item.product_id
              ) ===
              String(
                selectedProduct
              );


            return (
              searchMatch &&
              productMatch
            );

          }
        );


      const grid =
        document.getElementById(
          "galleryGrid"
        );


      if (!filtered.length) {

        grid.innerHTML = `

          <div class="gallery-empty">
            Belum ada foto gallery.
          </div>

        `;

        return;

      }


      grid.innerHTML =
        filtered.map(
          function (item) {

            const product =
              getProduct(
                item.product_id
              );


            return `

              <article class="gallery-card">

                <div class="gallery-image-wrap">

                  <img
                    src="${esc(
                      item.image_url ||
                      ""
                    )}"
                    alt="${esc(
                      item.title ||
                      "Gallery"
                    )}"
                    class="gallery-image"
                    loading="lazy"
                  >

                </div>


                <div class="gallery-card-body">

                  <strong>
                    ${esc(
                      item.title ||
                      "Untitled"
                    )}
                  </strong>

                  <span>
                    ${esc(
                      product?.name ||
                      "Produk"
                    )}
                  </span>

                  <span>
                    ${esc(
                      item.image_type ||
                      "catalog"
                    )}
                  </span>


                  ${
                    item.is_cover
                      ? `
                        <div class="gallery-badge">
                          Cover
                        </div>
                      `
                      : ""
                  }

                </div>

              </article>

            `;

          }
        ).join("");

    }


    async function loadData() {

      try {

        const productResult =
          await db
            .from("products")
            .select(
              "id,name,slug,is_active"
            )
            .order(
              "name",
              {
                ascending:true
              }
            );


        if (
          productResult.error
        ) {

          throw productResult.error;

        }


        products =
          productResult.data ||
          [];


        const galleryResult =
          await db
            .from("product_gallery")
            .select("*")
            .order(
              "created_at",
              {
                ascending:false
              }
            );


        if (
          galleryResult.error
        ) {

          throw galleryResult.error;

        }


        gallery =
          galleryResult.data ||
          [];


        renderProductOptions();
        renderStats();
        renderGallery();

      }
      catch (error) {

        console.error(
          "GALLERY:",
          error
        );


        document.getElementById(
          "galleryGrid"
        ).innerHTML = `

          <div class="gallery-empty">
            Gallery gagal dimuat:
            ${esc(
              error?.message ||
              "Terjadi kesalahan."
            )}
          </div>

        `;

      }

    }


    document
      .getElementById(
        "galleryForm"
      )
      .addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();


          saveButton.disabled =
            true;

          saveButton.textContent =
            "Menyimpan...";


          try {

            const payload = {

              product_id:
                productInput.value,

              title:
                document
                  .getElementById(
                    "galleryTitle"
                  )
                  .value
                  .trim(),

              image_url:
                document
                  .getElementById(
                    "galleryUrl"
                  )
                  .value
                  .trim(),

              image_type:
                document
                  .getElementById(
                    "galleryType"
                  )
                  .value,

              is_cover:
                document
                  .getElementById(
                    "galleryCoverInput"
                  )
                  .checked,

              is_active:
                document
                  .getElementById(
                    "galleryActiveInput"
                  )
                  .checked

            };


            const result =
              await db
                .from(
                  "product_gallery"
                )
                .insert(
                  payload
                )
                .select("*")
                .single();


            if (
              result.error
            ) {

              throw result.error;

            }


            gallery.unshift(
              result.data
            );


            renderStats();
            renderGallery();


            document
              .getElementById(
                "galleryForm"
              )
              .reset();


            document
              .getElementById(
                "galleryActiveInput"
              )
              .checked =
                true;


            showMessage(
              "Foto gallery berhasil disimpan.",
              "success"
            );

          }
          catch (error) {

            console.error(
              "GALLERY INSERT:",
              error
            );


            showMessage(
              error?.message ||
              "Foto gallery gagal disimpan.",
              "error"
            );

          }
          finally {

            saveButton.disabled =
              false;

            saveButton.textContent =
              "Simpan Foto";

          }

        }
      );


    search.addEventListener(
      "input",
      renderGallery
    );


    filter.addEventListener(
      "change",
      renderGallery
    );


    await loadData();

  }
);