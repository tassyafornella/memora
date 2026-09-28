(function () {

  "use strict";


  let orders = [];
  let customers = [];
  let payments = [];

  let selectedOrderId = null;


  const PAYMENT_LABELS = {
    belum_ada_pembayaran: "Belum Ada Pembayaran",
    dp_diterima: "DP Diterima",
    sebagian: "Sebagian",
    lunas: "Lunas"
  };


  function client() {
    return window.memoraSupabase || null;
  }


  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }


  function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = String(value ?? "");

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
    ).format(Number(value) || 0);

  }


  function getOrderTotal(order) {

    return Number(
      order.grand_total ||
      order.total ||
      order.total_amount ||
      order.final_total ||
      0
    ) || 0;

  }


  function getPaymentStatus(order) {

    return normalize(
      order.payment_status
    );

  }


  function getOrderNumber(order) {

    return (
      order.order_number ||
      order.order_no ||
      order.number ||
      "-"
    );

  }


  function findCustomer(order) {

    return customers.find(
      customer =>
        String(customer.id) ===
        String(order.customer_id)
    ) || null;

  }


  function customerName(customer) {

    return (
      customer?.name ||
      customer?.full_name ||
      customer?.customer_name ||
      "Customer"
    );

  }


  function customerWhatsapp(customer) {

    return (
      customer?.whatsapp ||
      customer?.phone ||
      customer?.phone_number ||
      customer?.wa ||
      "-"
    );

  }


  function paymentAmount(payment) {

    return Number(
      payment.amount ||
      payment.payment_amount ||
      payment.nominal ||
      payment.total ||
      0
    ) || 0;

  }


  function paidForOrder(orderId) {

    return payments
      .filter(
        payment =>
          String(payment.order_id) ===
          String(orderId)
      )
      .reduce(
        (sum, payment) =>
          sum + paymentAmount(payment),
        0
      );

  }


  function paymentClass(status) {

    if (status === "lunas") {
      return "paid";
    }

    if (
      status === "dp_diterima" ||
      status === "sebagian"
    ) {
      return "partial";
    }

    return "unpaid";

  }


  async function loadData() {

    const supabase = client();


    const [
      ordersResult,
      customersResult,
      paymentsResult
    ] = await Promise.all([

      supabase
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false
        }),

      supabase
        .from("customers")
        .select("*"),

      supabase
        .from("payments")
        .select("*")
        .order("created_at", {
          ascending: false
        })

    ]);


    if (ordersResult.error) {
      throw ordersResult.error;
    }

    if (paymentsResult.error) {
      throw paymentsResult.error;
    }


    orders = ordersResult.data || [];

    customers =
      customersResult.error
        ? []
        : customersResult.data || [];

    payments =
      paymentsResult.data || [];

  }


  function activeOrders() {

    return orders.filter(
      order =>
        normalize(order.status) !==
        "dibatalkan"
    );

  }


  function renderStats() {

    const active = activeOrders();


    const orderValue =
      active.reduce(
        (sum, order) =>
          sum + getOrderTotal(order),
        0
      );


    const paid =
      payments.reduce(
        (sum, payment) =>
          sum + paymentAmount(payment),
        0
      );


    const outstanding =
      Math.max(
        0,
        orderValue - paid
      );


    const paidOrders =
      active.filter(
        order =>
          getPaymentStatus(order) ===
          "lunas"
      ).length;


    document.getElementById(
      "financeOrderValue"
    ).textContent =
      formatRupiah(orderValue);


    document.getElementById(
      "financePaidAmount"
    ).textContent =
      formatRupiah(paid);


    document.getElementById(
      "financeOutstanding"
    ).textContent =
      formatRupiah(outstanding);


    document.getElementById(
      "financePaidOrders"
    ).textContent =
      paidOrders;

  }


  function filteredOrders() {

    const search =
      normalize(
        document.getElementById(
          "financeSearch"
        )?.value
      );


    const paymentFilter =
      normalize(
        document.getElementById(
          "financePaymentFilter"
        )?.value
      );


    return activeOrders()
      .filter(
        order => {

          const customer =
            findCustomer(order);


          if (
            paymentFilter &&
            getPaymentStatus(order) !==
            paymentFilter
          ) {
            return false;
          }


          if (!search) {
            return true;
          }


          const haystack = [
            getOrderNumber(order),
            customerName(customer),
            customerWhatsapp(customer)
          ]
            .join(" ")
            .toLowerCase();


          return haystack.includes(
            search
          );

        }
      );

  }


  function renderTable() {

    const body =
      document.getElementById(
        "financeTableBody"
      );


    const empty =
      document.getElementById(
        "financeEmpty"
      );


    const data =
      filteredOrders();


    if (!data.length) {

      body.innerHTML = "";

      empty.hidden = false;

      return;

    }


    empty.hidden = true;


    body.innerHTML =
      data.map(
        order => {

          const customer =
            findCustomer(order);


          const total =
            getOrderTotal(order);


          const paid =
            paidForOrder(order.id);


          const remaining =
            Math.max(
              0,
              total - paid
            );


          const paymentStatus =
            getPaymentStatus(order);


          return `

            <tr>

              <td>

                <span class="finance-order-number">
                  ${escapeHtml(
                    getOrderNumber(order)
                  )}
                </span>

              </td>


              <td>

                <span class="finance-customer-name">
                  ${escapeHtml(
                    customerName(customer)
                  )}
                </span>

              </td>


              <td>
                <strong>
                  ${formatRupiah(total)}
                </strong>
              </td>


              <td>
                ${formatRupiah(paid)}
              </td>


              <td>
                ${formatRupiah(remaining)}
              </td>


              <td>

                <span
                  class="
                    finance-status
                    finance-status-${paymentClass(
                      paymentStatus
                    )}
                  "
                >
                  ${escapeHtml(
                    PAYMENT_LABELS[paymentStatus] ||
                    paymentStatus ||
                    "-"
                  )}
                </span>

              </td>


              <td>

                <button
                  type="button"
                  class="finance-pay-button"
                  data-payment-order="${escapeHtml(
                    order.id
                  )}"
                >
                  Catat Pembayaran
                </button>

              </td>

            </tr>

          `;

        }
      ).join("");


    bindPaymentButtons();

  }


  function bindPaymentButtons() {

    document
      .querySelectorAll(
        "[data-payment-order]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              openPaymentModal(
                button.dataset.paymentOrder
              );

            }
          );

        }
      );

  }


  function openPaymentModal(orderId) {

    const order =
      orders.find(
        item =>
          String(item.id) ===
          String(orderId)
      );


    if (!order) {
      return;
    }


    selectedOrderId =
      orderId;


    const total =
      getOrderTotal(order);


    const paid =
      paidForOrder(orderId);


    const remaining =
      Math.max(
        0,
        total - paid
      );


    document.getElementById(
      "paymentOrderNumber"
    ).textContent =
      getOrderNumber(order);


    document.getElementById(
      "paymentGrandTotal"
    ).textContent =
      formatRupiah(total);


    document.getElementById(
      "paymentAlreadyPaid"
    ).textContent =
      formatRupiah(paid);


    document.getElementById(
      "paymentRemaining"
    ).textContent =
      formatRupiah(remaining);


    document.getElementById(
      "paymentAmount"
    ).value = "";


    document.getElementById(
      "paymentReference"
    ).value = "";
document.getElementById(
      "paymentModal"
    ).hidden = false;

  }


  function closePaymentModal() {

    document.getElementById(
      "paymentModal"
    ).hidden = true;


    selectedOrderId = null;

  }


  async function savePayment() {

    if (!selectedOrderId) {
      return;
    }


    const button =
      document.getElementById(
        "savePaymentButton"
      );


    const order =
      orders.find(
        item =>
          String(item.id) ===
          String(selectedOrderId)
      );


    const amount =
      Number(
        document.getElementById(
          "paymentAmount"
        ).value
      );


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      alert(
        "Nominal pembayaran belum valid."
      );

      return;

    }


    const total =
      getOrderTotal(order);


    const currentPaid =
      paidForOrder(
        selectedOrderId
      );


    const newPaid =
      currentPaid + amount;


    if (
      newPaid > total
    ) {

      alert(
        "Nominal pembayaran melebihi sisa tagihan."
      );

      return;

    }


    const type =
      document.getElementById(
        "paymentType"
      ).value;


    const method =
      document.getElementById(
        "paymentMethod"
      ).value;


    const reference =
      document.getElementById(
        "paymentReference"
      ).value.trim();
