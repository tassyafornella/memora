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


    function esc(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    function formatDate(value) {

      if (!value) {
        return "-";
      }


      const date =
        new Date(value);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "-";
      }


      return new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      ).format(date);

    }


    function statusLabel(value) {

      const map = {

        menunggu_konfirmasi:
          "Menunggu Konfirmasi",

        data_belum_lengkap:
          "Data Belum Lengkap",

        data_lengkap:
          "Data Lengkap",

        desain:
          "Desain",

        menunggu_approval:
          "Menunggu Approval",

        revisi:
          "Revisi",

        approved:
          "Approved",

        printing:
          "Printing",

        finishing:
          "Finishing",

        quality_check:
          "Quality Check",

        packing:
          "Packing",

        dikirim:
          "Dikirim",

        selesai:
          "Selesai",

        dibatalkan:
          "Dibatalkan"

      };


      return (
        map[value] ||
        String(value || "-")
          .replaceAll("_", " ")
      );

    }


    content.innerHTML = `

      <div>

        <div class="eyebrow">
          Overview
        </div>

        <h1 class="page-title">
          Dashboard
        </h1>

        <p class="page-description">
          Ringkasan aktivitas MEMORA Studio.
        </p>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            Total Orders
          </span>

          <strong id="dashOrders">
            -
          </strong>

        </div>


        <div class="stat">

          <span>
            Products
          </span>

          <strong id="dashProducts">
            -
          </strong>

        </div>


        <div class="stat">

          <span>
            Belum Bayar
          </span>

          <strong id="dashUnpaid">
            -
          </strong>

        </div>


        <div class="stat">

          <span>
            Production
          </span>

          <strong id="dashProduction">
            -
          </strong>

        </div>

      </div>


      <div class="dashboard-actions">

        <a
          href="/studio/orders/"
          class="dashboard-action"
        >

          <strong>
            Orders
          </strong>

          <span>
            Lihat dan kelola pesanan customer.
          </span>

        </a>


        <a
          href="/studio/products/"
          class="dashboard-action"
        >

          <strong>
            Products
          </strong>

          <span>
            Ubah informasi dan status produk.
          </span>

        </a>


        <a
          href="/studio/payments/"
          class="dashboard-action"
        >

          <strong>
            Payments
          </strong>

          <span>
            Kelola pembayaran setiap order.
          </span>

        </a>


        <a
          href="/studio/production/"
          class="dashboard-action"
        >

          <strong>
            Production
          </strong>

          <span>
            Pantau proses printing hingga selesai.
          </span>

        </a>

      </div>


      <div class="dashboard-grid">


        <section class="panel">

          <div class="eyebrow">
            Recent Orders
          </div>

          <h2>
            Pesanan Terbaru
          </h2>


          <div class="dashboard-table-wrap">

            <table class="dashboard-table">

              <thead>

                <tr>

                  <th>
                    Order
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Tanggal
                  </th>

                </tr>

              </thead>


              <tbody id="dashboardRecentOrders">

                <tr>

                  <td
                    colspan="4"
                    class="dashboard-empty"
                  >
                    Memuat order...
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </section>


        <div>


          <section class="panel">

            <div class="eyebrow">
              Order Value
            </div>

            <h2>
              Nilai Order
            </h2>

            <div
              style="
                margin-top:15px;
                font-size:26px;
                font-weight:700;
                color:#344a3f;
              "
              id="dashValue"
            >
              -
            </div>

            <p>
              Total grand total seluruh order yang tersimpan.
            </p>

          </section>


          <section
            class="panel"
            style="margin-top:18px;"
          >

            <div class="eyebrow">
              QA Project
            </div>

            <h2>
              Test Case Admin
            </h2>


            <div class="qa-list">


              <div class="qa-item">

                <div>

                  <strong>
                    TC-14 Products
                  </strong>

                  <span>
                    Perubahan informasi produk.
                  </span>

                </div>

                <div class="qa-ready">
                  READY
                </div>

              </div>


              <div class="qa-item">

                <div>

                  <strong>
                    TC-15 Orders
                  </strong>

                  <span>
                    Data pesanan diperbarui.
                  </span>

                </div>

                <div class="qa-ready">
                  READY
                </div>

              </div>


              <div class="qa-item">

                <div>

                  <strong>
                    TC-16 Payments
                  </strong>

                  <span>
                    Status pembayaran diperbarui.
                  </span>

                </div>

                <div class="qa-ready">
                  READY
                </div>

              </div>


              <div class="qa-item">

                <div>

                  <strong>
                    TC-17 Production
                  </strong>

                  <span>
                    Status produksi diperbarui.
                  </span>

                </div>

                <div class="qa-ready">
                  READY
                </div>

              </div>


            </div>

          </section>


        </div>


      </div>

    `;


    try {

      const [
        ordersResult,
        productsResult
      ] =
        await Promise.all([

          db
            .from("orders")
            .select(
              "id,order_number,status,payment_status,grand_total,created_at"
            )
            .order(
              "created_at",
              {
                ascending:false
              }
            ),

          db
            .from("products")
            .select(
              "id,is_active"
            )

        ]);


      if (
        ordersResult.error
      ) {

        throw ordersResult.error;

      }


      const orders =
        ordersResult.data ||
        [];


      const products =
        productsResult.error
          ? []
          : (
              productsResult.data ||
              []
            );


      document.getElementById(
        "dashOrders"
      ).textContent =
        orders.length;


      document.getElementById(
        "dashProducts"
      ).textContent =
        products.length;


      const unpaid =
        orders.filter(
          function (order) {

            return (
              !order.payment_status ||
              order.payment_status ===
              "belum_ada_pembayaran"
            );

          }
        ).length;


      document.getElementById(
        "dashUnpaid"
      ).textContent =
        unpaid;


      const production =
        orders.filter(
          function (order) {

            return [
              "printing",
              "finishing",
              "quality_check",
              "packing"
            ].includes(
              order.status
            );

          }
        ).length;


      document.getElementById(
        "dashProduction"
      ).textContent =
        production;


      const value =
        orders.reduce(
          function (
            total,
            order
          ) {

            return (
              total +
              Number(
                order.grand_total ||
                0
              )
            );

          },
          0
        );


      document.getElementById(
        "dashValue"
      ).textContent =
        MemoraAdmin.money(
          value
        );


      const recent =
        orders.slice(
          0,
          6
        );


      const tbody =
        document.getElementById(
          "dashboardRecentOrders"
        );


      if (!recent.length) {

        tbody.innerHTML = `

          <tr>

            <td
              colspan="4"
              class="dashboard-empty"
            >
              Belum ada order.
            </td>

          </tr>

        `;

      }
      else {

        tbody.innerHTML =
          recent.map(
            function (order) {

              return `

                <tr>

                  <td>

                    <a
                      class="dashboard-order-link"
                      href="/studio/order-detail/?id=${encodeURIComponent(
                        order.id
                      )}"
                    >
                      ${esc(
                        order.order_number ||
                        "-"
                      )}
                    </a>

                  </td>


                  <td>

                    <span class="dashboard-badge">

                      ${esc(
                        statusLabel(
                          order.status
                        )
                      )}

                    </span>

                  </td>


                  <td>
                    ${MemoraAdmin.money(
                      order.grand_total
                    )}
                  </td>


                  <td>
                    ${formatDate(
                      order.created_at
                    )}
                  </td>

                </tr>

              `;

            }
          ).join("");

      }

    }
    catch (error) {

      console.error(
        "DASHBOARD:",
        error
      );


      document.getElementById(
        "dashboardRecentOrders"
      ).innerHTML = `

        <tr>

          <td
            colspan="4"
            class="dashboard-empty"
          >
            Dashboard gagal memuat data.
          </td>

        </tr>

      `;

    }

  }
);