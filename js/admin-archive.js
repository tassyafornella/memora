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
            Archive
          </div>

          <h1>
            Archived Orders
          </h1>

          <p>
            Pesanan yang sudah dipindahkan ke arsip.
          </p>

        </div>

      </div>


      <section class="panel">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Order</th>
                <th>Status</th>
                <th>Total</th>
                <th>Tanggal</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody id="archiveRows"></tbody>

          </table>

        </div>

      </section>
    `;


    const result =
      await db
        .from("orders")
        .select("*")
        .eq(
          "is_archived",
          true
        )
        .order(
          "created_at",
          {
            ascending:false
          }
        );


    if (result.error) {
      throw result.error;
    }


    const orders =
      result.data || [];


    function render() {

      document.getElementById(
        "archiveRows"
      ).innerHTML =
        orders.map(order => `

          <tr>

            <td>
              <strong>
                ${
                  MemoraAdmin.escapeHtml(
                    order.order_number
                  )
                }
              </strong>
            </td>

            <td>
              ${
                MemoraAdmin.statusLabel(
                  order.status
                )
              }
            </td>

            <td>
              ${
                MemoraAdmin.money(
                  order.grand_total
                )
              }
            </td>

            <td>
              ${
                MemoraAdmin.date(
                  order.created_at
                )
              }
            </td>

            <td>

              <button
                class="btn"
                data-restore="${order.id}"
                type="button"
              >
                Restore
              </button>

            </td>

          </tr>

        `).join("") ||

        `
          <tr>

            <td
              colspan="5"
              class="empty"
            >
              Archive masih kosong.
            </td>

          </tr>
        `;


      document
        .querySelectorAll(
          "[data-restore]"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            async () => {

              const id =
                button.dataset.restore;


              const result =
                await db
                  .from("orders")
                  .update({
                    is_archived:false
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


              const index =
                orders.findIndex(
                  x => x.id === id
                );


              if (index >= 0) {
                orders.splice(
                  index,
                  1
                );
              }


              render();

            }
          );

        });

    }


    render();

  });

});