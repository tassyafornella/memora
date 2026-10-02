"use strict";


let customOrders = [];


/*
  productKey   = page identifier
  dbSlug       = slug expected by create_memora_order RPC
*/

const CUSTOM_PRODUCTS = {

  bridesmaid: {

    name:
      "Bridesmaid / MOH Set",

    page:
      "/product/bridesmaid/",

    dbSlug:
      "bridesmaid-moh",

    imageFolder:
      "bridesmaid",

    unit:
      "set"

  },


  keepsake: {

    name:
      "Keepsake",

    page:
      "/product/keepsake/",

    dbSlug:
      "keepsake",

    imageFolder:
      "keepsake",

    unit:
      "set"

  },


  hangtag: {

    name:
      "Hangtag",

    page:
      "/product/hangtag/",

    dbSlug:
      "hangtag",

    imageFolder:
      "hangtag",

    unit:
      "set"

  },


  birthday: {

    name:
      "Birthday Card",

    page:
      "/product/birthday/",

    dbSlug:
      "birthday",

    imageFolder:
      "birthday",

    unit:
      "set"

  }

};


const productPriceCache =
  new Map();



function getDB() {

  const client =
    window.memoraSupabase ||
    window.supabaseClient ||
    window.db ||
    window.supabaseDB ||
    window.supabase_client ||
    null;


  if (
    client &&
    typeof client.rpc ===
      "function"
  ) {

    return client;

  }


  throw new Error(
    "Supabase client belum tersedia."
  );

}



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
    Number(value || 0)
  );

}



function escapeHTML(value) {

  return String(
    value ?? ""
  )
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

}



function parseRupiah(text) {

  const match =
    String(text || "")
      .match(
        /Rp\s*([\d.,]+)/i
      );


  if (!match) {
    return 0;
  }


  return Number(
    match[1]
      .replace(/\./g, "")
      .replace(/,/g, "")
  ) || 0;

}



function formatDate(value) {

  if (!value) {
    return "Tanpa expired";
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
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit"
    }
  ).format(date);

}



function getStatus(row) {

  if (
    row.is_active ===
    false
  ) {

    return "disabled";

  }


  if (
    row.expires_at &&
    new Date(
      row.expires_at
    ).getTime() <=
      Date.now()
  ) {

    return "expired";

  }


  if (
    Number(
      row.used_count || 0
    ) >=
    Number(
      row.max_uses || 1
    )
  ) {

    return "used";

  }


  return "active";

}



function statusLabel(status) {

  return {

    active:
      "Aktif",

    used:
      "Sudah dipakai",

    expired:
      "Expired",

    disabled:
      "Dinonaktifkan"

  }[status] || status;

}



function shareLink(token) {

  return (
    `${window.location.origin}/custom-order/?token=${encodeURIComponent(token)}`
  );

}



/* ============================================================
   READ PRICES DIRECTLY FROM CURRENT PRODUCT PAGE
   ============================================================ */

