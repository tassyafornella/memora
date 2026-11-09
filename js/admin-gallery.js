document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db =
      MemoraAdmin.db;

    const page =
      document.getElementById(
        "adminPage"
      );


    page.innerHTML = `

      <div class="page-head">

        <div>

          <div class="eyebrow">
            Catalog Media
          </div>

          <h1>
            Gallery
          </h1>

          <p>
            Kelola cover dan foto variant produk.
          </p>

        </div>

      </div>


      <section class="panel">

        <div class="panel-head">
          <h2>Upload Image</h2>
        </div>

        <div class="panel-body">

          <div class="upload-box">

            <div class="form-grid-2">

              <div class="field">

                <label>
                  Product
                </label>

                <select id="galleryProduct"></select>

              </div>


              <div class="field">

                <label>
                  Variant
                </label>

                <select id="galleryVariant">

                  <option value="">
                    No Variant
                  </option>

                </select>

              </div>

            </div>


            <div class="form-grid-2">

              <div class="field">

                <label>
                  Image Type
                </label>

                <select id="galleryType">

                  <option value="gallery">
                    Gallery
                  </option>

                  <option value="variant">
                    Variant
                  </option>

                  <option value="cover">
                    Cover
                  </option>

                </select>

              </div>


              <div class="field">

                <label>
                  Title
                </label>

                <input
                  id="galleryTitle"
                  placeholder="Optional title"
                >

              </div>

            </div>


            <div class="field">

              <label>
                Image File
              </label>

              <input
                id="galleryFile"
                type="file"
                accept="image/*"
              >

            </div>


            <button
              class="btn btn-primary"
              id="uploadGallery"
              type="button"
            >
              Upload Image
            </button>

          </div>

        </div>

      </section>


      <div style="height:18px"></div>


      <div
        class="gallery-grid"
        id="galleryGrid"
      ></div>
    `;


    const [
      productResult,
      variantResult,
      galleryResult
    ] =
      await Promise.all([

        db
          .from("products")
          .select("*")
          .order("slug"),

        db
          .from("product_variants")
          .select("*")
          .order("name"),

        db
          .from("product_gallery")
          .select("*")
          .order(
            "created_at",
            {
              ascending:false
            }
          )

      ]);


    if (productResult.error) {
      throw productResult.error;
    }

    if (variantResult.error) {
      throw variantResult.error;
    }

    if (galleryResult.error) {
      throw galleryResult.error;
    }


    const products =
      productResult.data || [];


    const variants =
      variantResult.data || [];


    const gallery =
      galleryResult.data || [];


    const productSelect =
      document.getElementById(
        "galleryProduct"
      );


    const variantSelect =
      document.getElementById(
        "galleryVariant"
      );


    productSelect.innerHTML =
      products.map(item => `

        <option value="${item.id}">
          ${
            MemoraAdmin.escapeHtml(
              item.name ||
              item.slug ||
              item.id
            )
          }
        </option>

      `).join("");


    function refreshVariants() {

      const productId =
        productSelect.value;


      variantSelect.innerHTML =
        `
          <option value="">
            No Variant
          </option>
        ` +
        variants
          .filter(
            item =>
              String(
                item.product_id
              ) ===
              String(
                productId
              )
          )
          .map(item => `

            <option value="${item.id}">
              ${
                MemoraAdmin.escapeHtml(
                  item.name ||
                  item.code ||
                  item.id
                )
              }
            </option>

          `)
          .join("");

    }


    productSelect.addEventListener(
      "change",
      refreshVariants
    );


    refreshVariants();


    function productName(id) {

      const product =
        products.find(
          item =>
            String(item.id) ===
            String(id)
        );


      return (
        product?.name ||
        product?.slug ||
        "-"
      );

    }


    function render() {

      document.getElementById(
        "galleryGrid"
      ).innerHTML =
        gallery.map(item => `

          <article class="gallery-card">

            <div class="gallery-image">

              ${
                item.image_url
                  ? `
                      <img
                        src="${MemoraAdmin.escapeHtml(item.image_url)}"
                        alt=""
                      >
                    `
                  : ""
              }

            </div>

            <div class="gallery-info">

              <strong>
                ${
                  MemoraAdmin.escapeHtml(
                    item.title ||
                    productName(
                      item.product_id
                    )
                  )
                }
              </strong>

              <span>
                ${
                  MemoraAdmin.escapeHtml(
                    item.image_type ||
                    "gallery"
                  )
                }
              </span>

              ${
                item.is_cover
                  ? `
                      <span>
                        Cover Image
                      </span>
                    `
                  : ""
              }

            </div>

            <div class="gallery-actions">

              <button
                class="btn"
                data-cover="${item.id}"
                type="button"
              >
                Set Cover
              </button>

              <button
                class="btn btn-danger"
                data-delete="${item.id}"
                type="button"
              >
                Delete
              </button>

            </div>

          </article>

        `).join("") ||

        `
          <div class="panel">
            <div class="empty">
              Gallery masih kosong.
            </div>
          </div>
        `;


      document
        .querySelectorAll(
          "[data-cover]"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            async () => {

              const id =
                button.dataset.cover;


              const item =
                gallery.find(
                  x => x.id === id
                );


              if (!item) {
                return;
              }


              await db
                .from(
                  "product_gallery"
                )
                .update({
                  is_cover:false
                })
                .eq(
                  "product_id",
                  item.product_id
                );


              const result =
                await db
                  .from(
                    "product_gallery"
                  )
                  .update({
                    is_cover:true,
                    image_type:"cover",
                    is_active:true
                  })
                  .eq(
                    "id",
                    id
                  );


              if (result.error) {

                alert(
                  result.error.message
                );

                return;
              }


              window.location.reload();

            }
          );

        });


      document
        .querySelectorAll(
          "[data-delete]"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            async () => {

              const id =
                button.dataset.delete;


              const item =
                gallery.find(
                  x => x.id === id
                );


              if (
                !item ||
                !confirm(
                  "Hapus foto ini?"
                )
              ) {
                return;
              }


              if (
                item.storage_path
              ) {

                const storageResult =
                  await db.storage
                    .from(
                      "product-gallery"
                    )
                    .remove([
                      item.storage_path
                    ]);


                if (
                  storageResult.error
                ) {

                  console.warn(
                    storageResult.error
                  );

                }

              }


              const deleteResult =
                await db
                  .from(
                    "product_gallery"
                  )
                  .delete()
                  .eq(
                    "id",
                    id
                  );


              if (
                deleteResult.error
              ) {

                alert(
                  deleteResult.error.message
                );

                return;
              }


              window.location.reload();

            }
          );

        });

    }


    render();


    document
      .getElementById(
        "uploadGallery"
      )
      .addEventListener(
        "click",
        async () => {

          const file =
            document.getElementById(
              "galleryFile"
            ).files[0];


          if (!file) {

            alert(
              "Pilih file gambar."
            );

            return;
          }


          const productId =
            productSelect.value;


          const variantId =
            variantSelect.value ||
            null;


          const title =
            document.getElementById(
              "galleryTitle"
            ).value.trim();


          const type =
            document.getElementById(
              "galleryType"
            ).value;


          const extension =
            (
              file.name
                .split(".")
                .pop() ||
              "jpg"
            )
              .toLowerCase();


          const storagePath =
            `${productId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;


          const upload =
            await db.storage
              .from(
                "product-gallery"
              )
              .upload(
                storagePath,
                file,
                {
                  upsert:false
                }
              );


          if (upload.error) {

            alert(
              upload.error.message
            );

            return;
          }


          const publicUrl =
            db.storage
              .from(
                "product-gallery"
              )
              .getPublicUrl(
                storagePath
              )
              .data
              .publicUrl;


          if (
            type === "cover"
          ) {

            await db
              .from(
                "product_gallery"
              )
              .update({
                is_cover:false
              })
              .eq(
                "product_id",
                productId
              );

          }


          const insertResult =
            await db
              .from(
                "product_gallery"
              )
              .insert({

                product_id:
                  productId,

                variant_id:
                  variantId,

                title:
                  title || null,

                image_url:
                  publicUrl,

                storage_path:
                  storagePath,

                image_type:
                  type,

                is_cover:
                  type === "cover",

                is_active:
                  true

              });


          if (
            insertResult.error
          ) {

            await db.storage
              .from(
                "product-gallery"
              )
              .remove([
                storagePath
              ]);


            alert(
              insertResult.error.message
            );

            return;
          }


          window.location.reload();

        }
      );

  });

});