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

      const labels = {

        belum_ada_pembayaran:
          "Belum Ada Pembayaran",

        dp_diterima:
          "DP Diterima",

        sebagian:
          "Pembayaran Sebagian",

        lunas:
          "Lunas"

      };


      return (
        labels[value] ||
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
          Invoice Management
        </div>

        <h1 class="page-title">
          Invoices
        </h1>

        <p class="page-description">
          Lihat dan cetak invoice berdasarkan order MEMORA.
        </p>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            Total Invoice
          </span>

          <strong id="invoiceTotal">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Belum Lunas
          </span>

          <strong id="invoiceUnpaid">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Lunas
          </span>

          <strong id="invoicePaid">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Nilai Invoice
          </span>

          <strong
            id="invoiceValue"
            style="font-size:18px;"
          >
            -
          </strong>

        </div>

      </div>


      <div class="invoices-toolbar">

        <input
          type="search"
          class="input"
          id="invoiceSearch"
          placeholder="Cari order atau customer..."
        >


        <select
          class="input"
          id="invoiceFilter"
        >

          <option value="">
            Semua Status
          </option>

          <option value="belum">
            Belum Lunas
          </option>

          <option value="lunas">
            Lunas
          </option>

        </select>

      </div>


      <div class="invoices-card">

        <div class="invoices-table-wrap">

          <table class="invoices-table">

            <thead>

              <tr>

                <th>
                  Invoice
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Nominal
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Aksi
                </th>

              </tr>

            </thead>


            <tbody id="invoiceBody">

              <tr>

                <td
                  colspan="5"
                  class="invoices-empty"
                >
                  Memuat invoice...
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    `;


    const search =
      document.getElementById(
        "invoiceSearch"
      );


    const filter =
      document.getElementById(
        "invoiceFilter"
      );


    function renderStats() {

      document.getElementById(
        "invoiceTotal"
      ).textContent =
        orders.length;


      document.getElementById(
        "invoiceUnpaid"
      ).textContent =
        orders.filter(
          function (order) {

            return (
              order.payment_status !==
              "lunas"
            );

          }
        ).length;


      document.getElementById(
        "invoicePaid"
      ).textContent =
        orders.filter(
          function (order) {

            return (
              order.payment_status ===
              "lunas"
            );

          }
        ).length;


      const total =
        orders.reduce(
          function (
            sum,
            order
          ) {

            return (
              sum +
              Number(
                order.grand_total ||
                0
              )
            );

          },
          0
        );


      document.getElementById(
        "invoiceValue"
      ).textContent =
        MemoraAdmin.money(
          total
        );

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
                customer?.whatsapp
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const searchMatch =
              !keyword ||
              searchable.includes(
                keyword
              );


            let statusMatch =
              true;


            if (
              selected ===
              "lunas"
            ) {

              statusMatch =
                order.payment_status ===
                "lunas";

            }


            if (
              selected ===
              "belum"
            ) {

              statusMatch =
                order.payment_status !==
                "lunas";

            }


            return (
              searchMatch &&
              statusMatch
            );

          }
        );


      const tbody =
        document.getElementById(
          "invoiceBody"
        );


      if (!filtered.length) {

        tbody.innerHTML = `

          <tr>

            <td
              colspan="5"
              class="invoices-empty"
            >
              Tidak ada invoice.
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


            const paid =
              order.payment_status ===
              "lunas";


            const invoiceNumber =
              "INV-" +
              (
                order.order_number ||
                String(order.id)
                  .slice(0,8)
              );


            return `

              <tr>

                <td>

                  <div class="invoice-order-number">

                    ${esc(
                      invoiceNumber
                    )}

                  </div>

                  <div
                    style="
                      margin-top:3px;
                      color:#858c88;
                      font-size:10px;
                    "
                  >
                    ${esc(
                      order.order_number ||
                      "-"
                    )}
                  </div>

                </td>


                <td>

                  <div class="invoice-customer">

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

                  <strong>
                    ${MemoraAdmin.money(
                      order.grand_total
                    )}
                  </strong>

                </td>


                <td>

                  <span
                    class="invoice-status ${
                      paid
                        ? "paid"
                        : ""
                    }"
                  >
                    ${esc(
                      paymentLabel(
                        order.payment_status
                      )
                    )}
                  </span>

                </td>


                <td>

                  <a
                    href="/studio/invoice-print/?id=${encodeURIComponent(
                      order.id
                    )}"
                    class="invoice-open-button"
                  >
                    Buka Invoice
                  </a>

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
          "INVOICES:",
          error
        );


        document.getElementById(
          "invoiceBody"
        ).innerHTML = `

          <tr>

            <td
              colspan="5"
              class="invoices-empty"
            >
              Invoice gagal dimuat.
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