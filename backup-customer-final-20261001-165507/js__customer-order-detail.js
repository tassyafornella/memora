(function () {

  "use strict";


  const supabase =
    window.memoraSupabase;


  const loading =
    document.getElementById(
      "orderDetailLoading"
    );


  const errorBox =
    document.getElementById(
      "orderDetailError"
    );


  const content =
    document.getElementById(
      "orderDetailContent"
    );


  function setText(
    id,
    value
  ) {

    const el =
      document.getElementById(id);

    if (el) {
      el.textContent = value ?? "-";
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
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ).format(
      new Date(value)
    );

  }


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

    return map[status] || status || "-";

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


  function showError(message) {

    if (loading) {
      loading.hidden = true;
    }

    if (content) {
      content.hidden = true;
    }

    if (errorBox) {

      errorBox.textContent =
        message;

      errorBox.classList.add(
        "show"
      );

    }

  }


  async function init() {

    if (!supabase) {

      showError(
        "Koneksi akun belum tersedia."
      );

      return;

    }


    const params =
      new URLSearchParams(
        window.location.search
      );


    const orderId =
      params.get("id");


    if (!orderId) {

      showError(
        "ID pesanan tidak ditemukan."
      );

      return;

    }


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

      showError(
        "Sesi login tidak ditemukan."
      );

      return;

    }


    const {
      data: customer,
      error: customerError
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
      customerError ||
      !customer
    ) {

      showError(
        "Akun customer belum terhubung."
      );

      return;

    }


    const {
      data: order,
      error
    } =
      await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          customer_id,
          status,
          payment_status,
          pic,
          event_date,
          target_finish_date,
          deadline_date,
          customer_note,
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
          "id",
          orderId
        )
        .eq(
          "customer_id",
          customer.id
        )
        .maybeSingle();


    if (
      error ||
      !order
    ) {

      console.error(
        "Order detail:",
        error
      );

      showError(
        "Pesanan tidak ditemukan atau tidak dapat diakses."
      );

      return;

    }


    setText(
      "detailOrderNumber",
      order.order_number
    );


    setText(
      "detailOrderDate",
      date(order.created_at)
    );


    setText(
      "detailOrderStatus",
      customerStatus(order.status)
    );


    setText(
      "detailStatusText",
      customerStatus(order.status)
    );


    setText(
      "detailQueue",
      order.queue_number
        ? `#${order.queue_number}`
        : "-"
    );


    setText(
      "detailPic",
      order.pic || "-"
    );


    setText(
      "detailEventDate",
      date(order.event_date)
    );


    setText(
      "detailTargetDate",
      date(order.target_finish_date)
    );


    setText(
      "detailCustomerNote",
      order.customer_note ||
      "Tidak ada catatan."
    );


    setText(
      "detailPaymentStatus",
      paymentStatus(
        order.payment_status
      )
    );


    setText(
      "detailSubtotal",
      rupiah(order.subtotal)
    );


    setText(
      "detailShipping",
      rupiah(order.shipping_cost)
    );


    setText(
      "detailDiscount",
      rupiah(order.discount_amount)
    );


    setText(
      "detailPaid",
      rupiah(order.total_paid)
    );


    setText(
      "detailRemaining",
      rupiah(order.remaining_amount)
    );


    setText(
      "detailGrandTotal",
      rupiah(order.grand_total)
    );


    if (loading) {
      loading.hidden = true;
    }


    if (content) {
      content.hidden = false;
    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();
