(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  let customerId =
    null;


  let orders =
    [];


  let items =
    [];


  let activeFilter =
    "all";


  const list =
    document.getElementById(
      "customerOrdersList"
    );


  const empty =
    document.getElementById(
      "ordersEmpty"
    );


  const loading =
    document.getElementById(
      "ordersLoading"
    );


  const errorBox =
    document.getElementById(
      "ordersError"
    );


  function rupiah(value) {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style:
          "currency",

        currency:
          "IDR",

        maximumFractionDigits:
          0
      }
    ).format(
      Number(value) || 0
    );

  }


  function tanggal(value) {

    if (!value) {
      return "-";
    }


    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day:
          "numeric",

        month:
          "long",

        year:
          "numeric"
      }
    ).format(
      new Date(value)
    );

  }


  function esc(value) {

    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function customerStatus(status) {

    const map = {

      menunggu_konfirmasi:
        "Pesanan Diproses",

      data_belum_lengkap:
        "Pesanan Diproses",

      data_lengkap:
        "Pesanan Diproses",

      desain:
        "Desain & Approval",

      menunggu_approval:
        "Desain & Approval",

      revisi:
        "Desain & Approval",

      approved:
        "Desain & Approval",

      printing:
        "Produksi",

      finishing:
        "Produksi",

      quality_check:
        "Produksi",

      packing:
        "Packing",

      dikirim:
        "Dikirim",

      selesai:
        "Selesai",

      dibatalkan:
        "Dibatalkan"

    };


    return (
      map[status] ||
      status ||
      "-"
    );

  }


  function paymentStatus(status) {

    const map = {

      belum_ada_pembayaran:
        "Belum ada pembayaran",

      menunggu_verifikasi:
        "Menunggu verifikasi",

      dp:
        "DP diterima",

      lunas:
        "Lunas"

    };


    return (
      map[status] ||
      String(status || "-")
        .replaceAll("_", " ")
    );

  }


  function group(status) {

    if (
      [
        "menunggu_konfirmasi",
        "data_belum_lengkap",
        "data_lengkap",
        "desain",
        "menunggu_approval",
        "revisi",
        "approved"
      ].includes(status)
    ) {
      return "process";
    }


    if (
      [
        "printing",
        "finishing",
        "quality_check",
        "packing"
      ].includes(status)
    ) {
      return "production";
    }


    if (
      status === "dikirim"
    ) {
      return "shipping";
    }


    if (
      status === "selesai"
    ) {
      return "done";
    }


    return "other";

  }


  function itemName(item) {

    return (
      item.product_name ||
      item.name ||
      item.title ||
      item.product?.name ||
      "Produk Memora"
    );

  }


  function itemVariant(item) {

    return (
      item.variant_name ||
      item.package_name ||
      item.package ||
      item.selected_variant ||
      item.selected_size ||
      ""
    );

  }


  function itemQuantity(item) {

    return (
      item.quantity ||
      item.qty ||
      1
    );

  }


  function itemsForOrder(
    orderId
  ) {

    return items.filter(
      function (item) {

        return (
          item.order_id ===
          orderId
        );

      }
    );

  }


  async function getCustomer() {

    const {
      data
    } =
      await db
        .auth
        .getSession();


    const user =
      data?.session?.user;


    if (!user) {
      return false;
    }


    const {
      data: customer,
      error
    } =
      await db
        .from("customers")
        .select("id")
        .eq(
          "auth_user_id",
          user.id
        )
        .maybeSingle();


    if (
      error ||
      !customer
    ) {

      throw (
        error ||
        new Error(
          "Customer tidak ditemukan."
        )
      );

    }


    customerId =
      customer.id;


    return true;

  }


  async function load() {

    const {
      data,
      error
    } =
      await db
        .from("orders")
        .select("*")
        .eq(
          "customer_id",
          customerId
        )
        .eq(
          "is_archived",
          false
        )
        .order(
          "created_at",
          {
            ascending:
              false
          }
        );


    if (error) {
      throw error;
    }


    orders =
      data || [];


    if (
      orders.length ===
      0
    ) {

      render();

      return;

    }


    const ids =
      orders.map(
        function (order) {
          return order.id;
        }
      );


    const {
      data: orderItems,
      error: itemError
    } =
      await db
        .from("order_items")
        .select("*")
        .in(
          "order_id",
          ids
        );


    if (!itemError) {

      items =
        orderItems || [];

    }


    render();

  }


  function render() {

    if (loading) {
      loading.hidden = true;
    }


    const filtered =
      activeFilter === "all"
        ? orders
        : orders.filter(
            function (order) {

              return (
                group(order.status) ===
                activeFilter
              );

            }
          );


    if (
      filtered.length ===
      0
    ) {

      list.innerHTML =
        "";


      if (empty) {

        empty.hidden =
          false;

        empty.style.display =
          "";

      }


      return;

    }


    if (empty) {

      empty.hidden =
        true;

      empty.style.display =
        "none";

    }


    list.innerHTML =
      filtered
        .map(
          function (order) {

            const orderItems =
              itemsForOrder(
                order.id
              );


            let productText =
              "Detail produk tersedia pada rincian pesanan";


            if (
              orderItems.length
            ) {

              const first =
                orderItems[0];


              productText =
                `${esc(itemName(first))}`;


              const variant =
                itemVariant(first);


              if (variant) {

                productText +=
                  ` · ${esc(variant)}`;

              }


              productText +=
                ` · ${itemQuantity(first)} pcs`;


              if (
                orderItems.length > 1
              ) {

                productText +=
                  ` +${orderItems.length - 1} produk`;

              }

            }


            return `
              <article class="customer-order-card">

                <div class="customer-order-top">

                  <div>

                    <p class="customer-order-number">
                      ${esc(order.order_number)}
                    </p>

                    <span class="customer-order-date">
                      ${tanggal(order.created_at)}
                    </span>

                  </div>

                  <span class="customer-order-status">
                    ${esc(customerStatus(order.status))}
                  </span>

                </div>


                <div style="
                  padding:16px 0 4px;
                  font-size:11px;
                  line-height:1.7;
                  color:#4d5c55;
                ">
                  ${productText}
                </div>


                <div class="customer-order-body">

                  <div class="customer-order-info">

                    <span>
                      Pembayaran
                    </span>

                    <strong>
                      ${esc(paymentStatus(order.payment_status))}
                    </strong>

                  </div>


                  <div class="customer-order-info">

                    <span>
                      Sisa Pembayaran
                    </span>

                    <strong>
                      ${rupiah(order.remaining_amount)}
                    </strong>

                  </div>

                </div>


                <div class="customer-order-footer">

                  <div class="customer-order-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ${rupiah(order.grand_total)}
                    </strong>

                  </div>


                  <a
                    href="/account/orders/detail/?id=${encodeURIComponent(order.id)}"
                    class="customer-order-detail-button"
                  >
                    Lihat Rincian
                  </a>

                </div>

              </article>
            `;

          }
        )
        .join("");

  }


  function bindFilter() {

    document
      .querySelectorAll(
        "[data-order-filter]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              activeFilter =
                button.dataset.orderFilter ||
                "all";


              document
                .querySelectorAll(
                  "[data-order-filter]"
                )
                .forEach(
                  function (other) {

                    other
                      .classList
                      .remove("active");

                  }
                );


              button
                .classList
                .add("active");


              render();

            }
          );

        }
      );

  }


  async function init() {

    bindFilter();


    try {

      await getCustomer();

      await load();

    }
    catch (error) {

      console.error(
        "Customer orders:",
        error
      );


      if (loading) {
        loading.hidden = true;
      }


      if (errorBox) {

        errorBox.textContent =
          "Pesanan belum dapat dimuat. " +
          (
            error?.message ||
            ""
          );


        errorBox
          .classList
          .add("show");

      }

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();