async function readProductPrices(
  productKey
) {

  if (
    productPriceCache.has(
      productKey
    )
  ) {

    return productPriceCache.get(
      productKey
    );

  }


  const config =
    CUSTOM_PRODUCTS[
      productKey
    ];


  if (!config) {
    return [];
  }


  const response =
    await fetch(
      config.page,
      {
        cache:
          "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      `Gagal membaca ${config.page}`
    );

  }


  const html =
    await response.text();


  const doc =
    new DOMParser()
      .parseFromString(
        html,
        "text/html"
      );


  const prices =
    [];


  /*
    Current Memora structure:

    .variant-card
    data-variant="simple"

      .variant-label Simple
      strong Rp8.000
  */

  Array.from(
    doc.querySelectorAll(
      ".variant-card[data-variant]"
    )
  )
  .forEach(
    card => {

      const code =
        String(
          card.dataset.variant || ""
        )
        .trim()
        .toLowerCase();


      if (!code) {
        return;
      }


      const name =
        card
          .querySelector(
            ".variant-label"
          )
          ?.textContent
          ?.trim() ||
        code;


      const price =
        parseRupiah(
          card.textContent
        );


      if (price <= 0) {
        return;
      }


      if (
        prices.some(
          item =>
            item.code === code
        )
      ) {
        return;
      }


      prices.push({

        code,

        name,

        price

      });

    }
  );


  /*
    Backward-compatible support.
  */

  if (!prices.length) {

    Array.from(
      doc.querySelectorAll(
        "[data-price]"
      )
    )
    .forEach(
      element => {

        const code =
          element.dataset.variant ||
          element.dataset.package ||
          element.dataset.foldedPackage ||
          "";


        const price =
          Number(
            element.dataset.price || 0
          );


        if (
          !code ||
          price <= 0
        ) {
          return;
        }


        const name =
          element.dataset.packageName ||
          element.dataset.variantName ||
          element
            .querySelector(
              ".variant-label,strong,h3"
            )
            ?.textContent
            ?.trim() ||
          code;


        if (
          !prices.some(
            item =>
              item.code === code
          )
        ) {

          prices.push({

            code:
              String(code)
                .toLowerCase(),

            name,

            price

          });

        }

      }
    );

  }


  productPriceCache.set(
    productKey,
    prices
  );


  return prices;

}



/* ============================================================
   PRODUCT ROW
   ============================================================ */

function productOptions() {

  return `

    <option value="">
      Pilih produk
    </option>

    ${Object.entries(
      CUSTOM_PRODUCTS
    )
    .map(
      ([key, item]) => `
        <option value="${key}">
          ${escapeHTML(item.name)}
        </option>
      `
    )
    .join("")}

  `;

}



function addProductRow(
  initial = {}
) {

  const container =
    document.getElementById(
      "customProductRows"
    );


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "custom-product-row";


  row.innerHTML = `

    <div class="custom-product-grid">

      <label>

        Produk

        <select
          class="custom-product-select"
          required
        >
          ${productOptions()}
        </select>

      </label>


      <label>

        Paket

        <select
          class="custom-variant-select"
          required
          disabled
        >
          <option value="">
            Pilih produk dahulu
          </option>
        </select>

      </label>


      <label>

        Qty

        <input
          type="number"
          class="custom-quantity"
          min="1"
          value="${Number(initial.quantity || 1)}"
          required
        >

      </label>


      <label>

        Jenis / Detail

        <input
          type="text"
          class="custom-detail"
          placeholder="Contoh: Bridesmaid / MOH"
          value="${escapeHTML(initial.detail || "")}"
        >

      </label>


      <button
        type="button"
        class="remove-product"
        title="Hapus"
      >
        ×
      </button>

    </div>


    <div class="custom-line-price">

      <span class="custom-price-description">
        Pilih produk dan paket
      </span>

      <strong class="custom-line-total">
        Rp0
      </strong>

    </div>

  `;


  container.appendChild(
    row
  );


  const productSelect =
    row.querySelector(
      ".custom-product-select"
    );


  const variantSelect =
    row.querySelector(
      ".custom-variant-select"
    );


  productSelect.addEventListener(
    "change",
    async () => {

      variantSelect.disabled =
        true;


      variantSelect.innerHTML =
        `
          <option value="">
            Memuat harga...
          </option>
        `;


      try {

        const prices =
          await readProductPrices(
            productSelect.value
          );


        variantSelect.innerHTML =
          `
            <option value="">
              Pilih paket
            </option>
          `;


        prices.forEach(
          variant => {

            const option =
              document.createElement(
                "option"
              );


            option.value =
              variant.code;


            option.dataset.price =
              String(
                variant.price
              );


            option.dataset.name =
              variant.name;


            option.textContent =
              `${variant.name} — ${rupiah(variant.price)}`;


            variantSelect.appendChild(
              option
            );

          }
        );


        variantSelect.disabled =
          false;


        updateBuilder();

      }
      catch (error) {

        console.error(
          error
        );


        variantSelect.innerHTML =
          `
            <option value="">
              Harga tidak ditemukan
            </option>
          `;

      }

    }
  );


  variantSelect.addEventListener(
    "change",
    updateBuilder
  );


  row
    .querySelector(
      ".custom-quantity"
    )
    .addEventListener(
      "input",
      updateBuilder
    );


  row
    .querySelector(
      ".custom-detail"
    )
    .addEventListener(
      "input",
      updateBuilder
    );


  row
    .querySelector(
      ".remove-product"
    )
    .addEventListener(
      "click",
      () => {

        row.remove();

        updateBuilder();

      }
    );

}



