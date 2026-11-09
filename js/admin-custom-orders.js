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
    let items = [];
    let customers = [];


    const STATUS_LABELS = {

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


    function esc(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    function statusLabel(value) {

      return (
        STATUS_LABELS[value] ||
        String(value || "-")
          .replaceAll("_", " ")
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


    function getOrderItems(orderId) {

      return items.filter(
        function (item) {

          return (
            String(item.order_id) ===
            String(orderId)
          );

        }
      );

    }


    function hasPersonalization(value) {

      if (
        value === null ||
        value === undefined
      ) {

        return false;

      }


      if (
        typeof value ===
        "string"
      ) {

        const cleaned =
          value
            .trim()
            .toLowerCase();


        return (
          cleaned !== "" &&
          cleaned !== "{}" &&
          cleaned !== "null"
        );

      }


      if (
        typeof value ===
        "object"
      ) {

        return (
          Object.keys(value)
            .length > 0
        );

      }


      return true;

    }


    function personalizationText(value) {

      if (!hasPersonalization(value)) {
        return "-";
      }


      if (
        typeof value ===
        "string"
      ) {

        return value;

      }


      try {

        return Object.entries(value)
          .map(
            function (entry) {

              let itemValue =
                entry[1];


              if (
                typeof itemValue ===
                "object" &&
                itemValue !== null
              ) {

                itemValue =
                  JSON.stringify(
                    itemValue
                  );

              }


              return (
                entry[0] +
                ": " +
                String(itemValue)
              );

            }
          )
          .join(" • ");

      }
      catch (error) {

        return "-";

      }

    }


    function isCustomOrder(order) {

      const orderItems =
        getOrderItems(
          order.id
        );


      return orderItems.some(
        function (item) {

          return hasPersonalization(
            item.personalization
          );

        }
      );

    }


    content.innerHTML = `

      <div>

        <div class="eyebrow">
          Personalized Orders
        </div>

        <h1 class="page-title">
          Custom Orders
        </h1>

        <p class="page-description">
          Pantau pesanan yang memiliki data personalisasi atau permintaan khusus customer.
        </p>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            Custom Orders
          </span>

          <strong id="customOrderTotal">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Menunggu / Data
          </span>

          <strong id="customOrderPending">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Desain
          </span>

          <strong id="customOrderDesign">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Production
          </span>

          <strong id="customOrderProduction">
            0
          </strong>

        </div>

      </div>


      <div class="custom-orders-toolbar">

        <input
          type="search"
          class="input"
          id="customOrderSearch"
          placeholder="Cari order, customer, atau produk..."
        >


        <select
          class="input"
          id="customOrderStatus"
        >

          <option value="">
            Semua Status
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

          <option value="selesai">
            Selesai
          </option>

        </select>

      </div>


      <div
        class="custom-orders-grid"
        id="customOrdersGrid"
      >

        <div class="custom-orders-empty">
          Memuat custom orders...
        </div>

      </div>

    `;


    const search =
      document.getElementById(
        "customOrderSearch"
      );


    const statusFilter =
      document.getElementById(
        "customOrderStatus"
      );


    function customOrders() {

      return orders.filter(
        isCustomOrder
      );

    }


    function renderStats() {

      const custom =
        customOrders();


      document.getElementById(
        "customOrderTotal"
      ).textContent =
        custom.length;


      document.getElementById(
        "customOrderPending"
      ).textContent =
        custom.filter(
          function (order) {

            return [
              "menunggu_konfirmasi",
              "data_belum_lengkap",
              "data_lengkap"
            ].includes(
              order.status
            );

          }
        ).length;


      document.getElementById(
        "customOrderDesign"
      ).textContent =
        custom.filter(
          function (order) {

            return [
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
        "customOrderProduction"
      ).textContent =
        custom.filter(
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
        customOrders()
          .filter(
            function (order) {

              const customer =
                getCustomer(order);


              const orderItems =
                getOrderItems(
                  order.id
                );


              const searchable =
                [
                  order.order_number,
                  order.customer_note,
                  customer?.full_name,
                  customer?.name,
                  customer?.whatsapp,
                  ...orderItems.map(
                    function (item) {

                      return [
                        item.product_name,
                        item.variant_name,
                        personalizationText(
                          item.personalization
                        )
                      ].join(" ");

                    }
                  )
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


      const grid =
        document.getElementById(
          "customOrdersGrid"
        );


      if (!filtered.length) {

        grid.innerHTML = `

          <div class="custom-orders-empty">

            Belum ada order dengan data personalisasi.

          </div>

        `;

        return;

      }


      grid.innerHTML =
        filtered.map(
          function (order) {

            const customer =
              getCustomer(order);


            const customItems =
              getOrderItems(
                order.id
              )
                .filter(
                  function (item) {

                    return hasPersonalization(
                      item.personalization
                    );

                  }
                );


            const productsHtml =
              customItems.map(
                function (item) {

                  return `

                    <div class="custom-order-product">

                      <strong>

                        ${esc(
                          item.product_name ||
                          "Produk"
                        )}

                        ${
                          item.variant_name
                            ? " — " +
                              esc(
                                item.variant_name
                              )
                            : ""
                        }

                      </strong>


                      <span>

                        ${esc(
                          personalizationText(
                            item.personalization
                          )
                        )}

                      </span>

                    </div>

                  `;

                }
              ).join("");


            return `

              <article class="custom-order-card">

                <div class="custom-order-head">

                  <div>

                    <div class="custom-order-number">

                      ${esc(
                        order.order_number ||
                        "-"
                      )}

                    </div>

                    <div class="custom-order-customer">

                      ${esc(
                        customer?.full_name ||
                        customer?.name ||
                        "Customer"
                      )}

                      ${
                        customer?.whatsapp
                          ? " • " +
                            esc(
                              customer.whatsapp
                            )
                          : ""
                      }

                    </div>

                  </div>


                  <span class="custom-order-status">

                    ${esc(
                      statusLabel(
                        order.status
                      )
                    )}

                  </span>

                </div>


                <div class="custom-order-products">

                  ${productsHtml}

                </div>


                ${
                  order.customer_note
                    ? `

                      <div class="custom-order-note">

                        <span>
                          Catatan Customer
                        </span>

                        <p>
                          ${esc(
                            order.customer_note
                          )}
                        </p>

                      </div>

                    `
                    : ""
                }


                <div class="custom-order-foot">

                  <div class="custom-order-value">

                    ${MemoraAdmin.money(
                      order.grand_total
                    )}

                  </div>


                  <a
                    href="/studio/order-detail/?id=${encodeURIComponent(
                      order.id
                    )}"
                    class="custom-order-open"
                  >
                    Buka Order
                  </a>

                </div>

              </article>

            `;

          }
        ).join("");

    }


    async function loadData() {

      try {

        const [
          orderResult,
          itemResult,
          customerResult
        ] =
          await Promise.all([

            db
              .from("orders")
              .select(
                "id,order_number,customer_id,status,payment_status,grand_total,customer_note,created_at"
              )
              .order(
                "created_at",
                {
                  ascending:false
                }
              ),

            db
              .from("order_items")
              .select(
                "id,order_id,product_name,variant_name,quantity,personalization,created_at"
              )
              .order(
                "created_at",
                {
                  ascending:true
                }
              ),

            db
              .from("customers")
              .select("*")

          ]);


        if (
          orderResult.error
        ) {

          throw orderResult.error;

        }


        if (
          itemResult.error
        ) {

          throw itemResult.error;

        }


        orders =
          orderResult.data ||
          [];


        items =
          itemResult.data ||
          [];


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
          "CUSTOM ORDERS:",
          error
        );


        document.getElementById(
          "customOrdersGrid"
        ).innerHTML = `

          <div class="custom-orders-empty">

            Custom Orders gagal dimuat.

            <br><br>

            ${esc(
              error?.message ||
              "Terjadi kesalahan."
            )}

          </div>

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