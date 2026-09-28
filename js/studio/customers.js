(function () {

  "use strict";


  let customers = [];
  let orders = [];


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
      document.createElement(
        "div"
      );


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


  function customerEmail(customer) {

    return (
      customer?.email ||
      "-"
    );

  }


  function customerAddress(customer) {

    return (
      customer?.address ||
      customer?.alamat ||
      "-"
    );

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


  function customerOrders(customerId) {

    return orders.filter(
      order =>
        String(order.customer_id) ===
        String(customerId) &&
        normalize(order.status) !==
        "dibatalkan"
    );

  }


  function customerSpend(customerId) {

    return customerOrders(customerId)
      .reduce(
        (total, order) =>
          total + orderTotal(order),
        0
      );

  }


  function latestCustomerOrder(
    customerId
  ) {

    const data =
      customerOrders(customerId);


    if (!data.length) {
      return null;
    }


    return [...data]
      .sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ) -
          new Date(
            a.created_at || 0
          )
      )[0];

  }


  async function loadData() {

    const supabase =
      client();


    if (!supabase) {

      throw new Error(
        "Supabase belum tersedia."
      );

    }


    const [
      customersResult,
      ordersResult
    ] =
      await Promise.all([

        supabase
          .from("customers")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          ),

        supabase
          .from("orders")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          )

      ]);


    if (
      customersResult.error
    ) {
      throw customersResult.error;
    }


    if (
      ordersResult.error
    ) {
      throw ordersResult.error;
    }


    customers =
      customersResult.data || [];


    orders =
      ordersResult.data || [];

  }


  function renderStats() {

    const withOrders =
      customers.filter(
        customer =>
          customerOrders(
            customer.id
          ).length > 0
      );


    const repeat =
      customers.filter(
        customer =>
          customerOrders(
            customer.id
          ).length > 1
      );


    const totalRevenue =
      customers.reduce(
        (
          total,
          customer
        ) =>
          total +
          customerSpend(
            customer.id
          ),
        0
      );


    document.getElementById(
      "customersTotal"
    ).textContent =
      customers.length;


    document.getElementById(
      "customersWithOrders"
    ).textContent =
      withOrders.length;


    document.getElementById(
      "customersRepeat"
    ).textContent =
      repeat.length;


    document.getElementById(
      "customersRevenue"
    ).textContent =
      formatRupiah(
        totalRevenue
      );

  }


  function filteredCustomers() {

    const search =
      normalize(
        document.getElementById(
          "customersSearch"
        )?.value
      );


    const filter =
      normalize(
        document.getElementById(
          "customersFilter"
        )?.value
      );


    return customers.filter(
      customer => {

        const count =
          customerOrders(
            customer.id
          ).length;


        if (
          filter === "has_order" &&
          count < 1
        ) {
          return false;
        }


        if (
          filter === "repeat" &&
          count < 2
        ) {
          return false;
        }


        if (
          filter === "no_order" &&
          count > 0
        ) {
          return false;
        }


        if (!search) {
          return true;
        }


        const haystack = [
          customerName(customer),
          customerWhatsapp(customer),
          customerEmail(customer)
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
        "customersTableBody"
      );


    const empty =
      document.getElementById(
        "customersEmpty"
      );


    const countLabel =
      document.getElementById(
        "customersResultCount"
      );


    const data =
      filteredCustomers();


    countLabel.textContent =
      `${data.length} customer`;


    if (!data.length) {

      body.innerHTML = "";

      empty.hidden = false;

      return;

    }


    empty.hidden = true;


    body.innerHTML =
      data.map(
        customer => {

          const customerOrderList =
            customerOrders(
              customer.id
            );


          const latest =
            latestCustomerOrder(
              customer.id
            );


          const spend =
            customerSpend(
              customer.id
            );


          return `

            <tr>

              <td>

                <span class="customers-name">
                  ${escapeHtml(
                    customerName(customer)
                  )}
                </span>

              </td>


              <td>
                ${escapeHtml(
                  customerWhatsapp(customer)
                )}
              </td>


              <td>
                ${escapeHtml(
                  customerEmail(customer)
                )}
              </td>


              <td>

                <span class="customers-value">
                  ${customerOrderList.length}
                </span>

              </td>


              <td>

                <span class="customers-value">
                  ${formatRupiah(spend)}
                </span>

              </td>


              <td>
                ${
                  latest
                    ? formatDate(
                        latest.created_at
                      )
                    : "-"
                }
              </td>


              <td>

                <button
                  type="button"
                  class="customers-detail-button"
                  data-customer-detail="${escapeHtml(
                    customer.id
                  )}"
                >
                  Detail
                </button>

              </td>

            </tr>

          `;

        }
      ).join("");


    bindDetailButtons();

  }


  function bindDetailButtons() {

    document
      .querySelectorAll(
        "[data-customer-detail]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              openCustomerDetail(
                button.dataset
                  .customerDetail
              );

            }
          );

        }
      );

  }


  function openCustomerDetail(
    customerId
  ) {

    const customer =
      customers.find(
        item =>
          String(item.id) ===
          String(customerId)
      );


    if (!customer) {
      return;
    }


    const list =
      customerOrders(
        customer.id
      );


    const spend =
      customerSpend(
        customer.id
      );


    document.getElementById(
      "customerModalName"
    ).textContent =
      customerName(customer);


    document.getElementById(
      "customerModalWhatsapp"
    ).textContent =
      customerWhatsapp(customer);


    document.getElementById(
      "customerModalEmail"
    ).textContent =
      customerEmail(customer);


    document.getElementById(
      "customerModalAddress"
    ).textContent =
      customerAddress(customer);


    document.getElementById(
      "customerModalOrderCount"
    ).textContent =
      list.length;


    document.getElementById(
      "customerModalSpend"
    ).textContent =
      formatRupiah(spend);


    const orderContainer =
      document.getElementById(
        "customerModalOrders"
      );


    if (!list.length) {

      orderContainer.innerHTML = `

        <div class="customers-order-item">

          <span>
            Belum ada order.
          </span>

        </div>

      `;

    }
    else {

      orderContainer.innerHTML =
        list.map(
          order => `

            <div class="customers-order-item">

              <div>

                <strong>
                  ${escapeHtml(
                    orderNumber(order)
                  )}
                </strong>

                <span>
                  ${formatDate(
                    order.created_at
                  )}
                </span>

              </div>


              <strong>
                ${formatRupiah(
                  orderTotal(order)
                )}
              </strong>


              <a
                href="../order-detail/?id=${encodeURIComponent(
                  order.id
                )}"
              >
                Detail
              </a>

            </div>

          `
        ).join("");

    }


    document.getElementById(
      "customerModal"
    ).hidden = false;

  }


  function closeCustomerDetail() {

    document.getElementById(
      "customerModal"
    ).hidden = true;

  }


  function bindEvents() {

    document.getElementById(
      "customersSearch"
    )?.addEventListener(
      "input",
      renderTable
    );


    document.getElementById(
      "customersFilter"
    )?.addEventListener(
      "change",
      renderTable
    );


    document.getElementById(
      "customersResetButton"
    )?.addEventListener(
      "click",
      () => {

        document.getElementById(
          "customersSearch"
        ).value = "";


        document.getElementById(
          "customersFilter"
        ).value = "";


        renderTable();

      }
    );


    document.getElementById(
      "customersRefreshButton"
    )?.addEventListener(
      "click",
      async () => {

        await loadData();

        renderStats();

        renderTable();

      }
    );


    document.querySelectorAll(
      "[data-close-customer]"
    ).forEach(
      element => {

        element.addEventListener(
          "click",
          closeCustomerDetail
        );

      }
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
        "Memora Customers:",
        error
      );


      document.getElementById(
        "customersTableBody"
      ).innerHTML = `

        <tr>

          <td
            colspan="7"
            class="customers-error"
          >
            ${escapeHtml(
              error?.message ||
              "Gagal memuat customer."
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
