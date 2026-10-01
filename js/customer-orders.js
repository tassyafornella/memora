(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  const list =
    document.getElementById(
      "customerOrdersList"
    );


  const loading =
    document.getElementById(
      "ordersLoading"
    );


  const empty =
    document.getElementById(
      "ordersEmpty"
    );


  const errorBox =
    document.getElementById(
      "ordersError"
    );


  let orders = [];
  let orderItems = [];
  let activeFilter = "all";


  /* ======================================================
     FORMAT
  ====================================================== */

  function rupiah(value) {

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


  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  /* ======================================================
     STATUS
  ====================================================== */

  function getStatusLabel(status) {

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


  function getPaymentLabel(status) {

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


  function getFilterGroup(status) {

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


    if (status === "dikirim") {
      return "shipping";
    }


    if (status === "selesai") {
      return "done";
    }


    return "other";

  }


  /* ======================================================
     ORDER ITEM
  ====================================================== */

  function getItemsForOrder(orderId) {

    return orderItems.filter(
      item =>
        item.order_id === orderId
    );

  }


  function renderProduct(order) {

    const items =
      getItemsForOrder(
        order.id
      );


    if (!items.length) {

      return `
        <div class="order-product-area">

          <div class="order-product-empty">
            Detail produk tersedia pada rincian pesanan.
          </div>

        </div>
      `;

    }


    const first =
      items[0];


    const productName =
      first.product_name ||
      "Produk Memora";


    const variant =
      first.variant_name ||
      "Package";


    const quantity =
      Number(
        first.quantity
      ) || 1;


    const extra =
      items.length > 1
        ? `
          <span class="order-product-extra">
            +${items.length - 1} produk lainnya
          </span>
        `
        : "";


    return `
      <div class="order-product-area">

        <div class="order-product-summary">

          <div class="order-product-main">

            <span class="order-product-label">
              PRODUK
            </span>

            <strong class="order-product-name">
              ${escapeHtml(productName)}
            </strong>

          </div>


          <div class="order-product-meta">

            <span class="order-product-chip">
              ${escapeHtml(variant)}
            </span>

            <span class="order-product-chip">
              ${quantity} pcs
            </span>

            ${extra}

          </div>

        </div>

      </div>
    `;

  }


  /* ======================================================
     RENDER
  ====================================================== */

  function renderOrders() {

    if (loading) {

      loading.hidden = true;
      loading.style.display = "none";

    }


    let visibleOrders =
      orders;


    if (
      activeFilter !== "all"
    ) {

      visibleOrders =
        orders.filter(
          order =>
            getFilterGroup(
              order.status
            ) === activeFilter
        );

    }


    if (
      visibleOrders.length === 0
    ) {

      if (list) {
        list.innerHTML = "";
      }


      if (empty) {

        empty.hidden = false;
        empty.style.display = "";

      }


      return;

    }


    if (empty) {

      empty.hidden = true;
      empty.style.display = "none";

    }


    if (!list) {
      return;
    }


    list.innerHTML =
      visibleOrders
        .map(
          order => `

            <article class="customer-order-card">


              <div class="customer-order-top">

                <div>

                  <strong class="customer-order-number">
                    ${escapeHtml(order.order_number)}
                  </strong>

                  <div class="customer-order-date">
                    ${formatDate(order.created_at)}
                  </div>

                </div>


                <span class="customer-order-status">
                  ${escapeHtml(
                    getStatusLabel(
                      order.status
                    )
                  )}
                </span>

              </div>


              ${renderProduct(order)}


              <div class="customer-order-body">

                <div class="customer-order-info">

                  <span>
                    Pembayaran
                  </span>

                  <strong>
                    ${escapeHtml(
                      getPaymentLabel(
                        order.payment_status
                      )
                    )}
                  </strong>

                </div>


                <div class="customer-order-info">

                  <span>
                    Sisa Pembayaran
                  </span>

                  <strong>
                    ${rupiah(
                      order.remaining_amount
                    )}
                  </strong>

                </div>

              </div>


              <div class="customer-order-footer">

                <div class="customer-order-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    ${rupiah(
                      order.grand_total
                    )}
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

          `
        )
        .join("");

  }


  /* ======================================================
     FILTER
  ====================================================== */

  function bindFilters() {

    const buttons =
      document.querySelectorAll(
        "[data-order-filter]"
      );


    buttons.forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            activeFilter =
              button.dataset.orderFilter ||
              "all";


            buttons.forEach(
              item =>
                item.classList.remove(
                  "active"
                )
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


  /* ======================================================
     ERROR
  ====================================================== */

  function showError(error) {

    console.error(
      "Pesanan Saya:",
      error
    );


    if (loading) {

      loading.hidden = true;
      loading.style.display = "none";

    }


    if (errorBox) {

      errorBox.hidden = false;

      errorBox.textContent =
        "Pesanan belum dapat dimuat. " +
        (
          error?.message ||
          ""
        );

      errorBox.classList.add(
        "show"
      );

    }
    else if (list) {

      list.innerHTML = `
        <div style="
          padding:20px;
          border:1px solid #dde6e0;
          border-radius:16px;
          color:#6c2936;
          font-size:12px;
          background:#fff;
        ">
          Pesanan belum dapat dimuat.
          ${
            escapeHtml(
              error?.message ||
              ""
            )
          }
        </div>
      `;

    }

  }


  /* ======================================================
     INIT
  ====================================================== */

  async function init() {

    try {

      if (!db) {

        throw new Error(
          "Koneksi Supabase belum tersedia."
        );

      }


      bindFilters();


      const {
        data: sessionData,
        error: sessionError
      } =
        await db.auth.getSession();


      if (sessionError) {
        throw sessionError;
      }


      const user =
        sessionData
          ?.session
          ?.user;


      if (!user) {

        window.location.href =
          "/account/login/?next=" +
          encodeURIComponent(
            "/account/orders/"
          );

        return;

      }


      /* ================================================
         CURRENT CUSTOMER
      ================================================ */

      const {
        data: customer,
        error: customerError
      } =
        await db
          .from("customers")
          .select("id")
          .eq(
            "auth_user_id",
            user.id
          )
          .maybeSingle();


      if (customerError) {
        throw customerError;
      }


      if (!customer) {

        throw new Error(
          "Data customer akun ini belum ditemukan."
        );

      }


      /* ================================================
         ORDERS
      ================================================ */

      const {
        data: orderData,
        error: orderError
      } =
        await db
          .from("orders")
          .select(`
            id,
            order_number,
            customer_id,
            status,
            payment_status,
            subtotal,
            shipping_cost,
            discount_amount,
            grand_total,
            total_paid,
            remaining_amount,
            queue_number,
            created_at
          `)
          .eq(
            "customer_id",
            customer.id
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


      if (orderError) {
        throw orderError;
      }


      orders =
        orderData || [];


      /* ================================================
         ORDER ITEMS
      ================================================ */

      if (
        orders.length > 0
      ) {

        const ids =
          orders.map(
            order =>
              order.id
          );


        const {
          data: itemData,
          error: itemError
        } =
          await db
            .from("order_items")
            .select(`
              id,
              order_id,
              product_name,
              variant_name,
              quantity,
              unit_price,
              subtotal
            `)
            .in(
              "order_id",
              ids
            );


        /*
         * Jangan sampai seluruh halaman gagal hanya karena
         * order_items belum dapat dibaca.
         */

        if (itemError) {

          console.warn(
            "Order items belum dapat dibaca:",
            itemError
          );

          orderItems = [];

        }
        else {

          orderItems =
            itemData || [];

        }

      }


      renderOrders();

    }
    catch (error) {

      showError(
        error
      );

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();
