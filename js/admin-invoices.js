document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db =
      MemoraAdmin.db;

    const page =
      document.getElementById(
        "adminPage"
      );


    page.innerHTML = `

      <div class="page-head">

        <div>

          <div class="eyebrow">
            Documents
          </div>

          <h1>
            Invoices
          </h1>

          <p>
            Buat dan cetak invoice berdasarkan order customer.
          </p>

        </div>

      </div>


      <section class="panel">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>

                <th>Invoice</th>
                <th>Order</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Action</th>

              </tr>

            </thead>

            <tbody id="invoiceRows"></tbody>

          </table>

        </div>

      </section>
    `;


    const result =
      await db
        .from("orders")
        .select("*")
        .order(
          "created_at",
          {
            ascending:false
          }
        );


    if (result.error) {
      throw result.error;
    }


    const orders =
      result.data || [];


    document.getElementById(
      "invoiceRows"
    ).innerHTML =
      orders.map(order => `

        <tr>

          <td>
            INV-${
              MemoraAdmin.escapeHtml(
                String(
                  order.order_number ||
                  ""
                )
                  .replace(
                    "MEM-",
                    ""
                  )
              )
            }
          </td>

          <td>

            <strong>
              ${
                MemoraAdmin.escapeHtml(
                  order.order_number
                )
              }
            </strong>

          </td>

          <td>
            ${
              MemoraAdmin.money(
                order.grand_total
              )
            }
          </td>

          <td>
            ${
              MemoraAdmin.money(
                order.total_paid
              )
            }
          </td>

          <td>
            ${
              MemoraAdmin.money(
                order.remaining_amount ??
                (
                  Number(
                    order.grand_total ||
                    0
                  ) -
                  Number(
                    order.total_paid ||
                    0
                  )
                )
              )
            }
          </td>

          <td>
            ${
              MemoraAdmin.statusLabel(
                order.payment_status
              )
            }
          </td>

          <td>

            <button
              class="btn"
              data-invoice="${order.id}"
              type="button"
            >
              Print Invoice
            </button>

          </td>

        </tr>

      `).join("") ||

      `
        <tr>

          <td
            colspan="7"
            class="empty"
          >
            Belum ada invoice.
          </td>

        </tr>
      `;


    document
      .querySelectorAll(
        "[data-invoice]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          async () => {

            const orderId =
              button.dataset.invoice;


            const order =
              orders.find(
                x =>
                  String(x.id) ===
                  String(orderId)
              );


            if (!order) {
              return;
            }


            const [
              customerResult,
              itemResult,
              paymentResult
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
                      data:null
                    }),

                db
                  .from("order_items")
                  .select("*")
                  .eq(
                    "order_id",
                    orderId
                  ),

                db
                  .from("payments")
                  .select("*")
                  .eq(
                    "order_id",
                    orderId
                  )
                  .order(
                    "payment_date",
                    {
                      ascending:true
                    }
                  )

              ]);


            const customer =
              customerResult.data;


            const items =
              itemResult.data || [];


            const payments =
              paymentResult.data || [];


            const itemRows =
              items.map(item => `

                <tr>

                  <td>
                    ${
                      MemoraAdmin.escapeHtml(
                        item.product_name ||
                        "-"
                      )
                    }
                  </td>

                  <td>
                    ${
                      MemoraAdmin.escapeHtml(
                        item.variant_name ||
                        "-"
                      )
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

                  <td style="text-align:right">
                    ${
                      MemoraAdmin.money(
                        item.unit_price
                      )
                    }
                  </td>

                  <td style="text-align:right">
                    ${
                      MemoraAdmin.money(
                        item.subtotal
                      )
                    }
                  </td>

                </tr>

              `).join("");


            const paymentRows =
              payments.map(item => `

                <tr>

                  <td>
                    ${
                      MemoraAdmin.date(
                        item.payment_date
                      )
                    }
                  </td>

                  <td>
                    ${
                      MemoraAdmin.escapeHtml(
                        item.payment_type ||
                        "-"
                      )
                    }
                  </td>

                  <td>
                    ${
                      MemoraAdmin.escapeHtml(
                        item.payment_method ||
                        "-"
                      )
                    }
                  </td>

                  <td style="text-align:right">
                    ${
                      MemoraAdmin.money(
                        item.amount
                      )
                    }
                  </td>

                </tr>

              `).join("");


            const popup =
              window.open(
                "",
                "_blank",
                "width=1050,height=800"
              );


            popup.document.write(`

              <!doctype html>

              <html>

              <head>

                <meta charset="utf-8">

                <title>
                  Invoice ${
                    MemoraAdmin.escapeHtml(
                      order.order_number
                    )
                  }
                </title>

                <style>

                  * {
                    box-sizing:border-box;
                  }

                  body {
                    margin:0;
                    padding:45px;
                    font-family:
                      Inter,
                      -apple-system,
                      BlinkMacSystemFont,
                      Arial,
                      sans-serif;
                    color:#1d2421;
                    font-size:13px;
                  }

                  .head {
                    display:flex;
                    justify-content:space-between;
                    gap:40px;
                    margin-bottom:40px;
                  }

                  .brand {
                    font-size:27px;
                    font-weight:700;
                    letter-spacing:.14em;
                  }

                  .muted {
                    color:#777;
                  }

                  h1 {
                    margin:0;
                    font-size:25px;
                  }

                  table {
                    width:100%;
                    border-collapse:collapse;
                    margin-top:18px;
                  }

                  th,
                  td {
                    padding:10px 8px;
                    border-bottom:1px solid #ddd;
                    text-align:left;
                  }

                  th {
                    font-size:11px;
                    text-transform:uppercase;
                    color:#777;
                  }

                  .summary {
                    margin-left:auto;
                    margin-top:25px;
                    width:360px;
                  }

                  .summary div {
                    display:flex;
                    justify-content:space-between;
                    gap:20px;
                    padding:8px 0;
                  }

                  .grand {
                    font-size:18px;
                    font-weight:700;
                    border-top:1px solid #333;
                  }

                  .section {
                    margin-top:35px;
                  }

                  @media print {
                    body {
                      padding:18mm;
                    }
                  }

                </style>

              </head>

              <body>

                <div class="head">

                  <div>

                    <div class="brand">
                      MEMORA
                    </div>

                    <div class="muted">
                      Creative Printing & Personalized Stationery
                    </div>

                  </div>

                  <div style="text-align:right">

                    <h1>
                      INVOICE
                    </h1>

                    <div>
                      ${
                        MemoraAdmin.escapeHtml(
                          order.order_number
                        )
                      }
                    </div>

                    <div class="muted">
                      ${
                        MemoraAdmin.date(
                          order.created_at
                        )
                      }
                    </div>

                  </div>

                </div>


                <div>

                  <strong>
                    Bill To
                  </strong>

                  <div>
                    ${
                      MemoraAdmin.escapeHtml(
                        customer?.full_name ||
                        customer?.name ||
                        "-"
                      )
                    }
                  </div>

                  <div>
                    ${
                      MemoraAdmin.escapeHtml(
                        customer?.email ||
                        "-"
                      )
                    }
                  </div>

                  <div>
                    ${
                      MemoraAdmin.escapeHtml(
                        customer?.whatsapp ||
                        customer?.phone ||
                        "-"
                      )
                    }
                  </div>

                </div>


                <div class="section">

                  <strong>
                    Items
                  </strong>

                  <table>

                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Package</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      ${itemRows}
                    </tbody>

                  </table>

                </div>


                <div class="summary">

                  <div>
                    <span>Subtotal</span>
                    <strong>
                      ${
                        MemoraAdmin.money(
                          order.subtotal
                        )
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Shipping</span>
                    <strong>
                      ${
                        MemoraAdmin.money(
                          order.shipping_cost
                        )
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Discount</span>
                    <strong>
                      ${
                        MemoraAdmin.money(
                          order.discount_amount
                        )
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Paid</span>
                    <strong>
                      ${
                        MemoraAdmin.money(
                          order.total_paid
                        )
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Remaining</span>
                    <strong>
                      ${
                        MemoraAdmin.money(
                          order.remaining_amount
                        )
                      }
                    </strong>
                  </div>

                  <div class="grand">
                    <span>Grand Total</span>
                    <strong>
                      ${
                        MemoraAdmin.money(
                          order.grand_total
                        )
                      }
                    </strong>
                  </div>

                </div>


                ${
                  payments.length
                    ? `

                        <div class="section">

                          <strong>
                            Payment History
                          </strong>

                          <table>

                            <thead>

                              <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Method</th>
                                <th>Amount</th>
                              </tr>

                            </thead>

                            <tbody>
                              ${paymentRows}
                            </tbody>

                          </table>

                        </div>

                      `
                    : ""
                }


                <script>

                  window.onload =
                    function () {
                      window.print();
                    };

                <\/script>

              </body>

              </html>

            `);


            popup.document.close();

          }
        );

      });

  });

});