/* ============================================================
   COLLECT ROWS
   ============================================================ */

function collectBuilderItems() {

  return Array.from(
    document.querySelectorAll(
      ".custom-product-row"
    )
  )
  .map(
    row => {

      const productKey =
        row
          .querySelector(
            ".custom-product-select"
          )
          .value;


      const variantSelect =
        row
          .querySelector(
            ".custom-variant-select"
          );


      const variantOption =
        variantSelect
          .selectedOptions[0];


      const quantity =
        Math.max(
          Number(
            row
              .querySelector(
                ".custom-quantity"
              )
              .value || 0
          ),
          0
        );


      const detail =
        row
          .querySelector(
            ".custom-detail"
          )
          .value
          .trim();


      const product =
        CUSTOM_PRODUCTS[
          productKey
        ];


      const unitPrice =
        Number(
          variantOption
            ?.dataset
            ?.price || 0
        );


      const variantName =
        variantOption
          ?.dataset
          ?.name ||
        variantOption
          ?.textContent
          ?.split("—")[0]
          ?.trim() ||
        "";


      const variant =
        variantSelect.value;


      return {

        product_key:
          productKey,

        product_id:
          product?.dbSlug || "",

        product_name:
          product?.name || "",

        product_page:
          product?.page || "",

        image_folder:
          product?.imageFolder || "",

        unit:
          product?.unit || "pcs",

        variant,

        variant_name:
          variantName,

        quantity,

        detail,

        unit_price:
          unitPrice,

        subtotal:
          unitPrice *
          quantity

      };

    }
  )
  .filter(
    item =>
      item.product_id &&
      item.variant &&
      item.quantity > 0 &&
      item.unit_price > 0
  );

}



/* ============================================================
   SUMMARY
   ============================================================ */

function updateBuilder() {

  const items =
    collectBuilderItems();


  document
    .querySelectorAll(
      ".custom-product-row"
    )
    .forEach(
      row => {

        const productKey =
          row
            .querySelector(
              ".custom-product-select"
            )
            .value;


        const variant =
          row
            .querySelector(
              ".custom-variant-select"
            )
            .selectedOptions[0];


        const qty =
          Number(
            row
              .querySelector(
                ".custom-quantity"
              )
              .value || 0
          );


        const price =
          Number(
            variant
              ?.dataset
              ?.price || 0
          );


        const description =
          row.querySelector(
            ".custom-price-description"
          );


        const total =
          row.querySelector(
            ".custom-line-total"
          );


        if (
          productKey &&
          variant?.value &&
          price > 0
        ) {

          const unit =
            CUSTOM_PRODUCTS[
              productKey
            ]?.unit ||
            "pcs";


          description.textContent =
            `${qty} ${unit} × ${rupiah(price)}`;


          total.textContent =
            rupiah(
              qty *
              price
            );

        }
        else {

          description.textContent =
            "Pilih produk dan paket";


          total.textContent =
            "Rp0";

        }

      }
    );


  const summary =
    document.getElementById(
      "customSummary"
    );


  if (!items.length) {

    summary.innerHTML =
      `
        <div class="custom-summary-empty">
          Tambahkan produk untuk melihat ringkasan.
        </div>
      `;


    document.getElementById(
      "customGrandTotal"
    ).textContent =
      "Rp0";


    return;

  }


  summary.innerHTML =
    items.map(
      item => `

        <div class="custom-summary-line">

          <div>

            <strong>
              ${escapeHTML(item.product_name)}
            </strong>

            <span>
              ${escapeHTML(item.variant_name)}
              ${item.detail ? ` · ${escapeHTML(item.detail)}` : ""}
              · ${item.quantity} ${escapeHTML(item.unit)}
            </span>

          </div>

          <strong>
            ${rupiah(item.subtotal)}
          </strong>

        </div>

      `
    )
    .join("");


  const grandTotal =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.subtotal,
      0
    );


  document.getElementById(
    "customGrandTotal"
  ).textContent =
    rupiah(
      grandTotal
    );

}



