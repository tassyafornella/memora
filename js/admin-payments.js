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

    let confirmations = [];


    const PAYMENT_STATUS = [

      [
        "belum_ada_pembayaran",
        "Belum Ada Pembayaran"
      ],

      [
        "dp_diterima",
        "DP Diterima"
      ],

      [
        "sebagian",
        "Pembayaran Sebagian"
      ],

      [
        "lunas",
        "Lunas"
      ]

    ];


    page.innerHTML = `

      <div class="page-head">

        <div>

          <div class="eyebrow">
            TC-16
          </div>

          <h1>
            Payment
          </h1>

          <p>
            Kelola dan perbarui status pembayaran customer.
          </p>

        </div>

        <button
          type="button"
          class="btn"
          id="refreshPayments"
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
            Belum Bayar
          </span>

          <strong id="paymentUnpaid">
            0
          </strong>

        </div>


        <div class="stat-card">

          <span>
            DP / Sebagian
          </span>

          <strong id="paymentPartial">
            0
          </strong>

        </div>


        <div class="stat-card">

          <span>
            Lunas
          </span>

          <strong id="paymentPaid">
            0
          </strong>

        </div>


        <div class="stat-card">

          <span>
            Confirmation
          </span>

          <strong id="paymentConfirmationTotal">
            0
          </strong>

        </div>

      </div>


      <section class="panel">

        <div
          style="
            display:flex;
            justify-content:space-between;
            gap:14px;
            flex-wrap:wrap;
            align-items:center;
            margin-bottom:18px;
          "
        >

          <div>

            <h2 style="margin:0;">
              Order Payment Status
            </h2>

            <p
              style="
                margin:5px 0 0;
                color:#7a837e;
              "
            >
              Pilih status pembayaran lalu simpan.
            </p>

          </div>


          <input
            type="search"
            class="input"
            id="paymentSearch"
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
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody id="paymentOrderRows"></tbody>

          </table>

        </div>

      </section>


      <section
        class="panel"
        style="margin-top:18px;"
      >

        <div class="eyebrow">
          Customer Confirmation
        </div>

        <h2>
          Payment Confirmation
        </h2>

        <p
          style="
            color:#7a837e;
            margin-top:5px;
          "
        >
          Konfirmasi yang dikirim customer akan tampil di sini.
        </p>


        <div
          class="table-wrap"
          style="margin-top:18px;"
        >

          <table>

            <thead>

              <tr>
                <th>Date</th>
                <th>Order</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody id="confirmationRows"></tbody>

          </table>

        </div>

      </section>


      <div
        id="paymentSuccess"
        style="
          display:none;
          position:fixed;
          right:24px;
          bottom:24px;
          z-index:9999;
          max-width:360px;
          padding:14px 17px;
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
          "paymentSuccess"
        );


      box.textContent =
        "Status pembayaran berhasil diperbarui.";


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
        customerResult,
        confirmationResult
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
            .select("*"),

          db
            .from(
              "payment_confirmations"
            )
            .select("*")
            .order(
              "submitted_at",
              {
                ascending:false
              }
            )

        ]);


      if (orderResult.error) {
        throw orderResult.error;
      }


      orders =
        orderResult.data ||
        [];


      customers =
        customerResult.error
          ? []
          : (
              customerResult.data ||
              []
            );


      confirmations =
        confirmationResult.error
          ? []
          : (
              confirmationResult.data ||
              []
            );


      renderStats();
      renderOrders();
      renderConfirmations();

    }


    function renderStats() {

      document.getElementById(
        "paymentUnpaid"
      ).textContent =
        orders.filter(
          item =>
            !item.payment_status ||
            item.payment_status ===
              "belum_ada_pembayaran"
        ).length;


      document.getElementById(
        "paymentPartial"
      ).textContent =
        orders.filter(
          item =>
            [
              "dp_diterima",
              "sebagian"
            ].includes(
              item.payment_status
            )
        ).length;


      document.getElementById(
        "paymentPaid"
      ).textContent =
        orders.filter(
          item =>
            item.payment_status ===
            "lunas"
        ).length;


      document.getElementById(
        "paymentConfirmationTotal"
      ).textContent =
        confirmations.length;

    }


    function renderOrders() {

      const search =
        String(
          document.getElementById(
            "paymentSearch"
          )?.value ||
          ""
        )
          .trim()
          .toLowerCase();


      const filtered =
        orders.filter(order => {

          const customer =
            customerFor(order);


          const haystack =
            `${order.order_number || ""} ${customer?.full_name || ""} ${customer?.name || ""}`
              .toLowerCase();


          return (
            !search ||
            haystack.includes(search)
          );

        });


      document.getElementById(
        "paymentOrderRows"
      ).innerHTML =
        filtered.map(order => {

          const customer =
            customerFor(order);


          const current =
            order.payment_status ||
            "belum_ada_pembayaran";


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
                ${MemoraAdmin.money(
                  order.grand_total
                )}
              </td>

              <td>
                ${MemoraAdmin.money(
                  order.total_paid
                )}
              </td>

              <td>

                <select
                  class="input"
                  data-payment-status="${order.id}"
                  style="min-width:180px;"
                >

                  ${

                    PAYMENT_STATUS.map(
                      item => `

                        <option
                          value="${item[0]}"
                          ${
                            current === item[0]
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
                  data-save-payment="${order.id}"
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
              colspan="6"
              class="empty"
            >
              Tidak ada order.
            </td>

          </tr>

        `;


      document
        .querySelectorAll(
          "[data-save-payment]"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            () => {

              savePaymentStatus(
                button.dataset.savePayment,
                button
              );

            }
          );

        });

    }


    function renderConfirmations() {

      document.getElementById(
        "confirmationRows"
      ).innerHTML =
        confirmations.map(item => {

          const order =
            orders.find(
              data =>
                String(data.id) ===
                String(item.order_id)
            );


          return `

            <tr>

              <td>
                ${MemoraAdmin.date(
                  item.submitted_at
                )}
              </td>

              <td>
                ${escapeHtml(
                  order?.order_number ||
                  "-"
                )}
              </td>

              <td>
                ${MemoraAdmin.money(
                  item.amount
                )}
              </td>

              <td>
                ${escapeHtml(
                  item.payment_method ||
                  "-"
                )}
              </td>

              <td>
                <span class="badge">
                  ${escapeHtml(
                    item.status ||
                    "-"
                  )}
                </span>
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
              Belum ada payment confirmation.
            </td>

          </tr>

        `;

    }


    async function savePaymentStatus(
      orderId,
      button
    ) {

      const select =
        document.querySelector(
          `[data-payment-status="${orderId}"]`
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
              payment_status:
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


        showSuccess();


        alert(
          "Status pembayaran berhasil diperbarui."
        );

      }
      catch (error) {

        console.error(
          error
        );

        alert(
          error.message ||
          "Status pembayaran gagal diperbarui."
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
      "paymentSearch"
    ).addEventListener(
      "input",
      renderOrders
    );


    document.getElementById(
      "refreshPayments"
    ).addEventListener(
      "click",
      loadData
    );


    await loadData();

  });

});