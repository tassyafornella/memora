(function () {

  "use strict";


  let orders = [];

  let customers = [];


  const STAGES = [

    {
      key: "desain",
      label: "Desain"
    },

    {
      key: "menunggu_approval",
      label: "Menunggu Approval"
    },

    {
      key: "revisi",
      label: "Revisi"
    },

    {
      key: "approved",
      label: "Approved"
    },

    {
      key: "printing",
      label: "Printing"
    },

    {
      key: "finishing",
      label: "Finishing"
    },

    {
      key: "quality_check",
      label: "Quality Check"
    },

    {
      key: "packing",
      label: "Packing"
    },

    {
      key: "dikirim",
      label: "Dikirim"
    }

  ];


  const STAGE_KEYS =
    STAGES.map(
      item => item.key
    );


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
        month: "short"
      }
    ).format(date);

  }


  function getStatus(order) {

    return normalize(
      order.status ||
      order.order_status
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


  function getTotal(order) {

    return Number(
      order.grand_total ||
      order.total ||
      order.total_amount ||
      order.final_total ||
      0
    ) || 0;

  }


  function findCustomer(order) {

    if (!order.customer_id) {

      return null;

    }


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


  async function loadData() {

    const supabase =
      client();


    if (!supabase) {

      throw new Error(
        "Supabase belum tersedia."
      );

    }


    const [
      ordersResult,
      customersResult
    ] =
      await Promise.all([

        supabase
          .from("orders")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          ),

        supabase
          .from("customers")
          .select("*")

      ]);


    if (
      ordersResult.error
    ) {

      throw ordersResult.error;

    }


    orders =
      Array.isArray(
        ordersResult.data
      )
        ? ordersResult.data
        : [];


    if (
      customersResult.error
    ) {

      console.warn(
        "Production customers:",
        customersResult.error
      );


      customers = [];

    }
    else {

      customers =
        Array.isArray(
          customersResult.data
        )
          ? customersResult.data
          : [];

    }

  }


  function getProductionOrders() {

    return orders.filter(
      order =>
        STAGE_KEYS.includes(
          getStatus(order)
        )
    );

  }


  function renderStats() {

    const active =
      getProductionOrders();


    const approval =
      active.filter(
        order =>
          getStatus(order) ===
          "menunggu_approval"
      ).length;


    const printing =
      active.filter(
        order =>
          getStatus(order) ===
          "printing"
      ).length;


    const shipping =
      active.filter(
        order =>
          [
            "packing",
            "dikirim"
          ].includes(
            getStatus(order)
          )
      ).length;


    document.getElementById(
      "productionActiveCount"
    ).textContent =
      active.length;


    document.getElementById(
      "productionApprovalCount"
    ).textContent =
      approval;


    document.getElementById(
      "productionPrintingCount"
    ).textContent =
      printing;


    document.getElementById(
      "productionShippingCount"
    ).textContent =
      shipping;

  }


  function getFilteredOrders() {

    const search =
      normalize(
        document.getElementById(
          "productionSearch"
        )?.value
      );


    const stage =
      normalize(
        document.getElementById(
          "productionStageFilter"
        )?.value
      );


    return getProductionOrders()
      .filter(
        order => {

          const orderStatus =
            getStatus(order);


          if (stage) {

            const stageGroups = {

              desain: [
                "desain"
              ],

              approval: [
                "menunggu_approval",
                "revisi",
                "approved"
              ],

              produksi: [
                "printing",
                "finishing",
                "quality_check"
              ],

              packing: [
                "packing"
              ],

              dikirim: [
                "dikirim"
              ]

            };


            const allowedStatuses =
              stageGroups[stage] || [];


            if (
              !allowedStatuses.includes(
                orderStatus
              )
            ) {

              return false;

            }

          }


          if (!search) {

            return true;

          }


          const customer =
            findCustomer(order);


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


  function stageOptions(
    selected
  ) {

    return STAGES
      .map(
        stage => `

          <option
            value="${stage.key}"
            ${
              stage.key === selected
                ? "selected"
                : ""
            }
          >
            ${stage.label}
          </option>

        `
      )
      .join("");

  }


  function renderCard(order) {

    const customer =
      findCustomer(order);


    const status =
      getStatus(order);


    const id =
      escapeHtml(
        order.id
      );


    return `

      <article
        class="production-card"
        data-order-id="${id}"
      >


        <div class="production-card-order">

          <strong>
            ${escapeHtml(
              getOrderNumber(order)
            )}
          </strong>

          <span class="production-card-date">
            ${formatDate(
              order.created_at
            )}
          </span>

        </div>


        <div class="production-card-customer">

          <strong>
            ${escapeHtml(
              customerName(customer)
            )}
          </strong>

          <span>
            ${escapeHtml(
              customerWhatsapp(customer)
            )}
          </span>

        </div>


        <div class="production-card-total">

          <span>
            Total
          </span>

          <strong>
            ${formatRupiah(
              getTotal(order)
            )}
          </strong>

        </div>


        <select
          class="production-stage-select"
          data-order-id="${id}"
        >
          ${stageOptions(status)}
        </select>


        <div class="production-card-actions">

          <button
            type="button"
            class="production-card-save"
            data-save-production="${id}"
          >
            Simpan
          </button>


          <a
            href="../order-detail/?id=${encodeURIComponent(
              order.id
            )}"
            class="production-card-detail"
          >
            Detail
          </a>

        </div>


      </article>

    `;

  }


  function renderBoard() {

    const board =
      document.getElementById(
        "productionBoard"
      );


    const empty =
      document.getElementById(
        "productionEmpty"
      );


    const filtered =
      getFilteredOrders();


    if (!filtered.length) {

      if (empty) {

        empty.hidden =
          false;

      }

    }
    else {

      if (empty) {

        empty.hidden =
          true;

      }

    }


    board.innerHTML =
      STAGES
        .map(
          stage => {

            const stageOrders =
              filtered.filter(
                order =>
                  getStatus(order) ===
                  stage.key
              );


            return `

              <section class="production-column">

                <div class="production-column-heading">

                  <strong>
                    ${stage.label}
                  </strong>

                  <span class="production-column-count">
                    ${stageOrders.length}
                  </span>

                </div>


                <div class="production-column-list">

                  ${
                    stageOrders.length
                      ? stageOrders
                          .map(
                            renderCard
                          )
                          .join("")
                      : `
                        <div class="production-column-empty">
                          Tidak ada order
                        </div>
                      `
                  }

                </div>

              </section>

            `;

          }
        )
        .join("");


    bindSaveButtons();

  }


  async function updateStage(
    orderId,
    nextStatus,
    button
  ) {

    if (
      !orderId ||
      !nextStatus
    ) {

      return;

    }


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


      const order =
        orders.find(
          item =>
            String(item.id) ===
            String(orderId)
        );


      if (order) {

        order.status =
          nextStatus;

      }


      renderStats();

      renderBoard();

    }
    catch (error) {

      console.error(
        "Production update:",
        error
      );


      alert(
        error?.message ||
        "Gagal memperbarui tahap produksi."
      );


      button.disabled =
        false;


      button.textContent =
        "Simpan";

    }

  }


  function bindSaveButtons() {

    document
      .querySelectorAll(
        "[data-save-production]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const orderId =
                button.dataset
                  .saveProduction;


              const select =
                document.querySelector(
                  `.production-stage-select[data-order-id="${CSS.escape(
                    orderId
                  )}"]`
                );


              const nextStatus =
                select?.value;


              updateStage(
                orderId,
                nextStatus,
                button
              );

            }
          );

        }
      );

  }


  function renderError(message) {

    const board =
      document.getElementById(
        "productionBoard"
      );


    board.innerHTML = `

      <div class="production-error">
        ${escapeHtml(message)}
      </div>

    `;

  }


  function bindFilters() {

    const search =
      document.getElementById(
        "productionSearch"
      );


    const filter =
      document.getElementById(
        "productionStageFilter"
      );


    const reset =
      document.getElementById(
        "productionResetButton"
      );


    search?.addEventListener(
      "input",
      renderBoard
    );


    filter?.addEventListener(
      "change",
      renderBoard
    );


    reset?.addEventListener(
      "click",
      () => {

        if (search) {

          search.value = "";

        }


        if (filter) {

          filter.value = "";

        }


        renderBoard();

      }
    );

  }


  function bindRefresh() {

    const button =
      document.getElementById(
        "productionRefreshButton"
      );


    button?.addEventListener(
      "click",
      async () => {

        button.disabled =
          true;


        button.textContent =
          "Memuat...";


        try {

          await loadData();

          renderStats();

          renderBoard();

        }
        catch (error) {

          renderError(
            error?.message ||
            "Gagal memuat production."
          );

        }
        finally {

          button.disabled =
            false;


          button.textContent =
            "Refresh";

        }

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

    bindFilters();

    bindRefresh();


    try {

      await loadData();

      renderStats();

      renderBoard();

    }
    catch (error) {

      console.error(
        "Memora Production:",
        error
      );


      renderError(
        error?.message ||
        "Gagal memuat production."
      );

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

