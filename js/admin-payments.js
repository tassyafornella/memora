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
            Kelola status pembayaran customer dan konfirmasi pembayaran.
          </p>

        </div>


        <button
          type="button"
          class="btn"
          id="refreshPayment"
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

          <strong id="statUnpaid">
            0
          </strong>

        </div>


        <div class="stat-card">

          <span>
            DP / Sebagian
          </span>

          <strong id="statPartial">
            0
          </strong>

        </div>


        <div class="stat-card">

          <span>
            Lunas
          </span>

          <strong id="statPaid">
            0
          </strong>

        </div>


        <div class="stat-card">

          <span>
            Confirmation
          </span>

          <strong id="statConfirmation">
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
            gap:14px;
            flex-wrap:wrap;
            margin-bottom:18px;
          "
        >

          <div>

            <h2 style="margin:0;">
              Payment Status
            </h2>

            <p
              style="
                margin:5px 0 0;
                color:#7a837e;
              "
            >
              Ubah status pembayaran pesanan.
            </p>

          </div>


          <input
            type="search"
            id="paymentSearch"
            class="input"
            placeholder="Cari order atau customer..."
            style="max-width:290px;"
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

            <tbody id="paymentRows"></tbody>

          </table>

        </div>

      </section>


      <section
        class="panel"
        style="margin-top:18px;"
      >

        <div class="eyebrow">
          Customer Upload
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
          Bukti pembayaran yang dikirim customer akan tampil di sini.
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
        id="paymentNotice"
        style="
          display:none;
          position:fixed;
          right:24px;
          bottom:24px;
          z-index:9999;
          background:#315844;
          color:#fff;
          padding:14px 18px;
          border-radius:12px;
          box-shadow:0 12px 30px rgba(0,0,0,.18);
          font-weight:600;
        "
      ></div>

    `;


    function esc(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    function findCustomer(order) {

      return customers.find(
        customer =>
          String(customer.id) ===
          String(order.customer_id)
      ) || null;

    }


    function showNotice(message) {

      const box =
        document.getElementById(
          "paymentNotice"
        );

      box.textContent =
        message;

      box.style.display =
        "block";


      setTimeout(
        () => {
          box.style.display =
            "none";
        },
        3000
      );

    }


    async function loadData() {

      const orderResult =
        await db
          .from("orders")
          .select("*")
          .order(
            "created_at",
            {
              ascending:false
            }
          );


      if (orderResult.error) {
        throw orderResult.error;
      }


      orders =
        orderResult.data || [];


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


      const confirmationResult =
        await db
          .from("payment_confirmations")
          .select("*")
          .order(
            "submitted_at",
            {
              ascending:false
            }
          );


      if (confirmationResult.error) {

        console.warn(
          "payment_confirmations:",
          confirmationResult.error
        );

        confirmations =
          [];

      }
      else {

        confirmations =
          confirmationResult.data ||
          [];

      }


      renderStats();
      renderOrders();
      renderConfirmations();

    }


    function renderStats() {

      document.getElementById(
        "statUnpaid"
      ).textContent =
        orders.filter(
          order =>
            !order.payment_status ||
            order.payment_status ===
              "belum_ada_pembayaran"
        ).length;


      document.getElementById(
        "statPartial"
      ).textContent =
        orders.filter(
          order =>
            [
              "dp_diterima",
              "sebagian"
            ].includes(
              order.payment_status
            )
        ).length;


      document.getElementById(
        "statPaid"
      ).textContent =
        orders.filter(
          order =>
            order.payment_status ===
            "lunas"
        ).length;


      document.getElementById(
        "statConfirmation"
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
        orders.filter(
          order => {

            const customer =
              findCustomer(order);


            const text =
              `${order.order_number || ""} ${customer?.full_name || ""} ${customer?.name || ""}`
                .toLowerCase();


            return (
              !search ||
              text.includes(search)
            );

          }
        );


      const tbody =
        document.getElementById(
          "paymentRows"
        );


      tbody.innerHTML =
        filtered.map(order => {

          const customer =
            findCustomer(order);


          const current =
            order.payment_status ||
            "belum_ada_pembayaran";


          return `

            <tr>

              <td>

                <strong>
                  ${esc(
                    order.order_number ||
                    "-"
                  )}
                </strong>

              </td>

              <td>
                ${esc(
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
                    PAYMENT_STATUS
                      .map(
                        option => `

                          <option
                            value="${option[0]}"
                            ${
                              option[0] ===
                              current
                                ? "selected"
                                : ""
                            }
                          >
                            ${option[1]}
                          </option>

                        `
                      )
                      .join("")
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
        .forEach(
          button => {

            button.addEventListener(
              "click",
              () => {

                saveStatus(
                  button.dataset.savePayment,
                  button
                );

              }
            );

          }
        );

    }


    function renderConfirmations() {

      const tbody =
        document.getElementById(
          "confirmationRows"
        );


      tbody.innerHTML =
        confirmations.map(
          confirmation => {

            const order =
              orders.find(
                item =>
                  String(item.id) ===
                  String(confirmation.order_id)
              );


            return `

              <tr>

                <td>
                  ${MemoraAdmin.date(
                    confirmation.submitted_at
                  )}
                </td>

                <td>
                  ${esc(
                    order?.order_number ||
                    "-"
                  )}
                </td>

                <td>
                  ${MemoraAdmin.money(
                    confirmation.amount
                  )}
                </td>

                <td>
                  ${esc(
                    confirmation.payment_method ||
                    "-"
                  )}
                </td>

                <td>

                  <span class="badge">
                    ${esc(
                      confirmation.status ||
                      "-"
                    )}
                  </span>

                </td>

              </tr>

            `;

          }
        ).join("") ||

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


    async function saveStatus(
      orderId,
      button
    ) {

      const select =
        document.querySelector(
          `[data-payment-status="${orderId}"]`
        );


      if (!select) {
        return;
      }


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
            order =>
              String(order.id) ===
              String(orderId)
          );


        if (index >= 0) {

          orders[index] =
            result.data;

        }


        renderStats();


        showNotice(
          "Status pembayaran berhasil diperbarui."
        );


        alert(
          "Status pembayaran berhasil diperbarui."
        );

      }
      catch (error) {

        console.error(
          "Payment update:",
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


    document
      .getElementById(
        "paymentSearch"
      )
      .addEventListener(
        "input",
        renderOrders
      );


    document
      .getElementById(
        "refreshPayment"
      )
      .addEventListener(
        "click",
        async () => {

          try {

            await loadData();

          }
          catch (error) {

            console.error(error);

            alert(
              error.message ||
              "Payment gagal dimuat."
            );

          }

        }
      );


    try {

      await loadData();

    }
    catch (error) {

      console.error(
        "MEMORA Payment:",
        error
      );


      page.innerHTML += `

        <section
          class="panel"
          style="
            margin-top:18px;
            border-color:#e4b8b8;
          "
        >

          <strong>
            Payment gagal dimuat
          </strong>

          <p>
            ${esc(
              error.message ||
              "Terjadi kesalahan."
            )}
          </p>

        </section>

      `;

    }

  });

});