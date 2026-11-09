document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db = MemoraAdmin.db;
    const page = document.getElementById("adminPage");

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
            Preview dan simpan invoice dalam format PDF A4.
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


    const result = await db
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


    const orders = result.data || [];


    function invoiceNumber(order) {

      const number = String(
        order.order_number ||
        order.id ||
        ""
      ).replace("MEM-", "");

      return `INV-${number}`;
    }


    function remainingAmount(order) {

      if (
        order.remaining_amount !== null &&
        order.remaining_amount !== undefined
      ) {
        return Number(order.remaining_amount);
      }

      return (
        Number(order.grand_total || 0) -
        Number(order.total_paid || 0)
      );
    }


    document.getElementById("invoiceRows").innerHTML =
      orders.map(order => `

        <tr>

          <td>
            <strong>
              ${MemoraAdmin.escapeHtml(
                invoiceNumber(order)
              )}
            </strong>
          </td>

          <td>
            ${MemoraAdmin.escapeHtml(
              order.order_number || "-"
            )}
          </td>

          <td>
            ${MemoraAdmin.money(
              order.grand_total
            )}
          </td>

          <td>
            ${MemoraAdmin.money(
              order.total_paid
            )}
          </td>

          <td>
            ${MemoraAdmin.money(
              remainingAmount(order)
            )}
          </td>

          <td>
            <span class="badge">
              ${MemoraAdmin.statusLabel(
                order.payment_status
              )}
            </span>
          </td>

          <td>

            <button
              class="btn btn-primary"
              type="button"
              data-invoice="${order.id}"
            >
              PDF
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


    async function loadInvoice(orderId) {

      const order = orders.find(
        item =>
          String(item.id) ===
          String(orderId)
      );


      if (!order) {
        throw new Error(
          "Order tidak ditemukan."
        );
      }


      const customerPromise =
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
            });


      const [
        customerResult,
        itemResult,
        paymentResult
      ] = await Promise.all([

        customerPromise,

        db
          .from("order_items")
          .select("*")
          .eq(
            "order_id",
            order.id
          )
          .order(
            "created_at",
            {
              ascending:true
            }
          ),

        db
          .from("payments")
          .select("*")
          .eq(
            "order_id",
            order.id
          )
          .order(
            "payment_date",
            {
              ascending:true
            }
          )

      ]);


      return {

        order,

        customer:
          customerResult.data ||
          null,

        items:
          itemResult.error
            ? []
            : itemResult.data || [],

        payments:
          paymentResult.error
            ? []
            : paymentResult.data || []

      };
    }


    function createInvoiceHtml(data) {

      const {
        order,
        customer,
        items,
        payments
      } = data;


      const itemRows =
        items.map((item,index) => `

          <tr>

            <td class="center muted">
              ${index + 1}
            </td>

            <td>

              <strong class="item-name">
                ${MemoraAdmin.escapeHtml(
                  item.product_name ||
                  "-"
                )}
              </strong>

              ${
                item.variant_name
                  ? `
                      <div class="item-variant">
                        ${MemoraAdmin.escapeHtml(
                          item.variant_name
                        )}
                      </div>
                    `
                  : ""
              }

            </td>

            <td class="center">
              ${Number(
                item.quantity ||
                0
              )}
            </td>

            <td class="right">
              ${MemoraAdmin.money(
                item.unit_price
              )}
            </td>

            <td class="right strong">
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
              class="empty-row"
            >
              Tidak ada item.
            </td>
          </tr>
        `;


      const paymentRows =
        payments.map(item => `

          <tr>

            <td>
              ${MemoraAdmin.date(
                item.payment_date
              )}
            </td>

            <td>
              ${MemoraAdmin.escapeHtml(
                item.payment_type ||
                "-"
              )}
            </td>

            <td>
              ${MemoraAdmin.escapeHtml(
                item.payment_method ||
                "-"
              )}
            </td>

            <td class="right strong">
              ${MemoraAdmin.money(
                item.amount
              )}
            </td>

          </tr>

        `).join("");


      const remaining =
        remainingAmount(order);


      return `
<!doctype html>

<html lang="id">

<head>

<meta charset="utf-8">

<title>
  ${MemoraAdmin.escapeHtml(
    invoiceNumber(order)
  )}
</title>

<link
  rel="preconnect"
  href="https://fonts.googleapis.com"
>

<link
  rel="preconnect"
  href="https://fonts.gstatic.com"
  crossorigin
>

<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
>

<style>

@page {
  size: A4 portrait;
  margin: 10mm;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: #ffffff;
}

body {
  font-family:
    "Inter",
    Arial,
    sans-serif;

  color: #1c2521;

  font-size: 10.5pt;
  line-height: 1.45;

  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.invoice {
  width: 100%;
  max-width: 100%;
  margin: 0;
}


/* HEADER */

.invoice-header {
  display: grid;
  grid-template-columns:
    minmax(0,1fr)
    minmax(0,1fr);

  align-items: start;

  gap: 15mm;

  padding-bottom: 7mm;

  border-bottom:
    0.5mm solid #29483b;
}

.brand {
  min-width: 0;
}

.brand-name {
  margin: 0;

  color: #29483b;

  font-size: 20pt;
  line-height: 1;

  font-weight: 700;

  letter-spacing: .13em;
}

.brand-subtitle {
  margin-top: 3mm;

  color: #7b847f;

  font-size: 8pt;
}


.invoice-title {
  min-width: 0;
  text-align: right;
}

.invoice-title h1 {
  margin: 0;

  color: #1c2521;

  font-size: 20pt;
  line-height: 1;

  font-weight: 700;
}

.invoice-number {
  margin-top: 3mm;

  font-size: 9pt;
  font-weight: 600;

  overflow-wrap: anywhere;
}

.invoice-date {
  margin-top: 1mm;

  color: #7b847f;

  font-size: 8.5pt;
}


/* CUSTOMER */

.information {
  display: grid;

  grid-template-columns:
    minmax(0,1fr)
    minmax(0,1fr);

  gap: 15mm;

  margin-top: 9mm;
}

.info-right {
  text-align: right;
}

.section-label {
  margin-bottom: 3mm;

  color: #7b847f;

  font-size: 7.5pt;

  line-height: 1;

  font-weight: 700;

  letter-spacing: .11em;

  text-transform: uppercase;
}

.customer-name {
  font-size: 11pt;
  font-weight: 600;
}

.info-line {
  margin-top: 1.5mm;
  overflow-wrap: anywhere;
}

.info-muted {
  color: #707973;
}


/* DETAILS */

.details {
  margin-top: 11mm;
}

table {
  width: 100%;
  max-width: 100%;

  border-collapse: collapse;

  table-layout: fixed;
}

.order-table col:nth-child(1) {
  width: 6%;
}

.order-table col:nth-child(2) {
  width: 47%;
}

.order-table col:nth-child(3) {
  width: 9%;
}

.order-table col:nth-child(4) {
  width: 18%;
}

.order-table col:nth-child(5) {
  width: 20%;
}

th {
  padding:
    3mm 2mm;

  background:
    #f4f6f4;

  color:
    #68726d;

  font-size:
    7.5pt;

  font-weight:
    700;

  text-align:
    left;

  text-transform:
    uppercase;

  letter-spacing:
    .04em;

  white-space:
    nowrap;
}

td {
  padding:
    3.5mm 2mm;

  border-bottom:
    .25mm solid #e6e8e6;

  vertical-align:
    top;

  font-size:
    9pt;

  overflow-wrap:
    anywhere;
}

.center {
  text-align: center;
}

.right {
  text-align: right;
}

.strong {
  font-weight: 600;
}

.muted {
  color: #78817c;
}

.item-name {
  display: block;
  font-size: 9.5pt;
}

.item-variant {
  margin-top: 1mm;

  color: #7d8681;

  font-size: 8pt;
}

.empty-row {
  text-align: center;
  color: #7d8681;
}


/* SUMMARY */

.summary-wrap {
  display: flex;

  justify-content:
    flex-end;

  margin-top:
    7mm;
}

.summary {
  width:
    78mm;

  max-width:
    100%;
}

.summary-row {
  display:
    flex;

  justify-content:
    space-between;

  gap:
    8mm;

  padding:
    2mm 0;

  font-size:
    9pt;
}

.summary-label {
  color:
    #737c77;
}

.summary-value {
  white-space:
    nowrap;

  font-weight:
    600;
}

.summary-grand {
  display:
    flex;

  justify-content:
    space-between;

  gap:
    8mm;

  margin-top:
    2mm;

  padding-top:
    4mm;

  border-top:
    .5mm solid #29483b;

  font-size:
    12pt;

  font-weight:
    700;
}

.summary-grand strong:last-child {
  color:
    #29483b;

  white-space:
    nowrap;
}


/* PAYMENT */

.payment {
  margin-top:
    10mm;

  break-inside:
    avoid;
}

.payment table col:nth-child(1) {
  width: 24%;
}

.payment table col:nth-child(2) {
  width: 25%;
}

.payment table col:nth-child(3) {
  width: 31%;
}

.payment table col:nth-child(4) {
  width: 20%;
}


/* FOOTER */

.footer {
  margin-top:
    14mm;

  padding-top:
    5mm;

  border-top:
    .25mm solid #e4e7e5;

  display:
    flex;

  justify-content:
    space-between;

  align-items:
    flex-end;

  gap:
    10mm;

  color:
    #848c87;

  font-size:
    7.5pt;
}

.footer-left {
  min-width:
    0;
}

.footer-title {
  color:
    #29483b;

  font-weight:
    600;
}

.footer-subtitle {
  margin-top:
    1mm;
}

.footer-right {
  white-space:
    nowrap;

  text-align:
    right;
}


/* PRINT */

@media print {

  html,
  body {
    width: auto;
    height: auto;
  }

  .invoice {
    page-break-after:
      avoid;
  }

  button {
    display:
      none !important;
  }

}

</style>

</head>

<body>

<main class="invoice">


  <header class="invoice-header">

    <div class="brand">

      <div class="brand-name">
        MEMORA
      </div>

      <div class="brand-subtitle">
        Creative Printing & Personalized Stationery
      </div>

    </div>


    <div class="invoice-title">

      <h1>
        INVOICE
      </h1>

      <div class="invoice-number">
        ${MemoraAdmin.escapeHtml(
          invoiceNumber(order)
        )}
      </div>

      <div class="invoice-date">
        ${MemoraAdmin.date(
          order.created_at
        )}
      </div>

    </div>

  </header>


  <section class="information">

    <div>

      <div class="section-label">
        Bill To
      </div>

      <div class="customer-name">
        ${MemoraAdmin.escapeHtml(
          customer?.full_name ||
          customer?.name ||
          "-"
        )}
      </div>

      <div class="info-line info-muted">
        ${MemoraAdmin.escapeHtml(
          customer?.email ||
          "-"
        )}
      </div>

      <div class="info-line info-muted">
        ${MemoraAdmin.escapeHtml(
          customer?.whatsapp ||
          customer?.phone ||
          "-"
        )}
      </div>

    </div>


    <div class="info-right">

      <div class="section-label">
        Order Information
      </div>

      <div class="info-line">
        Order:
        <strong>
          ${MemoraAdmin.escapeHtml(
            order.order_number ||
            "-"
          )}
        </strong>
      </div>

      <div class="info-line">
        Payment:
        <strong>
          ${MemoraAdmin.statusLabel(
            order.payment_status
          )}
        </strong>
      </div>

      <div class="info-line">
        Status:
        <strong>
          ${MemoraAdmin.statusLabel(
            order.status
          )}
        </strong>
      </div>

    </div>

  </section>


  <section class="details">

    <div class="section-label">
      Order Details
    </div>

    <table class="order-table">

      <colgroup>
        <col>
        <col>
        <col>
        <col>
        <col>
      </colgroup>

      <thead>

        <tr>

          <th>
            No.
          </th>

          <th>
            Item
          </th>

          <th class="center">
            Qty
          </th>

          <th class="right">
            Unit Price
          </th>

          <th class="right">
            Total
          </th>

        </tr>

      </thead>

      <tbody>
        ${itemRows}
      </tbody>

    </table>

  </section>


  <section class="summary-wrap">

    <div class="summary">

      <div class="summary-row">

        <span class="summary-label">
          Subtotal
        </span>

        <span class="summary-value">
          ${MemoraAdmin.money(
            order.subtotal
          )}
        </span>

      </div>


      <div class="summary-row">

        <span class="summary-label">
          Shipping
        </span>

        <span class="summary-value">
          ${MemoraAdmin.money(
            order.shipping_cost
          )}
        </span>

      </div>


      <div class="summary-row">

        <span class="summary-label">
          Discount
        </span>

        <span class="summary-value">
          ${MemoraAdmin.money(
            order.discount_amount
          )}
        </span>

      </div>


      <div class="summary-row">

        <span class="summary-label">
          Paid
        </span>

        <span class="summary-value">
          ${MemoraAdmin.money(
            order.total_paid
          )}
        </span>

      </div>


      <div class="summary-row">

        <span class="summary-label">
          Remaining
        </span>

        <span class="summary-value">
          ${MemoraAdmin.money(
            remaining
          )}
        </span>

      </div>


      <div class="summary-grand">

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


  ${
    payments.length
      ? `

          <section class="payment">

            <div class="section-label">
              Payment History
            </div>

            <table>

              <colgroup>
                <col>
                <col>
                <col>
                <col>
              </colgroup>

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Method
                  </th>

                  <th class="right">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>
                ${paymentRows}
              </tbody>

            </table>

          </section>

        `
      : ""
  }


  <footer class="footer">

    <div class="footer-left">

      <div class="footer-title">
        Thank you for choosing MEMORA.
      </div>

      <div class="footer-subtitle">
        Creative Printing & Personalized Stationery
      </div>

    </div>

    <div class="footer-right">
      Generated by MEMORA Studio
    </div>

  </footer>


</main>


<script>

window.addEventListener(
  "load",
  async function () {

    try {

      if (
        document.fonts &&
        document.fonts.ready
      ) {
        await document.fonts.ready;
      }

    }
    catch (error) {}


    setTimeout(
      function () {
        window.print();
      },
      250
    );

  }
);

<\/script>


</body>

</html>
      `;

    }


    async function printInvoice(orderId) {

      const button =
        document.querySelector(
          `[data-invoice="${orderId}"]`
        );


      if (button) {

        button.disabled =
          true;

        button.textContent =
          "Loading...";

      }


      try {

        const data =
          await loadInvoice(
            orderId
          );


        const popup =
          window.open(
            "",
            "_blank",
            "width=1000,height=850"
          );


        if (!popup) {

          throw new Error(
            "Popup diblokir browser. Izinkan popup untuk MEMORA."
          );

        }


        popup.document.open();

        popup.document.write(
          createInvoiceHtml(
            data
          )
        );

        popup.document.close();

      }
      finally {

        if (button) {

          button.disabled =
            false;

          button.textContent =
            "PDF";

        }

      }

    }


    document
      .querySelectorAll(
        "[data-invoice]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          async () => {

            try {

              await printInvoice(
                button.dataset.invoice
              );

            }
            catch (error) {

              console.error(error);

              alert(
                error.message ||
                "Invoice gagal dibuka."
              );

            }

          }
        );

      });

  });

});