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


    function statusLabel(value) {

      const labels = {

        selesai:
          "Selesai",

        dibatalkan:
          "Dibatalkan"

      };


      return (
        labels[value] ||
        String(value || "-")
          .replaceAll("_", " ")
      );

    }


    function archivedOrders() {

      return orders.filter(
        function (order) {

          return (
            order.is_archived === true ||
            order.status === "selesai" ||
            order.status === "dibatalkan"
          );

        }
      );

    }


    content.innerHTML = `

      <div>

        <div class="eyebrow">
          Order Archive
        </div>

        <h1 class="page-title">
          Archive
        </h1>

        <p class="page-description">
          Riwayat pesanan yang selesai, dibatalkan, atau telah diarsipkan.
        </p>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            Total Archive
          </span>

          <strong id="archiveTotal">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Selesai
          </span>

          <strong id="archiveDone">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Dibatalkan
          </span>

          <strong id="archiveCancelled">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Nilai Order
          </span>

          <strong
            id="archiveValue"
            style="font-size:18px;"
          >
            -
          </strong>

        </div>

      </div>


      <div class="archive-toolbar">

        <input
          type="search"
          class="input"
          id="archiveSearch"
          placeholder="Cari order atau customer..."
        >


        <select
          class="input"
          id="archiveFilter"
        >

          <option value="">
            Semua Archive
          </option>

          <option value="selesai">
            Selesai
          </option>

          <option value="dibatalkan">
            Dibatalkan
          </option>

          <option value="manual">
            Diarsipkan Manual
          </option>

        </select>

      </div>


      <div class="archive-card">

        <div class="archive-table-wrap">

          <table class="archive-table">

            <thead>

              <tr>

                <th>
                  Order
                </th>

                <th>
                  Customer
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
                  Aksi
                </th>

              </tr>

            </thead>


            <tbody id="archiveBody">

              <tr>

                <td
                  colspan="6"
                  class="archive-empty"
                >
                  Memuat archive...
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    `;


    const search =
      document.getElementById(
        "archiveSearch"
      );


    const filter =
      document.getElementById(
        "archiveFilter"
      );


    function renderStats() {

      const archived =
        archivedOrders();


      document.getElementById(
        "archiveTotal"
      ).textContent =
        archived.length;


      document.getElementById(
        "archiveDone"
      ).textContent =
        archived.filter(
          function (order) {

            return (
              order.status ===
              "selesai"
            );

          }
        ).length;


      document.getElementById(
        "archiveCancelled"
      ).textContent =
        archived.filter(
          function (order) {

            return (
              order.status ===
              "dibatalkan"
            );

          }
        ).length;


      const value =
        archived.reduce(
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
        "archiveValue"
      ).textContent =
        MemoraAdmin.money(
          value
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
        archivedOrders().filter(
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


            let statusMatch =
              true;


            if (
              selected ===
              "selesai"
            ) {

              statusMatch =
                order.status ===
                "selesai";

            }


            if (
              selected ===
              "dibatalkan"
            ) {

              statusMatch =
                order.status ===
                "dibatalkan";

            }


            if (
              selected ===
              "manual"
            ) {

              statusMatch =
                order.is_archived ===
                true;

            }


            return (
              searchMatch &&
              statusMatch
            );

          }
        );


      const tbody =
        document.getElementById(
          "archiveBody"
        );


      if (!filtered.length) {

        tbody.innerHTML = `

          <tr>

            <td
              colspan="6"
              class="archive-empty"
            >
              Belum ada order di archive.
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

              <tr>

                <td>

                  <span class="archive-order-number">

                    ${esc(
                      order.order_number ||
                      "-"
                    )}

                  </span>

                </td>


                <td>

                  <div class="archive-customer">

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

                  <span
                    class="archive-status ${
                      order.status ===
                      "dibatalkan"
                        ? "cancelled"
                        : ""
                    }"
                  >

                    ${esc(
                      statusLabel(
                        order.status
                      )
                    )}

                  </span>

                </td>


                <td>

                  ${esc(
                    String(
                      order.payment_status ||
                      "-"
                    )
                      .replaceAll(
                        "_",
                        " "
                      )
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

                  <a
                    href="/studio/order-detail/?id=${encodeURIComponent(
                      order.id
                    )}"
                    class="archive-open-button"
                  >
                    Lihat Order
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
              "id,order_number,customer_id,status,payment_status,grand_total,is_archived,created_at"
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
          "ARCHIVE:",
          error
        );


        document.getElementById(
          "archiveBody"
        ).innerHTML = `

          <tr>

            <td
              colspan="6"
              class="archive-empty"
            >
              Archive gagal dimuat.

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
      renderTable
    );


    filter.addEventListener(
      "change",
      renderTable
    );


    await loadData();

  }
);