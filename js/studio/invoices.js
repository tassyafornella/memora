(function () {

  "use strict";


  let orders = [];
  let customers = [];
  let orderItems = [];
  let payments = [];

  let activeInvoice = null;


  const PAYMENT_STATUS_LABELS = {

    belum_ada_pembayaran:
      "Belum Ada Pembayaran",

    dp_diterima:
      "DP Diterima",

    sebagian:
      "Pembayaran Sebagian",

    lunas:
      "Lunas"

  };


  function client() {

    return window.memoraSupabase || null;

  }


  function normalize(value) {

    return String(
      value || ""
    )
      .trim()
      .toLowerCase();

  }


  function escapeHtml(value) {

    const div =
      document.createElement("div");

    div.textContent =
      String(value ?? "");

    return div.innerHTML;

  }


  function formatRupiah(value) {

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


  function formatDateShort(value) {

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
        month: "short",
        year: "numeric"
      }
    ).format(date);

  }


  function getOrderNumber(order) {

    return (
      order?.order_number ||
      order?.order_no ||
      order?.number ||
      "-"
    );

  }


  function getOrderTotal(order) {

    return Number(
      order?.grand_total ||
      order?.total ||
      order?.total_amount ||
      order?.final_total ||
      0
    ) || 0;

  }


  function getShipping(order) {

    return Number(
      order?.shipping_cost ||
      order?.shipping_fee ||
      order?.ongkir ||
      0
    ) || 0;

  }


  function findCustomer(order) {

    return customers.find(
      customer =>
        String(customer.id) ===
        String(order?.customer_id)
    ) || null;

  }


  function customerName(customer) {

    return (
      customer?.name ||
      customer?.full_name ||
      customer?.customer_name ||
      "Customer"
    );

  }


  function customerWhatsapp(customer) {

    return (
      customer?.whatsapp ||
      customer?.phone ||
      customer?.phone_number ||
      customer?.wa ||
      "-"
    );

  }


  function customerEmail(customer) {

    return (
      customer?.email ||
      "-"
    );

  }


  function customerAddress(customer) {

    return (
      customer?.address ||
      customer?.alamat ||
      "-"
    );

  }


  function paymentAmount(payment) {

    return Number(
      payment?.amount ||
      0
    ) || 0;

  }


  function orderPayments(orderId) {

    return payments
      .filter(
        payment =>
          String(payment.order_id) ===
          String(orderId)
      )
      .sort(
        (a, b) =>
          new Date(
            a.payment_date ||
            a.created_at ||
            0
          ) -
          new Date(
            b.payment_date ||
            b.created_at ||
            0
          )
      );

  }


  function orderPaidAmount(orderId) {

    return orderPayments(orderId)
      .reduce(
        (total, payment) =>
          total +
          paymentAmount(payment),
        0
      );

  }


  function itemsForOrder(orderId) {

    return orderItems.filter(
      item =>
        String(item.order_id) ===
        String(orderId)
    );

  }


  function itemSubtotal(item) {

    const qty =
      Number(
        item.quantity || 1
      );


    const unitPrice =
      Number(
        item.unit_price ||
        item.price ||
        0
      );


    return Number(
      item.subtotal ||
      item.total ||
      (
        qty *
        unitPrice
      )
    ) || 0;

  }


  function orderSubtotal(order) {

    const direct =
      Number(
        order?.subtotal
      );


    if (
      Number.isFinite(direct) &&
      direct > 0
    ) {
      return direct;
    }


    const itemTotal =
      itemsForOrder(
        order.id
      )
      .reduce(
        (total, item) =>
          total +
          itemSubtotal(item),
        0
      );


    if (itemTotal > 0) {
      return itemTotal;
    }


    return Math.max(
      0,
      getOrderTotal(order) -
      getShipping(order)
    );

  }


  function paymentTypeLabel(payment) {

    const type =
      normalize(
        payment?.payment_type
      );


    if (type === "dp") {
      return "DP";
    }


    if (
      type === "pelunasan" ||
      type === "final"
    ) {
      return "Pelunasan";
    }


    return "Pembayaran";
  }


  function documentTitle(
    payment,
    isFinal
  ) {

    if (isFinal) {

      return "INVOICE FINAL";

    }


    const type =
      normalize(
        payment?.payment_type
      );


    if (type === "dp") {

      return "INVOICE DP";

    }


    if (
      type === "pelunasan"
    ) {

      return "INVOICE PELUNASAN";

    }


    return "INVOICE PEMBAYARAN";

  }


  function makeInvoiceNumber(
    order,
    payment,
    isFinal
  ) {

    const rawOrder =
      getOrderNumber(order)
        .replace(
          /[^a-zA-Z0-9]/g,
          ""
        )
        .slice(-8);


    if (isFinal) {

      return (
        "FINAL-" +
        rawOrder
      );

    }


    const paymentList =
      orderPayments(
        order.id
      );


    const index =
      paymentList.findIndex(
        item =>
          String(item.id) ===
          String(payment?.id)
      );


    return (
      "PAY-" +
      rawOrder +
      "-" +
      String(
        Math.max(
          1,
          index + 1
        )
      ).padStart(
        2,
        "0"
      )
    );

  }


  async function loadData() {

    const supabase =
      client();


    if (!supabase) {

      throw new Error(
        "Supabase belum tersedia."
      );

    }


    const [
      orderResult,
      customerResult,
      itemResult,
      paymentResult
    ] =
      await Promise.all([

        supabase
          .from("orders")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          ),

        supabase
          .from("customers")
          .select("*"),

        supabase
          .from("order_items")
          .select("*"),

        supabase
          .from("payments")
          .select("*")
          .order(
            "created_at",
            {
              ascending: true
            }
          )

      ]);


    if (orderResult.error) {
      throw orderResult.error;
    }


    if (customerResult.error) {
      throw customerResult.error;
    }


    if (itemResult.error) {
      throw itemResult.error;
    }


    if (paymentResult.error) {
      throw paymentResult.error;
    }


    orders =
      orderResult.data || [];


    customers =
      customerResult.data || [];


    orderItems =
      itemResult.data || [];


    payments =
      paymentResult.data || [];

  }


  function renderStats() {

    const active =
      orders.filter(
        order =>
          normalize(order.status) !==
          "dibatalkan"
      );


    const withPayment =
      active.filter(
        order =>
          orderPayments(
            order.id
          ).length > 0
      );


    const paid =
      active.filter(
        order =>
          normalize(
            order.payment_status
          ) === "lunas"
      );


    const totalPayment =
      payments.reduce(
        (total, payment) =>
          total +
          paymentAmount(payment),
        0
      );


    document.getElementById(
      "invoiceOrderCount"
    ).textContent =
      active.length;


    document.getElementById(
      "invoicePaymentOrderCount"
    ).textContent =
      withPayment.length;


    document.getElementById(
      "invoicePaidOrderCount"
    ).textContent =
      paid.length;


    document.getElementById(
      "invoicePaymentTotal"
    ).textContent =
      formatRupiah(
        totalPayment
      );

  }


  function filteredOrders() {

    const search =
      normalize(
        document.getElementById(
          "invoiceSearch"
        )?.value
      );


    const filter =
      normalize(
        document.getElementById(
          "invoicePaymentFilter"
        )?.value
      );


    return orders
      .filter(
        order =>
          normalize(order.status) !==
          "dibatalkan"
      )
      .filter(
        order => {

          const paymentList =
            orderPayments(
              order.id
            );


          const paidAmount =
            orderPaidAmount(
              order.id
            );


          const total =
            getOrderTotal(order);


          if (
            filter === "paid" &&
            paymentList.length === 0
          ) {

            return false;

          }


          if (
            filter === "unpaid" &&
            paymentList.length > 0
          ) {

            return false;

          }


          if (
            filter === "lunas" &&
            paidAmount < total
          ) {

            return false;

          }


          if (!search) {

            return true;

          }


          const customer =
            findCustomer(order);


          const haystack = [

            getOrderNumber(order),

            customerName(customer),

            customerWhatsapp(customer)

          ]
            .join(" ")
            .toLowerCase();


          return haystack.includes(
            search
          );

        }
      );

  }


  function paymentOptions(order) {

    const list =
      orderPayments(
        order.id
      );


    if (!list.length) {

      return `
        <option value="">
          Belum ada pembayaran
        </option>
      `;

    }


    return list.map(
      payment => `

        <option value="${escapeHtml(
          payment.id
        )}">

          ${escapeHtml(
            paymentTypeLabel(payment)
          )}

          -

          ${formatRupiah(
            paymentAmount(payment)
          )}

          -

          ${formatDateShort(
            payment.payment_date ||
            payment.created_at
          )}

        </option>

      `
    ).join("");

  }


  function renderOrders() {

    const container =
      document.getElementById(
        "invoiceOrderGrid"
      );


    const empty =
      document.getElementById(
        "invoiceEmpty"
      );


    const data =
      filteredOrders();


    if (!data.length) {

      container.innerHTML = "";

      empty.hidden =
        false;

      return;

    }


    empty.hidden =
      true;


    container.innerHTML =
      data.map(
        order => {

          const customer =
            findCustomer(order);


          const paid =
            orderPaidAmount(
              order.id
            );


          const total =
            getOrderTotal(order);


          const remaining =
            Math.max(
              0,
              total - paid
            );


          const hasPayments =
            orderPayments(
              order.id
            ).length > 0;


          const isLunas =
            total > 0 &&
            paid >= total;


          return `

            <article class="invoice-order-card">

              <div class="invoice-order-header">

                <h3>
                  ${escapeHtml(
                    getOrderNumber(order)
                  )}
                </h3>

                <span>
                  ${formatDateShort(
                    order.created_at
                  )}
                </span>

              </div>


              <div class="invoice-customer">

                <strong>
                  ${escapeHtml(
                    customerName(customer)
                  )}
                </strong>

                <span>
                  ${escapeHtml(
                    customerWhatsapp(customer)
                  )}
                </span>

              </div>


              <div class="invoice-order-summary">

                <div>
                  <span>Grand Total</span>
                  <strong>
                    ${formatRupiah(total)}
                  </strong>
                </div>

                <div>
                  <span>Sudah Dibayar</span>
                  <strong>
                    ${formatRupiah(paid)}
                  </strong>
                </div>

                <div>
                  <span>Sisa</span>
                  <strong>
                    ${formatRupiah(
                      remaining
                    )}
                  </strong>
                </div>

              </div>


              <span class="invoice-payment-status">

                ${
                  isLunas
                    ? "Lunas"
                    : hasPayments
                      ? "Ada Pembayaran"
                      : "Belum Ada Pembayaran"
                }

              </span>


              <select
                class="invoice-payment-select"
                data-payment-select="${escapeHtml(
                  order.id
                )}"
                ${hasPayments ? "" : "disabled"}
              >

                ${paymentOptions(order)}

              </select>


              <div class="invoice-card-actions">

                <button
                  type="button"
                  class="invoice-card-button primary"
                  data-payment-invoice="${escapeHtml(
                    order.id
                  )}"
                  ${hasPayments ? "" : "disabled"}
                >
                  Invoice Pembayaran
                </button>


                <button
                  type="button"
                  class="invoice-card-button secondary"
                  data-final-invoice="${escapeHtml(
                    order.id
                  )}"
                  ${isLunas ? "" : "disabled"}
                >
                  Invoice Final
                </button>

              </div>

            </article>

          `;

        }
      ).join("");


    bindInvoiceButtons();

  }


  function findPayment(
    paymentId
  ) {

    return payments.find(
      payment =>
        String(payment.id) ===
        String(paymentId)
    ) || null;

  }


  function paidUntilPayment(
    orderId,
    payment
  ) {

    const list =
      orderPayments(orderId);


    let total = 0;


    for (
      const item of list
    ) {

      total +=
        paymentAmount(item);


      if (
        String(item.id) ===
        String(payment.id)
      ) {

        break;

      }

    }


    return total;

  }


  function createInvoiceData(
    order,
    payment,
    isFinal
  ) {

    const customer =
      findCustomer(order);


    const items =
      itemsForOrder(
        order.id
      );


    const total =
      getOrderTotal(order);


    const subtotal =
      orderSubtotal(order);


    const shipping =
      getShipping(order);


    const allPaid =
      orderPaidAmount(
        order.id
      );


    const cumulativePaid =
      isFinal
        ? allPaid
        : paidUntilPayment(
            order.id,
            payment
          );


    const remaining =
      Math.max(
        0,
        total -
        cumulativePaid
      );


    return {

      order,

      customer,

      items,

      payment,

      isFinal,

      title:
        documentTitle(
          payment,
          isFinal
        ),

      invoiceNumber:
        makeInvoiceNumber(
          order,
          payment,
          isFinal
        ),

      subtotal,

      shipping,

      grandTotal:
        total,

      currentPayment:
        isFinal
          ? allPaid
          : paymentAmount(
              payment
            ),

      totalPaid:
        cumulativePaid,

      remaining

    };

  }


  function openPaymentInvoice(
    orderId
  ) {

    const order =
      orders.find(
        item =>
          String(item.id) ===
          String(orderId)
      );


    if (!order) {
      return;
    }


    const select =
      document.querySelector(
        `[data-payment-select="${CSS.escape(
          String(orderId)
        )}"]`
      );


    const payment =
      findPayment(
        select?.value
      );


    if (!payment) {

      alert(
        "Pilih pembayaran terlebih dahulu."
      );

      return;

    }


    activeInvoice =
      createInvoiceData(
        order,
        payment,
        false
      );


    renderPreview();

  }


  function openFinalInvoice(
    orderId
  ) {

    const order =
      orders.find(
        item =>
          String(item.id) ===
          String(orderId)
      );


    if (!order) {
      return;
    }


    const paymentList =
      orderPayments(
        order.id
      );


    const lastPayment =
      paymentList[
        paymentList.length - 1
      ] || null;


    activeInvoice =
      createInvoiceData(
        order,
        lastPayment,
        true
      );


    renderPreview();

  }


  function renderPreview() {

    if (!activeInvoice) {
      return;
    }


    const {
      order,
      customer,
      items,
      payment,
      isFinal
    } =
      activeInvoice;


    document.getElementById(
      "previewInvoiceTitle"
    ).textContent =
      activeInvoice.title;


    document.getElementById(
      "previewInvoiceNumber"
    ).textContent =
      activeInvoice.invoiceNumber;


    document.getElementById(
      "previewCustomerName"
    ).textContent =
      customerName(customer);


    document.getElementById(
      "previewCustomerWhatsapp"
    ).textContent =
      customerWhatsapp(customer);


    document.getElementById(
      "previewCustomerEmail"
    ).textContent =
      customerEmail(customer);


    document.getElementById(
      "previewCustomerAddress"
    ).textContent =
      customerAddress(customer);


    document.getElementById(
      "previewOrderNumber"
    ).textContent =
      getOrderNumber(order);


    document.getElementById(
      "previewInvoiceDate"
    ).textContent =
      formatDate(
        isFinal
          ? new Date()
          : (
              payment?.payment_date ||
              payment?.created_at ||
              new Date()
            )
      );


    document.getElementById(
      "previewInvoiceStatus"
    ).textContent =
      activeInvoice.remaining <= 0
        ? "LUNAS"
        : (
            PAYMENT_STATUS_LABELS[
              normalize(
                order.payment_status
              )
            ] ||
            "PEMBAYARAN DITERIMA"
          );


    document.getElementById(
      "previewPaymentType"
    ).textContent =
      isFinal
        ? "Final / Lunas"
        : paymentTypeLabel(
            payment
          );


    document.getElementById(
      "previewCurrentPayment"
    ).textContent =
      formatRupiah(
        activeInvoice.currentPayment
      );


    document.getElementById(
      "previewPaymentMethod"
    ).textContent =
      isFinal
        ? "-"
        : (
            payment?.payment_method ||
            "-"
          );


    document.getElementById(
      "previewPaymentDate"
    ).textContent =
      isFinal
        ? "-"
        : formatDate(
            payment?.payment_date ||
            payment?.created_at
          );


    document.getElementById(
      "previewReferenceNote"
    ).textContent =
      isFinal
        ? "Pembayaran telah diterima sepenuhnya."
        : (
            payment?.reference_note ||
            "-"
          );


    document.getElementById(
      "previewSubtotal"
    ).textContent =
      formatRupiah(
        activeInvoice.subtotal
      );


    document.getElementById(
      "previewShipping"
    ).textContent =
      formatRupiah(
        activeInvoice.shipping
      );


    document.getElementById(
      "previewGrandTotal"
    ).textContent =
      formatRupiah(
        activeInvoice.grandTotal
      );


    document.getElementById(
      "previewTotalPaid"
    ).textContent =
      formatRupiah(
        activeInvoice.totalPaid
      );


    document.getElementById(
      "previewRemaining"
    ).textContent =
      formatRupiah(
        activeInvoice.remaining
      );


    document.getElementById(
      "previewInvoiceItems"
    ).innerHTML =
      items.length
        ? items.map(
            item => {

              const qty =
                Number(
                  item.quantity || 1
                );


              const unitPrice =
                Number(
                  item.unit_price ||
                  item.price ||
                  0
                );


              return `

                <tr>

                  <td>

                    <strong>
                      ${escapeHtml(
                        item.product_name ||
                        item.name ||
                        "Produk"
                      )}
                    </strong>

                    ${
                      item.variant_name ||
                      item.variant
                        ? `
                          <br>
                          <small>
                            ${escapeHtml(
                              item.variant_name ||
                              item.variant
                            )}
                          </small>
                        `
                        : ""
                    }

                  </td>

                  <td>
                    ${qty}
                  </td>

                  <td>
                    ${formatRupiah(
                      unitPrice
                    )}
                  </td>

                  <td>
                    ${formatRupiah(
                      itemSubtotal(item)
                    )}
                  </td>

                </tr>

              `;

            }
          ).join("")
        : `
            <tr>
              <td colspan="4">
                Tidak ada item order.
              </td>
            </tr>
          `;


    document.getElementById(
      "invoiceModal"
    ).hidden = false;

  }


  function closePreview() {

    document.getElementById(
      "invoiceModal"
    ).hidden = true;

  }


  function safeFileName(value) {

    return String(
      value || "invoice"
    )
      .replace(
        /[^a-zA-Z0-9-_]/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );

  }


  function createPdf() {

    if (!activeInvoice) {
      return null;
    }


    const {
      jsPDF
    } =
      window.jspdf;


    const doc =
      new jsPDF({
        unit: "mm",
        format: "a4"
      });


    const invoice =
      activeInvoice;


    const order =
      invoice.order;


    const customer =
      invoice.customer;


    const payment =
      invoice.payment;


    /*
     * HEADER
     */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(19);

    doc.text(
      "MEMORA",
      18,
      20
    );


    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      "Creative Printing & Personalized Stationery",
      18,
      26
    );


    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(17);

    doc.text(
      invoice.title,
      192,
      20,
      {
        align: "right"
      }
    );


    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      invoice.invoiceNumber,
      192,
      26,
      {
        align: "right"
      }
    );


    doc.line(
      18,
      32,
      192,
      32
    );


    /*
     * CUSTOMER
     */

    doc.setFontSize(8);

    doc.text(
      "BILL TO",
      18,
      42
    );


    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      customerName(customer),
      18,
      48
    );


    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);


    doc.text(
      "WhatsApp: " +
      customerWhatsapp(customer),
      18,
      54
    );


    if (
      customerEmail(customer) !==
      "-"
    ) {

      doc.text(
        "Email: " +
        customerEmail(customer),
        18,
        59
      );

    }


    doc.text(
      "Order ID: " +
      getOrderNumber(order),
      192,
      43,
      {
        align: "right"
      }
    );


    doc.text(
      "Tanggal: " +
      formatDate(
        invoice.isFinal
          ? new Date()
          : (
              payment?.payment_date ||
              payment?.created_at
            )
      ),
      192,
      49,
      {
        align: "right"
      }
    );


    doc.text(
      "Status: " +
      (
        invoice.remaining <= 0
          ? "LUNAS"
          : "PEMBAYARAN DITERIMA"
      ),
      192,
      55,
      {
        align: "right"
      }
    );


    /*
     * ITEMS
     */

    const tableRows =
      invoice.items.map(
        item => [

          item.product_name ||
          item.name ||
          "Produk",

          String(
            Number(
              item.quantity || 1
            )
          ),

          formatRupiah(
            Number(
              item.unit_price ||
              item.price ||
              0
            )
          ),

          formatRupiah(
            itemSubtotal(item)
          )

        ]
      );


    doc.autoTable({

      startY: 70,

      head: [[
        "Produk",
        "Qty",
        "Harga",
        "Total"
      ]],

      body:
        tableRows,

      theme:
        "grid",

      styles: {
        fontSize: 8,
        cellPadding: 3
      },

      headStyles: {
        fillColor: [
          23,
          63,
          53
        ]
      },

      columnStyles: {
        1: {
          halign: "center"
        },
        2: {
          halign: "right"
        },
        3: {
          halign: "right"
        }
      }

    });


    let y =
      doc.lastAutoTable.finalY +
      10;


    /*
     * PAYMENT DETAIL
     */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.text(
      invoice.isFinal
        ? "STATUS PEMBAYARAN"
        : "PEMBAYARAN",
      18,
      y
    );


    y += 6;


    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);


    if (
      invoice.isFinal
    ) {

      doc.text(
        "Status: Lunas",
        18,
        y
      );

    }
    else {

      doc.text(
        "Jenis: " +
        paymentTypeLabel(
          payment
        ),
        18,
        y
      );


      doc.text(
        "Pembayaran kali ini: " +
        formatRupiah(
          invoice.currentPayment
        ),
        18,
        y + 5
      );


      doc.text(
        "Metode: " +
        (
          payment?.payment_method ||
          "-"
        ),
        18,
        y + 10
      );


      if (
        payment?.reference_note
      ) {

        doc.text(
          "Keterangan: " +
          String(
            payment.reference_note
          ),
          18,
          y + 15,
          {
            maxWidth: 80
          }
        );

      }

    }


    /*
     * TOTALS
     */

    const totalXLabel =
      125;


    const totalXValue =
      192;


    doc.text(
      "Subtotal Produk",
      totalXLabel,
      y
    );


    doc.text(
      formatRupiah(
        invoice.subtotal
      ),
      totalXValue,
      y,
      {
        align: "right"
      }
    );


    doc.text(
      "Ongkir",
      totalXLabel,
      y + 6
    );


    doc.text(
      formatRupiah(
        invoice.shipping
      ),
      totalXValue,
      y + 6,
      {
        align: "right"
      }
    );


    doc.setFont(
      "helvetica",
      "bold"
    );


    doc.text(
      "Grand Total",
      totalXLabel,
      y + 14
    );


    doc.text(
      formatRupiah(
        invoice.grandTotal
      ),
      totalXValue,
      y + 14,
      {
        align: "right"
      }
    );


    doc.setFont(
      "helvetica",
      "normal"
    );


    doc.text(
      "Total Dibayar",
      totalXLabel,
      y + 21
    );


    doc.text(
      formatRupiah(
        invoice.totalPaid
      ),
      totalXValue,
      y + 21,
      {
        align: "right"
      }
    );


    doc.setFont(
      "helvetica",
      "bold"
    );


    doc.text(
      "Sisa Tagihan",
      totalXLabel,
      y + 28
    );


    doc.text(
      formatRupiah(
        invoice.remaining
      ),
      totalXValue,
      y + 28,
      {
        align: "right"
      }
    );


    /*
     * FOOTER
     */

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);


    doc.text(
      "Terima kasih telah mempercayai Memora.",
      18,
      280
    );


    doc.setFont(
      "helvetica",
      "bold"
    );


    doc.text(
      "Tassya & Arif",
      192,
      280,
      {
        align: "right"
      }
    );


    return doc;

  }


  function pdfFileName() {

    if (!activeInvoice) {

      return "Memora-Invoice.pdf";

    }


    return (
      "Memora-" +
      safeFileName(
        activeInvoice.invoiceNumber
      ) +
      "-" +
      safeFileName(
        customerName(
          activeInvoice.customer
        )
      ) +
      ".pdf"
    );

  }


  function exportPdf() {

    const doc =
      createPdf();


    if (!doc) {
      return;
    }


    doc.save(
      pdfFileName()
    );

  }


  async function sharePdf() {

    const doc =
      createPdf();


    if (!doc) {
      return;
    }


    const blob =
      doc.output(
        "blob"
      );


    const file =
      new File(
        [
          blob
        ],
        pdfFileName(),
        {
          type:
            "application/pdf"
        }
      );


    const shareData = {

      title:
        activeInvoice.title +
        " Memora",

      text:
        activeInvoice.title +
        " - " +
        getOrderNumber(
          activeInvoice.order
        ),

      files: [
        file
      ]

    };


    try {

      if (
        navigator.share &&
        (
          !navigator.canShare ||
          navigator.canShare(
            shareData
          )
        )
      ) {

        await navigator.share(
          shareData
        );

        return;

      }


      /*
       * Browser desktop biasanya belum mendukung
       * share PDF file.
       *
       * Fallback = download otomatis.
       */

      doc.save(
        pdfFileName()
      );


      alert(
        "Browser ini belum mendukung Share PDF langsung. File PDF sudah di-download dan bisa dikirim melalui WhatsApp."
      );

    }
    catch (error) {

      /*
       * AbortError artinya user menutup share sheet.
       */

      if (
        error?.name ===
        "AbortError"
      ) {

        return;

      }


      console.error(
        "Share PDF:",
        error
      );


      doc.save(
        pdfFileName()
      );


      alert(
        "Share PDF tidak tersedia. File PDF sudah di-download."
      );

    }

  }


  function bindInvoiceButtons() {

    document
      .querySelectorAll(
        "[data-payment-invoice]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              openPaymentInvoice(
                button.dataset
                  .paymentInvoice
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-final-invoice]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              openFinalInvoice(
                button.dataset
                  .finalInvoice
              );

            }
          );

        }
      );

  }


  function bindEvents() {

    document.getElementById(
      "invoiceSearch"
    )?.addEventListener(
      "input",
      renderOrders
    );


    document.getElementById(
      "invoicePaymentFilter"
    )?.addEventListener(
      "change",
      renderOrders
    );


    document.getElementById(
      "invoiceResetButton"
    )?.addEventListener(
      "click",
      () => {

        document.getElementById(
          "invoiceSearch"
        ).value = "";


        document.getElementById(
          "invoicePaymentFilter"
        ).value = "";


        renderOrders();

      }
    );


    document.getElementById(
      "invoiceRefreshButton"
    )?.addEventListener(
      "click",
      async () => {

        await loadData();

        renderStats();

        renderOrders();

      }
    );


    document.querySelectorAll(
      "[data-close-invoice]"
    ).forEach(
      element => {

        element.addEventListener(
          "click",
          closePreview
        );

      }
    );


    document.getElementById(
      "exportPdfButton"
    )?.addEventListener(
      "click",
      exportPdf
    );


    document.getElementById(
      "sharePdfButton"
    )?.addEventListener(
      "click",
      sharePdf
    );

  }


  function setupSidebar() {

    const button =
      document.getElementById(
        "studioMenuButton"
      );


    const sidebar =
      document.getElementById(
        "studioSidebar"
      );


    const overlay =
      document.getElementById(
        "studioMobileOverlay"
      );


    button?.addEventListener(
      "click",
      () => {

        sidebar?.classList.toggle(
          "open"
        );

        overlay?.classList.toggle(
          "show"
        );

      }
    );


    overlay?.addEventListener(
      "click",
      () => {

        sidebar?.classList.remove(
          "open"
        );

        overlay?.classList.remove(
          "show"
        );

      }
    );

  }


  async function init() {

    setupSidebar();

    bindEvents();


    try {

      await loadData();

      renderStats();

      renderOrders();

    }
    catch (error) {

      console.error(
        "Memora Invoice:",
        error
      );


      document.getElementById(
        "invoiceOrderGrid"
      ).innerHTML = `

        <div class="invoice-loading">
          ${escapeHtml(
            error?.message ||
            "Gagal memuat invoice."
          )}
        </div>

      `;

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    () => {

      setTimeout(
        init,
        150
      );

    }
  );


})();
