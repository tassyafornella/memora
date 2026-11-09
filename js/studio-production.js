(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  let orders =
    [];


  const stages = [

    {
      key: "desain",
      label: "Design"
    },

    {
      key: "produksi",
      label: "Production"
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
      label: "Shipping"
    },

    {
      key: "selesai",
      label: "Completed"
    }

  ];


  function el(id) {

    return document.getElementById(
      id
    );

  }


  function message(
    value,
    type = ""
  ) {

    const target =
      el(
        "productionMessage"
      );


    target.textContent =
      value;


    target.className =
      "studio-message " +
      type;

  }


  async function requireAdmin() {

    const {
      data
    } =
      await db.auth
        .getSession();


    const user =
      data?.session?.user;


    if (!user) {

      window.location.href =
        "/studio/login/?redirect=/studio/production/";

      return false;

    }


    const {
      data: profile
    } =
      await db
        .from(
          "profiles"
        )
        .select("role")
        .eq(
          "id",
          user.id
        )
        .maybeSingle();


    const role =
      String(
        profile?.role || ""
      )
        .trim()
        .toLowerCase();


    if (
      ![
        "owner",
        "admin"
      ].includes(role)
    ) {

      window.location.href =
        "/studio/login/";

      return false;

    }


    return true;

  }


  async function loadOrders() {

    const {
      data,
      error
    } =
      await db
        .from(
          "orders"
        )
        .select(`
          id,
          order_number,
          status,
          payment_status,
          grand_total,
          created_at
        `)
        .in(
          "status",
          stages.map(
            item =>
              item.key
          )
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


    orders =
      data || [];

  }


  function renderStats() {

    el(
      "productionDesign"
    ).textContent =
      orders.filter(
        item =>
          item.status ===
          "desain"
      ).length;


    el(
      "productionProcess"
    ).textContent =
      orders.filter(
        item =>
          [
            "produksi",
            "finishing",
            "quality_check"
          ].includes(
            item.status
          )
      ).length;


    el(
      "productionShipping"
    ).textContent =
      orders.filter(
        item =>
          [
            "packing",
            "dikirim",
            "selesai"
          ].includes(
            item.status
          )
      ).length;

  }


  function renderCard(order) {

    const options =
      stages
        .map(
          stage => `
            <option
              value="${stage.key}"
              ${
                stage.key ===
                order.status
                  ? "selected"
                  : ""
              }
            >
              ${stage.label}
            </option>
          `
        )
        .join("");


    return `
      <article class="production-card">

        <strong>
          ${order.order_number || "-"}
        </strong>

        <span>
          ${String(order.payment_status || "-").replaceAll("_"," ")}
        </span>

        <select
          data-production-status="${order.id}"
        >
          ${options}
        </select>

        <button
          type="button"
          data-save-production="${order.id}"
        >
          Save Stage
        </button>

      </article>
    `;

  }


  function render() {

    const search =
      el(
        "productionSearch"
      ).value
        .trim()
        .toLowerCase();


    const filter =
      el(
        "productionFilter"
      ).value;


    const filtered =
      orders.filter(
        order => {

          const matchesSearch =
            !search ||
            String(
              order.order_number || ""
            )
              .toLowerCase()
              .includes(
                search
              );


          const matchesStage =
            !filter ||
            order.status ===
            filter;


          return (
            matchesSearch &&
            matchesStage
          );

        }
      );


    el(
      "productionEmpty"
    ).hidden =
      filtered.length > 0;


    const visibleStages =
      filter
        ? stages.filter(
            stage =>
              stage.key ===
              filter
          )
        : stages;


    el(
      "productionBoard"
    ).innerHTML =
      visibleStages
        .map(
          stage => {

            const items =
              filtered.filter(
                order =>
                  order.status ===
                  stage.key
              );


            return `
              <section class="production-column">

                <div class="production-column-heading">

                  <strong>
                    ${stage.label}
                  </strong>

                  <span>
                    ${items.length}
                  </span>

                </div>

                ${
                  items.length
                    ? items
                        .map(
                          renderCard
                        )
                        .join("")
                    : `
                      <div class="studio-empty">
                        Tidak ada order
                      </div>
                    `
                }

              </section>
            `;

          }
        )
        .join("");

  }


  async function updateStage(
    id,
    button
  ) {

    const select =
      document.querySelector(
        `[data-production-status="${CSS.escape(id)}"]`
      );


    const nextStatus =
      select?.value;


    if (!nextStatus) {
      return;
    }


    button.disabled =
      true;


    button.textContent =
      "Saving...";


    try {

      const {
        error
      } =
        await db
          .from(
            "orders"
          )
          .update({

            status:
              nextStatus,

            updated_at:
              new Date()
                .toISOString()

          })
          .eq(
            "id",
            id
          );


      if (error) {
        throw error;
      }


      const order =
        orders.find(
          item =>
            item.id === id
        );


      if (order) {

        order.status =
          nextStatus;

      }


      renderStats();

      render();


      message(
        "Status produksi berhasil diperbarui.",
        "success"
      );

    }
    catch (error) {

      message(
        error?.message ||
        "Status produksi belum berhasil diperbarui.",
        "error"
      );


      button.disabled =
        false;


      button.textContent =
        "Save Stage";

    }

  }


  function bindEvents() {

    el(
      "productionSearch"
    )
      ?.addEventListener(
        "input",
        render
      );


    el(
      "productionFilter"
    )
      ?.addEventListener(
        "change",
        render
      );


    document.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            "[data-save-production]"
          );


        if (!button) {
          return;
        }


        updateStage(
          button.dataset.saveProduction,
          button
        );

      }
    );

  }


  async function init() {

    try {

      if (
        !await requireAdmin()
      ) {
        return;
      }


      bindEvents();


      await loadOrders();


      renderStats();

      render();


      el(
        "productionLoading"
      ).hidden =
        true;

    }
    catch (error) {

      el(
        "productionLoading"
      ).hidden =
        true;


      message(
        error?.message ||
        "Production belum dapat dimuat.",
        "error"
      );

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();