let paymentStatus =
      "sebagian";


    if (
      newPaid >= total
    ) {

      paymentStatus =
        "lunas";

    }
    else if (
      type === "dp"
    ) {

      paymentStatus =
        "dp_diterima";

    }


    button.disabled = true;

    button.textContent =
      "Menyimpan...";


    try {

      const {
        error: paymentError
      } =
        await client()
  .from("payments")
  .insert({

    order_id:
      selectedOrderId,

    payment_type:
      type,

    amount:
      amount,

    payment_date:
      new Date()
        .toISOString()
        .slice(0, 10),

    payment_method:
      method,

    reference_note:
      reference || null

  });


      if (paymentError) {
        throw paymentError;
      }


      const {
        error: orderError
      } =
        await client()
          .from("orders")
          .update({

            payment_status:
              paymentStatus,

            updated_at:
              new Date().toISOString()

          })
          .eq(
            "id",
            selectedOrderId
          );


      if (orderError) {
        throw orderError;
      }


      closePaymentModal();

      await loadData();

      renderStats();

      renderTable();

    }
    catch (error) {

      console.error(
        "Save payment:",
        error
      );


      alert(
        error?.message ||
        "Gagal menyimpan pembayaran."
      );

    }
    finally {

      button.disabled = false;

      button.textContent =
        "Simpan Pembayaran";

    }

  }


  function bindEvents() {

    document
      .getElementById(
        "financeSearch"
      )
      ?.addEventListener(
        "input",
        renderTable
      );


    document
      .getElementById(
        "financePaymentFilter"
      )
      ?.addEventListener(
        "change",
        renderTable
      );


    document
      .getElementById(
        "financeResetButton"
      )
      ?.addEventListener(
        "click",
        () => {

          document.getElementById(
            "financeSearch"
          ).value = "";


          document.getElementById(
            "financePaymentFilter"
          ).value = "";


          renderTable();

        }
      );


    document
      .getElementById(
        "financeRefreshButton"
      )
      ?.addEventListener(
        "click",
        async () => {

          await loadData();

          renderStats();

          renderTable();

        }
      );


    document
      .querySelectorAll(
        "[data-close-payment]"
      )
      .forEach(
        element => {

          element.addEventListener(
            "click",
            closePaymentModal
          );

        }
      );


    document
      .getElementById(
        "savePaymentButton"
      )
      ?.addEventListener(
        "click",
        savePayment
      );

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

    setupSidebar();

    bindEvents();


    try {

      await loadData();

      renderStats();

      renderTable();

    }
    catch (error) {

      console.error(
        "Memora Finance:",
        error
      );


      document.getElementById(
        "financeTableBody"
      ).innerHTML = `

        <tr>

          <td
            colspan="7"
            class="finance-error"
          >
            ${escapeHtml(
              error?.message ||
              "Gagal memuat finance."
            )}
          </td>

        </tr>

      `;

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    () => {

      setTimeout(
        init,
        150
      );

    }
  );


})();



