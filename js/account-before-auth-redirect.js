(function () {

  "use strict";


  let accountUser = null;
  let accountCustomer = null;
  let accountOrders = [];
  let accountOrderItems = [];
  let accountOrderHistory = [];


  const ORDER_STATUS_LABELS = {

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


  const PAYMENT_STATUS_LABELS = {

    belum_ada_pembayaran:
      "Belum Ada Pembayaran",

    dp_diterima:
      "DP Diterima",

    sebagian:
      "Pembayaran Sebagian",

    lunas:
      "Lunas"

  };


  function client() {

    return window.memoraSupabase || null;

  }


  function normalize(value) {

    return String(
      value || ""
    )
      .trim()
      .toLowerCase();

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
        month: "short",
        year: "numeric"
      }
    ).format(date);

  }


  function formatDateTime(value) {

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
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(date);

  }


  function showMessage(
    elementId,
    message,
    type
  ) {

    const element =
      document.getElementById(
        elementId
      );


    if (!element) {
      return;
    }


    element.hidden =
      false;


    element.textContent =
      message;


    element.className =
      "account-message " +
      (
        type === "success"
          ? "success"
          : "error"
      );

  }


  function hideMessage(
    elementId
  ) {

    const element =
      document.getElementById(
        elementId
      );


    if (element) {

      element.hidden =
        true;

    }

  }


  function setupPasswordToggles() {

    document
      .querySelectorAll(
        "[data-password-toggle]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const targetId =
                button.dataset
                  .passwordToggle;


              const input =
                document.getElementById(
                  targetId
                );


              if (!input) {
                return;
              }


              const hidden =
                input.type ===
                "password";


              input.type =
                hidden
                  ? "text"
                  : "password";


              button.textContent =
                hidden
                  ? "Sembunyi"
                  : "Lihat";

            }
          );

        }
      );

  }


  async function handleRegister(
    event
  ) {

    event.preventDefault();


    hideMessage(
      "registerMessage"
    );


    const supabase =
      client();


    if (!supabase) {

      showMessage(
        "registerMessage",
        "Supabase belum tersedia.",
        "error"
      );

      return;

    }


    const name =
      document.getElementById(
        "registerName"
      ).value.trim();


    const email =
      document.getElementById(
        "registerEmail"
      ).value.trim();


    const whatsapp =
      document.getElementById(
        "registerWhatsapp"
      ).value.trim();


    const password =
      document.getElementById(
        "registerPassword"
      ).value;


    const confirm =
      document.getElementById(
        "registerPasswordConfirm"
      ).value;


    const button =
      document.getElementById(
        "registerButton"
      );


    if (
      password !== confirm
    ) {

      showMessage(
        "registerMessage",
        "Konfirmasi password tidak sama.",
        "error"
      );

      return;

    }


    if (
      password.length < 8
    ) {

      showMessage(
        "registerMessage",
        "Password minimal 8 karakter.",
        "error"
      );

      return;

    }


    button.disabled = true;
    button.textContent = "Mendaftarkan...";


    try {

      const {
        data,
        error
      } =
        await supabase.auth
          .signUp({

            email:
              email,

            password:
              password,

            options: {

              data: {

                full_name:
                  name,

                whatsapp:
                  whatsapp,

                account_type:
                  "customer"

              }

            }

          });


      if (error) {
        throw error;
      }


      if (
        data?.session
      ) {

        window.location.href =
          "../";

        return;

      }


      showMessage(
        "registerMessage",
        "Akun berhasil dibuat.",
        "success"
      );


      event.target.reset();

    }
    catch (error) {

      console.error(
        "Register:",
        error
      );


      showMessage(
        "registerMessage",
        error?.message ||
        "Pendaftaran gagal.",
        "error"
      );

    }
    finally {

      button.disabled = false;
      button.textContent = "Daftar";

    }

  }


  async function handleLogin(
    event
  ) {

    event.preventDefault();


    hideMessage(
      "loginMessage"
    );


    const supabase =
      client();


    if (!supabase) {

      showMessage(
        "loginMessage",
        "Supabase belum tersedia.",
        "error"
      );

      return;

    }


    const email =
      document.getElementById(
        "loginEmail"
      ).value.trim();


    const password =
      document.getElementById(
        "loginPassword"
      ).value;


    const button =
      document.getElementById(
        "loginButton"
      );


    button.disabled = true;
    button.textContent = "Login...";


    try {

      const {
        error
      } =
        await supabase.auth
          .signInWithPassword({

            email:
              email,

            password:
              password

          });


      if (error) {
        throw error;
      }


      window.location.href =
        "../";

    }
    catch (error) {

      console.error(
        "Login:",
        error
      );


      showMessage(
        "loginMessage",
        error?.message ||
        "Email atau password salah.",
        "error"
      );

    }
    finally {

      button.disabled = false;
      button.textContent = "Login";

    }

  }


  async function requireAccountUser() {

    const supabase =
      client();


    const {
      data,
      error
    } =
      await supabase.auth
        .getUser();


    if (
      error ||
      !data?.user
    ) {

      window.location.href =
        "./login/";

      return null;

    }


    accountUser =
      data.user;


    return accountUser;

  }


  async function loadCustomerProfile() {

    const {
      data,
      error
    } =
      await client()
        .from("customers")
        .select("*")
        .eq(
          "auth_user_id",
          accountUser.id
        )
        .maybeSingle();


    if (error) {
      throw error;
    }


    if (!data) {

      throw new Error(
        "Profil customer belum terhubung."
      );

    }


    accountCustomer =
      data;

  }


  async function loadCustomerOrders() {

    const {
      data,
      error
    } =
      await client()
        .from("orders")
        .select("*")
        .eq(
          "customer_id",
          accountCustomer.id
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


    accountOrders =
      data || [];

  }


  async function loadCustomerOrderDetails() {

    const orderIds =
      accountOrders.map(
        order => order.id
      );


    if (!orderIds.length) {

      accountOrderItems = [];
      accountOrderHistory = [];

      return;

    }


    const [
      itemResult,
      historyResult
    ] =
      await Promise.all([

        client()
          .from("order_items")
          .select("*")
          .in(
            "order_id",
            orderIds
          ),

        client()
          .from("order_status_history")
          .select("*")
          .in(
            "order_id",
            orderIds
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          )

      ]);


    if (itemResult.error) {
      throw itemResult.error;
    }


    if (historyResult.error) {
      throw historyResult.error;
    }


    accountOrderItems =
      itemResult.data || [];


    accountOrderHistory =
      historyResult.data || [];

  }


  function orderNumber(order) {

    return (
      order?.order_number ||
      order?.order_no ||
      order?.number ||
      "-"
    );

  }


  function orderTotal(order) {

    return Number(
      order?.grand_total ||
      order?.total ||
      order?.total_amount ||
      order?.final_total ||
      0
    ) || 0;

  }


  function orderStatus(order) {

    return normalize(
      order?.status ||
      order?.order_status
    );

  }


  function paymentStatus(order) {

    return normalize(
      order?.payment_status
    );

  }


  function renderAccountProfile() {

    document.getElementById(
      "accountWelcomeName"
    ).textContent =
      accountCustomer.full_name ||
      "Customer";


    document.getElementById(
      "accountFullName"
    ).value =
      accountCustomer.full_name ||
      "";


    document.getElementById(
      "accountEmail"
    ).value =
      accountCustomer.email ||
      accountUser.email ||
      "";


    document.getElementById(
      "accountWhatsapp"
    ).value =
      accountCustomer.whatsapp ||
      "";


    document.getElementById(
      "accountAddress"
    ).value =
      accountCustomer.address ||
      "";


    document.getElementById(
      "accountCity"
    ).value =
      accountCustomer.city ||
      "";


    document.getElementById(
      "accountPostalCode"
    ).value =
      accountCustomer.postal_code ||
      "";

  }


  function renderAccountStats() {

    const validOrders =
      accountOrders.filter(
        order =>
          orderStatus(order) !==
          "dibatalkan"
      );


    const active =
      validOrders.filter(
        order =>
          ![
            "selesai",
            "dibatalkan"
          ].includes(
            orderStatus(order)
          )
      );


    const completed =
      validOrders.filter(
        order =>
          orderStatus(order) ===
          "selesai"
      );


    const spending =
      validOrders.reduce(
        (total, order) =>
          total +
          orderTotal(order),
        0
      );


    document.getElementById(
      "accountTotalOrders"
    ).textContent =
      validOrders.length;


    document.getElementById(
      "accountActiveOrders"
    ).textContent =
      active.length;


    document.getElementById(
      "accountCompletedOrders"
    ).textContent =
      completed.length;


    document.getElementById(
      "accountTotalSpending"
    ).textContent =
      formatRupiah(
        spending
      );

  }


  function renderAccountOrders() {

    const container =
      document.getElementById(
        "accountOrderList"
      );


    const empty =
      document.getElementById(
        "accountOrdersEmpty"
      );


    if (
      !accountOrders.length
    ) {

      container.innerHTML = "";

      empty.hidden =
        false;

      return;

    }


    empty.hidden =
      true;


    container.innerHTML =
      accountOrders.map(
        order => {

          const status =
            orderStatus(order);


          const payment =
            paymentStatus(order);


          return `

            <article class="account-order-card">

              <div class="account-order-card-header">

                <h3>
                  ${escapeHtml(
                    orderNumber(order)
                  )}
                </h3>

                <span>
                  ${formatDate(
                    order.created_at
                  )}
                </span>

              </div>


              <div class="account-order-card-statuses">

                <span class="account-order-badge">
                  ${escapeHtml(
                    ORDER_STATUS_LABELS[status] ||
                    status ||
                    "-"
                  )}
                </span>

                <span class="account-order-badge">
                  ${escapeHtml(
                    PAYMENT_STATUS_LABELS[payment] ||
                    payment ||
                    "-"
                  )}
                </span>

              </div>


              <div class="account-order-card-bottom">

                <div class="account-order-card-total">

                  <span>
                    Grand Total
                  </span>

                  <strong>
                    ${formatRupiah(
                      orderTotal(order)
                    )}
                  </strong>

                </div>


                <button
                  type="button"
                  class="account-order-detail-button"
                  data-account-order="${escapeHtml(
                    order.id
                  )}"
                >
                  Lihat Detail
                </button>

              </div>

            </article>

          `;

        }
      ).join("");


    bindAccountOrderButtons();

  }


  function bindAccountOrderButtons() {

    document
      .querySelectorAll(
        "[data-account-order]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              openAccountOrder(
                button.dataset
                  .accountOrder
              );

            }
          );

        }
      );

  }


  function openAccountOrder(
    orderId
  ) {

    const order =
      accountOrders.find(
        item =>
          String(item.id) ===
          String(orderId)
      );


    if (!order) {
      return;
    }


    const items =
      accountOrderItems.filter(
        item =>
          String(item.order_id) ===
          String(orderId)
      );


    const history =
      accountOrderHistory
        .filter(
          item =>
            String(item.order_id) ===
            String(orderId)
        )
        .sort(
          (a, b) =>
            new Date(
              b.created_at || 0
            ) -
            new Date(
              a.created_at || 0
            )
        );


    document.getElementById(
      "accountOrderModalNumber"
    ).textContent =
      orderNumber(order);


    document.getElementById(
      "accountOrderModalStatus"
    ).textContent =
      ORDER_STATUS_LABELS[
        orderStatus(order)
      ] ||
      orderStatus(order) ||
      "-";


    document.getElementById(
      "accountOrderModalPayment"
    ).textContent =
      PAYMENT_STATUS_LABELS[
        paymentStatus(order)
      ] ||
      paymentStatus(order) ||
      "-";


    document.getElementById(
      "accountOrderModalTotal"
    ).textContent =
      formatRupiah(
        orderTotal(order)
      );


    document.getElementById(
      "accountOrderModalDate"
    ).textContent =
      formatDate(
        order.created_at
      );


    const itemsContainer =
      document.getElementById(
        "accountOrderModalItems"
      );


    itemsContainer.innerHTML =
      items.length
        ? items.map(
            item => {

              const qty =
                Number(
                  item.quantity || 1
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


              return `

                <div class="account-order-item">

                  <div>

                    <strong>
                      ${escapeHtml(
                        item.product_name ||
                        item.name ||
                        "Produk"
                      )}
                    </strong>

                    <span>
                      ${escapeHtml(
                        item.variant_name ||
                        item.variant ||
                        "-"
                      )}
                      ·
                      ${qty}
                    </span>

                  </div>


                  <div class="account-order-item-price">
                    ${formatRupiah(
                      subtotal
                    )}
                  </div>

                </div>

              `;

            }
          ).join("")
        : `
            <div class="account-order-item">
              Tidak ada item.
            </div>
          `;


    const historyContainer =
      document.getElementById(
        "accountOrderModalHistory"
      );


    historyContainer.innerHTML =
      history.length
        ? history.map(
            item => {

              const status =
                normalize(
                  item.status ||
                  item.order_status
                );


              return `

                <div class="account-history-item">

                  <strong>
                    ${escapeHtml(
                      ORDER_STATUS_LABELS[status] ||
                      status ||
                      "-"
                    )}
                  </strong>

                  <span>
                    ${formatDateTime(
                      item.created_at
                    )}
                  </span>

                </div>

              `;

            }
          ).join("")
        : `
            <div class="account-history-item">
              Belum ada riwayat status.
            </div>
          `;


    const trackLink =
      document.getElementById(
        "accountOrderTrackLink"
      );


    const whatsapp =
      accountCustomer.whatsapp ||
      "";


    trackLink.href =
      "../track/?order=" +
      encodeURIComponent(
        orderNumber(order)
      ) +
      "&wa=" +
      encodeURIComponent(
        whatsapp
      );


    document.getElementById(
      "accountOrderModal"
    ).hidden =
      false;

  }


  function closeAccountOrder() {

    document.getElementById(
      "accountOrderModal"
    ).hidden =
      true;

  }


  async function saveAccountProfile(
    event
  ) {

    event.preventDefault();


    hideMessage(
      "accountProfileMessage"
    );


    const button =
      document.getElementById(
        "saveAccountProfileButton"
      );


    const fullName =
      document.getElementById(
        "accountFullName"
      ).value.trim();


    const whatsapp =
      document.getElementById(
        "accountWhatsapp"
      ).value.trim();


    const address =
      document.getElementById(
        "accountAddress"
      ).value.trim();


    const city =
      document.getElementById(
        "accountCity"
      ).value.trim();


    const postalCode =
      document.getElementById(
        "accountPostalCode"
      ).value.trim();


    if (
      !fullName ||
      !whatsapp
    ) {

      showMessage(
        "accountProfileMessage",
        "Nama dan WhatsApp wajib diisi.",
        "error"
      );

      return;

    }


    button.disabled =
      true;


    button.textContent =
      "Menyimpan...";


    try {

      const {
        data,
        error
      } =
        await client()
          .from("customers")
          .update({

            full_name:
              fullName,

            whatsapp:
              whatsapp,

            address:
              address || null,

            city:
              city || null,

            postal_code:
              postalCode || null,

            updated_at:
              new Date()
                .toISOString()

          })
          .eq(
            "id",
            accountCustomer.id
          )
          .select()
          .single();


      if (error) {
        throw error;
      }


      accountCustomer =
        data;


      renderAccountProfile();


      showMessage(
        "accountProfileMessage",
        "Profil berhasil diperbarui.",
        "success"
      );

    }
    catch (error) {

      console.error(
        "Update profile:",
        error
      );


      showMessage(
        "accountProfileMessage",
        error?.message ||
        "Gagal menyimpan profil.",
        "error"
      );

    }
    finally {

      button.disabled =
        false;


      button.textContent =
        "Simpan Profil";

    }

  }


  async function logoutAccount() {

    try {

      await client()
        .auth
        .signOut();

    }
    finally {

      window.location.href =
        "./login/";

    }

  }


  async function refreshOrders() {

    const button =
      document.getElementById(
        "accountRefreshOrders"
      );


    button.disabled =
      true;


    button.textContent =
      "Memuat...";


    try {

      await loadCustomerOrders();

      await loadCustomerOrderDetails();

      renderAccountStats();

      renderAccountOrders();

    }
    catch (error) {

      console.error(
        "Refresh orders:",
        error
      );

    }
    finally {

      button.disabled =
        false;


      button.textContent =
        "Refresh";

    }

  }


  function bindAccountDashboardEvents() {

    document
      .getElementById(
        "accountProfileForm"
      )
      ?.addEventListener(
        "submit",
        saveAccountProfile
      );


    document
      .getElementById(
        "accountLogoutButton"
      )
      ?.addEventListener(
        "click",
        logoutAccount
      );


    document
      .getElementById(
        "accountRefreshOrders"
      )
      ?.addEventListener(
        "click",
        refreshOrders
      );


    document
      .querySelectorAll(
        "[data-close-account-order]"
      )
      .forEach(
        element => {

          element.addEventListener(
            "click",
            closeAccountOrder
          );

        }
      );

  }


  async function initAccountDashboard() {

    const loading =
      document.getElementById(
        "accountDashboardLoading"
      );


    const content =
      document.getElementById(
        "accountDashboardContent"
      );


    const errorBox =
      document.getElementById(
        "accountDashboardError"
      );


    try {

      const user =
        await requireAccountUser();


      if (!user) {
        return;
      }


      await loadCustomerProfile();

      await loadCustomerOrders();

      await loadCustomerOrderDetails();


      renderAccountProfile();

      renderAccountStats();

      renderAccountOrders();

      bindAccountDashboardEvents();


      loading.hidden =
        true;


      content.hidden =
        false;

    }
    catch (error) {

      console.error(
        "Account Dashboard:",
        error
      );


      loading.hidden =
        true;


      errorBox.hidden =
        false;


      errorBox.textContent =
        error?.message ||
        "Gagal memuat akun.";

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    () => {

      setupPasswordToggles();


      document
        .getElementById(
          "registerForm"
        )
        ?.addEventListener(
          "submit",
          handleRegister
        );


      document
        .getElementById(
          "loginForm"
        )
        ?.addEventListener(
          "submit",
          handleLogin
        );


      if (
        document.getElementById(
          "accountDashboardLoading"
        )
      ) {

        initAccountDashboard();

      }

    }
  );


})();


