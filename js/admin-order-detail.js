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


    const params =
      new URLSearchParams(
        window.location.search
      );


    const orderId =
      params.get("id");


    if (!orderId) {

      content.innerHTML = `

        <a
          href="/studio/orders/"
          class="detail-back"
        >
          ← Kembali ke Orders
        </a>

        <div class="detail-error">
          ID order tidak ditemukan.
        </div>

      `;

      return;

    }


    const ORDER_LABELS = {

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


    const PAYMENT_LABELS = {

      belum_ada_pembayaran:
        "Belum Ada Pembayaran",

      menunggu_verifikasi:
        "Menunggu Verifikasi",

      dp:
        "DP",

      dp_diterima:
        "DP Diterima",

      sebagian:
        "Sebagian",

      lunas:
        "Lunas"

    };


    let order = null;
    let customer = null;
    let items = [];
    let shipping = null;
    let history = [];


    function esc(value) {

      return MemoraAdmin.escapeHtml(
        value ?? ""
      );

    }


    function labelStatus(value) {

      return (
        ORDER_LABELS[value] ||
        String(value || "-")
          .replaceAll("_", " ")
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


    function formatDate(value) {

      if (!value) {
        return "-";
      }


      const date =
        new Date(value);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "-";
      }


      return new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric"
        }
      ).format(date);

    }


    function dateInputValue(value) {

      if (!value) {
        return "";
      }


      const d =
        new Date(value);


      if (
        Number.isNaN(
          d.getTime()
        )
      ) {
        return "";
      }


      const year =
        d.getFullYear();


      const month =
        String(
          d.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const day =
        String(
          d.getDate()
        ).padStart(
          2,
          "0"
        );


      return (
        year +
        "-" +
        month +
        "-" +
        day
      );

    }


    function personalizationText(value) {

      if (!value) {
        return "";
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

              return (
                entry[0] +
                ": " +
                String(entry[1])
              );

            }
          )
          .join(" • ");

      }
      catch (error) {

        return "";

      }

    }


    function renderPage() {

      document.getElementById(
        "detailOrderNumber"
      ).textContent =
        order.order_number ||
        "Order";


      document.getElementById(
        "detailOrderDate"
      ).textContent =
        "Dibuat " +
        formatDate(
          order.created_at
        );


      const itemRows =
        items.length
          ? items.map(
              function (item) {

                const personalization =
                  personalizationText(
                    item.personalization
                  );


                return `

                  <tr>

                    <td>

                      <strong>
                        ${esc(
                          item.product_name ||
                          "Produk"
                        )}
                      </strong>

                      ${
                        item.variant_name
                          ? `
                            <div class="detail-personalization">
                              ${esc(
                                item.variant_name
                              )}
                            </div>
                          `
                          : ""
                      }

                      ${
                        personalization
                          ? `
                            <div class="detail-personalization">
                              ${esc(
                                personalization
                              )}
                            </div>
                          `
                          : ""
                      }

                    </td>

                    <td>
                      ${
                        Number(
                          item.quantity ||
                          0
                        )
                      }
                    </td>

                    <td>
                      ${MemoraAdmin.money(
                        item.unit_price
                      )}
                    </td>

                    <td>

                      <strong>
                        ${MemoraAdmin.money(
                          item.subtotal
                        )}
                      </strong>

                    </td>

                  </tr>

                `;

              }
            ).join("")
          : `

              <tr>

                <td
                  colspan="4"
                  class="detail-empty"
                >
                  Item order belum tersedia.
                </td>

              </tr>

            `;


      const historyRows =
        history.length
          ? history.slice(
              0,
              8
            ).map(
              function (entry) {

                return `

                  <div
                    class="detail-field"
                    style="
                      padding:10px 0;
                      border-bottom:1px solid #eeeeea;
                    "
                  >

                    <span>
                      ${formatDate(
                        entry.created_at
                      )}
                    </span>

                    <strong>
                      ${esc(
                        labelStatus(
                          entry.status
                        )
                      )}
                    </strong>

                    ${
                      entry.note
                        ? `
                          <div
                            style="
                              margin-top:4px;
                              color:#858c88;
                              font-size:11px;
                            "
                          >
                            ${esc(
                              entry.note
                            )}
                          </div>
                        `
                        : ""
                    }

                  </div>

                `;

              }
            ).join("")
          : `

              <div class="detail-empty">
                Belum ada riwayat status.
              </div>

            `;


      const customerName =
        customer?.full_name ||
        customer?.name ||
        "-";


      const addressText =
        shipping?.address ||
        shipping?.full_address ||
        order.shipping_address ||
        order.address ||
        "-";


      document.getElementById(
        "detailContent"
      ).innerHTML = `

        <div class="detail-grid">

          <div class="detail-stack">


            <section class="detail-card">

              <div class="eyebrow">
                Items
              </div>

              <h2>
                Produk Pesanan
              </h2>


              <div
                style="
                  width:100%;
                  overflow-x:auto;
                "
              >

                <table class="detail-items">

                  <thead>

                    <tr>

                      <th>
                        Produk
                      </th>

                      <th>
                        Qty
                      </th>

                      <th>
                        Harga
                      </th>

                      <th>
                        Subtotal
                      </th>

                    </tr>

                  </thead>

                  <tbody>
                    ${itemRows}
                  </tbody>

                </table>

              </div>

            </section>


            <section class="detail-card">

              <div class="eyebrow">
                Customer
              </div>

              <h2>
                Data Customer
              </h2>


              <div class="detail-list">

                <div class="detail-field">

                  <span>
                    Nama
                  </span>

                  <strong>
                    ${esc(
                      customerName
                    )}
                  </strong>

                </div>


                <div class="detail-field">

                  <span>
                    WhatsApp
                  </span>

                  <strong>
                    ${esc(
                      customer?.whatsapp ||
                      "-"
                    )}
                  </strong>

                </div>


                <div class="detail-field">

                  <span>
                    Email
                  </span>

                  <strong>
                    ${esc(
                      customer?.email ||
                      "-"
                    )}
                  </strong>

                </div>


                <div class="detail-field">

                  <span>
                    Alamat Pengiriman
                  </span>

                  <strong>
                    ${esc(
                      addressText
                    )}
                  </strong>

                </div>

              </div>

            </section>


            <section class="detail-card">

              <div class="eyebrow">
                Edit Order
              </div>

              <h2>
                Perbarui Data Pesanan
              </h2>

              <p class="detail-card-description">
                Ubah status, tanggal acara, atau catatan pesanan.
              </p>


              <form
                class="order-edit-form"
                id="orderEditForm"
              >

                <div class="order-edit-field">

                  <label for="editOrderStatus">
                    Status Order
                  </label>

                  <select
                    id="editOrderStatus"
                    class="order-edit-input"
                  >

                    ${
                      Object.entries(
                        ORDER_LABELS
                      )
                        .map(
                          function (entry) {

                            return `

                              <option
                                value="${entry[0]}"
                                ${
                                  order.status ===
                                  entry[0]
                                    ? "selected"
                                    : ""
                                }
                              >
                                ${entry[1]}
                              </option>

                            `;

                          }
                        )
                        .join("")
                    }

                  </select>

                </div>


                <div class="order-edit-field">

                  <label for="editEventDate">
                    Tanggal Acara
                  </label>

                  <input
                    type="date"
                    id="editEventDate"
                    class="order-edit-input"
                    value="${dateInputValue(
                      order.event_date
                    )}"
                  >

                </div>


                <div class="order-edit-field">

                  <label for="editCustomerNote">
                    Catatan Customer
                  </label>

                  <textarea
                    id="editCustomerNote"
                    class="order-edit-input"
                  >${esc(
                    order.customer_note ||
                    ""
                  )}</textarea>

                </div>


                <div class="order-edit-field">

                  <label for="editStatusNote">
                    Catatan Perubahan Status
                  </label>

                  <textarea
                    id="editStatusNote"
                    class="order-edit-input"
                    placeholder="Contoh: Data sudah lengkap dan siap masuk proses desain."
                  ></textarea>

                </div>


                <button
                  type="submit"
                  class="order-save-button"
                  id="saveOrderButton"
                >
                  Simpan Perubahan
                </button>

              </form>


              <div
                class="order-success"
                id="orderSuccess"
              >
                Data pesanan berhasil diperbarui.
              </div>


              <div
                class="order-update-error"
                id="orderUpdateError"
              ></div>

            </section>

          </div>


          <div class="detail-stack">


            <section class="detail-card">

              <div class="eyebrow">
                Order
              </div>

              <h2>
                Ringkasan
              </h2>


              <div class="detail-summary">

                <div class="detail-summary-row">

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ${MemoraAdmin.money(
                      order.subtotal
                    )}
                  </strong>

                </div>


                <div class="detail-summary-row">

                  <span>
                    Ongkir
                  </span>

                  <strong>
                    ${MemoraAdmin.money(
                      order.shipping_cost
                    )}
                  </strong>

                </div>


                <div class="detail-summary-row">

                  <span>
                    Diskon
                  </span>

                  <strong>
                    ${MemoraAdmin.money(
                      order.discount_amount
                    )}
                  </strong>

                </div>


                <div
                  class="detail-summary-row total"
                >

                  <span>
                    Grand Total
                  </span>

                  <strong>
                    ${MemoraAdmin.money(
                      order.grand_total
                    )}
                  </strong>

                </div>

              </div>

            </section>


            <section class="detail-card">

              <div class="eyebrow">
                Status
              </div>

              <h2>
                Status Order
              </h2>


              <div class="detail-status">

                ${esc(
                  labelStatus(
                    order.status
                  )
                )}

              </div>


              <div
                class="detail-list"
                style="
                  grid-template-columns:1fr;
                "
              >

                <div class="detail-field">

                  <span>
                    Payment
                  </span>

                  <strong>
                    ${esc(
                      labelPayment(
                        order.payment_status
                      )
                    )}
                  </strong>

                </div>


                <div class="detail-field">

                  <span>
                    Sudah Dibayar
                  </span>

                  <strong>
                    ${MemoraAdmin.money(
                      order.total_paid
                    )}
                  </strong>

                </div>


                <div class="detail-field">

                  <span>
                    Sisa Pembayaran
                  </span>

                  <strong>
                    ${MemoraAdmin.money(
                      order.remaining_amount
                    )}
                  </strong>

                </div>


                <div class="detail-field">

                  <span>
                    Tanggal Acara
                  </span>

                  <strong>
                    ${esc(
                      formatDate(
                        order.event_date
                      )
                    )}
                  </strong>

                </div>

              </div>

            </section>


            <section class="detail-card">

              <div class="eyebrow">
                History
              </div>

              <h2>
                Riwayat Status
              </h2>


              <div
                style="
                  margin-top:12px;
                "
              >
                ${historyRows}
              </div>

            </section>

          </div>

        </div>

      `;


      bindEditForm();

    }


    async function reloadHistory() {

      const historyResult =
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


      if (!historyResult.error) {

        history =
          historyResult.data ||
          [];

      }

    }


    function bindEditForm() {

      const form =
        document.getElementById(
          "orderEditForm"
        );


      const button =
        document.getElementById(
          "saveOrderButton"
        );


      const success =
        document.getElementById(
          "orderSuccess"
        );


      const errorBox =
        document.getElementById(
          "orderUpdateError"
        );


      form.addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();


          success.classList.remove(
            "show"
          );


          errorBox.classList.remove(
            "show"
          );


          button.disabled =
            true;

          button.textContent =
            "Menyimpan...";


          try {

            const newStatus =
              document.getElementById(
                "editOrderStatus"
              ).value;


            const eventDate =
              document.getElementById(
                "editEventDate"
              ).value ||
              null;


            const customerNote =
              document.getElementById(
                "editCustomerNote"
              ).value.trim();


            const statusNote =
              document.getElementById(
                "editStatusNote"
              ).value.trim();


            const oldStatus =
              order.status;


            const updateResult =
              await db
                .from("orders")
                .update({

                  status:
                    newStatus,

                  event_date:
                    eventDate,

                  customer_note:
                    customerNote

                })
                .eq(
                  "id",
                  orderId
                )
                .select("*")
                .single();


            if (
              updateResult.error
            ) {

              throw updateResult.error;

            }


            order =
              updateResult.data;


            if (
              oldStatus !==
              newStatus
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
                      "Status order diperbarui melalui MEMORA Studio."

                  });


              if (
                historyResult.error
              ) {

                console.warn(
                  "STATUS HISTORY:",
                  historyResult.error
                );

              }

            }


            await reloadHistory();


            renderPage();


            const newSuccess =
              document.getElementById(
                "orderSuccess"
              );


            newSuccess.classList.add(
              "show"
            );


            alert(
              "Data pesanan berhasil diperbarui."
            );

          }
          catch (error) {

            console.error(
              "UPDATE ORDER:",
              error
            );


            errorBox.textContent =
              error?.message ||
              "Data pesanan gagal diperbarui.";


            errorBox.classList.add(
              "show"
            );

          }
          finally {

            const activeButton =
              document.getElementById(
                "saveOrderButton"
              );


            if (activeButton) {

              activeButton.disabled =
                false;

              activeButton.textContent =
                "Simpan Perubahan";

            }

          }

        }
      );

    }


    content.innerHTML = `

      <a
        href="/studio/orders/"
        class="detail-back"
      >
        ← Kembali ke Orders
      </a>


      <div>

        <div class="eyebrow">
          Order Detail
        </div>

        <h1
          class="page-title"
          id="detailOrderNumber"
        >
          Memuat...
        </h1>

        <p
          class="page-description"
          id="detailOrderDate"
        >
          -
        </p>

      </div>


      <div
        id="detailContent"
      >

        <div class="panel">

          <p>
            Memuat detail order...
          </p>

        </div>

      </div>

    `;


    try {

      const orderResult =
        await db
          .from("orders")
          .select("*")
          .eq(
            "id",
            orderId
          )
          .maybeSingle();


      if (
        orderResult.error
      ) {

        throw orderResult.error;

      }


      order =
        orderResult.data;


      if (!order) {

        throw new Error(
          "Order tidak ditemukan."
        );

      }


      const [
        customerResult,
        itemsResult,
        shippingResult,
        historyResult
      ] =
        await Promise.all([

          db
            .from("customers")
            .select("*")
            .eq(
              "id",
              order.customer_id
            )
            .maybeSingle(),

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
            .from("shipping")
            .select("*")
            .eq(
              "order_id",
              orderId
            )
            .maybeSingle(),

          db
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
            )

        ]);


      customer =
        customerResult.error
          ? null
          : customerResult.data;


      items =
        itemsResult.error
          ? []
          : (
              itemsResult.data ||
              []
            );


      shipping =
        shippingResult.error
          ? null
          : shippingResult.data;


      history =
        historyResult.error
          ? []
          : (
              historyResult.data ||
              []
            );


      renderPage();

    }
    catch (error) {

      console.error(
        "ORDER DETAIL:",
        error
      );


      document.getElementById(
        "detailContent"
      ).innerHTML = `

        <div class="detail-error">

          <strong>
            Order gagal dimuat
          </strong>

          <br><br>

          ${esc(
            error?.message ||
            "Terjadi kesalahan."
          )}

        </div>

      `;

    }

  }
);