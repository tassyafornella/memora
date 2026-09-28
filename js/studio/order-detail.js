(function () {

  "use strict";


  let orderId = null;

  let currentOrder = null;

  let currentCustomer = null;

  let items = [];

  let history = [];

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


  const PAYMENT_LABELS = {

    belum_ada_pembayaran:
      "Belum Ada Pembayaran",

    dp_diterima:
      "DP Diterima",

    sebagian:
      "Sebagian",

    lunas:
      "Lunas"

  };


  function client() {

    return window.memoraSupabase || null;

  }


  function escapeHtml(value) {

    const div =
      document.createElement("div");

    div.textContent =
      String(value ?? "");

    return div.innerHTML;

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
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(date);

  }


  function normalize(value) {

    return String(
      value || ""
    )
      .trim()
      .toLowerCase();

  }


  function setText(
    id,
    value
  ) {

    const element =
      document.getElementById(id);

    if (element) {
      element.textContent = value;
    }

  }


  function getOrderNumber() {

    return (
      currentOrder?.order_number ||
      currentOrder?.order_no ||
      currentOrder?.number ||
      "-"
    );

  }


  function getStatus() {

    return normalize(
      currentOrder?.status ||
      currentOrder?.order_status
    );

  }


  function getPaymentStatus() {

    return normalize(
      currentOrder?.payment_status
    );

  }


  function getGrandTotal() {

    return Number(
      currentOrder?.grand_total ||
      currentOrder?.total ||
      currentOrder?.total_amount ||
      currentOrder?.final_total ||
      0
    ) || 0;

  }


  function getSubtotal() {

    const direct =
      Number(
        currentOrder?.subtotal
      );

    if (
      Number.isFinite(direct)
    ) {
      return direct;
    }


    return items.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.subtotal ||
          item.total ||
          (
            Number(item.unit_price || item.price || 0) *
            Number(item.quantity || 1)
          )
        ),
      0
    );

  }


  function getShipping() {

    return Number(
      currentOrder?.shipping_cost ||
      currentOrder?.shipping_fee ||
      currentOrder?.ongkir ||
      0
    ) || 0;

  }


  function getPaidAmount() {

    return payments.reduce(
      (
        total,
        payment
      ) =>
        total +
        Number(
          payment.amount ||
          payment.payment_amount ||
          payment.nominal ||
          0
        ),
      0
    );

  }


  function statusLabel(status) {

    return (
      STATUS_LABELS[status] ||
      status ||
      "-"
    );

  }


  function paymentLabel(status) {

    return (
      PAYMENT_LABELS[status] ||
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


  async function loadOrder() {

    const supabase =
      client();


    const {
      data,
      error
    } =
      await supabase
        .from("orders")
        .select("*")
        .eq(
          "id",
          orderId
        )
        .single();


    if (error) {
      throw error;
    }


    currentOrder = data;

  }


  async function loadCustomer() {

    if (
      !currentOrder?.customer_id
    ) {
      return;
    }


    const {
      data,
      error
    } =
      await client()
        .from("customers")
        .select("*")
        .eq(
          "id",
          currentOrder.customer_id
        )
        .maybeSingle();


    if (error) {

      console.warn(
        "Customer detail:",
        error
      );

      return;
    }


    currentCustomer = data;

  }


  async function loadItems() {

    const {
      data,
      error
    } =
      await client()
        .from("order_items")
        .select("*")
        .eq(
          "order_id",
          orderId
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    if (error) {
      throw error;
    }


    items =
      Array.isArray(data)
        ? data
        : [];

  }


  async function loadHistory() {

    const {
      data,
      error
    } =
      await client()
        .from("order_status_history")
        .select("*")
        .eq(
          "order_id",
          orderId
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {

      console.warn(
        "Status history:",
        error
      );

      history = [];

      return;
    }


    history =
      Array.isArray(data)
        ? data
        : [];

  }


  async function loadPayments() {

    const {
      data,
      error
    } =
      await client()
        .from("payments")
        .select("*")
        .eq(
          "order_id",
          orderId
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {

      console.warn(
        "Payments:",
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


  function renderHeader() {

    setText(
      "detailOrderNumber",
      getOrderNumber()
    );


    setText(
      "detailOrderDate",
      formatDate(
        currentOrder?.created_at
      )
    );


    const status =
      getStatus();


    const payment =
      getPaymentStatus();


    const statusBadge =
      document.getElementById(
        "detailStatusBadge"
      );


    const paymentBadge =
      document.getElementById(
        "detailPaymentBadge"
      );


    if (statusBadge) {

      statusBadge.textContent =
        statusLabel(status);

      statusBadge.className =
        "order-detail-badge " +
        badgeClass(status);

    }


    if (paymentBadge) {

      paymentBadge.textContent =
        paymentLabel(payment);

      paymentBadge.className =
        "order-detail-badge " +
        badgeClass(payment);

    }


    const select =
      document.getElementById(
        "detailStatusSelect"
      );


    if (select) {
      select.value = status;
    }

  }


  function renderCustomer() {

    const customer =
      currentCustomer || {};


    setText(
      "detailCustomerName",
      customer.name ||
      customer.full_name ||
      customer.customer_name ||
      "-"
    );


    setText(
      "detailCustomerWhatsapp",
      customer.whatsapp ||
      customer.phone ||
      customer.phone_number ||
      customer.wa ||
      "-"
    );


    setText(
      "detailCustomerEmail",
      customer.email ||
      "-"
    );


    setText(
      "detailCustomerAddress",
      customer.address ||
      customer.alamat ||
      "-"
    );

  }


  function renderItems() {

    const container =
      document.getElementById(
        "detailItems"
      );


    if (!items.length) {

      container.innerHTML = `
        <div class="order-detail-note">
          Tidak ada item order.
        </div>
      `;

      return;
    }


    container.innerHTML =
      items.map(
        item => {

          const name =
            item.product_name ||
            item.name ||
            "Produk";


          const variant =
            item.variant_name ||
            item.variant ||
            item.variant_code ||
            "-";


          const qty =
            Number(
              item.quantity ||
              1
            );


          const unitPrice =
            Number(
              item.unit_price ||
              item.price ||
              0
            );


          const subtotal =
            Number(
              item.subtotal ||
              item.total ||
              (
                qty *
                unitPrice
              )
            );


          let personalization =
            item.personalization ||
            item.custom_data ||
            item.metadata ||
            {};


          if (
            typeof personalization ===
            "string"
          ) {

            try {
              personalization =
                JSON.parse(
                  personalization
                );
            }
            catch {
              personalization = {};
            }

          }


          const personalizationHtml =
            Object.entries(
              personalization || {}
            )
              .map(
                ([key, value]) => {

                  let label =
                    key;

                  let displayValue =
                    value;


                  if (
                    value &&
                    typeof value ===
                    "object"
                  ) {

                    label =
                      value.label ||
                      key;

                    displayValue =
                      value.value ??
                      "-";

                  }


                  return `

                    <div class="order-detail-personalization-item">

                      <span>
                        ${escapeHtml(label)}
                      </span>

                      <strong>
                        ${escapeHtml(displayValue)}
                      </strong>

                    </div>

                  `;

                }
              )
              .join("");


          return `

            <article class="order-detail-item">

              <div class="order-detail-item-head">

                <div>

                  <h4>
                    ${escapeHtml(name)}
                  </h4>

                  <span>
                    ${escapeHtml(variant)}
                    ·
                    ${qty}
                  </span>

                </div>

                <div class="order-detail-item-price">
                  ${formatRupiah(subtotal)}
                </div>

              </div>


              ${
                personalizationHtml
                  ? `
                    <div class="order-detail-personalization">
                      ${personalizationHtml}
                    </div>
                  `
                  : ""
              }

            </article>

          `;

        }
      )
      .join("");

  }


  function renderSummary() {

    const subtotal =
      getSubtotal();


    const shipping =
      getShipping();


    const grandTotal =
      getGrandTotal();


    const paid =
      getPaidAmount();


    const remaining =
      Math.max(
        0,
        grandTotal - paid
      );


    setText(
      "detailSubtotal",
      formatRupiah(subtotal)
    );


    setText(
      "detailShipping",
      formatRupiah(shipping)
    );


    const shippingInput =
      document.getElementById(
        "shippingCostInput"
      );


    if (shippingInput) {

      shippingInput.value =
        Math.round(
          shipping
        );

    }


    setText(
      "detailGrandTotal",
      formatRupiah(grandTotal)
    );


    setText(
      "detailPaymentStatus",
      paymentLabel(
        getPaymentStatus()
      )
    );


    setText(
      "detailPaidAmount",
      formatRupiah(paid)
    );


    setText(
      "detailRemainingAmount",
      formatRupiah(remaining)
    );

  }


  function renderNote() {

    setText(
      "detailCustomerNote",
      currentOrder?.customer_note ||
      currentOrder?.note ||
      currentOrder?.notes ||
      "-"
    );

  }


  function renderTimeline() {

    const container =
      document.getElementById(
        "detailTimeline"
      );


    if (!history.length) {

      container.innerHTML = `
        <div class="order-detail-note">
          Belum ada riwayat status.
        </div>
      `;

      return;
    }


    container.innerHTML =
      history
        .map(
          item => {

            const status =
              normalize(
                item.status ||
                item.order_status
              );


            return `

              <div class="order-detail-timeline-item">

                <div class="order-detail-timeline-dot"></div>

                <div class="order-detail-timeline-content">

                  <strong>
                    ${escapeHtml(
                      statusLabel(status)
                    )}
                  </strong>

                  <span>
                    ${formatDate(
                      item.created_at
                    )}
                  </span>

                  ${
                    item.note ||
                    item.notes
                      ? `
                        <p>
                          ${escapeHtml(
                            item.note ||
                            item.notes
                          )}
                        </p>
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


  async function updateStatus() {

    const button =
      document.getElementById(
        "updateStatusButton"
      );


    const select =
      document.getElementById(
        "detailStatusSelect"
      );


    const note =
      document.getElementById(
        "detailStatusNote"
      );


    const nextStatus =
      select?.value;


    if (!nextStatus) {
      return;
    }


    button.disabled = true;
    button.textContent =
      "Menyimpan...";


    try {

      const {
        error
      } =
        await client()
          .from("orders")
          .update({
            status:
              nextStatus,
            updated_at:
              new Date().toISOString()
          })
          .eq(
            "id",
            orderId
          );


      if (error) {
        throw error;
      }


      /*
       * Jika trigger auto status history sudah aktif,
       * perubahan di atas otomatis masuk history.
       *
       * Catatan tambahan dimasukkan manual bila ada.
       */

      const noteValue =
        note?.value?.trim();


      if (noteValue) {

        const {
          error: historyError
        } =
          await client()
            .from(
              "order_status_history"
            )
            .insert({
              order_id:
                orderId,
              status:
                nextStatus,
              note:
                noteValue
            });


        if (historyError) {

          console.warn(
            "Status note:",
            historyError
          );

        }

      }


      if (note) {
        note.value = "";
      }


      await loadAll();

    }
    catch (error) {

      console.error(
        "Update status:",
        error
      );


      alert(
        error?.message ||
        "Gagal memperbarui status."
      );

    }
    finally {

      button.disabled = false;

      button.textContent =
        "Simpan Status";

    }

  }


  async function updateShipping() {

    const input =
      document.getElementById(
        "shippingCostInput"
      );


    const button =
      document.getElementById(
        "saveShippingButton"
      );


    if (
      !input ||
      !button ||
      !currentOrder
    ) {

      return;

    }


    const newShipping =
      Number(
        input.value
      );


    if (
      !Number.isFinite(newShipping) ||
      newShipping < 0
    ) {

      alert(
        "Nominal ongkir tidak valid."
      );

      return;

    }


    const oldShipping =
      getShipping();


    const oldGrandTotal =
      getGrandTotal();


    /*
     * Grand total lama sudah mungkin mengandung ongkir.
     * Jadi kita keluarkan ongkir lama terlebih dahulu,
     * lalu tambahkan ongkir baru.
     */

    const productTotal =
      Math.max(
        0,
        oldGrandTotal -
        oldShipping
      );


    const newGrandTotal =
      productTotal +
      newShipping;


    button.disabled =
      true;


    button.textContent =
      "Menyimpan...";


    try {

      const {
        error
      } =
        await client()
          .from("orders")
          .update({

            shipping_cost:
              newShipping,

            grand_total:
              newGrandTotal,

            updated_at:
              new Date().toISOString()

          })
          .eq(
            "id",
            orderId
          );


      if (error) {

        throw error;

      }


      currentOrder.shipping_cost =
        newShipping;


      currentOrder.grand_total =
        newGrandTotal;


      renderSummary();


      alert(
        "Ongkir berhasil disimpan."
      );

    }
    catch (error) {

      console.error(
        "Update shipping:",
        error
      );


      alert(
        error?.message ||
        "Gagal menyimpan ongkir."
      );

    }
    finally {

      button.disabled =
        false;


      button.textContent =
        "Simpan Ongkir";

    }

  }

  function renderAll() {

    renderHeader();

    renderCustomer();

    renderItems();

    renderSummary();

    renderNote();

    renderTimeline();

  }


  async function loadAll() {

    await loadOrder();


    await Promise.all([
      loadCustomer(),
      loadItems(),
      loadHistory(),
      loadPayments()
    ]);


    renderAll();

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
      () => {

        sidebar?.classList.remove(
          "open"
        );

        overlay?.classList.remove(
          "show"
        );

      }
    );

  }


  async function init() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    orderId =
      params.get("id");


    if (!orderId) {

      throw new Error(
        "Order ID tidak ditemukan."
      );

    }


    setupSidebar();


    document
      .getElementById(
        "updateStatusButton"
      )
      ?.addEventListener(
        "click",
        updateStatus
      );


    document
      .getElementById(
        "saveShippingButton"
      )
      ?.addEventListener(
        "click",
        updateShipping
      );


    await loadAll();


    document.getElementById(
      "orderDetailLoading"
    ).hidden = true;


    document.getElementById(
      "orderDetailContent"
    ).hidden = false;

  }


  document.addEventListener(
    "DOMContentLoaded",
    () => {

      setTimeout(
        async () => {

          try {

            await init();

          }
          catch (error) {

            console.error(
              "Order Detail:",
              error
            );


            document.getElementById(
              "orderDetailLoading"
            ).hidden = true;


            const errorBox =
              document.getElementById(
                "orderDetailError"
              );


            errorBox.hidden =
              false;


            errorBox.textContent =
              error?.message ||
              "Gagal memuat order.";

          }

        },
        150
      );

    }
  );


})();



