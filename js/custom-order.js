"use strict";


const params =
  new URLSearchParams(
    window.location.search
  );


const token =
  params.get("token") || "";


let customData =
  null;



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



function showOnly(id) {

  [
    "customLoading",
    "customInvalid",
    "customContent",
    "customAdded"
  ]
  .forEach(
    key => {

      const element =
        document.getElementById(
          key
        );


      if (element) {

        element.hidden =
          key !== id;

      }

    }
  );

}



function invalid(
  title,
  message
) {

  document.getElementById(
    "invalidTitle"
  ).textContent =
    title;


  document.getElementById(
    "invalidMessage"
  ).textContent =
    message;


  showOnly(
    "customInvalid"
  );

}



function statusError(status) {

  if (
    status === "expired"
  ) {

    return [
      "Link sudah expired",
      "Masa berlaku pesanan khusus ini sudah berakhir."
    ];

  }


  if (
    status === "used"
  ) {

    return [
      "Link sudah digunakan",
      "Pesanan khusus melalui link ini sudah selesai digunakan."
    ];

  }


  if (
    status === "disabled"
  ) {

    return [
      "Link dinonaktifkan",
      "Pesanan khusus ini sudah dinonaktifkan oleh Memora."
    ];

  }


  return [
    "Link tidak tersedia",
    "Pesanan khusus tidak ditemukan."
  ];

}



/* ============================================================
   LOAD
   ============================================================ */

async function loadCustomOrder() {

  if (!token) {

    invalid(
      "Link tidak tersedia",
      "Token custom order tidak ditemukan."
    );

    return;

  }


  try {

    const {
      data,
      error
    } =
      await getDB()
        .rpc(
          "get_custom_order_link",
          {
            p_token:
              token
          }
        );


    if (error) {
      throw error;
    }


    if (
      !data ||
      data.found !== true
    ) {

      invalid(
        "Link tidak tersedia",
        "Pesanan khusus tidak ditemukan."
      );

      return;

    }


    if (
      data.status !== "active"
    ) {

      const [
        title,
        message
      ] =
        statusError(
          data.status
        );


      invalid(
        title,
        message
      );

      return;

    }


    if (
      !Array.isArray(
        data.custom_items
      ) ||
      !data.custom_items.length
    ) {

      invalid(
        "Pesanan belum lengkap",
        "Private link ini belum memiliki item."
      );

      return;

    }


    customData =
      data;


    render();

  }
  catch (error) {

    console.error(
      error
    );


    invalid(
      "Terjadi kesalahan",
      "Pesanan khusus belum dapat dibuka."
    );

  }

}



/* ============================================================
   RENDER
   ============================================================ */

function render() {

  const items =
    customData.custom_items;


  document.getElementById(
    "customerGreeting"
  ).textContent =
    customData.customer_name
      ? `Hai ${customData.customer_name}, berikut detail pesanan khusus yang sudah disiapkan Memora untukmu.`
      : "Berikut detail pesanan khusus yang sudah disiapkan Memora untukmu.";


  if (
    customData.customer_message
  ) {

    document.getElementById(
      "customerMessage"
    ).textContent =
      customData.customer_message;


    document.getElementById(
      "customerMessageBox"
    ).hidden =
      false;

  }


  document.getElementById(
    "itemCount"
  ).textContent =
    `${items.length} item`;


  document.getElementById(
    "customItems"
  ).innerHTML =
    items.map(
      item => `

        <article class="customer-item">

          <div class="customer-item-top">

            <div>

              <h3>
                ${escapeHTML(
                  item.product_name
                )}
              </h3>

              <p>
                ${escapeHTML(
                  item.variant_name
                )}
                ·
                ${Number(item.quantity || 0)}
                ${escapeHTML(
                  item.unit || "pcs"
                )}
              </p>

            </div>


            <div class="customer-item-price">

              <strong>
                ${rupiah(
                  item.subtotal
                )}
              </strong>

              <span>
                ${rupiah(
                  item.unit_price
                )}
                / ${escapeHTML(
                  item.unit || "item"
                )}
              </span>

            </div>

          </div>


          ${
            item.detail
              ? `
                <span class="custom-detail-badge">
                  ${escapeHTML(item.detail)}
                </span>
              `
              : ""
          }

        </article>

      `
    )
    .join("");


  document.getElementById(
    "personalizationList"
  ).innerHTML =
    items.map(
      (
        item,
        index
      ) => `

        <div class="personalization-card">

          <strong>
            ${escapeHTML(item.product_name)}
            ${item.detail ? `— ${escapeHTML(item.detail)}` : ""}
          </strong>

          <textarea
            class="custom-personalization"
            data-index="${index}"
            placeholder="${personalizationPlaceholder(item.product_key)}"
          ></textarea>

        </div>

      `
    )
    .join("");


  document.getElementById(
    "grandTotal"
  ).textContent =
    rupiah(
      customData.total_price
    );


  showOnly(
    "customContent"
  );

}



