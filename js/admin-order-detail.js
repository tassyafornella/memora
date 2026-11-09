document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db =
      MemoraAdmin.db;

    const page =
      document.getElementById(
        "adminPage"
      );


    const params =
      new URLSearchParams(
        window.location.search
      );


    const orderId =
      params.get("id") ||
      params.get("order");


    const STATUS_OPTIONS = [

      [
        "menunggu_konfirmasi",
        "Menunggu Konfirmasi"
      ],

      [
        "data_belum_lengkap",
        "Data Belum Lengkap"
      ],

      [
        "data_lengkap",
        "Data Lengkap"
      ],

      [
        "desain",
        "Desain"
      ],

      [
        "menunggu_approval",
        "Menunggu Approval"
      ],

      [
        "revisi",
        "Revisi"
      ],

      [
        "approved",
        "Approved"
      ],

      [
        "printing",
        "Printing"
      ],

      [
        "finishing",
        "Finishing"
      ],

      [
        "quality_check",
        "Quality Check"
      ],

      [
        "packing",
        "Packing"
      ],

      [
        "dikirim",
        "Dikirim"
      ],

      [
        "selesai",
        "Selesai"
      ],

      [
        "dibatalkan",
        "Dibatalkan"
      ]

    ];


    if (!orderId) {

      page.innerHTML = `

        <section class="panel">

          <h2>
            Order tidak ditemukan
          </h2>

          <a
            href="/studio/orders/"
            class="btn"
          >
            Kembali ke Orders
          </a>

        </section>

      `;

      return;

    }


    page.innerHTML = `

      <div class="page-head">

        <div>

          <div class="eyebrow">
            TC-15
          </div>

          <h1 id="orderTitle">
            Order Detail
          </h1>

          <p>
            Perbarui data dan status pesanan.
          </p>

        </div>

        <a
          href="/studio/orders/"
          class="btn"
        >
          Back to Orders
        </a>

      </div>


      <div
        id="orderLoading"
        class="panel"
      >
        Memuat order...
      </div>


      <div
        id="orderContent"
        hidden
      >

        <div
          class="detail-grid"
          style="
            display:grid;
            grid-template-columns:minmax(0,1.4fr) minmax(300px,.6fr);
            gap:18px;
          "
        >

          <section class="panel">

            <div class="eyebrow">
              Order Information
            </div>

            <h2 id="detailOrderNumber">
              -
            </h2>


            <div
              class="form-grid"
              style="margin-top:22px;"
            >

              <label class="field">

                <span>
                  Status Pesanan
                </span>

                <select
                  class="input"
                  id="orderStatusInput"
                >

                  ${

                    STATUS_OPTIONS.map(
                      item => `

                        <option value="${item[0]}">
                          ${item[1]}
                        </option>

                      `
                    ).join("")

                  }

                </select>

              </label>


              <label class="field">

                <span>
                  Tanggal Acara
                </span>

                <input
                  type="date"
                  class="input"
                  id="eventDateInput"
                >

              </label>


              <label
                class="field"
                style="grid-column:1/-1;"
              >

                <span>
                  Catatan Customer
                </span>

                <textarea
                  class="input"
                  id="customerNoteInput"
                  rows="4"
                  placeholder="Catatan pesanan..."
                ></textarea>

              </label>


              <label
                class="field"
                style="grid-column:1/-1;"
              >

                <span>
                  Catatan Perubahan Status
                </span>

                <textarea
                  class="input"
                  id="statusNoteInput"
                  rows="3"
                  placeholder="Opsional..."
                ></textarea>

              </label>

            </div>


            <div
              id="orderUpdateMessage"
              style="
                display:none;
                margin-top:16px;
                padding:12px 14px;
                border-radius:10px;
                background:#edf5ef;
                color:#315844;
                font-weight:600;
              "
            ></div>


            <div
              style="
                margin-top:18px;
                display:flex;
                justify-content:flex-end;
              "
            >

              <button
                type="button"
                class="btn btn-primary"
                id="saveOrderButton"
              >
                Simpan Perubahan
              </button>

            </div>

          </section>


          <section class="panel">

            <div class="eyebrow">
              Summary
            </div>

            <div
              id="orderSummary"
              style="margin-top:14px;"
            ></div>

          </section>

        </div>


        <section
          class="panel"
          style="margin-top:18px;"
        >

          <div class="eyebrow">
            Products
          </div>

          <h2>
            Order Items
          </h2>

          <div class="table-wrap">

            <table>

              <thead>

                <tr>
                  <th>Item</th>
                  <th>Variant</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>

              </thead>

              <tbody id="orderItemRows"></tbody>

            </table>

          </div>

        </section>


        <section
          class="panel"
          style="margin-top:18px;"
        >

          <div class="eyebrow">
            History
          </div>

          <h2>
            Status History
          </h2>

          <div id="statusHistory"></div>

        </section>

      </div>

    `;


    let order = null;

    let customer = null;

    let items = [];

    let history = [];


    function escapeHtml(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    function dateInput(value) {

      if (!value) {
        return "";
      }

      return String(value).slice(
        0,
        10
      );

    }


    function render() {

      document.getElementById(
        "orderLoading"
      ).hidden =
        true;


      document.getElementById(
        "orderContent"
      ).hidden =
        false;


      document.getElementById(
        "orderTitle"
      ).textContent =
        order.order_number ||
        "Order Detail";


      document.getElementById(
        "detailOrderNumber"
      ).textContent =
        order.order_number ||
        "-";


      document.getElementById(
        "orderStatusInput"
      ).value =
        order.status ||
        "menunggu_konfirmasi";


      document.getElementById(
        "eventDateInput"
      ).value =
        dateInput(
          order.event_date
        );


      document.getElementById(
        "customerNoteInput"
      ).value =
        order.customer_note ||
        "";


      document.getElementById(
        "orderSummary"
      ).innerHTML = `

        <div
          style="
            display:grid;
            gap:13px;
          "
        >

          <div>

            <span
              style="
                display:block;
                color:#7a837e;
                font-size:12px;
              "
            >
              Customer
            </span>

            <strong>
              ${escapeHtml(
                customer?.full_name ||
                customer?.name ||
                "-"
              )}
            </strong>

          </div>


          <div>

            <span
              style="
                display:block;
                color:#7a837e;
                font-size:12px;
              "
            >
              Payment
            </span>

            <strong>
              ${escapeHtml(
                MemoraAdmin.statusLabel(
                  order.payment_status
                )
              )}
            </strong>

          </div>


          <div>

            <span
              style="
                display:block;
                color:#7a837e;
                font-size:12px;
              "
            >
              Grand Total
            </span>

            <strong>
              ${MemoraAdmin.money(
                order.grand_total
              )}
            </strong>

          </div>


          <div>

            <span
              style="
                display:block;
                color:#7a837e;
                font-size:12px;
              "
            >
              Paid
            </span>

            <strong>
              ${MemoraAdmin.money(
                order.total_paid
              )}
            </strong>

          </div>

        </div>

      `;


      document.getElementById(
        "orderItemRows"
      ).innerHTML =
        items.map(item => `

          <tr>

            <td>
              <strong>
                ${escapeHtml(
                  item.product_name ||
                  "-"
                )}
              </strong>
            </td>

            <td>
              ${escapeHtml(
                item.variant_name ||
                "-"
              )}
            </td>

            <td>
              ${Number(
                item.quantity ||
                0
              )}
            </td>

            <td>
              ${MemoraAdmin.money(
                item.unit_price
              )}
            </td>

            <td>
              ${MemoraAdmin.money(
                item.subtotal
              )}
            </td>

          </tr>

        `).join("") ||

        `

          <tr>

            <td
              colspan="5"
              class="empty"
            >
              Belum ada item.
            </td>

          </tr>

        `;


      document.getElementById(
        "statusHistory"
      ).innerHTML =
        history.map(item => `

          <div
            style="
              padding:12px 0;
              border-bottom:1px solid #eceeec;
            "
          >

            <strong>
              ${escapeHtml(
                MemoraAdmin.statusLabel(
                  item.status
                )
              )}
            </strong>

            <div
              style="
                margin-top:4px;
                color:#7a837e;
                font-size:12px;
              "
            >
              ${escapeHtml(
                item.note ||
                "-"
              )}
            </div>

          </div>

        `).join("") ||

        `

          <div class="empty">
            Belum ada history.
          </div>

        `;

    }


    async function loadOrder() {

      const orderResult =
        await db
          .from("orders")
          .select("*")
          .eq(
            "id",
            orderId
          )
          .single();


      if (orderResult.error) {
        throw orderResult.error;
      }


      order =
        orderResult.data;


      const [
        customerResult,
        itemResult,
        historyResult
      ] =
        await Promise.all([

          order.customer_id
            ? db
                .from("customers")
                .select("*")
                .eq(
                  "id",
                  order.customer_id
                )
                .maybeSingle()

            : Promise.resolve({
                data:null,
                error:null
              }),

          db
            .from("order_items")
            .select("*")
            .eq(
              "order_id",
              orderId
            )
            .order(
              "created_at",
              {
                ascending:true
              }
            ),

          db
            .from("order_status_history")
            .select("*")
            .eq(
              "order_id",
              orderId
            )
            .order(
              "created_at",
              {
                ascending:false
              }
            )

        ]);


      customer =
        customerResult.data ||
        null;


      items =
        itemResult.error
          ? []
          : (
              itemResult.data ||
              []
            );


      history =
        historyResult.error
          ? []
          : (
              historyResult.data ||
              []
            );


      render();

    }


    async function saveOrder() {

      const button =
        document.getElementById(
          "saveOrderButton"
        );


      const newStatus =
        document.getElementById(
          "orderStatusInput"
        ).value;


      const eventDate =
        document.getElementById(
          "eventDateInput"
        ).value ||
        null;


      const customerNote =
        document.getElementById(
          "customerNoteInput"
        ).value.trim();


      const statusNote =
        document.getElementById(
          "statusNoteInput"
        ).value.trim();


      const oldStatus =
        order.status;


      button.disabled =
        true;

      button.textContent =
        "Menyimpan...";


      try {

        const updatePayload = {

          status:
            newStatus,

          event_date:
            eventDate,

          customer_note:
            customerNote ||
            null

        };


        const result =
          await db
            .from("orders")
            .update(
              updatePayload
            )
            .eq(
              "id",
              orderId
            )
            .select("*")
            .single();


        if (result.error) {
          throw result.error;
        }


        order =
          result.data;


        if (
          newStatus !== oldStatus ||
          statusNote
        ) {

          const historyResult =
            await db
              .from(
                "order_status_history"
              )
              .insert({

                order_id:
                  orderId,

                status:
                  newStatus,

                note:
                  statusNote ||
                  "Data pesanan diperbarui melalui MEMORA Studio."

              });


          if (historyResult.error) {

            console.warn(
              "History tidak tercatat:",
              historyResult.error
            );

          }

        }


        const historyReload =
          await db
            .from(
              "order_status_history"
            )
            .select("*")
            .eq(
              "order_id",
              orderId
            )
            .order(
              "created_at",
              {
                ascending:false
              }
            );


        history =
          historyReload.error
            ? history
            : (
                historyReload.data ||
                []
              );


        document.getElementById(
          "statusNoteInput"
        ).value =
          "";


        render();


        const message =
          document.getElementById(
            "orderUpdateMessage"
          );


        message.textContent =
          "Data pesanan berhasil diperbarui.";

        message.style.display =
          "block";


        alert(
          "Data pesanan berhasil diperbarui."
        );

      }
      catch (error) {

        console.error(
          error
        );

        alert(
          error.message ||
          "Data pesanan gagal diperbarui."
        );

      }
      finally {

        button.disabled =
          false;

        button.textContent =
          "Simpan Perubahan";

      }

    }


    document.getElementById(
      "saveOrderButton"
    ).addEventListener(
      "click",
      saveOrder
    );


    await loadOrder();

  });

});