/* ============================================================
   MODAL
   ============================================================ */

function openModal() {

  document.getElementById(
    "customModal"
  ).hidden =
    false;


  document.getElementById(
    "customOrderForm"
  ).reset();


  document.getElementById(
    "customProductRows"
  ).innerHTML =
    "";


  document.getElementById(
    "maxUses"
  ).value =
    "1";


  addProductRow();

  updateBuilder();

}



function closeModal() {

  document.getElementById(
    "customModal"
  ).hidden =
    true;

}



/* ============================================================
   SAVE CUSTOM BUNDLE
   ============================================================ */

async function saveCustomOrder(
  event
) {

  event.preventDefault();


  const items =
    collectBuilderItems();


  if (!items.length) {

    alert(
      "Tambahkan minimal satu produk dengan paket dan quantity."
    );

    return;

  }


  const rowCount =
    document.querySelectorAll(
      ".custom-product-row"
    ).length;


  if (
    items.length !==
    rowCount
  ) {

    alert(
      "Masih ada produk yang belum lengkap."
    );

    return;

  }


  const totalQuantity =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,
      0
    );


  const grandTotal =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.subtotal,
      0
    );


  const expiresValue =
    document.getElementById(
      "expiresAt"
    ).value;


  const expiresAt =
    expiresValue
      ? new Date(
          expiresValue
        ).toISOString()
      : null;


  const button =
    document.getElementById(
      "saveCustomOrderButton"
    );


  button.disabled =
    true;


  button.textContent =
    "Membuat Link...";


  try {

    const db =
      getDB();


    const {
      data,
      error
    } =
      await db.rpc(
        "admin_create_custom_order_link",
        {

          p_customer_name:
            document.getElementById(
              "customerName"
            ).value.trim() ||
            null,

          p_customer_whatsapp:
            document.getElementById(
              "customerWhatsapp"
            ).value.trim() ||
            null,

          p_product_name:
            items.length > 1
              ? "Custom Bundle"
              : items[0].product_name,

          p_variant_name:
            items.length > 1
              ? null
              : items[0].variant_name,

          p_custom_items:
            items,

          p_quantity_total:
            totalQuantity,

          /*
            Summary only.
            Individual prices are inside custom_items.
          */

          p_unit_price:
            0,

          p_total_price:
            grandTotal,

          p_admin_note:
            document.getElementById(
              "adminNote"
            ).value.trim() ||
            null,

          p_customer_message:
            document.getElementById(
              "customerMessage"
            ).value.trim() ||
            null,

          p_expires_at:
            expiresAt,

          p_max_uses:
            Math.max(
              Number(
                document.getElementById(
                  "maxUses"
                ).value || 1
              ),
              1
            )

        }
      );


    if (error) {
      throw error;
    }


    const result =
      Array.isArray(data)
        ? data[0]
        : data;


    if (
      !result ||
      !result.token
    ) {

      throw new Error(
        "Token custom order tidak ditemukan."
      );

    }


    const link =
      shareLink(
        result.token
      );


    try {

      await navigator
        .clipboard
        .writeText(
          link
        );


      alert(
        `Private link berhasil dibuat.

${items.length} jenis item
${totalQuantity} total quantity
${rupiah(grandTotal)}

Link sudah disalin.`
      );

    }
    catch (_) {

      prompt(
        "Private link berhasil dibuat:",
        link
      );

    }


    closeModal();

    await loadCustomOrders();

  }
  catch (error) {

    console.error(
      error
    );


    const errorMessage =
      error?.message ||
      error?.details ||
      error?.hint ||
      error?.code ||
      JSON.stringify(error) ||
      "Unknown error";


    alert(
      `Custom order gagal:

${errorMessage}`
    );

  }
  finally {

    button.disabled =
      false;


    button.textContent =
      "Generate Private Link";

  }

}



