(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  let user =
    null;


  let customer =
    null;


  let orders =
    [];


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


  function date(value) {

    if (!value) {
      return "-";
    }


    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    ).format(
      new Date(value)
    );

  }


  function statusLabel(status) {

    const map = {

      menunggu_konfirmasi:
        "Menunggu Konfirmasi",

      data_belum_lengkap:
        "Data Belum Lengkap",

      menunggu_approval:
        "Menunggu Approval",

      diproses:
        "Diproses",

      desain:
        "Desain",

      produksi:
        "Produksi",

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


    return (
      map[status] ||
      status ||
      "-"
    );

  }


  function badgeClass(status) {

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


    return "";
  }


  function renderRecentOrders() {

    const list =
      document.getElementById(
        "recentOrders"
      );


    const empty =
      document.getElementById(
        "recentOrdersEmpty"
      );


    if (
      orders.length ===
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
      orders
        .slice(
          0,
          3
        )
        .map(
          order => `
            <article class="order-row">

              <div>

                <div class="order-number">
                  ${order.order_number || "-"}
                </div>

                <div class="order-date">
                  ${date(order.created_at)}
                </div>

              </div>

              <span class="status-badge ${badgeClass(order.status)}">
                ${statusLabel(order.status)}
              </span>

              <div class="order-total">
                ${rupiah(order.grand_total)}
              </div>

              <a
                href="/account/orders/detail/?id=${encodeURIComponent(order.id)}"
                class="order-view"
              >
                Detail
              </a>

            </article>
          `
        )
        .join("");

  }


  function renderStats() {

    const valid =
      orders.filter(
        order =>
          order.status !==
          "dibatalkan"
      );


    const active =
      valid.filter(
        order =>
          order.status !==
          "selesai"
      );


    const completed =
      valid.filter(
        order =>
          order.status ===
          "selesai"
      );


    const spending =
      valid.reduce(
        (total, order) =>
          total +
          Number(
            order.grand_total || 0
          ),
        0
      );


    document.getElementById(
      "totalOrders"
    ).textContent =
      valid.length;


    document.getElementById(
      "activeOrders"
    ).textContent =
      active.length;


    document.getElementById(
      "completedOrders"
    ).textContent =
      completed.length;


    document.getElementById(
      "totalSpending"
    ).textContent =
      rupiah(
        spending
      );

  }


  async function init() {

    try {

      if (!db) {

        throw new Error(
          "Koneksi Supabase belum tersedia."
        );

      }


      const {
        data: session
      } =
        await db.auth
          .getSession();


      user =
        session
          ?.session
          ?.user;


      if (!user) {

        window.location.href =
          "/account/login/?next=/account/";

        return;

      }


      const {
        data: customerData,
        error: customerError
      } =
        await db
          .from(
            "customers"
          )
          .select("*")
          .eq(
            "auth_user_id",
            user.id
          )
          .maybeSingle();


      if (customerError) {
        throw customerError;
      }


      if (!customerData) {

        throw new Error(
          "Profil customer belum terhubung."
        );

      }


      customer =
        customerData;


      const {
        data: orderData,
        error: orderError
      } =
        await db
          .from(
            "orders"
          )
          .select(`
            id,
            order_number,
            status,
            payment_status,
            grand_total,
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


      document.getElementById(
        "accountName"
      ).textContent =
        customer.full_name ||
        "Customer";


      document.getElementById(
        "profileName"
      ).textContent =
        customer.full_name ||
        "-";


      document.getElementById(
        "profileEmail"
      ).textContent =
        customer.email ||
        user.email ||
        "-";


      document.getElementById(
        "profileWhatsapp"
      ).textContent =
        customer.whatsapp ||
        "-";


      renderStats();

      renderRecentOrders();


      document.getElementById(
        "accountLoading"
      ).hidden =
        true;


      document.getElementById(
        "accountContent"
      ).hidden =
        false;


      document.getElementById(
        "logoutButton"
      )
        ?.addEventListener(
          "click",
          async () => {

            await db.auth
              .signOut();


            window.location.href =
              "/";

          }
        );

    }
    catch (error) {

      console.error(
        "Account dashboard:",
        error
      );


      document.getElementById(
        "accountLoading"
      ).hidden =
        true;


      document.getElementById(
        "accountMessage"
      ).textContent =
        error?.message ||
        "Account belum dapat dimuat.";

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();