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


    let orders = [];
    let customers = [];


    const ORDER_LABELS = {

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


    const PAYMENT_LABELS = {

      belum_ada_pembayaran:
        "Belum Ada Pembayaran",

      menunggu_verifikasi:
        "Menunggu Verifikasi",

      dp:
        "DP",

      dp_diterima:
        "DP Diterima",

      sebagian:
        "Sebagian",

      lunas:
        "Lunas"

    };


    function esc(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    function getCustomer(order) {

      return customers.find(
        function (customer) {

          return (
            String(customer.id) ===
            String(order.customer_id)
          );

        }
      ) || null;

    }


    function orderLabel(value) {

      return (
        ORDER_LABELS[value] ||
        String(value || "-")
          .replaceAll("_", " ")
      );

    }


    function paymentLabel(value) {

      return (
        PAYMENT_LABELS[value] ||
        String(
          value ||
          "belum_ada_pembayaran"
        )
          .replaceAll("_", " ")
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


    function activeOrders() {

      return orders.filter(
        function (order) {

          return (
            order.is_archived !== true &&
            order.status !== "selesai" &&
            order.status !== "dibatalkan"
          );

        }
      );

    }


    content.innerHTML = `

      <div>

        <div class="eyebrow">
          Order Management
        </div>

        <h1 class="page-title">
          Orders
        </h1>

        <p class="page-description">
          Kelola pesanan aktif customer MEMORA.
        </p>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            Semua Order Aktif
          </span>

          <strong id="orderTotal">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Menunggu Konfirmasi
          </span>

          <strong id="orderWaiting">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Diproses
          </span>

          <strong id="orderProcess">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Production
          </span>

          <strong id="orderProduction">
            0
          </strong>

        </div>

      </div>


      <div class="orders-toolbar">

        <input
          type="search"
          class="input"
          id="orderSearch"
          placeholder="Cari order atau customer..."
        >


        <select
          class="input"
          id="orderStatusFilter"
        >

          <option value="">
            Semua Status Aktif
          </option>

          <option value="menunggu_konfirmasi">
            Menunggu Konfirmasi
          </option>

          <option value="data_belum_lengkap">
            Data Belum Lengkap
          </option>

          <option value="data_lengkap">
            Data Lengkap
          </option>

          <option value="desain">
            Desain
          </option>

          <option value="menunggu_approval">
            Menunggu Approval
          </option>

          <option value="revisi">
            Revisi
          </option>

          <option value="approved">
            Approved
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

        </select>

      </div>


      <div class="orders-card">

        <div class="orders-table-wrap">

          <table class="orders-table">

            <thead>

              <tr>

                <th>
                  Order
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Tanggal
                </th>

                <th>
                  Total
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody id="ordersBody">

              <tr>

                <td
                  colspan="6"
                  class="orders-empty"
                >
                  Memuat order...
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    `;


    const search =
      document.getElementById(
        "orderSearch"
      );


    const statusFilter =
      document.getElementById(
        "orderStatusFilter"
      );


    function renderStats() {

      const active =
        activeOrders();


      document.getElementById(
        "orderTotal"
      ).textContent =
        active.length;


      document.getElementById(
        "orderWaiting"
      ).textContent =
        active.filter(
          function (order) {

            return (
              order.status ===
              "menunggu_konfirmasi"
            );

          }
        ).length;


      document.getElementById(
        "orderProcess"
      ).textContent =
        active.filter(
          function (order) {

            return [
              "data_belum_lengkap",
              "data_lengkap",
              "desain",
              "menunggu_approval",
              "revisi",
              "approved"
            ].includes(
              order.status
            );

          }
        ).length;


      document.getElementById(
        "orderProduction"
      ).textContent =
        active.filter(
          function (order) {

            return [
              "printing",
              "finishing",
              "quality_check",
              "packing",
              "dikirim"
            ].includes(
              order.status
            );

          }
        ).length;

    }


    function renderOrders() {

      const keyword =
        String(
          search.value ||
          ""
        )
          .trim()
          .toLowerCase();


      const selectedStatus =
        statusFilter.value;


      const filtered =
        activeOrders().filter(
          function (order) {

            const customer =
              getCustomer(order);


            const searchable =
              [
                order.order_number,
                customer?.full_name,
                customer?.name,
                customer?.whatsapp,
                customer?.email
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const searchMatch =
              !keyword ||
              searchable.includes(
                keyword
              );


            const statusMatch =
              !selectedStatus ||
              order.status ===
                selectedStatus;


            return (
              searchMatch &&
              statusMatch
            );

          }
        );


      const tbody =
        document.getElementById(
          "ordersBody"
        );


      if (!filtered.length) {

        tbody.innerHTML = `

          <tr>

            <td
              colspan="6"
              class="orders-empty"
            >
              Tidak ada order aktif.
            </td>

          </tr>

        `;

        return;

      }


      tbody.innerHTML =
        filtered.map(
          function (order) {

            const customer =
              getCustomer(order);


            return `

              <tr
                data-order-id="${order.id}"
                style="cursor:pointer;"
              >

                <td>

                  <strong class="order-number">
                    ${esc(
                      order.order_number ||
                      "-"
                    )}
                  </strong>

                </td>


                <td>

                  <div class="order-customer">

                    <strong>
                      ${esc(
                        customer?.full_name ||
                        customer?.name ||
                        "Customer"
                      )}
                    </strong>

                    <span>
                      ${esc(
                        customer?.whatsapp ||
                        customer?.email ||
                        "-"
                      )}
                    </span>

                  </div>

                </td>


                <td>
                  ${formatDate(
                    order.created_at
                  )}
                </td>


                <td>

                  <strong>
                    ${MemoraAdmin.money(
                      order.grand_total
                    )}
                  </strong>

                </td>


                <td>

                  <span class="order-payment">

                    ${esc(
                      paymentLabel(
                        order.payment_status
                      )
                    )}

                  </span>

                </td>


                <td>

                  <span class="order-status">

                    ${esc(
                      orderLabel(
                        order.status
                      )
                    )}

                  </span>

                </td>

              </tr>

            `;

          }
        ).join("");


      document
        .querySelectorAll(
          "[data-order-id]"
        )
        .forEach(
          function (row) {

            row.addEventListener(
              "click",
              function () {

                window.location.href =
                  "/studio/order-detail/?id=" +
                  encodeURIComponent(
                    row.dataset.orderId
                  );

              }
            );

          }
        );

    }


    async function loadData() {

      try {

        const orderResult =
          await db
            .from("orders")
            .select(
              "id,order_number,customer_id,status,payment_status,grand_total,total_paid,remaining_amount,is_archived,created_at"
            )
            .order(
              "created_at",
              {
                ascending:false
              }
            );


        if (
          orderResult.error
        ) {

          throw orderResult.error;

        }


        orders =
          orderResult.data ||
          [];


        const customerResult =
          await db
            .from("customers")
            .select("*");


        customers =
          customerResult.error
            ? []
            : (
                customerResult.data ||
                []
              );


        renderStats();
        renderOrders();

      }
      catch (error) {

        console.error(
          "ORDERS:",
          error
        );


        document.getElementById(
          "ordersBody"
        ).innerHTML = `

          <tr>

            <td
              colspan="6"
              class="orders-empty"
            >
              Order gagal dimuat.

              <br><br>

              ${esc(
                error?.message ||
                "Terjadi kesalahan."
              )}
            </td>

          </tr>

        `;

      }

    }


    search.addEventListener(
      "input",
      renderOrders
    );


    statusFilter.addEventListener(
      "change",
      renderOrders
    );


    await loadData();

  }
);