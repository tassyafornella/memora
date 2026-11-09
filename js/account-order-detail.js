(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  function text(
    id,
    value
  ) {

    const target =
      document.getElementById(
        id
      );


    if (target) {

      target.textContent =
        value ?? "-";

    }

  }


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
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
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


  function renderAddress(order) {

    const parts =
      [];


    if (
      order.shipping_recipient_name
    ) {

      parts.push(
        order.shipping_recipient_name
      );

    }


    if (
      order.shipping_phone
    ) {

      parts.push(
        order.shipping_phone
      );

    }


    if (
      order.shipping_address_line
    ) {

      parts.push(
        order.shipping_address_line
      );

    }


    const region =
      [
        order.shipping_village,
        order.shipping_district,
        order.shipping_city,
        order.shipping_province,
        order.shipping_postal_code
      ]
        .filter(Boolean)
        .join(", ");


    if (region) {

      parts.push(
        region
      );

    }


    if (
      order.shipping_landmark
    ) {

      parts.push(
        "Patokan: " +
        order.shipping_landmark
      );

    }


    document.getElementById(
      "detailAddress"
    ).innerHTML =
      parts.length
        ? parts.join("<br>")
        : "Alamat belum tersedia.";

  }


  async function init() {

    try {

      const orderId =
        new URLSearchParams(
          location.search
        ).get("id");


      if (!orderId) {

        throw new Error(
          "Order ID tidak ditemukan."
        );

      }


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
          "/account/login/?next=" +
          encodeURIComponent(
            location.pathname +
            location.search
          );

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
        data: order,
        error: orderError
      } =
        await db
          .from(
            "orders"
          )
          .select("*")
          .eq(
            "id",
            orderId
          )
          .eq(
            "customer_id",
            customer.id
          )
          .maybeSingle();


      if (
        orderError ||
        !order
      ) {

        throw (
          orderError ||
          new Error(
            "Pesanan tidak ditemukan."
          )
        );

      }


      const [
        itemResult,
        historyResult
      ] =
        await Promise.all([

          db
            .from(
              "order_items"
            )
            .select("*")
            .eq(
              "order_id",
              order.id
            )
            .order(
              "created_at",
              {
                ascending: true
              }
            ),

          db
            .from(
              "order_status_history"
            )
            .select("*")
            .eq(
              "order_id",
              order.id
            )
            .order(
              "created_at",
              {
                ascending: true
              }
            )

        ]);


      const items =
        itemResult.data ||
        [];


      const history =
        historyResult.error
          ? []
          : (
              historyResult.data ||
              []
            );


      text(
        "detailOrderNumber",
        order.order_number
      );


      text(
        "detailOrderDate",
        date(
          order.created_at
        )
      );


      text(
        "detailStatus",
        statusLabel(
          order.status
        )
      );


      text(
        "detailPaymentStatus",
        paymentLabel(
          order.payment_status
        )
      );


      text(
        "detailSubtotal",
        rupiah(
          order.subtotal
        )
      );


      text(
        "detailShipping",
        rupiah(
          order.shipping_cost
        )
      );


      text(
        "detailPaid",
        rupiah(
          order.total_paid
        )
      );


      text(
        "detailRemaining",
        rupiah(
          order.remaining_amount
        )
      );


      text(
        "detailGrandTotal",
        rupiah(
          order.grand_total
        )
      );


      text(
        "detailNote",
        order.customer_note ||
        "Tidak ada catatan."
      );


      const paymentButton =
        document.getElementById(
          "confirmPaymentButton"
        );


      if (paymentButton) {

        if (
          order.payment_status ===
          "lunas"
        ) {

          paymentButton.textContent =
            "Pembayaran Lunas";


          paymentButton.classList.add(
            "disabled"
          );


          paymentButton.removeAttribute(
            "href"
          );

        }
        else {

          paymentButton.href =
            "/payment/?order=" +
            encodeURIComponent(
              order.id
            );

        }

      }


      document.getElementById(
        "detailItems"
      ).innerHTML =
        items
          .map(
            item => `
              <article class="detail-item">

                <div>

                  <strong>
                    ${item.product_name || "MEMORA Product"}
                  </strong>

                  <p>
                    ${item.variant_name || "Package"}
                    - ${Number(item.quantity || 0)} pcs
                  </p>

                </div>

                <div class="detail-item-price">
                  ${rupiah(item.subtotal)}
                </div>

              </article>
            `
          )
          .join("");


      renderAddress(
        order
      );


      document.getElementById(
        "detailTimeline"
      ).innerHTML =
        history.length
          ? history
              .map(
                item => `
                  <div class="detail-timeline-item">

                    <div class="timeline-dot"></div>

                    <div class="timeline-content">

                      <strong>
                        ${statusLabel(item.status || item.order_status)}
                      </strong>

                      <span>
                        ${date(item.created_at)}
                      </span>

                      ${
                        item.note || item.notes
                          ? `
                            <p>
                              ${item.note || item.notes}
                            </p>
                          `
                          : ""
                      }

                    </div>

                  </div>
                `
              )
              .join("")
          : `
              <div class="account-empty">
                Belum ada riwayat status.
              </div>
            `;


      document.getElementById(
        "detailLoading"
      ).hidden =
        true;


      document.getElementById(
        "detailContent"
      ).hidden =
        false;

    }
    catch (error) {

      document.getElementById(
        "detailLoading"
      ).hidden =
        true;


      document.getElementById(
        "detailMessage"
      ).textContent =
        error?.message ||
        "Detail pesanan belum dapat dimuat.";

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();