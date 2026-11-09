document.addEventListener(
  "DOMContentLoaded",
  async function () {

    const db =
      window.memoraSupabase;


    const paper =
      document.getElementById(
        "invoicePaper"
      );


    function esc(value) {

      const div =
        document.createElement(
          "div"
        );

      div.textContent =
        String(value ?? "");

      return div.innerHTML;

    }


    function money(value) {

      return new Intl.NumberFormat(
        "id-ID",
        {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0
        }
      ).format(
        Number(value) || 0
      );

    }


    function date(value) {

      if (!value) {
        return "-";
      }


      const parsed =
        new Date(value);


      if (
        Number.isNaN(
          parsed.getTime()
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
      ).format(parsed);

    }


    function personalization(value) {

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


    const params =
      new URLSearchParams(
        window.location.search
      );


    const orderId =
      params.get("id");


    if (!orderId) {

      paper.innerHTML =
        "ID order tidak ditemukan.";

      return;

    }


    try {

      const session =
        await db.auth.getSession();


      if (
        !session.data?.session
      ) {

        window.location.replace(
          "/studio/login/"
        );

        return;

      }


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


      const order =
        orderResult.data;


      if (!order) {

        throw new Error(
          "Order tidak ditemukan."
        );

      }


      const [
        customerResult,
        itemsResult,
        shippingResult
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
            .maybeSingle()

        ]);


      const customer =
        customerResult.error
          ? null
          : customerResult.data;


      const items =
        itemsResult.error
          ? []
          : (
              itemsResult.data ||
              []
            );


      const shipping =
        shippingResult.error
          ? null
          : shippingResult.data;


      const invoiceNumber =
        "INV-" +
        (
          order.order_number ||
          String(order.id)
            .slice(0,8)
        );


      const itemRows =
        items.length
          ? items.map(
              function (item) {

                const extra =
                  personalization(
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
                            <div
                              style="
                                margin-top:3px;
                                color:#818884;
                              "
                            >
                              ${esc(
                                item.variant_name
                              )}
                            </div>
                          `
                          : ""
                      }

                      ${
                        extra
                          ? `
                            <div
                              style="
                                margin-top:3px;
                                color:#818884;
                                line-height:1.45;
                              "
                            >
                              ${esc(extra)}
                            </div>
                          `
                          : ""
                      }

                    </td>


                    <td>
                      ${Number(
                        item.quantity ||
                        0
                      )}
                    </td>


                    <td>
                      ${money(
                        item.unit_price
                      )}
                    </td>


                    <td>
                      ${money(
                        item.subtotal
                      )}
                    </td>

                  </tr>

                `;

              }
            ).join("")
          : `

              <tr>

                <td colspan="4">
                  Tidak ada item.
                </td>

              </tr>

            `;


      const address =
        shipping?.address ||
        shipping?.full_address ||
        order.shipping_address ||
        order.address ||
        "-";


      const paymentStatus =
        String(
          order.payment_status ||
          "belum_ada_pembayaran"
        )
          .replaceAll("_", " ");


      paper.innerHTML = `

        <header class="invoice-header">

          <div class="invoice-brand">

            <strong>
              MEMORA
            </strong>

            <span>
              Creative Printing & Personalized Stationery
            </span>

          </div>


          <div class="invoice-title">

            <h1>
              INVOICE
            </h1>

            <span>
              ${esc(invoiceNumber)}
            </span>

          </div>

        </header>


        <div class="invoice-meta-grid">

          <div class="invoice-meta-card">

            <span>
              Customer
            </span>

            <strong>
              ${esc(
                customer?.full_name ||
                customer?.name ||
                "Customer"
              )}
            </strong>

            <strong>
              ${esc(
                customer?.whatsapp ||
                customer?.email ||
                "-"
              )}
            </strong>

          </div>


          <div class="invoice-meta-card">

            <span>
              Order
            </span>

            <strong>
              ${esc(
                order.order_number ||
                "-"
              )}
            </strong>

            <strong>
              ${date(
                order.created_at
              )}
            </strong>

          </div>


          <div class="invoice-meta-card">

            <span>
              Alamat Pengiriman
            </span>

            <strong>
              ${esc(address)}
            </strong>

          </div>


          <div class="invoice-meta-card">

            <span>
              Status Pembayaran
            </span>

            <strong>
              ${esc(paymentStatus)}
            </strong>

          </div>

        </div>


        <table class="invoice-items-table">

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


        <div class="invoice-summary">

          <div class="invoice-summary-row">

            <span>
              Subtotal
            </span>

            <strong>
              ${money(
                order.subtotal
              )}
            </strong>

          </div>


          <div class="invoice-summary-row">

            <span>
              Ongkir
            </span>

            <strong>
              ${money(
                order.shipping_cost
              )}
            </strong>

          </div>


          <div class="invoice-summary-row">

            <span>
              Diskon
            </span>

            <strong>
              ${money(
                order.discount_amount
              )}
            </strong>

          </div>


          <div class="invoice-summary-row total">

            <span>
              Grand Total
            </span>

            <strong>
              ${money(
                order.grand_total
              )}
            </strong>

          </div>

        </div>


        <div class="invoice-payment-box">

          <span>
            Pembayaran
          </span>

          <strong>
            Sudah Dibayar:
            ${money(
              order.total_paid
            )}
          </strong>

          <strong>
            Sisa:
            ${money(
              order.remaining_amount
            )}
          </strong>

        </div>

      `;

    }
    catch (error) {

      console.error(
        "INVOICE PRINT:",
        error
      );


      paper.innerHTML = `

        <div
          style="
            padding:40px;
            color:#913f3f;
          "
        >
          ${esc(
            error?.message ||
            "Invoice gagal dimuat."
          )}
        </div>

      `;

    }


    document
      .getElementById(
        "printInvoice"
      )
      .addEventListener(
        "click",
        function () {

          window.print();

        }
      );

  }
);