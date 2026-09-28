(function () {

  "use strict";


  let orders = [];
  let customers = [];
  let payments = [];


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


  const PRODUCTION_STATUSES = [

    {
      key: "desain",
      label: "Desain"
    },

    {
      key: "menunggu_approval",
      label: "Approval"
    },

    {
      key: "revisi",
      label: "Revisi"
    },

    {
      key: "approved",
      label: "Approved"
    },

    {
      key: "printing",
      label: "Printing"
    },

    {
      key: "finishing",
      label: "Finishing"
    },

    {
      key: "quality_check",
      label: "Quality Check"
    },

    {
      key: "packing",
      label: "Packing"
    },

    {
      key: "dikirim",
      label: "Dikirim"
    }

  ];


  function supabaseClient() {

    return window.memoraSupabase || null;

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


  function setText(
    id,
    value
  ) {

    const element =
      document.getElementById(id);


    if (element) {

      element.textContent =
        value;

    }

  }


  function normalizeStatus(value) {

    return String(
      value || ""
    )
      .trim()
      .toLowerCase();

  }


  function getOrderStatus(order) {

    return normalizeStatus(
      order.status ||
      order.order_status
    );

  }


  function getPaymentStatus(order) {

    return normalizeStatus(
      order.payment_status
    );

  }


  function getOrderTotal(order) {

    const candidates = [

      order.grand_total,
      order.total,
      order.total_amount,
      order.final_total,
      order.amount

    ];


    for (
      const candidate of candidates
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


  function getPaymentAmount(payment) {

    const candidates = [

      payment.amount,
      payment.payment_amount,
      payment.nominal,
      payment.total,
      payment.paid_amount

    ];


    for (
      const candidate of candidates
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


  function getCustomerName(customer) {

    if (!customer) {

      return "Customer";

    }


    return (
      customer.name ||
      customer.full_name ||
      customer.customer_name ||
      "Customer"
    );

  }


  function findCustomer(order) {

    const customerId =
      order.customer_id;


    if (!customerId) {

      return null;

    }


    return customers.find(
      customer =>
        String(customer.id) ===
        String(customerId)
    ) || null;

  }


  function getOrderNumber(order) {

    return (
      order.order_number ||
      order.order_no ||
      order.number ||
      "-"
    );

  }


  function getOrderCreatedAt(order) {

    return (
      order.created_at ||
      order.order_date ||
      order.created_on ||
      null
    );

  }


  function statusLabel(status) {

    return (
      STATUS_LABELS[status] ||
      status
        .replaceAll("_", " ")
        .replace(
          /\b\w/g,
          value =>
            value.toUpperCase()
        ) ||
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


  async function loadOrders() {

    const supabase =
      supabaseClient();


    if (!supabase) {

      throw new Error(
        "Supabase belum tersedia."
      );

    }


    const {
      data,
      error
    } =
      await supabase
        .from("orders")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(500);


    if (error) {

      throw error;

    }


    orders =
      Array.isArray(data)
        ? data
        : [];

  }


  async function loadCustomers() {

    const supabase =
      supabaseClient();


    if (!supabase) {

      return;

    }


    const {
      data,
      error
    } =
      await supabase
        .from("customers")
        .select("*")
        .limit(1000);


    if (error) {

      console.warn(
        "Dashboard customers:",
        error
      );

      customers = [];

      return;

    }


    customers =
      Array.isArray(data)
        ? data
        : [];

  }


  async function loadPayments() {

    const supabase =
      supabaseClient();


    if (!supabase) {

      return;

    }


    const {
      data,
      error
    } =
      await supabase
        .from("payments")
        .select("*")
        .limit(2000);


    if (error) {

      console.warn(
        "Dashboard payments:",
        error
      );

      payments = [];

      return;

    }


    payments =
      Array.isArray(data)
        ? data
        : [];

  }


  function renderDate() {

    setText(
      "dashboardDate",
      new Intl.DateTimeFormat(
        "id-ID",
        {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric"
        }
      ).format(
        new Date()
      )
    );

  }


  function renderMainStats() {

    const total =
      orders.length;


    const waiting =
      orders.filter(
        order =>
          getOrderStatus(order) ===
          "menunggu_konfirmasi"
      ).length;


    const completed =
      orders.filter(
        order =>
          getOrderStatus(order) ===
          "selesai"
      ).length;


    const excluded = [

      "menunggu_konfirmasi",
      "selesai",
      "dibatalkan"

    ];


    const processing =
      orders.filter(
        order => {

          const status =
            getOrderStatus(order);


          return (
            status &&
            !excluded.includes(status)
          );

        }
      ).length;


    setText(
      "statTotalOrders",
      total
    );


    setText(
      "statWaitingOrders",
      waiting
    );


    setText(
      "statProcessingOrders",
      processing
    );


    setText(
      "statCompletedOrders",
      completed
    );

  }


  function renderFinance() {

    const validOrders =
      orders.filter(
        order =>
          getOrderStatus(order) !==
          "dibatalkan"
      );


    const orderValue =
      validOrders.reduce(
        (total, order) =>
          total +
          getOrderTotal(order),
        0
      );


    let paidAmount =
      payments.reduce(
        (total, payment) =>
          total +
          getPaymentAmount(payment),
        0
      );


    /*
     * Fallback jika tabel payments belum berisi data,
     * tetapi orders sudah menyimpan paid_amount.
     */

    if (
      paidAmount === 0
    ) {

      paidAmount =
        validOrders.reduce(
          (
            total,
            order
          ) => {

            const value =
              Number(
                order.paid_amount ||
                order.total_paid ||
                order.payment_total ||
                0
              );


            return total +
              (
                Number.isFinite(value)
                  ? value
                  : 0
              );

          },
          0
        );

    }


    const outstanding =
      Math.max(
        0,
        orderValue -
        paidAmount
      );


    const paidOrders =
      validOrders.filter(
        order =>
          getPaymentStatus(order) ===
          "lunas"
      ).length;


    setText(
      "statOrderValue",
      formatRupiah(
        orderValue
      )
    );


    setText(
      "statPaidAmount",
      formatRupiah(
        paidAmount
      )
    );


    setText(
      "statOutstandingAmount",
      formatRupiah(
        outstanding
      )
    );


    setText(
      "statPaidOrders",
      paidOrders
    );

  }


  function renderRecentOrders() {

    const body =
      document.getElementById(
        "recentOrdersBody"
      );


    const empty =
      document.getElementById(
        "recentOrdersEmpty"
      );


    if (!body) {

      return;

    }


    const recent =
      orders.slice(
        0,
        7
      );


    if (!recent.length) {

      body.innerHTML =
        "";


      if (empty) {

        empty.hidden =
          false;

      }


      return;

    }


    if (empty) {

      empty.hidden =
        true;

    }


    body.innerHTML =
      recent
        .map(
          order => {

            const customer =
              findCustomer(order);


            const status =
              getOrderStatus(order);


            const detailId =
              order.id
                ? encodeURIComponent(
                    order.id
                  )
                : "";


            return `

              <tr>

                <td>

                  <strong class="dashboard-order-number">
                    ${escapeHtml(
                      getOrderNumber(order)
                    )}
                  </strong>

                </td>


                <td>

                  <span class="dashboard-customer-name">
                    ${escapeHtml(
                      getCustomerName(
                        customer
                      )
                    )}
                  </span>

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
                      dashboard-status
                      dashboard-status-${statusClass(
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
                    getOrderCreatedAt(
                      order
                    )
                  )}
                </td>


                <td>

                  <a
                    href="../order-detail/?id=${detailId}"
                    class="dashboard-detail-link"
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


  function renderAttention() {

    const container =
      document.getElementById(
        "attentionList"
      );


    if (!container) {

      return;

    }


    const waiting =
      orders.filter(
        order =>
          getOrderStatus(order) ===
          "menunggu_konfirmasi"
      ).length;


    const incomplete =
      orders.filter(
        order =>
          getOrderStatus(order) ===
          "data_belum_lengkap"
      ).length;


    const approval =
      orders.filter(
        order =>
          getOrderStatus(order) ===
          "menunggu_approval"
      ).length;


    const unpaid =
      orders.filter(
        order => {

          const paymentStatus =
            getPaymentStatus(order);


          const orderStatus =
            getOrderStatus(order);


          return (
            orderStatus !==
              "dibatalkan" &&
            orderStatus !==
              "selesai" &&
            paymentStatus !==
              "lunas"
          );

        }
      ).length;


    const items = [

      {
        count: waiting,
        title:
          "Menunggu konfirmasi",
        description:
          "Order baru yang belum diperiksa.",
        href:
          "../orders/"
      },

      {
        count: incomplete,
        title:
          "Data belum lengkap",
        description:
          "Customer masih perlu melengkapi data.",
        href:
          "../orders/"
      },

      {
        count: approval,
        title:
          "Menunggu approval",
        description:
          "Desain menunggu persetujuan customer.",
        href:
          "../production/"
      },

      {
        count: unpaid,
        title:
          "Belum lunas",
        description:
          "Order aktif dengan pembayaran belum lunas.",
        href:
          "../finance/"
      }

    ];


    container.innerHTML =
      items
        .map(
          item => `

            <a
              href="${item.href}"
              class="dashboard-attention-item"
            >

              <div
                class="
                  dashboard-attention-count
                  ${
                    item.count > 0
                      ? "has-value"
                      : ""
                  }
                "
              >
                ${item.count}
              </div>

              <div>

                <strong>
                  ${item.title}
                </strong>

                <span>
                  ${item.description}
                </span>

              </div>

              <span class="dashboard-attention-arrow">
                →
              </span>

            </a>

          `
        )
        .join("");

  }


  function renderProduction() {

    const container =
      document.getElementById(
        "productionGrid"
      );


    if (!container) {

      return;

    }


    container.innerHTML =
      PRODUCTION_STATUSES
        .map(
          item => {

            const count =
              orders.filter(
                order =>
                  getOrderStatus(order) ===
                  item.key
              ).length;


            return `

              <article class="dashboard-production-card">

                <span>
                  ${item.label}
                </span>

                <strong>
                  ${count}
                </strong>

                <small>
                  order
                </small>

              </article>

            `;

          }
        )
        .join("");

  }


  function escapeHtml(value) {

    const element =
      document.createElement(
        "div"
      );


    element.textContent =
      String(
        value ?? ""
      );


    return element.innerHTML;

  }


  function renderError(message) {

    const body =
      document.getElementById(
        "recentOrdersBody"
      );


    if (body) {

      body.innerHTML = `

        <tr>

          <td
            colspan="6"
            class="dashboard-table-error"
          >
            ${escapeHtml(message)}
          </td>

        </tr>

      `;

    }

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


    function closeSidebar() {

      sidebar?.classList.remove(
        "open"
      );


      overlay?.classList.remove(
        "show"
      );

    }


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
      closeSidebar
    );

  }


  async function loadDashboard() {

    try {

      await Promise.all([
        loadOrders(),
        loadCustomers(),
        loadPayments()
      ]);


      renderMainStats();

      renderFinance();

      renderRecentOrders();

      renderAttention();

      renderProduction();

    }
    catch (error) {

      console.error(
        "Memora Dashboard:",
        error
      );


      renderError(
        error?.message ||
        "Dashboard gagal dimuat."
      );

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    () => {

      renderDate();

      setupSidebar();


      /*
       * Guard tetap menangani login.
       * Dashboard diberi sedikit delay agar auth
       * dan Supabase selesai siap.
       */

      setTimeout(
        loadDashboard,
        150
      );

    }
  );


})();
