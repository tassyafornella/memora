(function () {

  "use strict";


  const db =
    window.memoraSupabase;


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
        month: "long",
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


  function paymentLabel(status) {

    const map = {

      belum_ada_pembayaran:
        "Belum Ada Pembayaran",

      dp_diterima:
        "DP Diterima",

      sebagian:
        "Sebagian",

      lunas:
        "Lunas"

    };


    return (
      map[status] ||
      status ||
      "-"
    );

  }


  function badgeClass(status) {

    if (
      status === "selesai" ||
      status === "lunas"
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
        "menunggu_approval",
        "belum_ada_pembayaran",
        "dp_diterima",
        "sebagian"
      ].includes(status)
    ) {
      return "warning";
    }


    return "";
  }


  async function init() {

    try {

      const {
        data: sessionData
      } =
        await db.auth
          .getSession();


      const user =
        sessionData
          ?.session
          ?.user;


      if (!user) {

        window.location.href =
          "/account/login/?next=/account/orders/";

        return;

      }


      const {
        data: customer,
        error: customerError
      } =
        await db
          .from(
            "customers"
          )
          .select("id")
          .eq(
            "auth_user_id",
            user.id
          )
          .maybeSingle();


      if (
        customerError ||
        !customer
      ) {

        throw (
          customerError ||
          new Error(
            "Customer tidak ditemukan."
          )
        );

      }


      const {
        data,
        error
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


      if (error) {
        throw error;
      }


      const orders =
        data || [];


      document.getElementById(
        "ordersLoading"
      ).hidden =
        true;


      document.getElementById(
        "ordersContent"
      ).hidden =
        false;


      if (
        orders.length ===
        0
      ) {

        document.getElementById(
          "ordersEmpty"
        ).hidden =
          false;


        return;

      }


      document.getElementById(
        "ordersList"
      ).innerHTML =
        orders
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

                <div>

                  <span class="status-badge ${badgeClass(order.status)}">
                    ${statusLabel(order.status)}
                  </span>

                  <br>

                  <span class="status-badge ${badgeClass(order.payment_status)}">
                    ${paymentLabel(order.payment_status)}
                  </span>

                </div>

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
    catch (error) {

      document.getElementById(
        "ordersLoading"
      ).hidden =
        true;


      document.getElementById(
        "ordersMessage"
      ).textContent =
        error?.message ||
        "Pesanan belum dapat dimuat.";

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();