function personalizationPlaceholder(
  productKey
) {

  switch (productKey) {

    case "bridesmaid":

      return "Contoh: nama bridesmaid/MOH, nama pengantin, tanggal acara, tema/warna, custom message...";


    case "keepsake":

      return "Contoh: nama, tema, jumlah card, isi/caption, catatan foto...";


    case "hangtag":

      return "Contoh: nama/inisial, tanggal acara, teks hangtag, bentuk, tema/warna...";


    case "birthday":

      return "Contoh: nama, umur, tanggal, message, tema/warna...";


    default:

      return "Tulis detail personalisasi produk...";

  }

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



/* ============================================================
   GROUP LINES FOR CART

   BM 5 + MOH 2 with same product + variant becomes one
   cart item quantity 7, while breakdown is preserved.
   ============================================================ */

function buildCartItems() {

  const personalizationInputs =
    Array.from(
      document.querySelectorAll(
        ".custom-personalization"
      )
    );


  const notesByIndex =
    new Map();


  personalizationInputs
    .forEach(
      input => {

        notesByIndex.set(
          Number(
            input.dataset.index
          ),
          input.value.trim()
        );

      }
    );


  const grouped =
    new Map();


  customData.custom_items
    .forEach(
      (
        item,
        index
      ) => {

        const key =
          `${item.product_id}::${item.variant}`;


        if (
          !grouped.has(
            key
          )
        ) {

          grouped.set(
            key,
            {

              product_id:
                item.product_id,

              product:
                item.product_id,

              productSlug:
                item.product_id,

              product_slug:
                item.product_id,

              product_name:
                item.product_name,

              productName:
                item.product_name,

              variant:
                item.variant,

              package:
                item.variant,

              variant_name:
                item.variant_name,

              package_name:
                item.variant_name,

              variantName:
                item.variant_name,

              quantity:
                0,

              unit_price:
                Number(
                  item.unit_price || 0
                ),

              price:
                Number(
                  item.unit_price || 0
                ),

              unitPrice:
                Number(
                  item.unit_price || 0
                ),

              addons:
                [],

              personalization: {

                custom_order:
                  true,

                custom_order_token:
                  token,

                custom_breakdown:
                  []

              },

              customer_note:
                "",

              variant_image:
                `/assets/images/products/${item.image_folder}/${item.variant}.jpg`,

              image:
                `/assets/images/products/${item.image_folder}/${item.variant}.jpg`,

              is_custom_order:
                true,

              minimum_override:
                true,

              custom_order_token:
                token,

              custom_locked_quantity:
                0

            }
          );

        }


        const cartItem =
          grouped.get(
            key
          );


        cartItem.quantity +=
          Number(
            item.quantity || 0
          );


        cartItem.personalization
          .custom_breakdown
          .push({

            detail:
              item.detail || "",

            quantity:
              Number(
                item.quantity || 0
              ),

            note:
              notesByIndex.get(
                index
              ) || ""

          });

      }
    );


  return Array.from(
    grouped.values()
  )
  .map(
    item => {

      item.custom_locked_quantity =
        item.quantity;


      item.subtotal =
        item.unit_price *
        item.quantity;


      item.total =
        item.subtotal;


      item.totalPrice =
        item.subtotal;


      const breakdownText =
        item.personalization
          .custom_breakdown
          .map(
            part => {

              const name =
                part.detail ||
                "Custom";


              return (
                `${name} ${part.quantity}`
              );

            }
          )
          .join(", ");


      item.customer_note =
        `Private Custom Order: ${breakdownText}`;


      return item;

    }
  );

}



/* ============================================================
   ADD TO EXISTING CART
   ============================================================ */

function addToCart() {

  if (!customData) {
    return;
  }


  let cart = [];


  try {

    const stored =
      JSON.parse(
        localStorage.getItem(
          "memora_cart"
        ) || "[]"
      );


    cart =
      Array.isArray(stored)
        ? stored
        : [];

  }
  catch (_) {

    cart = [];

  }


  /*
    Remove items from THIS token first.
    This makes clicking the button twice idempotent.
  */

  cart =
    cart.filter(
      item =>
        item.custom_order_token !==
        token
  );


  const customItems =
    buildCartItems();


  cart.push(
    ...customItems
  );


  localStorage.setItem(
    "memora_cart",
    JSON.stringify(
      cart
    )
  );


  window.dispatchEvent(
    new CustomEvent(
      "memora:cart-updated",
      {
        detail:
          cart
      }
    )
  );


  showOnly(
    "customAdded"
  );

}



document
  .getElementById(
    "continueButton"
  )
  ?.addEventListener(
    "click",
    addToCart
  );


document.addEventListener(
  "DOMContentLoaded",
  loadCustomOrder
);