/* ============================================================
   LIST
   ============================================================ */

async function loadCustomOrders() {

  try {

    const {
      data,
      error
    } =
      await getDB()
        .rpc(
          "admin_list_custom_order_links"
        );


    if (error) {
      throw error;
    }


    customOrders =
      Array.isArray(data)
        ? data
        : [];


    renderOrders();

  }
  catch (error) {

    console.error(
      error
    );


    document.getElementById(
      "customOrderList"
    ).innerHTML =
      `
        <div class="custom-empty">
          Custom order belum dapat dimuat.
        </div>
      `;

  }

}



function updateStats() {

  const values = {

    total:
      customOrders.length,

    active:
      0,

    used:
      0,

    expired:
      0

  };


  customOrders.forEach(
    row => {

      const status =
        getStatus(row);


      if (
        Object.prototype
          .hasOwnProperty
          .call(
            values,
            status
          )
      ) {

        values[
          status
        ] += 1;

      }

    }
  );


  document.getElementById(
    "statTotal"
  ).textContent =
    values.total;


  document.getElementById(
    "statActive"
  ).textContent =
    values.active;


  document.getElementById(
    "statUsed"
  ).textContent =
    values.used;


  document.getElementById(
    "statExpired"
  ).textContent =
    values.expired;

}



function renderOrders() {

  updateStats();


  const search =
    document.getElementById(
      "customSearch"
    )
    .value
    .trim()
    .toLowerCase();


  const filter =
    document.getElementById(
      "customStatusFilter"
    ).value;


  const rows =
    customOrders.filter(
      row => {

        const status =
          getStatus(row);


        if (
          filter !== "all" &&
          status !== filter
        ) {

          return false;

        }


        if (!search) {
          return true;
        }


        const products =
          Array.isArray(
            row.custom_items
          )
            ? row.custom_items
                .map(
                  item =>
                    item.product_name
                )
                .join(" ")
            : "";


        return [
          row.customer_name,
          row.customer_whatsapp,
          row.product_name,
          products
        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);

      }
    );


  const container =
    document.getElementById(
      "customOrderList"
    );


  if (!rows.length) {

    container.innerHTML =
      `
        <div class="custom-empty">
          Tidak ada custom order ditemukan.
        </div>
      `;

    return;

  }


  container.innerHTML =
    rows.map(
      row => {

        const status =
          getStatus(row);


        const itemCount =
          Array.isArray(
            row.custom_items
          )
            ? row.custom_items.length
            : 0;


        return `

          <article class="custom-order-row">

            <div>

              <strong>
                ${escapeHTML(
                  row.customer_name ||
                  "Tanpa nama"
                )}
              </strong>

              <small>
                ${escapeHTML(
                  row.customer_whatsapp ||
                  "-"
                )}
              </small>

            </div>


            <div>

              <strong>
                ${
                  itemCount
                    ? `${itemCount} item custom`
                    : escapeHTML(
                        row.product_name ||
                        "Custom Order"
                      )
                }
              </strong>

              <small>
                ${Number(row.quantity_total || 0)}
                total quantity
              </small>

            </div>


            <div>

              <strong>
                ${rupiah(row.total_price)}
              </strong>

            </div>


            <div>

              <span
                class="status-badge status-${status}"
              >
                ${statusLabel(status)}
              </span>

              <small>
                ${escapeHTML(
                  formatDate(
                    row.expires_at
                  )
                )}
              </small>

            </div>


            <div class="custom-actions">

              <button
                type="button"
                data-action="copy"
                data-token="${escapeHTML(row.token)}"
              >
                Salin Link
              </button>


              <button
                type="button"
                data-action="preview"
                data-token="${escapeHTML(row.token)}"
              >
                Preview
              </button>


              ${
                row.is_active
                  ? `
                    <button
                      type="button"
                      data-action="disable"
                      data-id="${escapeHTML(row.id)}"
                    >
                      Nonaktifkan
                    </button>
                  `
                  : `
                    <button
                      type="button"
                      data-action="enable"
                      data-id="${escapeHTML(row.id)}"
                    >
                      Aktifkan
                    </button>
                  `
              }


              <button
                type="button"
                data-action="delete"
                data-id="${escapeHTML(row.id)}"
              >
                Hapus
              </button>

            </div>

          </article>

        `;

      }
    )
    .join("");

}



