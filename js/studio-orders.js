(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  let orders =
    [];


  let customers =
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


  function message(
    value,
    type = ""
  ) {

    const target =
      el(
        "ordersMessage"
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
        "/studio/login/?redirect=/studio/orders/";

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


  async function loadData() {

    const [
      orderResult,
      customerResult
    ] =
      await Promise.all([

        db
          .from(
            "orders"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          ),

        db
          .from(
            "customers"
          )
          .select(
            "id, full_name, email, whatsapp"
          )

      ]);


    if (orderResult.error) {
      throw orderResult.error;
    }


    orders =
      orderResult.data ||
      [];


    customers =
      customerResult.error
        ? []
        : (
            customerResult.data ||
            []
          );

  }


  function renderStats() {

    el(
      "ordersTotal"
    ).textContent =
      orders.length;


    el(
      "ordersWaiting"
    ).textContent =
      orders.filter(
        item =>
          item.status ===
          "menunggu_konfirmasi"
      ).length;


    el(
      "ordersProcessing"
    ).textContent =
      orders.filter(
        item =>
          ![
            "menunggu_konfirmasi",
            "selesai",
            "dibatalkan"
          ].includes(
            item.status
          )
      ).length;

  }


  function render() {

    const search =
      el(
        "ordersSearch"
      ).value
        .trim()
        .toLowerCase();


    const status =
      el(
        "ordersStatusFilter"
      ).value;


    const filtered =
      orders.filter(
        order => {

          const customer =
            findCustomer(
              order.customer_id
            );


          const haystack =
            [
              order.order_number,
              customer?.full_name,
              customer?.email,
              customer?.whatsapp
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          return (
            (
              !search ||
              haystack.includes(search)
            ) &&
            (
              !status ||
              order.status === status
            )
          );

        }
      );


    el(
      "ordersEmpty"
    ).hidden =
      filtered.length > 0;


    el(
      "ordersList"
    ).innerHTML =
      filtered
        .map(
          order => {

            const customer =
              findCustomer(
                order.customer_id
              );


            return `
              <article class="admin-order-card">

                <div>

                  <div class="admin-order-number">
                    ${order.order_number || "-"}
                  </div>

                  <div class="admin-order-customer">
                    ${customer?.full_name || "Customer"}
                    <br>
                    ${customer?.whatsapp || "-"}
                  </div>

                  <div class="admin-order-total">
                    ${rupiah(order.grand_total)}
                  </div>

                </div>


                <div>

                  <span class="payment-status ${order.payment_status || ""}">
                    ${String(order.payment_status || "-").replaceAll("_"," ")}
                  </span>

                </div>


                <div class="admin-order-editor">

                  <select
                    data-order-status="${order.id}"
                  >

                    <option value="menunggu_konfirmasi">
                      Menunggu Konfirmasi
                    </option>

                    <option value="desain">
                      Desain
                    </option>

                    <option value="produksi">
                      Produksi
                    </option>

                    <option value="finishing">
                      Finishing
                    </option>

                    <option value="quality_check">
                      Quality Check
                    </option>

                    <option value="packing">
                      Packing
                    </option>

                    <option value="dikirim">
                      Dikirim
                    </option>

                    <option value="selesai">
                      Selesai
                    </option>

                    <option value="dibatalkan">
                      Dibatalkan
                    </option>

                  </select>


                  <button
                    type="button"
                    data-save-order="${order.id}"
                  >
                    Save
                  </button>

                </div>

              </article>
            `;

          }
        )
        .join("");


    filtered.forEach(
      order => {

        const select =
          document.querySelector(
            `[data-order-status="${CSS.escape(order.id)}"]`
          );


        if (select) {

          select.value =
            order.status ||
            "menunggu_konfirmasi";

        }

      }
    );

  }


  async function updateOrder(
    id,
    button
  ) {

    const select =
      document.querySelector(
        `[data-order-status="${CSS.escape(id)}"]`
      );


    const status =
      select?.value;


    if (!status) {
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
              status,

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
          status;

      }


      renderStats();

      render();


      message(
        "Data pesanan berhasil diperbarui.",
        "success"
      );

    }
    catch (error) {

      message(
        error?.message ||
        "Data pesanan belum berhasil diperbarui.",
        "error"
      );


      button.disabled =
        false;


      button.textContent =
        "Save";

    }

  }


  function bindEvents() {

    el(
      "ordersSearch"
    )
      ?.addEventListener(
        "input",
        render
      );


    el(
      "ordersStatusFilter"
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
            "[data-save-order]"
          );


        if (!button) {
          return;
        }


        updateOrder(
          button.dataset.saveOrder,
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


      await loadData();


      renderStats();

      render();


      el(
        "ordersLoading"
      ).hidden =
        true;

    }
    catch (error) {

      el(
        "ordersLoading"
      ).hidden =
        true;


      message(
        error?.message ||
        "Orders belum dapat dimuat.",
        "error"
      );

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();