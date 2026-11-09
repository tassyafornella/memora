(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  let confirmations =
    [];


  let customers =
    [];


  let orders =
    [];


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


  function date(value) {

    if (!value) {
      return "-";
    }


    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(
      new Date(value)
    );

  }


  function message(
    value,
    type = ""
  ) {

    const target =
      el(
        "studioPaymentMessage"
      );


    target.textContent =
      value;


    target.className =
      "studio-message " +
      type;

  }


  function findCustomer(id) {

    return customers.find(
      item =>
        String(item.id) ===
        String(id)
    );

  }


  function findOrder(id) {

    return orders.find(
      item =>
        String(item.id) ===
        String(id)
    );

  }


  async function requireAdmin() {

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
        "/studio/login/?redirect=/studio/payments/";

      return false;

    }


    const {
      data,
      error
    } =
      await db
        .from(
          "profiles"
        )
        .select(
          "role"
        )
        .eq(
          "id",
          user.id
        )
        .maybeSingle();


    if (error) {
      throw error;
    }


    const role =
      String(
        data?.role || ""
      )
        .trim()
        .toLowerCase();


    if (
      ![
        "owner",
        "admin"
      ].includes(role)
    ) {

      await db.auth
        .signOut();


      window.location.href =
        "/studio/login/";

      return false;

    }


    return true;

  }


  async function loadData() {

    const [
      confirmationResult,
      customerResult,
      orderResult
    ] =
      await Promise.all([

        db
          .from(
            "payment_confirmations"
          )
          .select("*")
          .order(
            "submitted_at",
            {
              ascending:
                false
            }
          ),

        db
          .from(
            "customers"
          )
          .select(
            "id, full_name, email, whatsapp"
          ),

        db
          .from(
            "orders"
          )
          .select(
            "id, order_number, grand_total, total_paid, remaining_amount, payment_status"
          )

      ]);


    if (
      confirmationResult.error
    ) {

      throw confirmationResult.error;

    }


    confirmations =
      confirmationResult.data ||
      [];


    customers =
      customerResult.error
        ? []
        : (
            customerResult.data ||
            []
          );


    orders =
      orderResult.error
        ? []
        : (
            orderResult.data ||
            []
          );

  }


  function renderStats() {

    el(
      "waitingCount"
    ).textContent =
      confirmations.filter(
        item =>
          item.status ===
          "waiting_verification"
      ).length;


    el(
      "verifiedCount"
    ).textContent =
      confirmations.filter(
        item =>
          item.status ===
          "verified"
      ).length;


    el(
      "rejectedCount"
    ).textContent =
      confirmations.filter(
        item =>
          item.status ===
          "rejected"
      ).length;

  }


  function render() {

    const search =
      el(
        "paymentSearch"
      ).value
        .trim()
        .toLowerCase();


    const status =
      el(
        "paymentStatusFilter"
      ).value;


    const filtered =
      confirmations.filter(
        confirmation => {

          const customer =
            findCustomer(
              confirmation.customer_id
            );


          const order =
            findOrder(
              confirmation.order_id
            );


          const haystack =
            [
              customer?.full_name,
              customer?.email,
              customer?.whatsapp,
              order?.order_number,
              confirmation.payment_method
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          const searchMatch =
            !search ||
            haystack.includes(
              search
            );


          const statusMatch =
            !status ||
            confirmation.status ===
            status;


          return (
            searchMatch &&
            statusMatch
          );

        }
      );


    el(
      "studioPaymentEmpty"
    ).hidden =
      filtered.length > 0;


    el(
      "studioPaymentList"
    ).innerHTML =
      filtered
        .map(
          confirmation => {

            const customer =
              findCustomer(
                confirmation.customer_id
              );


            const order =
              findOrder(
                confirmation.order_id
              );


            const waiting =
              confirmation.status ===
              "waiting_verification";


            return `
              <article class="payment-review-card">

                <div>

                  <div class="payment-review-order">
                    ${order?.order_number || "-"}
                  </div>

                  <div class="payment-review-customer">
                    ${customer?.full_name || "Customer"}
                    <br>
                    ${date(confirmation.submitted_at)}
                  </div>

                </div>


                <div class="payment-review-amount">

                  <strong>
                    ${rupiah(confirmation.amount)}
                  </strong>

                  <span>
                    ${confirmation.payment_method || "-"}
                  </span>

                </div>


                <span class="payment-status ${confirmation.status}">
                  ${confirmation.status.replaceAll("_"," ")}
                </span>


                <div class="payment-review-actions">

                  <button
                    type="button"
                    data-proof="${confirmation.id}"
                  >
                    View Proof
                  </button>

                  ${
                    waiting
                      ? `
                        <button
                          type="button"
                          class="verify"
                          data-verify="${confirmation.id}"
                        >
                          Verify
                        </button>

                        <button
                          type="button"
                          class="reject"
                          data-reject="${confirmation.id}"
                        >
                          Reject
                        </button>
                      `
                      : ""
                  }

                </div>

              </article>
            `;

          }
        )
        .join("");

  }


  async function viewProof(id) {

    const confirmation =
      confirmations.find(
        item =>
          item.id === id
      );


    if (
      !confirmation?.proof_path
    ) {
      return;
    }


    const {
      data,
      error
    } =
      await db.storage
        .from(
          "payment-proofs"
        )
        .createSignedUrl(
          confirmation.proof_path,
          300
        );


    if (error) {

      message(
        error.message,
        "error"
      );

      return;

    }


    window.open(
      data.signedUrl,
      "_blank",
      "noopener,noreferrer"
    );

  }


  async function verify(id) {

    const confirmed =
      window.confirm(
        "Verifikasi pembayaran ini?"
      );


    if (!confirmed) {
      return;
    }


    message("");


    try {

      const {
        error
      } =
        await db.rpc(
          "verify_memora_payment_confirmation",
          {
            p_confirmation_id:
              id
          }
        );


      if (error) {
        throw error;
      }


      message(
        "Status pembayaran berhasil diperbarui.",
        "success"
      );


      await loadData();

      renderStats();

      render();

    }
    catch (error) {

      message(
        error?.message ||
        "Pembayaran belum berhasil diverifikasi.",
        "error"
      );

    }

  }


  async function reject(id) {

    const reason =
      window.prompt(
        "Alasan penolakan:"
      );


    if (reason === null) {
      return;
    }


    if (
      !reason.trim()
    ) {

      message(
        "Alasan penolakan wajib diisi.",
        "error"
      );

      return;

    }


    try {

      const {
        error
      } =
        await db
          .from(
            "payment_confirmations"
          )
          .update({

            status:
              "rejected",

            admin_note:
              reason.trim(),

            verified_at:
              new Date()
                .toISOString()

          })
          .eq(
            "id",
            id
          )
          .eq(
            "status",
            "waiting_verification"
          );


      if (error) {
        throw error;
      }


      message(
        "Konfirmasi pembayaran ditolak.",
        "success"
      );


      await loadData();

      renderStats();

      render();

    }
    catch (error) {

      message(
        error?.message ||
        "Konfirmasi belum berhasil ditolak.",
        "error"
      );

    }

  }


  function bindEvents() {

    el(
      "paymentSearch"
    )
      ?.addEventListener(
        "input",
        render
      );


    el(
      "paymentStatusFilter"
    )
      ?.addEventListener(
        "change",
        render
      );


    document.addEventListener(
      "click",
      event => {

        const proof =
          event.target.closest(
            "[data-proof]"
          );


        if (proof) {

          viewProof(
            proof.dataset.proof
          );

          return;

        }


        const verifyButton =
          event.target.closest(
            "[data-verify]"
          );


        if (verifyButton) {

          verify(
            verifyButton.dataset.verify
          );

          return;

        }


        const rejectButton =
          event.target.closest(
            "[data-reject]"
          );


        if (rejectButton) {

          reject(
            rejectButton.dataset.reject
          );

        }

      }
    );


    el(
      "studioLogoutButton"
    )
      ?.addEventListener(
        "click",
        async () => {

          await db.auth
            .signOut();


          window.location.href =
            "/studio/login/";

        }
      );

  }


  async function init() {

    try {

      const allowed =
        await requireAdmin();


      if (!allowed) {
        return;
      }


      bindEvents();


      await loadData();


      renderStats();

      render();


      el(
        "studioPaymentLoading"
      ).hidden =
        true;

    }
    catch (error) {

      el(
        "studioPaymentLoading"
      ).hidden =
        true;


      message(
        error?.message ||
        "Payment confirmation belum dapat dimuat.",
        "error"
      );

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();