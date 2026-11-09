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
    let activeOrder = null;


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


    function labelPayment(value) {

      return (
        PAYMENT_LABELS[value] ||
        String(
          value ||
          "belum_ada_pembayaran"
        )
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


    content.innerHTML = `

      <div>

        <div class="eyebrow">
          Payment Management
        </div>

        <h1 class="page-title">
          Payments
        </h1>

        <p class="page-description">
          Kelola status pembayaran setiap pesanan MEMORA.
        </p>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            Semua Order
          </span>

          <strong id="paymentTotal">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Belum Bayar
          </span>

          <strong id="paymentUnpaid">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            DP / Sebagian
          </span>

          <strong id="paymentPartial">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Lunas
          </span>

          <strong id="paymentPaid">
            0
          </strong>

        </div>

      </div>


      <div class="payments-toolbar">

        <input
          type="search"
          class="input"
          id="paymentSearch"
          placeholder="Cari nomor order atau customer..."
        >


        <select
          class="input"
          id="paymentFilter"
        >

          <option value="">
            Semua Status
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


      <div class="payments-card">

        <div class="payments-table-wrap">

          <table class="payments-table">

            <thead>

              <tr>

                <th>
                  Order
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Total
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

                <th>
                  Aksi
                </th>

              </tr>

            </thead>


            <tbody id="paymentsBody">

              <tr>

                <td
                  colspan="7"
                  class="payments-empty"
                >
                  Memuat pembayaran...
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>


      <div
        class="payment-message"
        id="paymentMessage"
      ></div>


      <div
        class="payment-modal"
        id="paymentModal"
      >

        <div class="payment-modal-card">

          <div class="payment-modal-head">

            <h2>
              Update Pembayaran
            </h2>

            <button
              type="button"
              class="payment-modal-close"
              id="closePaymentModal"
            >
              ×
            </button>

          </div>


          <form id="paymentEditForm">

            <div class="payment-modal-body">


              <div class="payment-info">

                <span>
                  Order
                </span>

                <strong id="modalOrderNumber">
                  -
                </strong>

              </div>


              <div class="payment-info">

                <span>
                  Grand Total
                </span>

                <strong id="modalGrandTotal">
                  -
                </strong>

              </div>


              <div class="payment-edit-field">

                <label for="editPaymentStatus">
                  Status Pembayaran
                </label>

                <select
                  class="payment-edit-input"
                  id="editPaymentStatus"
                >

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


              <div class="payment-edit-field">

                <label for="editTotalPaid">
                  Total Sudah Dibayar
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  class="payment-edit-input"
                  id="editTotalPaid"
                >

              </div>

            </div>


            <div class="payment-modal-foot">

              <button
                type="button"
                class="payment-cancel-button"
                id="cancelPaymentEdit"
              >
                Batal
              </button>

              <button
                type="submit"
                class="payment-save-button"
                id="savePaymentButton"
              >
                Simpan Perubahan
              </button>

            </div>

          </form>

        </div>

      </div>

    `;


    const search =
      document.getElementById(
        "paymentSearch"
      );


    const filter =
      document.getElementById(
        "paymentFilter"
      );


    const modal =
      document.getElementById(
        "paymentModal"
      );


    const statusInput =
      document.getElementById(
        "editPaymentStatus"
      );


    const paidInput =
      document.getElementById(
        "editTotalPaid"
      );


    const saveButton =
      document.getElementById(
        "savePaymentButton"
      );


    const message =
      document.getElementById(
        "paymentMessage"
      );


    function showMessage(
      text,
      type
    ) {

      message.textContent =
        text;


      message.className =
        "payment-message " +
        type;


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }


    function renderStats() {

      document.getElementById(
        "paymentTotal"
      ).textContent =
        orders.length;


      document.getElementById(
        "paymentUnpaid"
      ).textContent =
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
        "paymentPartial"
      ).textContent =
        orders.filter(
          function (order) {

            return [
              "dp_diterima",
              "sebagian"
            ].includes(
              order.payment_status
            );

          }
        ).length;


      document.getElementById(
        "paymentPaid"
      ).textContent =
        orders.filter(
          function (order) {

            return (
              order.payment_status ===
              "lunas"
            );

          }
        ).length;

    }


    function renderPayments() {

      const keyword =
        String(
          search.value ||
          ""
        )
          .trim()
          .toLowerCase();


      const selectedStatus =
        filter.value;


      const filtered =
        orders.filter(
          function (order) {

            const customer =
              getCustomer(order);


            const text =
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
              text.includes(
                keyword
              );


            const currentStatus =
              order.payment_status ||
              "belum_ada_pembayaran";


            const statusMatch =
              !selectedStatus ||
              currentStatus ===
                selectedStatus;


            return (
              searchMatch &&
              statusMatch
            );

          }
        );


      const tbody =
        document.getElementById(
          "paymentsBody"
        );


      if (!filtered.length) {

        tbody.innerHTML = `

          <tr>

            <td
              colspan="7"
              class="payments-empty"
            >
              Tidak ada data pembayaran.
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


            const customerName =
              customer?.full_name ||
              customer?.name ||
              "Customer";


            const paymentStatus =
              order.payment_status ||
              "belum_ada_pembayaran";


            const grandTotal =
              Number(
                order.grand_total ||
                0
              );


            const totalPaid =
              Number(
                order.total_paid ||
                0
              );


            const remaining =
              order.remaining_amount !==
              null &&
              order.remaining_amount !==
              undefined
                ? Number(
                    order.remaining_amount
                  )
                : Math.max(
                    grandTotal -
                    totalPaid,
                    0
                  );


            return `

              <tr>

                <td>

                  <span class="payment-order-number">
                    ${esc(
                      order.order_number ||
                      "-"
                    )}
                  </span>

                </td>


                <td>

                  <div class="payment-customer">

                    <strong>
                      ${esc(
                        customerName
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
                    grandTotal
                  )}
                </td>


                <td>
                  ${MemoraAdmin.money(
                    totalPaid
                  )}
                </td>


                <td>
                  ${MemoraAdmin.money(
                    remaining
                  )}
                </td>


                <td>

                  <span
                    class="payment-status-badge ${
                      paymentStatus ===
                      "lunas"
                        ? "paid"
                        : ""
                    }"
                  >
                    ${esc(
                      labelPayment(
                        paymentStatus
                      )
                    )}
                  </span>

                </td>


                <td>

                  <button
                    type="button"
                    class="payment-edit-button"
                    data-edit-payment="${order.id}"
                  >
                    Update
                  </button>

                </td>

              </tr>

            `;

          }
        ).join("");


      document
        .querySelectorAll(
          "[data-edit-payment]"
        )
        .forEach(
          function (button) {

            button.addEventListener(
              "click",
              function () {

                openPayment(
                  button.dataset.editPayment
                );

              }
            );

          }
        );

    }


    function openPayment(orderId) {

      activeOrder =
        orders.find(
          function (order) {

            return (
              String(order.id) ===
              String(orderId)
            );

          }
        );


      if (!activeOrder) {
        return;
      }


      document.getElementById(
        "modalOrderNumber"
      ).textContent =
        activeOrder.order_number ||
        "-";


      document.getElementById(
        "modalGrandTotal"
      ).textContent =
        MemoraAdmin.money(
          activeOrder.grand_total
        );


      statusInput.value =
        activeOrder.payment_status ||
        "belum_ada_pembayaran";


      paidInput.value =
        Number(
          activeOrder.total_paid ||
          0
        );


      modal.classList.add(
        "show"
      );

    }


    function closePayment() {

      modal.classList.remove(
        "show"
      );


      activeOrder =
        null;

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
        renderPayments();

      }
      catch (error) {

        console.error(
          "PAYMENTS:",
          error
        );


        document.getElementById(
          "paymentsBody"
        ).innerHTML = `

          <tr>

            <td
              colspan="7"
              class="payments-empty"
            >
              Data pembayaran gagal dimuat.
            </td>

          </tr>

        `;


        showMessage(
          error?.message ||
          "Data pembayaran gagal dimuat.",
          "error"
        );

      }

    }


    document
      .getElementById(
        "paymentEditForm"
      )
      .addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();


          if (!activeOrder) {
            return;
          }


          saveButton.disabled =
            true;

          saveButton.textContent =
            "Menyimpan...";


          try {

            const paymentStatus =
              statusInput.value;


            let totalPaid =
              Number(
                paidInput.value ||
                0
              );


            const grandTotal =
              Number(
                activeOrder.grand_total ||
                0
              );


            if (
              totalPaid < 0
            ) {

              throw new Error(
                "Total pembayaran tidak boleh kurang dari 0."
              );

            }


            if (
              totalPaid >
              grandTotal
            ) {

              throw new Error(
                "Total pembayaran tidak boleh melebihi grand total."
              );

            }


            /*
              Jika status dipilih Lunas,
              otomatis samakan total_paid
              dengan grand_total.
            */

            if (
              paymentStatus ===
              "lunas"
            ) {

              totalPaid =
                grandTotal;

            }


            const remaining =
              Math.max(
                grandTotal -
                totalPaid,
                0
              );


            const result =
              await db
                .from("orders")
                .update({

                  payment_status:
                    paymentStatus,

                  total_paid:
                    totalPaid,

                  remaining_amount:
                    remaining

                })
                .eq(
                  "id",
                  activeOrder.id
                )
                .select("*")
                .single();


            if (
              result.error
            ) {

              throw result.error;

            }


            const index =
              orders.findIndex(
                function (order) {

                  return (
                    String(order.id) ===
                    String(activeOrder.id)
                  );

                }
              );


            if (
              index >= 0
            ) {

              orders[index] =
                result.data;

            }


            closePayment();


            renderStats();
            renderPayments();


            showMessage(
              "Status pembayaran berhasil diperbarui.",
              "success"
            );


            alert(
              "Status pembayaran berhasil diperbarui."
            );

          }
          catch (error) {

            console.error(
              "PAYMENT UPDATE:",
              error
            );


            showMessage(
              error?.message ||
              "Status pembayaran gagal diperbarui.",
              "error"
            );

          }
          finally {

            saveButton.disabled =
              false;

            saveButton.textContent =
              "Simpan Perubahan";

          }

        }
      );


    search.addEventListener(
      "input",
      renderPayments
    );


    filter.addEventListener(
      "change",
      renderPayments
    );


    document
      .getElementById(
        "closePaymentModal"
      )
      .addEventListener(
        "click",
        closePayment
      );


    document
      .getElementById(
        "cancelPaymentEdit"
      )
      .addEventListener(
        "click",
        closePayment
      );


    modal.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          modal
        ) {

          closePayment();

        }

      }
    );


    await loadData();

  }
);