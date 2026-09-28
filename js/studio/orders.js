(function () {

  "use strict";


  let orders = [];
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


  const PAYMENT_LABELS = {

    belum_ada_pembayaran:
      "Belum Bayar",

    dp_diterima:
      "DP Diterima",

    sebagian:
      "Sebagian",

    lunas:
      "Lunas"

  };


  function client() {

    return window.memoraSupabase || null;

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
        month: "short",
        year: "numeric"
      }
    ).format(date);

  }


  function normalize(value) {

    return String(
      value || ""
    )
      .trim()
      .toLowerCase();

  }


  function getStatus(order) {

    return normalize(
      order.status ||
      order.order_status
    );

  }


  function getPaymentStatus(order) {

    return normalize(
      order.payment_status
    );

  }


  function getOrderNumber(order) {

    return (
      order.order_number ||
      order.order_no ||
      order.number ||
      "-"
    );

  }


  function getOrderTotal(order) {

    const values = [

      order.grand_total,
      order.total,
      order.total_amount,
      order.final_total,
      order.amount

    ];


    for (
      const candidate of values
    ) {

      const value =
        Number(candidate);


      if (
        Number.isFinite(value)
      ) {

        return value;

      }

    }


    return 0;

  }


  function findCustomer(order) {

    if (!order.customer_id) {

      return null;

    }


    return customers.find(
      customer =>
        String(customer.id) ===
        String(order.customer_id)
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
      ""
    );

  }


  function statusLabel(status) {

    return (
      STATUS_LABELS[status] ||
      status ||
      "-"
    );

  }


  function paymentLabel(status) {

    return (
      PAYMENT_LABELS[status] ||
      status ||
      "-"
    );

  }


  function statusClass(status) {

    if (
      status === "selesai"
    ) {

      return "success";

    }


    if (
      status === "dibatalkan"
    ) {

      return "danger";

    }


    if (
      [
        "menunggu_konfirmasi",
        "data_belum_lengkap",
        "menunggu_approval"
      ].includes(status)
    ) {

      return "warning";

    }


    return "processing";

  }


  function paymentClass(status) {

    if (
      status === "lunas"
    ) {

      return "paid";

    }


    if (
      [
        "dp_diterima",
        "sebagian"
      ].includes(status)
    ) {

      return "partial";

    }


    return "unpaid";

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
      ordersResult,
      customersResult
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
          .select("*")

      ]);


    if (
      ordersResult.error
    ) {

      throw ordersResult.error;

    }


    if (
      customersResult.error
    ) {

      console.warn(
        "Orders customers:",
        customersResult.error
      );

    }


    orders =
      Array.isArray(
        ordersResult.data
      )
        ? ordersResult.data
        : [];


    customers =
      Array.isArray(
        customersResult.data
      )
        ? customersResult.data
        : [];

  }


  function renderStats() {

    const total =
      orders.length;


    const waiting =
      orders.filter(
        order =>
          getStatus(order) ===
          "menunggu_konfirmasi"
      ).length;


    const completed =
      orders.filter(
        order =>
          getStatus(order) ===
          "selesai"
      ).length;


    const processing =
      orders.filter(
        order => {

          const status =
            getStatus(order);


          return (
            status &&
            ![
              "menunggu_konfirmasi",
              "selesai",
              "dibatalkan"
            ].includes(status)
          );

        }
      ).length;


    document.getElementById(
      "ordersTotal"
    ).textContent = total;


    document.getElementById(
      "ordersWaiting"
    ).textContent = waiting;


    document.getElementById(
      "ordersProcessing"
    ).textContent = processing;


    document.getElementById(
      "ordersCompleted"
    ).textContent = completed;

  }


  function getFilteredOrders() {

    const search =
      normalize(
        document.getElementById(
          "ordersSearch"
        )?.value
      );


    const status =
      normalize(
        document.getElementById(
          "ordersStatusFilter"
        )?.value
      );


    const payment =
      normalize(
        document.getElementById(
          "ordersPaymentFilter"
        )?.value
      );


    return orders.filter(
      order => {

        const customer =
          findCustomer(order);


        if (
          status &&
          getStatus(order) !==
          status
        ) {

          return false;

        }


        if (
          payment &&
          getPaymentStatus(order) !==
          payment
        ) {

          return false;

        }


        if (!search) {

          return true;

        }


        const haystack = [

          getOrderNumber(order),
          customerName(customer),
          customerWhatsapp(customer),
          customerEmail(customer)

        ]
          .join(" ")
          .toLowerCase();


        return haystack.includes(
          search
        );

      }
    );

  }


  function renderOrders() {

    const body =
      document.getElementById(
        "ordersTableBody"
      );


    const empty =
      document.getElementById(
        "ordersEmpty"
      );


    const count =
      document.getElementById(
        "ordersResultCount"
      );


    const filtered =
      getFilteredOrders();


    if (count) {

      count.textContent =
        `${filtered.length} order`;

    }


    if (!filtered.length) {

      body.innerHTML = "";


      if (empty) {

        empty.hidden = false;

      }


      return;

    }


    if (empty) {

      empty.hidden = true;

    }


    body.innerHTML =
      filtered
        .map(
          order => {

            const customer =
              findCustomer(order);


            const status =
              getStatus(order);


            const payment =
              getPaymentStatus(order);


            const id =
              encodeURIComponent(
                order.id || ""
              );


            return `

              <tr>

                <td>

                  <span class="orders-order-number">
                    ${escapeHtml(
                      getOrderNumber(order)
                    )}
                  </span>

                </td>


                <td>

                  <span class="orders-customer-name">
                    ${escapeHtml(
                      customerName(customer)
                    )}
                  </span>

                  ${
                    customerEmail(customer)
                      ? `
                        <span class="orders-customer-email">
                          ${escapeHtml(
                            customerEmail(customer)
                          )}
                        </span>
                      `
                      : ""
                  }

                </td>


                <td>

                  ${escapeHtml(
                    customerWhatsapp(customer)
                  )}

                </td>


                <td>

                  <strong>
                    ${formatRupiah(
                      getOrderTotal(order)
                    )}
                  </strong>

                </td>


                <td>

                  <span
                    class="
                      orders-payment
                      orders-payment-${paymentClass(
                        payment
                      )}
                    "
                  >
                    ${escapeHtml(
                      paymentLabel(payment)
                    )}
                  </span>

                </td>


                <td>

                  <span
                    class="
                      orders-status
                      orders-status-${statusClass(
                        status
                      )}
                    "
                  >
                    ${escapeHtml(
                      statusLabel(status)
                    )}
                  </span>

                </td>


                <td>

                  ${formatDate(
                    order.created_at
                  )}

                </td>


                <td>

                  <a
                    href="../order-detail/?id=${id}"
                    class="orders-detail-button"
                  >
                    Detail
                  </a>

                </td>

              </tr>

            `;

          }
        )
        .join("");

  }


  function renderError(message) {

    const body =
      document.getElementById(
        "ordersTableBody"
      );


    body.innerHTML = `

      <tr>

        <td
          colspan="8"
          class="orders-error"
        >
          ${escapeHtml(message)}
        </td>

      </tr>

    `;

  }


  function bindFilters() {

    const search =
      document.getElementById(
        "ordersSearch"
      );


    const status =
      document.getElementById(
        "ordersStatusFilter"
      );


    const payment =
      document.getElementById(
        "ordersPaymentFilter"
      );


    const reset =
      document.getElementById(
        "ordersResetFilter"
      );


    const refresh =
      document.getElementById(
        "ordersRefreshButton"
      );


    search?.addEventListener(
      "input",
      renderOrders
    );


    status?.addEventListener(
      "change",
      renderOrders
    );


    payment?.addEventListener(
      "change",
      renderOrders
    );


    reset?.addEventListener(
      "click",
      () => {

        if (search) {
          search.value = "";
        }

        if (status) {
          status.value = "";
        }

        if (payment) {
          payment.value = "";
        }

        renderOrders();

      }
    );


    refresh?.addEventListener(
      "click",
      async () => {

        refresh.disabled =
          true;


        refresh.textContent =
          "Memuat...";


        try {

          await loadData();

          renderStats();

          renderOrders();

        }
        catch (error) {

          renderError(
            error?.message ||
            "Gagal memuat order."
          );

        }
        finally {

          refresh.disabled =
            false;


          refresh.textContent =
            "Refresh";

        }

      }
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

    bindFilters();


    try {

      await loadData();

      renderStats();

      renderOrders();

    }
    catch (error) {

      console.error(
        "Memora Orders:",
        error
      );


      renderError(
        error?.message ||
        "Gagal memuat order."
      );

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
