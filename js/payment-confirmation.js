(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  let user =
    null;


  let customer =
    null;


  let order =
    null;


  function el(id) {

    return document.getElementById(
      id
    );

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


  function message(
    value,
    type = ""
  ) {

    const target =
      el(
        "paymentMessage"
      );


    target.textContent =
      value;


    target.className =
      "payment-message " +
      type;

  }


  function remainingAmount() {

    const grandTotal =
      Number(
        order?.grand_total || 0
      );


    const totalPaid =
      Number(
        order?.total_paid || 0
      );


    return Math.max(
      0,
      grandTotal - totalPaid
    );

  }


  function sanitizeFilename(
    filename
  ) {

    const extension =
      filename.includes(".")
        ? "." +
          filename
            .split(".")
            .pop()
            .toLowerCase()
        : "";


    return (
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2,10) +
      extension
    );

  }


  async function loadPage() {

    if (!db) {

      throw new Error(
        "Koneksi Supabase belum tersedia."
      );

    }


    const orderId =
      new URLSearchParams(
        location.search
      ).get(
        "order"
      );


    if (!orderId) {

      throw new Error(
        "Order tidak ditemukan."
      );

    }


    const {
      data: sessionData,
      error: sessionError
    } =
      await db.auth
        .getSession();


    if (sessionError) {
      throw sessionError;
    }


    user =
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
      data: customerData,
      error: customerError
    } =
      await db
        .from(
          "customers"
        )
        .select(
          "id, full_name, email"
        )
        .eq(
          "auth_user_id",
          user.id
        )
        .maybeSingle();


    if (
      customerError ||
      !customerData
    ) {

      throw (
        customerError ||
        new Error(
          "Customer tidak ditemukan."
        )
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
          customer_id,
          grand_total,
          total_paid,
          remaining_amount,
          payment_status
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
      orderError ||
      !orderData
    ) {

      throw (
        orderError ||
        new Error(
          "Pesanan tidak ditemukan."
        )
      );

    }


    order =
      orderData;


    el(
      "paymentOrderNumber"
    ).textContent =
      order.order_number ||
      "-";


    el(
      "paymentOrderTotal"
    ).textContent =
      rupiah(
        order.grand_total
      );


    el(
      "paymentRemaining"
    ).textContent =
      rupiah(
        order.remaining_amount ??
        remainingAmount()
      );


    el(
      "paymentAmount"
    ).max =
      String(
        order.remaining_amount ??
        remainingAmount()
      );


    el(
      "paymentLoading"
    ).hidden =
      true;


    el(
      "paymentContent"
    ).hidden =
      false;

  }


  async function submitConfirmation(
    event
  ) {

    event.preventDefault();


    message("");


    const amount =
      Number(
        el(
          "paymentAmount"
        ).value
      );


    const method =
      el(
        "paymentMethod"
      ).value;


    const proof =
      el(
        "paymentProof"
      ).files[0];


    const note =
      el(
        "paymentNote"
      ).value
        .trim();


    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {

      message(
        "Payment amount belum valid.",
        "error"
      );

      return;

    }


    const remaining =
      Number(
        order.remaining_amount ??
        remainingAmount()
      );


    if (
      remaining > 0 &&
      amount > remaining
    ) {

      message(
        "Nominal pembayaran melebihi sisa tagihan.",
        "error"
      );

      return;

    }


    if (!method) {

      message(
        "Pilih bank atau payment method.",
        "error"
      );

      return;

    }


    if (!proof) {

      message(
        "Upload payment proof terlebih dahulu.",
        "error"
      );

      return;

    }


    if (
      proof.size >
      5 * 1024 * 1024
    ) {

      message(
        "Ukuran bukti pembayaran maksimal 5 MB.",
        "error"
      );

      return;

    }


    const button =
      el(
        "paymentSubmitButton"
      );


    button.disabled =
      true;


    button.textContent =
      "Sending...";


    let uploadedPath =
      null;


    try {

      const filename =
        sanitizeFilename(
          proof.name
        );


      uploadedPath =
        `${customer.id}/${order.id}/${filename}`;


      const {
        error: uploadError
      } =
        await db.storage
          .from(
            "payment-proofs"
          )
          .upload(
            uploadedPath,
            proof,
            {
              upsert:
                false,

              contentType:
                proof.type
            }
          );


      if (uploadError) {
        throw uploadError;
      }


      const {
        error: insertError
      } =
        await db
          .from(
            "payment_confirmations"
          )
          .insert({

            order_id:
              order.id,

            customer_id:
              customer.id,

            amount:
              amount,

            payment_method:
              method,

            proof_path:
              uploadedPath,

            status:
              "waiting_verification",

            customer_note:
              note ||
              null

          });


      if (insertError) {
        throw insertError;
      }


      message(
        "Konfirmasi pembayaran berhasil dikirim.",
        "success"
      );


      event.target.reset();


      button.textContent =
        "Confirmation Sent";


      setTimeout(
        () => {

          window.location.href =
            "/account/orders/detail/?id=" +
            encodeURIComponent(
              order.id
            );

        },
        1200
      );

    }
    catch (error) {

      console.error(
        "Payment confirmation:",
        error
      );


      /*
       * Jika upload berhasil tetapi insert DB gagal,
       * hapus file agar storage tidak menyisakan file yatim.
       */

      if (uploadedPath) {

        try {

          await db.storage
            .from(
              "payment-proofs"
            )
            .remove([
              uploadedPath
            ]);

        }
        catch {
        }

      }


      message(
        error?.message ||
        "Konfirmasi pembayaran belum berhasil dikirim.",
        "error"
      );


      button.disabled =
        false;


      button.textContent =
        "Send Confirmation";

    }

  }


  async function init() {

    try {

      await loadPage();


      el(
        "paymentConfirmationForm"
      )
        ?.addEventListener(
          "submit",
          submitConfirmation
        );

    }
    catch (error) {

      console.error(
        "Payment page:",
        error
      );


      el(
        "paymentLoading"
      ).hidden =
        true;


      message(
        error?.message ||
        "Halaman pembayaran belum dapat dimuat.",
        "error"
      );

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();