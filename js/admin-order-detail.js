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
      params.get("id");

    if (!orderId) {

      page.innerHTML = `
        <div class="page-head">
          <div>
            <h1>Order Detail</h1>
          </div>
        </div>

        <div class="panel">
          <div class="empty">
            Order ID tidak ditemukan.
          </div>
        </div>
      `;

      return;
    }


    page.innerHTML = `
      <div class="page-head">

        <div>

          <div class="eyebrow">
            Order Management
          </div>

          <h1 id="detailNumber">
            Order Detail
          </h1>

          <p id="detailDate">
            Memuat data...
          </p>

        </div>

        <div class="actions">

          <a
            class="btn"
            href="/studio/orders/"
          >
            Back to Orders
          </a>

          <button
            class="btn btn-danger"
            id="archiveOrder"
            type="button"
          >
            Archive
          </button>

        </div>

      </div>

      <div
        class="detail-grid"
        id="detailContent"
      ></div>
    `;


    const orderResult =
      await db
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();


    if (orderResult.error) {
      throw orderResult.error;
    }


    const order =
      orderResult.data;


    let customer =
      null;


    if (order.customer_id) {

      const result =
        await db
          .from("customers")
          .select("*")
          .eq(
            "id",
            order.customer_id
          )
          .maybeSingle();


      if (!result.error) {
        customer = result.data;
      }

    }


    const [
      itemResult,
      historyResult,
      paymentResult
    ] =
      await Promise.all([

        db
          .from("order_items")
          .select("*")
          .eq("order_id", orderId)
          .order(
            "created_at",
            {
              ascending:true
            }
          ),

        db
          .from(
            "order_status_history"
          )
          .select("*")
          .eq("order_id", orderId)
          .order(
            "created_at",
            {
              ascending:false
            }
          ),

        db
          .from("payments")
          .select("*")
          .eq("order_id", orderId)
          .order(
            "payment_date",
            {
              ascending:false
            }
          )

      ]);


    const items =
      itemResult.error
        ? []
        : itemResult.data || [];


    const history =
      historyResult.error
        ? []
        : historyResult.data || [];


    const payments =
      paymentResult.error
        ? []
        : paymentResult.data || [];


    document.getElementById(
      "detailNumber"
    ).textContent =
      order.order_number ||
      "Order Detail";


    document.getElementById(
      "detailDate"
    ).textContent =
      "Dibuat " +
      MemoraAdmin.date(
        order.created_at
      );


    const statusOptions = [
      "menunggu_konfirmasi",
      "data_belum_lengkap",
      "desain",
      "menunggu_approval",
      "revisi",
      "approved",
      "printing",
      "produksi",
      "finishing",
      "quality_check",
      "packing",
      "dikirim",
      "selesai",
      "dibatalkan"
    ];


    const itemHtml =
      items.map(item => `

        <div class="item-card">

          <div class="item-head">

            <div>

              <strong>
                ${MemoraAdmin.escapeHtml(
                  item.product_name ||
                  "-"
                )}
              </strong>

              <div class="item-meta">

                <span>
                  ${
                    MemoraAdmin.escapeHtml(
                      item.variant_name ||
                      "-"
                    )
                  }
                </span>

                <span>
                  Qty ${Number(
                    item.quantity || 0
                  )}
                </span>

              </div>

            </div>

            <strong>
              ${
                MemoraAdmin.money(
                  item.subtotal
                )
              }
            </strong>

          </div>

        </div>

      `).join("") ||
      `
        <div class="empty">
          Tidak ada item.
        </div>
      `;


    const paymentHtml =
      payments.map(item => `

        <div class="detail-row">

          <span>
            ${
              MemoraAdmin.date(
                item.payment_date
              )
            }
          </span>

          <strong>
            ${
              MemoraAdmin.money(
                item.amount
              )
            }
            -
            ${
              MemoraAdmin.escapeHtml(
                item.payment_method ||
                item.payment_type ||
                "-"
              )
            }
          </strong>

        </div>

      `).join("") ||
      `
        <div class="empty">
          Belum ada pembayaran.
        </div>
      `;


    const historyHtml =
      history.map(item => `

        <div class="timeline-item">

          <div class="timeline-dot"></div>

          <div>

            <strong>
              ${
                MemoraAdmin.statusLabel(
                  item.status
                )
              }
            </strong>

            <span>
              ${
                MemoraAdmin.date(
                  item.created_at
                )
              }
            </span>

            ${
              item.note
                ? `
                    <p>
                      ${
                        MemoraAdmin.escapeHtml(
                          item.note
                        )
                      }
                    </p>
                  `
                : ""
            }

          </div>

        </div>

      `).join("") ||
      `
        <div class="empty">
          Belum ada riwayat.
        </div>
      `;


    const address =
      [
        order.shipping_recipient_name,
        order.shipping_phone,
        order.shipping_address,
        order.shipping_district,
        order.shipping_city,
        order.shipping_province,
        order.shipping_postal_code
      ]
        .filter(Boolean)
        .join(", ");


    document.getElementById(
      "detailContent"
    ).innerHTML = `

      <div class="detail-stack">

        <section class="panel">

          <div class="panel-head">

            <h2>
              Customer
            </h2>

          </div>

          <div class="panel-body detail-list">

            <div class="detail-row">

              <span>
                Nama
              </span>

              <strong>
                ${
                  MemoraAdmin.escapeHtml(
                    customer?.full_name ||
                    customer?.name ||
                    "-"
                  )
                }
              </strong>

            </div>

            <div class="detail-row">

              <span>
                Email
              </span>

              <strong>
                ${
                  MemoraAdmin.escapeHtml(
                    customer?.email ||
                    "-"
                  )
                }
              </strong>

            </div>

            <div class="detail-row">

              <span>
                WhatsApp
              </span>

              <strong>
                ${
                  MemoraAdmin.escapeHtml(
                    customer?.whatsapp ||
                    customer?.phone ||
                    "-"
                  )
                }
              </strong>

            </div>

            <div class="detail-row">

              <span>
                Alamat
              </span>

              <strong>
                ${
                  MemoraAdmin.escapeHtml(
                    address ||
                    "-"
                  )
                }
              </strong>

            </div>

          </div>

        </section>


        <section class="panel">

          <div class="panel-head">

            <h2>
              Items
            </h2>

          </div>

          <div class="panel-body">

            ${itemHtml}

          </div>

        </section>


        <section class="panel">

          <div class="panel-head">

            <h2>
              Payment Records
            </h2>

          </div>

          <div class="panel-body">

            ${paymentHtml}

          </div>

        </section>

      </div>


      <div class="detail-stack">

        <section class="panel">

          <div class="panel-head">

            <h2>
              Status
            </h2>

          </div>

          <div class="panel-body">

            <div class="field">

              <label>
                Status Order
              </label>

              <select id="detailStatus">

                ${
                  statusOptions
                    .map(status => `

                      <option
                        value="${status}"
                        ${
                          status ===
                          order.status
                            ? "selected"
                            : ""
                        }
                      >
                        ${
                          MemoraAdmin.statusLabel(
                            status
                          )
                        }
                      </option>

                    `)
                    .join("")
                }

              </select>

            </div>

            <div class="field">

              <label>
                Catatan Status
              </label>

              <textarea
                id="detailStatusNote"
                placeholder="Catatan opsional..."
              ></textarea>

            </div>

            <button
              class="btn btn-primary btn-block"
              id="saveDetailStatus"
              type="button"
            >
              Save Status
            </button>

          </div>

        </section>


        <section class="panel">

          <div class="panel-head">

            <h2>
              Payment Summary
            </h2>

          </div>

          <div class="panel-body">

            <div class="total-list">

              <div class="total-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ${
                    MemoraAdmin.money(
                      order.subtotal
                    )
                  }
                </strong>

              </div>

              <div class="total-row">

                <span>
                  Shipping
                </span>

                <strong>
                  ${
                    MemoraAdmin.money(
                      order.shipping_cost
                    )
                  }
                </strong>

              </div>

              <div class="total-row">

                <span>
                  Discount
                </span>

                <strong>
                  ${
                    MemoraAdmin.money(
                      order.discount_amount
                    )
                  }
                </strong>

              </div>

              <div class="total-row">

                <span>
                  Paid
                </span>

                <strong>
                  ${
                    MemoraAdmin.money(
                      order.total_paid
                    )
                  }
                </strong>

              </div>

              <div class="total-row">

                <span>
                  Remaining
                </span>

                <strong>
                  ${
                    MemoraAdmin.money(
                      order.remaining_amount
                    )
                  }
                </strong>

              </div>

              <div class="total-row grand">

                <span>
                  Grand Total
                </span>

                <strong>
                  ${
                    MemoraAdmin.money(
                      order.grand_total
                    )
                  }
                </strong>

              </div>

            </div>

          </div>

        </section>


        <section class="panel">

          <div class="panel-head">

            <h2>
              History
            </h2>

          </div>

          <div class="panel-body timeline">

            ${historyHtml}

          </div>

        </section>

      </div>

    `;


    document
      .getElementById(
        "saveDetailStatus"
      )
      .addEventListener(
        "click",
        async () => {

          const status =
            document.getElementById(
              "detailStatus"
            ).value;

          const note =
            document.getElementById(
              "detailStatusNote"
            ).value.trim();


          const updateResult =
            await db
              .from("orders")
              .update({
                status
              })
              .eq(
                "id",
                orderId
              );


          if (updateResult.error) {

            alert(
              updateResult.error.message
            );

            return;
          }


          const historyPayload = {
            order_id:
              orderId,

            status:
              status
          };


          if (note) {
            historyPayload.note = note;
          }


          const historyInsert =
            await db
              .from(
                "order_status_history"
              )
              .insert(
                historyPayload
              );


          if (
            historyInsert.error
          ) {

            console.warn(
              historyInsert.error
            );

          }


          alert(
            "Data pesanan berhasil diperbarui."
          );


          window.location.reload();

        }
      );


    document
      .getElementById(
        "archiveOrder"
      )
      .addEventListener(
        "click",
        async () => {

          if (
            !confirm(
              "Archive order ini?"
            )
          ) {
            return;
          }


          const result =
            await db
              .from("orders")
              .update({
                is_archived:true
              })
              .eq(
                "id",
                orderId
              );


          if (result.error) {

            alert(
              result.error.message
            );

            return;
          }


          window.location.href =
            "/studio/archive/";

        }
      );

  });

});