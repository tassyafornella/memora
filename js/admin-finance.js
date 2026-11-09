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


    const PAYMENT_LABELS = {

      belum_ada_pembayaran:
        "Belum Ada Pembayaran",

      dp_diterima:
        "DP Diterima",

      sebagian:
        "Pembayaran Sebagian",

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


    content.innerHTML = `

      <div>

        <div class="eyebrow">
          Financial Overview
        </div>

        <h1 class="page-title">
          Finance
        </h1>

        <p class="page-description">
          Pantau nilai order, pembayaran masuk, dan sisa pembayaran customer.
        </p>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            Total Order Value
          </span>

          <strong
            id="financeGrandTotal"
            style="font-size:18px;"
          >
            -
          </strong>

        </div>


        <div class="stat">

          <span>
            Sudah Dibayar
          </span>

          <strong
            id="financePaid"
            style="font-size:18px;"
          >
            -
          </strong>

        </div>


        <div class="stat">

          <span>
            Sisa Pembayaran
          </span>

          <strong
            id="financeRemaining"
            style="font-size:18px;"
          >
            -
          </strong>

        </div>


        <div class="stat">

          <span>
            Order Lunas
          </span>

          <strong id="financePaidOrders">
            -
          </strong>

        </div>

      </div>


      <div class="finance-toolbar">

        <input
          type="search"
          class="input"
          id="financeSearch"
          placeholder="Cari order atau customer..."
        >


        <select
          class="input"
          id="financeFilter"
        >

          <option value="">
            Semua Pembayaran
          </option>

          <option value="belum_ada_pembayaran">
            Belum Ada Pembayaran
          </option>

          <option value="dp_diterima">
            DP Diterima
          </option>

          <option value="sebagian">
            Pembayaran Sebagian
          </option>

          <option value="lunas">
            Lunas
          </option>

        </select>

      </div>


      <div class="finance-card">

        <div class="finance-table-wrap">

          <table class="finance-table">

            <thead>

              <tr>

                <th>
                  Order
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Grand Total
                </th>

                <th>
                  Dibayar
                </th>

                <th>
                  Sisa
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody id="financeBody">

              <tr>

                <td
                  colspan="6"
                  class="finance-empty"
                >
                  Memuat finance...
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    `;


    const search =
      document.getElementById(
        "financeSearch"
      );


    const filter =
      document.getElementById(
        "financeFilter"
      );


    function orderGrandTotal(order) {

      return Number(
        order.grand_total ||
        0
      );

    }


    function orderPaid(order) {

      return Number(
        order.total_paid ||
        0
      );

    }


    function orderRemaining(order) {

      if (
        order.remaining_amount !==
        null &&
        order.remaining_amount !==
        undefined
      ) {

        return Number(
          order.remaining_amount ||
          0
        );

      }


      return Math.max(
        orderGrandTotal(order) -
        orderPaid(order),
        0
      );

    }


    function renderStats() {

      const grandTotal =
        orders.reduce(
          function (
            total,
            order
          ) {

            return (
              total +
              orderGrandTotal(order)
            );

          },
          0
        );


      const paid =
        orders.reduce(
          function (
            total,
            order
          ) {

            return (
              total +
              orderPaid(order)
            );

          },
          0
        );


      const remaining =
        orders.reduce(
          function (
            total,
            order
          ) {

            return (
              total +
              orderRemaining(order)
            );

          },
          0
        );


      const paidOrders =
        orders.filter(
          function (order) {

            return (
              order.payment_status ===
              "lunas"
            );

          }
        ).length;


      document.getElementById(
        "financeGrandTotal"
      ).textContent =
        MemoraAdmin.money(
          grandTotal
        );


      document.getElementById(
        "financePaid"
      ).textContent =
        MemoraAdmin.money(
          paid
        );


      document.getElementById(
        "financeRemaining"
      ).textContent =
        MemoraAdmin.money(
          remaining
        );


      document.getElementById(
        "financePaidOrders"
      ).textContent =
        paidOrders;

    }


    function renderTable() {

      const keyword =
        String(
          search.value ||
          ""
        )
          .trim()
          .toLowerCase();


      const selected =
        filter.value;


      const filtered =
        orders.filter(
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


            const keywordMatch =
              !keyword ||
              searchable.includes(
                keyword
              );


            const currentStatus =
              order.payment_status ||
              "belum_ada_pembayaran";


            const statusMatch =
              !selected ||
              currentStatus ===
              selected;


            return (
              keywordMatch &&
              statusMatch
            );

          }
        );


      const tbody =
        document.getElementById(
          "financeBody"
        );


      if (!filtered.length) {

        tbody.innerHTML = `

          <tr>

            <td
              colspan="6"
              class="finance-empty"
            >
              Tidak ada data finance.
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


            const remaining =
              orderRemaining(order);


            const paymentStatus =
              order.payment_status ||
              "belum_ada_pembayaran";


            return `

              <tr>

                <td>

                  <a
                    href="/studio/order-detail/?id=${encodeURIComponent(
                      order.id
                    )}"
                    class="finance-order"
                  >
                    ${esc(
                      order.order_number ||
                      "-"
                    )}
                  </a>

                </td>


                <td>

                  <div class="finance-customer">

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
                  ${MemoraAdmin.money(
                    orderGrandTotal(
                      order
                    )
                  )}
                </td>


                <td>
                  ${MemoraAdmin.money(
                    orderPaid(
                      order
                    )
                  )}
                </td>


                <td>

                  <span
                    class="finance-balance ${
                      remaining <= 0
                        ? "zero"
                        : ""
                    }"
                  >
                    ${MemoraAdmin.money(
                      remaining
                    )}
                  </span>

                </td>


                <td>

                  <span
                    class="finance-status ${
                      paymentStatus ===
                      "lunas"
                        ? "paid"
                        : ""
                    }"
                  >
                    ${esc(
                      paymentLabel(
                        paymentStatus
                      )
                    )}
                  </span>

                </td>

              </tr>

            `;

          }
        ).join("");

    }


    async function loadData() {

      try {

        const orderResult =
          await db
            .from("orders")
            .select(
              "id,order_number,customer_id,grand_total,total_paid,remaining_amount,payment_status,status,created_at"
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
        renderTable();

      }
      catch (error) {

        console.error(
          "FINANCE:",
          error
        );


        document.getElementById(
          "financeBody"
        ).innerHTML = `

          <tr>

            <td
              colspan="6"
              class="finance-empty"
            >
              Finance gagal dimuat.
            </td>

          </tr>

        `;

      }

    }


    search.addEventListener(
      "input",
      renderTable
    );


    filter.addEventListener(
      "change",
      renderTable
    );


    await loadData();

  }
);