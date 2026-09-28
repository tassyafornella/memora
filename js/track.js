document.addEventListener("DOMContentLoaded", () => {

  const form =
    document.getElementById("trackForm");

  const orderInput =
    document.getElementById("trackOrderNumber");

  const whatsappInput =
    document.getElementById("trackWhatsapp");

  const submitButton =
    document.getElementById("trackSubmitButton");

  const submitText =
    document.getElementById("trackSubmitText");

  const formError =
    document.getElementById("trackFormError");


  const placeholder =
    document.getElementById("trackPlaceholder");

  const notFound =
    document.getElementById("trackNotFound");

  const result =
    document.getElementById("trackResult");


  const orderNumberEl =
    document.getElementById("resultOrderNumber");

  const createdAtEl =
    document.getElementById("resultCreatedAt");

  const statusBadge =
    document.getElementById("resultStatusBadge");

  const progressPercent =
    document.getElementById("trackProgressPercent");

  const progressFill =
    document.getElementById("trackProgressFill");

  const currentMessage =
    document.getElementById("trackCurrentMessage");


  const customerNameEl =
    document.getElementById("resultCustomerName");

  const whatsappEl =
    document.getElementById("resultWhatsapp");


  const paymentStatusEl =
    document.getElementById("resultPaymentStatus");

  const grandTotalEl =
    document.getElementById("resultGrandTotal");

  const totalPaidEl =
    document.getElementById("resultTotalPaid");

  const remainingBalanceEl =
    document.getElementById("resultRemainingBalance");


  const trackItems =
    document.getElementById("trackItems");

  const trackTimeline =
    document.getElementById("trackTimeline");


  const shippingCard =
    document.getElementById("shippingCard");

  const shippingCourier =
    document.getElementById("shippingCourier");

  const shippingTrackingNumber =
    document.getElementById("shippingTrackingNumber");

  const shippingDate =
    document.getElementById("shippingDate");

  const shippingStatus =
    document.getElementById("shippingStatus");


  const ORDER_STAGES = [

    "menunggu_konfirmasi",
    "data_belum_lengkap",
    "data_lengkap",
    "desain",
    "menunggu_approval",
    "revisi",
    "approved",
    "printing",
    "finishing",
    "quality_check",
    "packing",
    "dikirim",
    "selesai"

  ];


  const STATUS_LABELS = {

    menunggu_konfirmasi:
      "Menunggu Konfirmasi",

    data_belum_lengkap:
      "Data Belum Lengkap",

    data_lengkap:
      "Data Lengkap",

    desain:
      "Proses Desain",

    menunggu_approval:
      "Menunggu Approval",

    revisi:
      "Revisi Desain",

    approved:
      "Desain Approved",

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


  const STATUS_MESSAGES = {

    menunggu_konfirmasi:
      "Pesanan sudah masuk dan sedang menunggu konfirmasi dari tim Memora.",

    data_belum_lengkap:
      "Tim Memora masih menunggu kelengkapan data pesanan dari customer.",

    data_lengkap:
      "Data pesanan sudah lengkap dan siap masuk proses desain.",

    desain:
      "Tim Memora sedang mengerjakan desain pesanan.",

    menunggu_approval:
      "Desain sudah dikirim dan sedang menunggu persetujuan customer.",

    revisi:
      "Desain sedang dalam proses revisi sesuai feedback customer.",

    approved:
      "Desain sudah disetujui dan siap masuk proses produksi.",

    printing:
      "Pesanan sedang dalam proses printing.",

    finishing:
      "Pesanan sedang dalam proses finishing.",

    quality_check:
      "Pesanan sedang melalui pemeriksaan kualitas.",

    packing:
      "Pesanan sedang dipersiapkan dan dikemas.",

    dikirim:
      "Pesanan sudah diserahkan ke pihak pengiriman.",

    selesai:
      "Pesanan telah selesai. Terima kasih sudah memilih Memora.",

    dibatalkan:
      "Pesanan ini telah dibatalkan."

  };


  const PAYMENT_LABELS = {

    belum_ada_pembayaran:
      "Belum Ada Pembayaran",

    dp_diterima:
      "DP Diterima",

    sebagian:
      "Dibayar Sebagian",

    lunas:
      "Lunas"

  };


  function normalizeWhatsapp(value) {

    return String(value || "")
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .replace(/[()]/g, "");

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


  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function cleanImagePath(path) {

    if (!path) {
      return "../assets/images/products/placeholder.jpg";
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    let cleaned =
      path
        .replace("../../", "")
        .replace("../", "");

    if (
      cleaned.startsWith("assets/")
    ) {
      return "../" + cleaned;
    }

    return "../" + cleaned;

  }


  function getStatusLabel(status) {

    return (
      STATUS_LABELS[status] ||
      String(status || "-")
        .replaceAll("_", " ")
    );

  }


  function getPaymentLabel(status) {

    return (
      PAYMENT_LABELS[status] ||
      String(status || "-")
        .replaceAll("_", " ")
    );

  }


  function getProgress(status) {

    if (
      status === "dibatalkan"
    ) {
      return 0;
    }

    const index =
      ORDER_STAGES.indexOf(status);

    if (
      index < 0
    ) {
      return 0;
    }

    return Math.round(
      (
        (index + 1) /
        ORDER_STAGES.length
      ) * 100
    );

  }


  function showError(message) {

    formError.textContent =
      message;

    formError.classList.add(
      "show"
    );

  }


  function clearError() {

    formError.textContent =
      "";

    formError.classList.remove(
      "show"
    );

  }


  function setLoading(isLoading) {

    submitButton.disabled =
      isLoading;

    submitButton.classList.toggle(
      "loading",
      isLoading
    );

    submitText.textContent =
      isLoading
        ? "Mencari..."
        : "Lacak Pesanan";

  }


  function showPlaceholder() {

    placeholder.classList.remove(
      "hidden"
    );

    notFound.classList.add(
      "hidden"
    );

    result.classList.add(
      "hidden"
    );

  }


  function showNotFound() {

    placeholder.classList.add(
      "hidden"
    );

    notFound.classList.remove(
      "hidden"
    );

    result.classList.add(
      "hidden"
    );

  }


  function showResult() {

    placeholder.classList.add(
      "hidden"
    );

    notFound.classList.add(
      "hidden"
    );

    result.classList.remove(
      "hidden"
    );

  }


  function normalizeOrderData(data) {

    if (!data) {
      return null;
    }

    if (
      Array.isArray(data)
    ) {

      if (
        data.length === 0
      ) {
        return null;
      }

      return data[0];

    }

    return data;

  }


  function extractItems(order) {

    const candidates = [

      order.items,
      order.order_items,
      order.orderItems,
      order.products

    ];

    for (
      const candidate of candidates
    ) {

      if (
        Array.isArray(candidate)
      ) {
        return candidate;
      }

    }

    return [];

  }


  function normalizePersonalization(data) {

    if (!data) {
      return [];
    }

    let parsed =
      data;

    if (
      typeof parsed === "string"
    ) {

      try {

        parsed =
          JSON.parse(parsed);

      }
      catch {

        return [];

      }

    }


    if (
      Array.isArray(parsed)
    ) {

      return parsed
        .filter(Boolean)
        .map(value => ({
          label: "",
          value:
            typeof value === "object"
              ? JSON.stringify(value)
              : String(value)
        }));

    }


    if (
      typeof parsed === "object"
    ) {

      return Object.values(parsed)
        .map(item => {

          if (
            item &&
            typeof item === "object" &&
            "value" in item
          ) {

            return {
              label:
                item.label || "",
              value:
                item.value ?? ""
            };

          }

          return {
            label: "",
            value:
              String(item ?? "")
          };

        })
        .filter(
          item =>
            item.value !== "" &&
            item.value !== "-"
        );

    }


    return [];

  }


  function renderItems(order) {

    const items =
      extractItems(order);


    if (
      items.length === 0
    ) {

      trackItems.innerHTML = `
        <div class="track-item-empty">
          Detail produk belum tersedia.
        </div>
      `;

      return;

    }


    trackItems.innerHTML =
      items.map(item => {

        const productName =
          item.product_name_snapshot ||
          item.product_name ||
          item.productName ||
          item.name ||
          "Produk Memora";


        const variantName =
          item.variant_name_snapshot ||
          item.variant_name ||
          item.variantName ||
          item.variant ||
          "";


        const quantity =
          Number(
            item.quantity
          ) || 1;


        const subtotal =
          Number(
            item.subtotal
          ) ||
          (
            Number(
              item.unit_price ||
              item.unitPrice
            ) || 0
          ) * quantity;


        const imagePath =
          cleanImagePath(
            item.image_url_snapshot ||
            item.variant_image ||
            item.variantImage ||
            item.image_url ||
            ""
          );


        const personalization =
          normalizePersonalization(
            item.personalization
          );


        const chips =
          personalization
            .slice(0, 8)
            .map(entry => {

              const text =
                entry.label
                  ? `${entry.label}: ${entry.value}`
                  : entry.value;

              return `
                <span>
                  ${escapeHtml(text)}
                </span>
              `;

            })
            .join("");


        return `
          <article class="track-item">

            <div class="track-item-image">

              <img
                src="${escapeHtml(imagePath)}"
                alt="${escapeHtml(productName)}"
                onerror="
                  this.style.display='none';
                  this.parentElement.style.background='#e8f0eb';
                "
              >

            </div>


            <div class="track-item-content">

              <div class="track-item-title">
                ${escapeHtml(productName)}
              </div>

              ${
                variantName
                  ? `
                    <div class="track-item-variant">
                      ${escapeHtml(variantName)}
                    </div>
                  `
                  : ""
              }

              ${
                chips
                  ? `
                    <div class="track-item-personalization">
                      ${chips}
                    </div>
                  `
                  : ""
              }

            </div>


            <div class="track-item-price">

              <strong>
                ${formatRupiah(subtotal)}
              </strong>

              <span>
                ${quantity} ${
                  item.product_id === "sticker"
                    ? "lembar"
                    : "item"
                }
              </span>

            </div>

          </article>
        `;

      })
      .join("");

  }


  function renderShipping(order) {

    const shipping =
      order.shipping ||
      order.delivery ||
      null;


    if (
      !shipping
    ) {

      shippingCard.classList.add(
        "hidden"
      );

      return;

    }


    const courier =
      shipping.courier ||
      shipping.courier_name ||
      "-";


    const trackingNumber =
      shipping.tracking_number ||
      shipping.resi ||
      shipping.awb ||
      "-";


    const shippedAt =
      shipping.shipped_at ||
      shipping.shipping_date ||
      shipping.created_at ||
      null;


    const status =
      shipping.status ||
      shipping.shipping_status ||
      "-";


    const hasShippingData =
      courier !== "-" ||
      trackingNumber !== "-" ||
      shippedAt ||
      status !== "-";


    if (
      !hasShippingData
    ) {

      shippingCard.classList.add(
        "hidden"
      );

      return;

    }


    shippingCourier.textContent =
      courier;


    shippingTrackingNumber.textContent =
      trackingNumber;


    shippingDate.textContent =
      shippedAt
        ? formatDate(shippedAt)
        : "-";


    shippingStatus.textContent =
      String(status)
        .replaceAll("_", " ");


    shippingCard.classList.remove(
      "hidden"
    );

  }


  function normalizeHistory(history) {

    if (!history) {
      return [];
    }


    if (
      Array.isArray(history)
    ) {
      return history;
    }


    if (
      Array.isArray(
        history.history
      )
    ) {
      return history.history;
    }


    return [];

  }


  function renderTimeline(history, order) {

    let entries =
      normalizeHistory(history);


    if (
      entries.length === 0
    ) {

      entries = [{
        status:
          order.status,
        created_at:
          order.created_at,
        note:
          STATUS_MESSAGES[
            order.status
          ] || ""
      }];

    }


    entries.sort(
      (a, b) =>
        new Date(
          a.created_at ||
          a.changed_at ||
          a.date ||
          0
        ) -
        new Date(
          b.created_at ||
          b.changed_at ||
          b.date ||
          0
        )
    );


    trackTimeline.innerHTML =
      entries.map(entry => {

        const status =
          entry.status ||
          entry.new_status ||
          entry.order_status ||
          "";


        const note =
          entry.note ||
          entry.notes ||
          entry.description ||
          STATUS_MESSAGES[status] ||
          "";


        const timestamp =
          entry.created_at ||
          entry.changed_at ||
          entry.date ||
          null;


        return `
          <div class="timeline-item">

            <div class="timeline-marker">

              <span class="timeline-dot"></span>
              <span class="timeline-line"></span>

            </div>


            <div class="timeline-content">

              <strong>
                ${escapeHtml(
                  getStatusLabel(status)
                )}
              </strong>

              ${
                note
                  ? `
                    <p>
                      ${escapeHtml(note)}
                    </p>
                  `
                  : ""
              }

              <time>
                ${escapeHtml(
                  formatDate(timestamp)
                )}
              </time>

            </div>

          </div>
        `;

      })
      .join("");

  }


  function renderOrder(order, history) {

    const orderNumber =
      order.order_number ||
      order.orderNumber ||
      "-";


    const status =
      order.status ||
      "menunggu_konfirmasi";


    const paymentStatus =
      order.payment_status ||
      order.paymentStatus ||
      "belum_ada_pembayaran";


    const customer =
      order.customer ||
      order.customers ||
      {};


    const customerName =
      order.customer_name ||
      customer.full_name ||
      customer.name ||
      "-";


    const whatsapp =
      order.whatsapp ||
      order.customer_whatsapp ||
      customer.whatsapp ||
      "-";


    const grandTotal =
      Number(
        order.grand_total ||
        order.total ||
        order.total_amount
      ) || 0;


    const totalPaid =
      Number(
        order.total_paid ||
        order.paid_amount
      ) || 0;


    let remainingBalance =
      Number(
        order.remaining_balance
      );


    if (
      Number.isNaN(
        remainingBalance
      )
    ) {

      remainingBalance =
        Math.max(
          grandTotal - totalPaid,
          0
        );

    }


    const progress =
      getProgress(status);


    orderNumberEl.textContent =
      orderNumber;


    createdAtEl.textContent =
      order.created_at
        ? `Dibuat ${formatDate(order.created_at)}`
        : "-";


    statusBadge.textContent =
      getStatusLabel(status);


    progressPercent.textContent =
      `${progress}%`;


    progressFill.style.width =
      `${progress}%`;


    currentMessage.textContent =
      STATUS_MESSAGES[status] ||
      "Status pesanan sedang diperbarui oleh tim Memora.";


    customerNameEl.textContent =
      customerName;


    whatsappEl.textContent =
      whatsapp;


    paymentStatusEl.textContent =
      getPaymentLabel(
        paymentStatus
      );


    grandTotalEl.textContent =
      formatRupiah(
        grandTotal
      );


    totalPaidEl.textContent =
      formatRupiah(
        totalPaid
      );


    remainingBalanceEl.textContent =
      formatRupiah(
        remainingBalance
      );


    renderItems(order);

    renderShipping(order);

    renderTimeline(
      history,
      order
    );


    showResult();

  }


  async function getOrder(
    orderNumber,
    whatsapp
  ) {

    const response =
      await window.memoraSupabase.rpc(
        "track_order",
        {
          p_order_number:
            orderNumber,

          p_whatsapp:
            whatsapp
        }
      );


    if (
      response.error
    ) {

      throw response.error;

    }


    return normalizeOrderData(
      response.data
    );

  }


  async function getHistory(
    orderNumber,
    whatsapp
  ) {

    const response =
      await window.memoraSupabase.rpc(
        "track_order_history",
        {
          p_order_number:
            orderNumber,

          p_whatsapp:
            whatsapp
        }
      );


    if (
      response.error
    ) {

      console.warn(
        "Track history error:",
        response.error
      );

      return [];

    }


    return response.data || [];

  }


  async function searchOrder() {

    clearError();


    const orderNumber =
      orderInput.value
        .trim()
        .toUpperCase();


    const whatsapp =
      normalizeWhatsapp(
        whatsappInput.value
      );


    if (
      !orderNumber
    ) {

      showError(
        "Order ID wajib diisi."
      );

      orderInput.focus();

      return;

    }


    if (
      !whatsapp
    ) {

      showError(
        "Nomor WhatsApp wajib diisi."
      );

      whatsappInput.focus();

      return;

    }


    if (
      !window.isMemoraSupabaseConfigured ||
      !window.memoraSupabase
    ) {

      showError(
        "Supabase belum dikonfigurasi pada website."
      );

      return;

    }


    setLoading(true);


    try {

      const order =
        await getOrder(
          orderNumber,
          whatsapp
        );


      if (
        !order
      ) {

        showNotFound();

        return;

      }


      const history =
        await getHistory(
          orderNumber,
          whatsapp
        );


      renderOrder(
        order,
        history
      );


      const url =
        new URL(
          window.location.href
        );


      url.searchParams.set(
        "order",
        orderNumber
      );


      url.searchParams.set(
        "wa",
        whatsapp
      );


      window.history.replaceState(
        {},
        "",
        url
      );

    }
    catch (error) {

      console.error(
        "Tracking error:",
        error
      );


      const message =
        String(
          error?.message || ""
        ).toLowerCase();


      if (
        message.includes(
          "not found"
        ) ||
        message.includes(
          "tidak ditemukan"
        )
      ) {

        showNotFound();

      }
      else {

        showError(
          "Tracking belum dapat diproses. Silakan coba kembali."
        );

      }

    }
    finally {

      setLoading(false);

    }

  }


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      searchOrder();

    }
  );


  orderInput.addEventListener(
    "input",
    () => {

      orderInput.value =
        orderInput.value
          .toUpperCase();

      clearError();

    }
  );


  whatsappInput.addEventListener(
    "input",
    clearError
  );


  /*
   * AUTO-FILL
   * Dari halaman success:
   * /track/?order=MEM-...&wa=08...
   */

  const params =
    new URLSearchParams(
      window.location.search
    );


  const orderFromUrl =
    params.get("order");


  const whatsappFromUrl =
    params.get("wa");


  if (
    orderFromUrl
  ) {

    orderInput.value =
      orderFromUrl.toUpperCase();

  }


  if (
    whatsappFromUrl
  ) {

    whatsappInput.value =
      whatsappFromUrl;

  }


  if (
    orderFromUrl &&
    whatsappFromUrl
  ) {

    searchOrder();

  }
  else {

    showPlaceholder();

  }

});
