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


    let customers = [];
    let orders = [];
    let activeCustomer = null;


    function esc(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    function customerOrders(customerId) {

      return orders.filter(
        function (order) {

          return (
            String(order.customer_id) ===
            String(customerId)
          );

        }
      );

    }


    function customerValue(customerId) {

      return customerOrders(
        customerId
      ).reduce(
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

    }


    content.innerHTML = `

      <div>

        <div class="eyebrow">
          Customer Management
        </div>

        <h1 class="page-title">
          Customers
        </h1>

        <p class="page-description">
          Lihat data customer dan riwayat order MEMORA.
        </p>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            Total Customer
          </span>

          <strong id="customerTotal">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Pernah Order
          </span>

          <strong id="customerOrdered">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Total Orders
          </span>

          <strong id="customerOrderTotal">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Order Value
          </span>

          <strong
            id="customerOrderValue"
            style="font-size:18px;"
          >
            -
          </strong>

        </div>

      </div>


      <div class="customers-toolbar">

        <input
          type="search"
          class="input"
          id="customerSearch"
          placeholder="Cari nama, WhatsApp, atau email..."
        >

      </div>


      <div class="customers-card">

        <div class="customers-table-wrap">

          <table class="customers-table">

            <thead>

              <tr>

                <th>
                  Customer
                </th>

                <th>
                  WhatsApp
                </th>

                <th>
                  Email
                </th>

                <th>
                  Orders
                </th>

                <th>
                  Total Value
                </th>

                <th>
                  Aksi
                </th>

              </tr>

            </thead>


            <tbody id="customersBody">

              <tr>

                <td
                  colspan="6"
                  class="customers-empty"
                >
                  Memuat customer...
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>


      <div
        class="customer-modal"
        id="customerModal"
      >

        <div class="customer-modal-card">

          <div class="customer-modal-head">

            <h2>
              Detail Customer
            </h2>

            <button
              type="button"
              class="customer-modal-close"
              id="closeCustomerModal"
            >
              ×
            </button>

          </div>


          <div
            class="customer-modal-body"
            id="customerModalBody"
          ></div>

        </div>

      </div>

    `;


    const search =
      document.getElementById(
        "customerSearch"
      );


    const modal =
      document.getElementById(
        "customerModal"
      );


    function renderStats() {

      document.getElementById(
        "customerTotal"
      ).textContent =
        customers.length;


      const ordered =
        customers.filter(
          function (customer) {

            return (
              customerOrders(
                customer.id
              ).length > 0
            );

          }
        ).length;


      document.getElementById(
        "customerOrdered"
      ).textContent =
        ordered;


      document.getElementById(
        "customerOrderTotal"
      ).textContent =
        orders.length;


      const orderValue =
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
        "customerOrderValue"
      ).textContent =
        MemoraAdmin.money(
          orderValue
        );

    }


    function renderCustomers() {

      const keyword =
        String(
          search.value ||
          ""
        )
          .trim()
          .toLowerCase();


      const filtered =
        customers.filter(
          function (customer) {

            const searchable =
              [
                customer.full_name,
                customer.name,
                customer.whatsapp,
                customer.email
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            return (
              !keyword ||
              searchable.includes(
                keyword
              )
            );

          }
        );


      const tbody =
        document.getElementById(
          "customersBody"
        );


      if (!filtered.length) {

        tbody.innerHTML = `

          <tr>

            <td
              colspan="6"
              class="customers-empty"
            >
              Tidak ada customer.
            </td>

          </tr>

        `;

        return;

      }


      tbody.innerHTML =
        filtered.map(
          function (customer) {

            const ownedOrders =
              customerOrders(
                customer.id
              );


            return `

              <tr>

                <td>

                  <div class="customer-name">

                    <strong>
                      ${esc(
                        customer.full_name ||
                        customer.name ||
                        "Customer"
                      )}
                    </strong>

                    <span>
                      ${esc(
                        customer.id
                      )}
                    </span>

                  </div>

                </td>


                <td>
                  ${esc(
                    customer.whatsapp ||
                    "-"
                  )}
                </td>


                <td>
                  ${esc(
                    customer.email ||
                    "-"
                  )}
                </td>


                <td>
                  ${ownedOrders.length}
                </td>


                <td>

                  <strong>
                    ${MemoraAdmin.money(
                      customerValue(
                        customer.id
                      )
                    )}
                  </strong>

                </td>


                <td>

                  <button
                    type="button"
                    class="customer-view-button"
                    data-customer-id="${customer.id}"
                  >
                    Lihat
                  </button>

                </td>

              </tr>

            `;

          }
        ).join("");


      document
        .querySelectorAll(
          "[data-customer-id]"
        )
        .forEach(
          function (button) {

            button.addEventListener(
              "click",
              function () {

                openCustomer(
                  button.dataset.customerId
                );

              }
            );

          }
        );

    }


    function openCustomer(customerId) {

      activeCustomer =
        customers.find(
          function (customer) {

            return (
              String(customer.id) ===
              String(customerId)
            );

          }
        );


      if (!activeCustomer) {
        return;
      }


      const ownedOrders =
        customerOrders(
          activeCustomer.id
        );


      const orderList =
        ownedOrders.length
          ? ownedOrders.map(
              function (order) {

                return `

                  <a
                    href="/studio/order-detail/?id=${encodeURIComponent(
                      order.id
                    )}"
                    class="customer-order-item"
                  >

                    <div>

                      <strong>
                        ${esc(
                          order.order_number ||
                          "-"
                        )}
                      </strong>

                      <span>
                        ${esc(
                          String(
                            order.status ||
                            "-"
                          )
                            .replaceAll(
                              "_",
                              " "
                            )
                        )}
                      </span>

                    </div>


                    <strong>
                      ${MemoraAdmin.money(
                        order.grand_total
                      )}
                    </strong>

                  </a>

                `;

              }
            ).join("")
          : `

              <div
                style="
                  padding:18px 0;
                  color:#858c88;
                  font-size:12px;
                "
              >
                Customer belum memiliki order.
              </div>

            `;


      document.getElementById(
        "customerModalBody"
      ).innerHTML = `

        <div class="eyebrow">
          Customer
        </div>

        <h2
          style="
            margin:6px 0 0;
            font-size:20px;
          "
        >
          ${esc(
            activeCustomer.full_name ||
            activeCustomer.name ||
            "Customer"
          )}
        </h2>


        <div class="customer-detail-grid">

          <div class="customer-detail-box">

            <span>
              WhatsApp
            </span>

            <strong>
              ${esc(
                activeCustomer.whatsapp ||
                "-"
              )}
            </strong>

          </div>


          <div class="customer-detail-box">

            <span>
              Email
            </span>

            <strong>
              ${esc(
                activeCustomer.email ||
                "-"
              )}
            </strong>

          </div>


          <div class="customer-detail-box">

            <span>
              Jumlah Order
            </span>

            <strong>
              ${ownedOrders.length}
            </strong>

          </div>


          <div class="customer-detail-box">

            <span>
              Total Nilai Order
            </span>

            <strong>
              ${MemoraAdmin.money(
                customerValue(
                  activeCustomer.id
                )
              )}
            </strong>

          </div>

        </div>


        <div
          style="
            margin-top:23px;
          "
        >

          <div class="eyebrow">
            Order History
          </div>

          <h3
            style="
              margin:6px 0 0;
              font-size:15px;
            "
          >
            Riwayat Pesanan
          </h3>

        </div>


        <div class="customer-orders-list">
          ${orderList}
        </div>

      `;


      modal.classList.add(
        "show"
      );

    }


    function closeCustomer() {

      modal.classList.remove(
        "show"
      );


      activeCustomer =
        null;

    }


    async function loadData() {

      try {

        const customerResult =
          await db
            .from("customers")
            .select("*");


        if (
          customerResult.error
        ) {

          throw customerResult.error;

        }


        customers =
          customerResult.data ||
          [];


        const orderResult =
          await db
            .from("orders")
            .select(
              "id,order_number,customer_id,status,payment_status,grand_total,created_at"
            )
            .order(
              "created_at",
              {
                ascending:false
              }
            );


        orders =
          orderResult.error
            ? []
            : (
                orderResult.data ||
                []
              );


        renderStats();
        renderCustomers();

      }
      catch (error) {

        console.error(
          "CUSTOMERS:",
          error
        );


        document.getElementById(
          "customersBody"
        ).innerHTML = `

          <tr>

            <td
              colspan="6"
              class="customers-empty"
            >
              Customer gagal dimuat.
            </td>

          </tr>

        `;

      }

    }


    search.addEventListener(
      "input",
      renderCustomers
    );


    document
      .getElementById(
        "closeCustomerModal"
      )
      .addEventListener(
        "click",
        closeCustomer
      );


    modal.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          modal
        ) {

          closeCustomer();

        }

      }
    );


    await loadData();

  }
);