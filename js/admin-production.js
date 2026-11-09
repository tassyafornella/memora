document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db =
      MemoraAdmin.db;

    const page =
      document.getElementById(
        "adminPage"
      );


    let orders = [];

    let customers = [];


    const PRODUCTION_STATUS = [

      [
        "desain",
        "Desain"
      ],

      [
        "menunggu_approval",
        "Menunggu Approval"
      ],

      [
        "revisi",
        "Revisi"
      ],

      [
        "approved",
        "Approved"
      ],

      [
        "printing",
        "Printing"
      ],

      [
        "finishing",
        "Finishing"
      ],

      [
        "quality_check",
        "Quality Check"
      ],

      [
        "packing",
        "Packing"
      ],

      [
        "dikirim",
        "Dikirim"
      ],

      [
        "selesai",
        "Selesai"
      ]

    ];


    const PRODUCTION_KEYS =
      PRODUCTION_STATUS.map(
        item => item[0]
      );


    page.innerHTML = `

      <div class="page-head">

        <div>

          <div class="eyebrow">
            TC-17
          </div>

          <h1>
            Production
          </h1>

          <p>
            Kelola proses produksi setiap pesanan.
          </p>

        </div>


        <button
          type="button"
          class="btn"
          id="refreshProduction"
        >
          Refresh
        </button>

      </div>


      <div
        class="stats-grid"
        style="margin-bottom:18px;"
      >

        <div class="stat-card">

          <span>
            Design
          </span>

          <strong id="productionDesign">
            0
          </strong>

        </div>


        <div class="stat-card">

          <span>
            Printing
          </span>

          <strong id="productionPrinting">
            0
          </strong>

        </div>


        <div class="stat-card">

          <span>
            Finishing / QC
          </span>

          <strong id="productionFinishing">
            0
          </strong>

        </div>


        <div class="stat-card">

          <span>
            Packing
          </span>

          <strong id="productionPacking">
            0
          </strong>

        </div>

      </div>


      <section class="panel">

        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            flex-wrap:wrap;
            gap:14px;
            margin-bottom:18px;
          "
        >

          <div>

            <h2 style="margin:0;">
              Production Queue
            </h2>

            <p
              style="
                margin:5px 0 0;
                color:#7a837e;
              "
            >
              Update status sesuai proses produksi.
            </p>

          </div>


          <input
            type="search"
            id="productionSearch"
            class="input"
            placeholder="Cari order/customer..."
            style="max-width:280px;"
          >

        </div>


        <div class="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Current Status</th>
                <th>Production Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody id="productionRows"></tbody>

          </table>

        </div>

      </section>


      <div
        id="productionSuccess"
        style="
          display:none;
          position:fixed;
          right:24px;
          bottom:24px;
          z-index:9999;
          padding:14px 18px;
          max-width:380px;
          border-radius:12px;
          background:#315844;
          color:#fff;
          font-weight:600;
          box-shadow:0 14px 35px rgba(0,0,0,.18);
        "
      ></div>

    `;


    function escapeHtml(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    function customerFor(order) {

      return customers.find(
        item =>
          String(item.id) ===
          String(order.customer_id)
      ) || null;

    }


    function showSuccess() {

      const box =
        document.getElementById(
          "productionSuccess"
        );


      box.textContent =
        "Status produksi berhasil diperbarui.";


      box.style.display =
        "block";


      setTimeout(
        () => {

          box.style.display =
            "none";

        },
        3500
      );

    }


    async function loadData() {

      const [
        orderResult,
        customerResult
      ] =
        await Promise.all([

          db
            .from("orders")
            .select("*")
            .order(
              "created_at",
              {
                ascending:false
              }
            ),

          db
            .from("customers")
            .select("*")

        ]);


      if (orderResult.error) {
        throw orderResult.error;
      }


      orders =
        (
          orderResult.data ||
          []
        ).filter(order =>

          PRODUCTION_KEYS.includes(
            order.status
          )

          ||

          [
            "data_lengkap",
            "menunggu_konfirmasi"
          ].includes(
            order.status
          )

        );


      customers =
        customerResult.error
          ? []
          : (
              customerResult.data ||
              []
            );


      renderStats();
      renderRows();

    }


    function renderStats() {

      document.getElementById(
        "productionDesign"
      ).textContent =
        orders.filter(
          item =>
            [
              "desain",
              "menunggu_approval",
              "revisi",
              "approved"
            ].includes(
              item.status
            )
        ).length;


      document.getElementById(
        "productionPrinting"
      ).textContent =
        orders.filter(
          item =>
            item.status ===
            "printing"
        ).length;


      document.getElementById(
        "productionFinishing"
      ).textContent =
        orders.filter(
          item =>
            [
              "finishing",
              "quality_check"
            ].includes(
              item.status
            )
        ).length;


      document.getElementById(
        "productionPacking"
      ).textContent =
        orders.filter(
          item =>
            item.status ===
            "packing"
        ).length;

    }


    function renderRows() {

      const search =
        String(
          document.getElementById(
            "productionSearch"
          )?.value ||
          ""
        )
          .trim()
          .toLowerCase();


      const filtered =
        orders.filter(order => {

          const customer =
            customerFor(order);


          const value =
            `${order.order_number || ""} ${customer?.full_name || ""} ${customer?.name || ""}`
              .toLowerCase();


          return (
            !search ||
            value.includes(search)
          );

        });


      document.getElementById(
        "productionRows"
      ).innerHTML =
        filtered.map(order => {

          const customer =
            customerFor(order);


          const currentStatus =
            PRODUCTION_KEYS.includes(
              order.status
            )
              ? order.status
              : "desain";


          return `

            <tr>

              <td>

                <strong>
                  ${escapeHtml(
                    order.order_number ||
                    "-"
                  )}
                </strong>

              </td>

              <td>
                ${escapeHtml(
                  customer?.full_name ||
                  customer?.name ||
                  "-"
                )}
              </td>

              <td>

                <span class="badge">
                  ${escapeHtml(
                    MemoraAdmin.statusLabel(
                      order.status
                    )
                  )}
                </span>

              </td>

              <td>

                <select
                  class="input"
                  data-production-status="${order.id}"
                  style="min-width:190px;"
                >

                  ${

                    PRODUCTION_STATUS.map(
                      item => `

                        <option
                          value="${item[0]}"
                          ${
                            currentStatus ===
                            item[0]
                              ? "selected"
                              : ""
                          }
                        >
                          ${item[1]}
                        </option>

                      `
                    ).join("")

                  }

                </select>

              </td>

              <td>

                <button
                  type="button"
                  class="btn btn-primary"
                  data-save-production="${order.id}"
                >
                  Simpan
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
              Belum ada order dalam proses produksi.
            </td>

          </tr>

        `;


      document
        .querySelectorAll(
          "[data-save-production]"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            () => {

              saveProduction(
                button.dataset.saveProduction,
                button
              );

            }
          );

        });

    }


    async function saveProduction(
      orderId,
      button
    ) {

      const select =
        document.querySelector(
          `[data-production-status="${orderId}"]`
        );


      const status =
        select.value;


      button.disabled =
        true;

      button.textContent =
        "Menyimpan...";


      try {

        const result =
          await db
            .from("orders")
            .update({
              status:
                status
            })
            .eq(
              "id",
              orderId
            )
            .select("*")
            .single();


        if (result.error) {
          throw result.error;
        }


        const historyResult =
          await db
            .from(
              "order_status_history"
            )
            .insert({

              order_id:
                orderId,

              status:
                status,

              note:
                "Status produksi diperbarui melalui MEMORA Studio."

            });


        if (historyResult.error) {

          console.warn(
            "Production history:",
            historyResult.error
          );

        }


        const index =
          orders.findIndex(
            item =>
              String(item.id) ===
              String(orderId)
          );


        if (index >= 0) {

          orders[index] =
            result.data;

        }


        renderStats();
        renderRows();


        showSuccess();


        alert(
          "Status produksi berhasil diperbarui."
        );

      }
      catch (error) {

        console.error(
          error
        );

        alert(
          error.message ||
          "Status produksi gagal diperbarui."
        );

      }
      finally {

        button.disabled =
          false;

        button.textContent =
          "Simpan";

      }

    }


    document.getElementById(
      "productionSearch"
    ).addEventListener(
      "input",
      renderRows
    );


    document.getElementById(
      "refreshProduction"
    ).addEventListener(
      "click",
      loadData
    );


    await loadData();

  });

});