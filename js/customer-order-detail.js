(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  const loading =
    document.getElementById(
      "detailLoading"
    );


  const content =
    document.getElementById(
      "detailContent"
    );


  const errorBox =
    document.getElementById(
      "detailError"
    );


  function el(id) {
    return document.getElementById(id);
  }


  function text(
    id,
    value
  ) {

    const target =
      el(id);


    if (target) {

      target.textContent =
        value ?? "-";

    }

  }


  function esc(value) {

    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function rupiah(value) {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style:
          "currency",

        currency:
          "IDR",

        maximumFractionDigits:
          0
      }
    ).format(
      Number(value) || 0
    );

  }


  function tanggal(value) {

    if (!value) {
      return "-";
    }


    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day:
          "numeric",

        month:
          "long",

        year:
          "numeric"
      }
    ).format(
      new Date(value)
    );

  }


  function statusLabel(status) {

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


  function paymentLabel(status) {

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


  function stage(status) {

    const map = {

      menunggu_konfirmasi:
        0,

      data_belum_lengkap:
        0,

      data_lengkap:
        0,

      desain:
        1,

      revisi:
        1,

      menunggu_approval:
        2,

      approved:
        2,

      printing:
        3,

      finishing:
        3,

      quality_check:
        3,

      packing:
        4,

      dikirim:
        5,

      selesai:
        6

    };


    return (
      map[status] ??
      0
    );

  }


  function renderTimeline(order) {

    const steps = [
      "Pesanan Dibuat",
      "Desain",
      "Approval",
      "Produksi",
      "Packing",
      "Dikirim",
      "Selesai"
    ];


    const current =
      stage(order.status);


    el(
      "orderTimeline"
    ).innerHTML =
      steps
        .map(
          function (
            step,
            index
          ) {

            return `
              <div
                class="timeline-item ${index <= current ? "done" : ""}"
              >

                <span class="timeline-dot"></span>

                <div>

                  <strong>
                    ${step}
                  </strong>

                  ${
                    index === current
                      ? `
                        <small>
                          Status saat ini
                        </small>
                      `
                      : ""
                  }

                </div>

              </div>
            `;

          }
        )
        .join("");

  }


  function renderItems(items) {

    const container =
      el("orderProducts");


    if (
      !items ||
      !items.length
    ) {

      container.innerHTML =
        `
          <p class="detail-address">
            Detail produk belum tersedia.
          </p>
        `;

      return;

    }


    container.innerHTML =
      items
        .map(
          function (item) {

            const name =
              item.product_name ||
              item.name ||
              item.title ||
              "Produk Memora";


            const variant =
              item.variant_name ||
              item.package_name ||
              item.package ||
              item.selected_variant ||
              item.selected_size ||
              "";


            const shape =
              item.selected_shape ||
              "";


            const qty =
              item.quantity ||
              item.qty ||
              1;


            const unit =
              item.unit_price ??
              item.price ??
              0;


            const total =
              item.line_total ??
              item.total ??
              (
                Number(unit) *
                Number(qty)
              );


            const details =
              [
                variant,
                shape,
                `${qty} pcs`
              ]
                .filter(Boolean)
                .join(" · ");


            return `
              <div class="detail-product">

                <strong>
                  ${esc(name)}
                </strong>

                <p>
                  ${esc(details)}
                </p>

                <div class="detail-product-price">
                  ${rupiah(total)}
                </div>

              </div>
            `;

          }
        )
        .join("");

  }


  function renderAddress(order) {

    const parts = [];


    if (
      order.shipping_recipient_name
    ) {

      parts.push(
        `<strong>${esc(order.shipping_recipient_name)}</strong>`
      );

    }


    if (
      order.shipping_phone
    ) {

      parts.push(
        esc(order.shipping_phone)
      );

    }


    if (
      order.shipping_address_line
    ) {

      parts.push(
        esc(order.shipping_address_line)
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
        .map(esc)
        .join(", ");


    if (region) {
      parts.push(region);
    }


    if (
      order.shipping_landmark
    ) {

      parts.push(
        `Patokan: ${esc(order.shipping_landmark)}`
      );

    }


    el(
      "orderAddress"
    ).innerHTML =
      parts.length
        ? parts.join("<br>")
        : "Alamat pengiriman untuk pesanan lama belum tersimpan sebagai snapshot.";

  }


  async function init() {

    if (!db) {
      return;
    }


    const orderId =
      new URLSearchParams(
        location.search
      ).get("id");


    if (!orderId) {

      showError(
        "Pesanan tidak ditemukan."
      );

      return;

    }


    try {

      const {
        data: auth
      } =
        await db.auth.getSession();


      const user =
        auth?.session?.user;


      if (!user) {

        throw new Error(
          "Sesi login tidak ditemukan."
        );

      }


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
          .from("orders")
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
        shippingResult,
        historyResult
      ] =
        await Promise.all([

          db
            .from("order_items")
            .select("*")
            .eq(
              "order_id",
              order.id
            ),

          db
            .from("shipping")
            .select("*")
            .eq(
              "order_id",
              order.id
            )
            .maybeSingle(),

          db
            .from("order_status_history")
            .select("*")
            .eq(
              "order_id",
              order.id
            )
            .order(
              "created_at",
              {
                ascending:
                  true
              }
            )

        ]);


      text(
        "orderNumber",
        order.order_number
      );


      text(
        "orderDate",
        tanggal(
          order.created_at
        )
      );


      text(
        "orderStatus",
        statusLabel(
          order.status
        )
      );


      text(
        "queueNumber",
        order.queue_number
          ? `#${order.queue_number}`
          : "-"
      );


      text(
        "eventDate",
        tanggal(
          order.event_date
        )
      );


      text(
        "targetDate",
        tanggal(
          order.target_finish_date
        )
      );


      text(
        "paymentStatus",
        paymentLabel(
          order.payment_status
        )
      );


      text(
        "subtotal",
        rupiah(
          order.subtotal
        )
      );


      text(
        "shippingCost",
        rupiah(
          order.shipping_cost
        )
      );


      text(
        "discount",
        rupiah(
          order.discount_amount
        )
      );


      text(
        "paid",
        rupiah(
          order.total_paid
        )
      );


      text(
        "remaining",
        rupiah(
          order.remaining_amount
        )
      );


      text(
        "grandTotal",
        rupiah(
          order.grand_total
        )
      );


      text(
        "orderNote",
        order.customer_note ||
        "Tidak ada catatan."
      );


      renderItems(
        itemResult.data || []
      );


      renderAddress(
        order
      );


      renderTimeline(
        order,
        historyResult.data || []
      );


      const shipping =
        shippingResult.data;


      if (shipping) {

        const section =
          el(
            "shippingSection"
          );


        section.hidden =
          false;


        text(
          "courier",
          shipping.courier ||
          "-"
        );


        text(
          "service",
          shipping.service ||
          "-"
        );


        text(
          "shippingStatus",
          String(
            shipping.shipping_status ||
            "belum_dikirim"
          )
            .replaceAll(
              "_",
              " "
            )
        );


        text(
          "trackingNumber",
          shipping.tracking_number ||
          "Belum tersedia"
        );

      }


      loading.hidden =
        true;


      content.hidden =
        false;

    }
    catch (error) {

      console.error(
        "Order detail:",
        error
      );


      showError(
        error?.message ||
        "Rincian pesanan belum dapat dimuat."
      );

    }

  }


  function showError(message) {

    if (loading) {
      loading.hidden = true;
    }


    if (content) {
      content.hidden = true;
    }


    errorBox.textContent =
      message;


    errorBox
      .classList
      .add("show");

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();
