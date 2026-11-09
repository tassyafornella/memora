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
            Catalog
          </div>

          <h1>
            Products
          </h1>

          <p>
            Produk dan variant yang digunakan MEMORA.
          </p>

        </div>

      </div>


      <section class="panel">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Product</th>
                <th>Slug</th>
                <th>Variants</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody id="productRows"></tbody>

          </table>

        </div>

      </section>
    `;


    const [
      productResult,
      variantResult
    ] =
      await Promise.all([

        db
          .from("products")
          .select("*")
          .order("slug"),

        db
          .from("product_variants")
          .select("*")
          .order("name")

      ]);


    if (productResult.error) {
      throw productResult.error;
    }


    if (variantResult.error) {
      throw variantResult.error;
    }


    const products =
      productResult.data || [];


    const variants =
      variantResult.data || [];


    document.getElementById(
      "productRows"
    ).innerHTML =
      products.map(item => {

        const productVariants =
          variants.filter(
            variant =>
              String(
                variant.product_id
              ) ===
              String(
                item.id
              )
          );


        return `

          <tr>

            <td>

              <strong>
                ${
                  MemoraAdmin.escapeHtml(
                    item.name ||
                    item.title ||
                    item.slug ||
                    "-"
                  )
                }
              </strong>

            </td>

            <td>
              ${
                MemoraAdmin.escapeHtml(
                  item.slug ||
                  "-"
                )
              }
            </td>

            <td>
              ${
                productVariants.length
                  ? productVariants
                      .map(
                        variant =>
                          MemoraAdmin.escapeHtml(
                            variant.name ||
                            variant.code ||
                            "-"
                          )
                      )
                      .join(", ")
                  : "-"
              }
            </td>

            <td>

              ${
                (
                  item.is_active ??
                  item.active ??
                  true
                )
                  ? `
                      <span class="badge">
                        Active
                      </span>
                    `
                  : `
                      <span class="badge red">
                        Inactive
                      </span>
                    `
              }

            </td>

          </tr>

        `;

      }).join("") ||

      `
        <tr>
          <td
            colspan="4"
            class="empty"
          >
            Tidak ada produk.
          </td>
        </tr>
      `;

  });

});