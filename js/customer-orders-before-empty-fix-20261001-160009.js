(function () {

  "use strict";


  const supabase =
    window.memoraSupabase;


  let customerId =
    null;


  let orders =
    [];


  let activeFilter =
    "all";


  const list =
    document.getElementById(
      "customerOrdersList"
    );


  const empty =
    document.getElementById(
      "ordersEmpty"
    );


  const loading =
    document.getElementById(
      "ordersLoading"
    );


  const errorBox =
    document.getElementById(
      "ordersError"
    );


  /* ========================================================
     FORMAT
     ======================================================== */

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


    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ).format(
      new Date(value)
    );

  }


  /* ========================================================
     STATUS
     ======================================================== */

  function customerStatus(status) {

    const map = {

      menunggu_konfirmasi:
        "Pesanan Diproses",

      data_belum_lengkap:
        "Pesanan Diproses",

      data_lengkap:
        "Pesanan Diproses",

      desain:
        "Desain & Approval",

      menunggu_approval:
        "Desain & Approval",

      revisi:
        "Desain & Approval",

      approved:
        "Desain & Approval",

      printing:
        "Produksi",

      finishing:
        "Produksi",

      quality_check:
        "Produksi",

      packing:
        "Packing",

      dikirim:
        "Dikirim",

      selesai:
        "Selesai",

      dibatalkan:
        "Dibatalkan"

    };


    return (
      map[status] ||
      status ||
      "-"
    );

  }


  function paymentStatus(status) {

    const map = {

      belum_ada_pembayaran:
        "Belum ada pembayaran",

      menunggu_verifikasi:
        "Menunggu verifikasi",

      dp:
        "DP diterima",

      lunas:
        "Lunas"

    };


    return (
      map[status] ||
      String(status || "-")
        .replaceAll("_", " ")
    );

  }


  function statusGroup(status) {

    if (
      [
        "menunggu_konfirmasi",
        "data_belum_lengkap",
        "data_lengkap",
        "desain",
        "menunggu_approval",
        "revisi",
        "approved"
      ].includes(status)
    ) {

      return "process";

    }


    if (
      [
        "printing",
        "finishing",
        "quality_check",
        "packing"
      ].includes(status)
    ) {

      return "production";

    }


    if (
      status === "dikirim"
    ) {

      return "shipping";

    }


    if (
      status === "selesai"
    ) {

      return "done";

    }


    return "other";

  }


  /* ========================================================
     CUSTOMER
     ======================================================== */

  async function loadCustomer() {

    const {
      data: sessionData,
      error: sessionError
    } =
      await supabase
        .auth
        .getSession();


    const user =
      sessionData
        ?.session
        ?.user;


    if (
      sessionError ||
      !user
    ) {

      return false;

    }


    const {
      data: customer,
      error
    } =
      await supabase
        .from("customers")
        .select("id")
        .eq(
          "auth_user_id",
          user.id
        )
        .maybeSingle();


    if (
      error ||
      !customer
    ) {

      console.error(
        "Load customer orders:",
        error
      );


      showError(
        "Akun customer belum terhubung."
      );


      return false;

    }


    customerId =
      customer.id;


    return true;

  }


  /* ========================================================
     LOAD ORDERS
     ======================================================== */

  async function loadOrders() {

    const {
      data,
      error
    } =
      await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          payment_status,
          subtotal,
          shipping_cost,
          discount_amount,
          grand_total,
          total_paid,
          remaining_amount,
          created_at
        `)
        .eq(
          "customer_id",
          customerId
        )
        .eq(
          "is_archived",
          false
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (loading) {
      loading.hidden = true;
    }


    if (error) {

      console.error(
        "Load customer orders:",
        error
      );


      showError(
        `Pesanan belum dapat dimuat. ${error.message || ""}`
      );


      return;

    }


    orders =
      data || [];


    renderOrders();

  }


  /* ========================================================
     RENDER
     ======================================================== */

  function renderOrders() {

    let visibleOrders =
      orders;


    if (
      activeFilter !==
      "all"
    ) {

      visibleOrders =
        orders.filter(
          function (order) {

            return (
              statusGroup(
                order.status
              ) ===
              activeFilter
            );

          }
        );

    }


    if (
      visibleOrders.length ===
      0
    ) {

      list.innerHTML =
        "";


      empty.hidden =
        false;


      return;

    }


    empty.hidden =
      true;


    list.innerHTML =
      visibleOrders
        .map(
          function (order) {

            return `
              <article class="customer-order-card">

                <div class="customer-order-top">

                  <div>

                    <p class="customer-order-number">
                      ${order.order_number}
                    </p>

                    <span class="customer-order-date">
                      ${formatDate(order.created_at)}
                    </span>

                  </div>


                  <span class="customer-order-status">
                    ${customerStatus(order.status)}
                  </span>

                </div>


                <div class="customer-order-body">

                  <div class="customer-order-info">

                    <span>
                      Pembayaran
                    </span>

                    <strong>
                      ${paymentStatus(order.payment_status)}
                    </strong>

                  </div>


                  <div class="customer-order-info">

                    <span>
                      Sisa Pembayaran
                    </span>

                    <strong>
                      ${formatRupiah(order.remaining_amount)}
                    </strong>

                  </div>

                </div>


                <div class="customer-order-footer">

                  <div class="customer-order-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ${formatRupiah(order.grand_total)}
                    </strong>

                  </div>


                  <a
                    href="/account/orders/detail/?id=${encodeURIComponent(order.id)}"
                    class="customer-order-detail-button"
                  >
                    Lihat Rincian
                  </a>

                </div>

              </article>
            `;

          }
        )
        .join("");

  }


  /* ========================================================
     FILTER
     ======================================================== */

  function bindFilters() {

    document
      .querySelectorAll(
        "[data-order-filter]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              activeFilter =
                button.getAttribute(
                  "data-order-filter"
                ) ||
                "all";


              document
                .querySelectorAll(
                  "[data-order-filter]"
                )
                .forEach(
                  function (item) {

                    item.classList.remove(
                      "active"
                    );

                  }
                );


              button.classList.add(
                "active"
              );


              renderOrders();

            }
          );

        }
      );

  }


  /* ========================================================
     ERROR
     ======================================================== */

  function showError(message) {

    if (loading) {
      loading.hidden = true;
    }


    if (!errorBox) {
      return;
    }


    errorBox.textContent =
      message;


    errorBox.classList.add(
      "show"
    );

  }


  /* ========================================================
     INIT
     ======================================================== */

  async function init() {

    if (!supabase) {

      showError(
        "Koneksi akun belum tersedia."
      );

      return;

    }


    bindFilters();


    const ready =
      await loadCustomer();


    if (!ready) {
      return;
    }


    await loadOrders();

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();
