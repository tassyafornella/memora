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
            Order Management
          </div>

          <h1>
            Orders
          </h1>

          <p>
            Kelola seluruh pesanan customer MEMORA.
          </p>

        </div>

      </div>


      <div class="toolbar">

        <input
          id="searchOrder"
          placeholder="Cari nomor order..."
        >

        <select id="filterOrder">

          <option value="">
            Semua Status
          </option>

          <option value="menunggu_konfirmasi">
            Menunggu Konfirmasi
          </option>

          <option value="desain">
            Desain
          </option>

          <option value="menunggu_approval">
            Menunggu Approval
          </option>

          <option value="printing">
            Printing
          </option>

          <option value="finishing">
            Finishing
          </option>

          <option value="quality_check">
            Quality Check
          </option>

          <option value="packing">
            Packing
          </option>

          <option value="dikirim">
            Dikirim
          </option>

          <option value="selesai">
            Selesai
          </option>

        </select>

      </div>


      <section class="panel">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  Order
                </th>

                <th>
                  Status
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Total
                </th>

                <th>
                  Tanggal
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody id="orderRows"></tbody>

          </table>

        </div>

      </section>
    `;


    let query =
      db
        .from("orders")
        .select("*")
        .order(
          "created_at",
          {
            ascending:false
          }
        );


    let result =
      await query;


    if (result.error) {
      throw result.error;
    }


    const orders =
      (result.data || [])
        .filter(
          order =>
            order.is_archived !== true
        );


    function render() {

      const search =
        document
          .getElementById(
            "searchOrder"
          )
          .value
          .toLowerCase();


      const filter =
        document
          .getElementById(
            "filterOrder"
          )
          .value;


      const filtered =
        orders.filter(order => {

          const matchSearch =
            String(
              order.order_number ||
              ""
            )
              .toLowerCase()
              .includes(search);


          const matchFilter =
            !filter ||
            order.status === filter;


          return (
            matchSearch &&
            matchFilter
          );

        });


      document.getElementById(
        "orderRows"
      ).innerHTML =
        filtered.map(order => `

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

              <span class="badge">
                ${
                  MemoraAdmin.statusLabel(
                    order.status
                  )
                }
              </span>

            </td>

            <td>
              ${
                MemoraAdmin.statusLabel(
                  order.payment_status
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

              <a
                class="btn"
                href="/studio/order-detail/?id=${order.id}"
              >
                Detail
              </a>

            </td>

          </tr>

        `).join("") ||

        `
          <tr>

            <td
              colspan="6"
              class="empty"
            >
              Tidak ada order.
            </td>

          </tr>
        `;

    }


    document
      .getElementById(
        "searchOrder"
      )
      .addEventListener(
        "input",
        render
      );


    document
      .getElementById(
        "filterOrder"
      )
      .addEventListener(
        "change",
        render
      );


    render();

  });

});