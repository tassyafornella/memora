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


    const PRODUCTION_STATUSES = {

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
        "Selesai"

    };


    function esc(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    function labelStatus(value) {

      return (
        PRODUCTION_STATUSES[value] ||
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


    content.innerHTML = `

      <div>

        <div class="eyebrow">
          Production Management
        </div>

        <h1 class="page-title">
          Production
        </h1>

        <p class="page-description">
          Pantau dan perbarui proses produksi pesanan MEMORA.
        </p>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            Production Queue
          </span>

          <strong id="productionTotal">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Printing
          </span>

          <strong id="productionPrinting">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Finishing / QC
          </span>

          <strong id="productionProcess">
            0
          </strong>

        </div>


        <div class="stat">

          <span>
            Selesai
          </span>

          <strong id="productionDone">
            0
          </strong>

        </div>

      </div>


      <div class="production-toolbar">

        <input
          type="search"
          class="input"
          id="productionSearch"
          placeholder="Cari nomor order atau customer..."
        >


        <select
          class="input"
          id="productionFilter"
        >

          <option value="">
            Semua Tahap
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


      <div class="production-card">

        <div class="production-table-wrap">

          <table class="production-table">

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
                  Payment
                </th>

                <th>
                  Tahap Produksi
                </th>

                <th>
                  Aksi
                </th>

              </tr>

            </thead>


            <tbody id="productionBody">

              <tr>

                <td
                  colspan="6"
                  class="production-empty"
                >
                  Memuat produksi...
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>


      <div
        class="production-message"
        id="productionMessage"
      ></div>


      <div
        class="production-modal"
        id="productionModal"
      >

        <div class="production-modal-card">

          <div class="production-modal-head">

            <h2>
              Update Production
            </h2>

            <button
              type="button"
              class="production-modal-close"
              id="closeProductionModal"
            >
              ×
            </button>

          </div>


          <form id="productionEditForm">

            <div class="production-modal-body">


              <div class="production-info">

                <span>
                  Order
                </span>

                <strong id="productionOrderNumber">
                  -
                </strong>

              </div>


              <div class="production-field">

                <label for="productionStatus">
                  Tahap Produksi
                </label>

                <select
                  id="productionStatus"
                  class="production-input"
                >

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


              <div class="production-field">

                <label for="productionNote">
                  Catatan Produksi
                </label>

                <textarea
                  id="productionNote"
                  class="production-input"
                  placeholder="Contoh: Printing selesai dan masuk proses finishing."
                ></textarea>

              </div>

            </div>


            <div class="production-modal-foot">

              <button
                type="button"
                class="production-cancel-button"
                id="cancelProductionEdit"
              >
                Batal
              </button>

              <button
                type="submit"
                class="production-save-button"
                id="saveProductionButton"
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
        "productionSearch"
      );


    const filter =
      document.getElementById(
        "productionFilter"
      );


    const modal =
      document.getElementById(
        "productionModal"
      );


    const statusInput =
      document.getElementById(
        "productionStatus"
      );


    const noteInput =
      document.getElementById(
        "productionNote"
      );


    const saveButton =
      document.getElementById(
        "saveProductionButton"
      );


    const message =
      document.getElementById(
        "productionMessage"
      );


    function showMessage(
      text,
      type
    ) {

      message.textContent =
        text;


      message.className =
        "production-message " +
        type;


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }


    function renderStats() {

      document.getElementById(
        "productionTotal"
      ).textContent =
        orders.length;


      document.getElementById(
        "productionPrinting"
      ).textContent =
        orders.filter(
          function (order) {

            return (
              order.status ===
              "printing"
            );

          }
        ).length;


      document.getElementById(
        "productionProcess"
      ).textContent =
        orders.filter(
          function (order) {

            return [
              "finishing",
              "quality_check",
              "packing"
            ].includes(
              order.status
            );

          }
        ).length;


      document.getElementById(
        "productionDone"
      ).textContent =
        orders.filter(
          function (order) {

            return (
              order.status ===
              "selesai"
            );

          }
        ).length;

    }


    function renderProduction() {

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
                customer?.whatsapp
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const searchMatch =
              !keyword ||
              text.includes(
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
          "productionBody"
        );


      if (!filtered.length) {

        tbody.innerHTML = `

          <tr>

            <td
              colspan="6"
              class="production-empty"
            >
              Belum ada order pada proses produksi.
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

                  <span class="production-order-number">
                    ${esc(
                      order.order_number ||
                      "-"
                    )}
                  </span>

                </td>


                <td>

                  <div class="production-customer">

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
                    order.grand_total
                  )}
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

                  <span class="production-status">
                    ${esc(
                      labelStatus(
                        order.status
                      )
                    )}
                  </span>

                </td>


                <td>

                  <button
                    type="button"
                    class="production-update-button"
                    data-production-id="${order.id}"
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
          "[data-production-id]"
        )
        .forEach(
          function (button) {

            button.addEventListener(
              "click",
              function () {

                openProduction(
                  button.dataset.productionId
                );

              }
            );

          }
        );

    }


    function openProduction(orderId) {

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
        "productionOrderNumber"
      ).textContent =
        activeOrder.order_number ||
        "-";


      statusInput.value =
        activeOrder.status;


      noteInput.value =
        "";


      modal.classList.add(
        "show"
      );

    }


    function closeProduction() {

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
              "id,order_number,customer_id,status,payment_status,grand_total,created_at"
            )
            .in(
              "status",
              [
                "printing",
                "finishing",
                "quality_check",
                "packing",
                "dikirim",
                "selesai"
              ]
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
        renderProduction();

      }
      catch (error) {

        console.error(
          "PRODUCTION:",
          error
        );


        document.getElementById(
          "productionBody"
        ).innerHTML = `

          <tr>

            <td
              colspan="6"
              class="production-empty"
            >
              Production gagal dimuat.
            </td>

          </tr>

        `;


        showMessage(
          error?.message ||
          "Production gagal dimuat.",
          "error"
        );

      }

    }


    document
      .getElementById(
        "productionEditForm"
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

            const newStatus =
              statusInput.value;


            const note =
              noteInput.value
                .trim();


            const result =
              await db
                .from("orders")
                .update({

                  status:
                    newStatus

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


            const historyResult =
              await db
                .from(
                  "order_status_history"
                )
                .insert({

                  order_id:
                    activeOrder.id,

                  status:
                    newStatus,

                  note:
                    note ||
                    "Status produksi diperbarui melalui MEMORA Studio."

                });


            if (
              historyResult.error
            ) {

              console.warn(
                "PRODUCTION HISTORY:",
                historyResult.error
              );

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


            closeProduction();


            renderStats();
            renderProduction();


            showMessage(
              "Status produksi berhasil diperbarui.",
              "success"
            );


            alert(
              "Status produksi berhasil diperbarui."
            );

          }
          catch (error) {

            console.error(
              "PRODUCTION UPDATE:",
              error
            );


            showMessage(
              error?.message ||
              "Status produksi gagal diperbarui.",
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
      renderProduction
    );


    filter.addEventListener(
      "change",
      renderProduction
    );


    document
      .getElementById(
        "closeProductionModal"
      )
      .addEventListener(
        "click",
        closeProduction
      );


    document
      .getElementById(
        "cancelProductionEdit"
      )
      .addEventListener(
        "click",
        closeProduction
      );


    modal.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          modal
        ) {

          closeProduction();

        }

      }
    );


    await loadData();

  }
);