/* ============================================================
   ACTIONS
   ============================================================ */

async function setActive(
  id,
  active
) {

  const {
    error
  } =
    await getDB()
      .rpc(
        "admin_set_custom_order_active",
        {
          p_id:
            id,

          p_is_active:
            active
        }
      );


  if (error) {
    throw error;
  }


  await loadCustomOrders();

}



async function deleteOrder(
  id
) {

  if (
    !confirm(
      "Hapus custom order link ini?"
    )
  ) {

    return;

  }


  const {
    error
  } =
    await getDB()
      .rpc(
        "admin_delete_custom_order_link",
        {
          p_id:
            id
        }
      );


  if (error) {
    throw error;
  }


  await loadCustomOrders();

}



/* ============================================================
   EVENTS
   ============================================================ */

document
  .getElementById(
    "openCreateButton"
  )
  .addEventListener(
    "click",
    openModal
  );


document
  .getElementById(
    "closeCreateButton"
  )
  .addEventListener(
    "click",
    closeModal
  );


document
  .getElementById(
    "cancelCreateButton"
  )
  .addEventListener(
    "click",
    closeModal
  );


document
  .getElementById(
    "addProductButton"
  )
  .addEventListener(
    "click",
    () => {

      addProductRow();

    }
  );


document
  .getElementById(
    "customOrderForm"
  )
  .addEventListener(
    "submit",
    saveCustomOrder
  );


document
  .getElementById(
    "customSearch"
  )
  .addEventListener(
    "input",
    renderOrders
  );


document
  .getElementById(
    "customStatusFilter"
  )
  .addEventListener(
    "change",
    renderOrders
  );


document
  .getElementById(
    "customOrderList"
  )
  .addEventListener(
    "click",
    async event => {

      const button =
        event.target.closest(
          "button[data-action]"
        );


      if (!button) {
        return;
      }


      try {

        switch (
          button.dataset.action
        ) {

          case "copy": {

            const link =
              shareLink(
                button.dataset.token
              );


            await navigator
              .clipboard
              .writeText(
                link
              );


            button.textContent =
              "Tersalin ✓";


            setTimeout(
              () => {

                button.textContent =
                  "Salin Link";

              },
              1200
            );


            break;

          }


          case "preview":

            window.open(
              shareLink(
                button.dataset.token
              ),
              "_blank"
            );

            break;


          case "disable":

            await setActive(
              button.dataset.id,
              false
            );

            break;


          case "enable":

            await setActive(
              button.dataset.id,
              true
            );

            break;


          case "delete":

            await deleteOrder(
              button.dataset.id
            );

            break;

        }

      }
      catch (error) {

        console.error(
          error
        );


        alert(
          "Aksi belum berhasil."
        );

      }

    }
  );


document.addEventListener(
  "DOMContentLoaded",
  loadCustomOrders
);


