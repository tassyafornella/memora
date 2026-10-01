(function () {

  "use strict";


  const supabase =
    window.memoraSupabase;


  /* ========================================================
     HELPER
     ======================================================== */

  function get(id) {

    return document.getElementById(id);

  }


  function setValue(
    id,
    value
  ) {

    const element =
      get(id);


    if (!element) {
      return;
    }


    element.value =
      value || "";

  }


  /* ========================================================
     HIDE OLD DATA CUSTOMER SECTION
     ======================================================== */

  function hideLegacyCustomerSection() {

    const headings =
      Array.from(
        document.querySelectorAll(
          "h1, h2, h3, h4"
        )
      );


    const heading =
      headings.find(
        function (element) {

          return (
            String(
              element.textContent || ""
            )
              .trim()
              .toLowerCase() ===
            "data customer"
          );

        }
      );


    if (!heading) {
      return;
    }


    const section =
      heading.closest("section");


    if (section) {

      section.classList.add(
        "checkout-legacy-customer-section"
      );

      section.hidden =
        true;

    }

  }


  /* ========================================================
     PROFILE
     ======================================================== */

  async function loadCustomerProfile() {

    if (!supabase) {
      return;
    }


    const {
      data: sessionData,
      error: sessionError
    } =
      await supabase
        .auth
        .getSession();


    const user =
      sessionData
        ?.session
        ?.user;


    if (
      sessionError ||
      !user
    ) {
      return;
    }


    const {
      data: customer,
      error
    } =
      await supabase
        .from("customers")
        .select(
          "full_name, whatsapp, email"
        )
        .eq(
          "auth_user_id",
          user.id
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Checkout profile bridge:",
        error
      );

      return;
    }


    /*
     * Current checkout HTML memakai ID ini.
     */

    setValue(
      "customerName",
      customer?.full_name ||
      user.user_metadata?.full_name ||
      ""
    );


    setValue(
      "customerWhatsapp",
      customer?.whatsapp ||
      user.user_metadata?.whatsapp ||
      ""
    );


    setValue(
      "customerEmail",
      customer?.email ||
      user.email ||
      ""
    );

  }


  /* ========================================================
     SELECTED ADDRESS
     ======================================================== */

  function getSelectedAddress() {

    try {

      const raw =
        localStorage.getItem(
          "memora_checkout_address"
        );


      if (!raw) {
        return null;
      }


      return JSON.parse(raw);

    }
    catch (error) {

      console.error(
        "Read checkout address:",
        error
      );


      return null;

    }

  }


  function buildFullAddress(
    address
  ) {

    if (!address) {
      return "";
    }


    const area =
      [
        address.village,
        address.district,
        address.city,
        address.province
      ]
        .filter(Boolean)
        .join(", ");


    const parts =
      [
        address.address_line,
        area
      ]
        .filter(Boolean);


    if (address.landmark) {

      parts.push(
        `Patokan: ${address.landmark}`
      );

    }


    return parts.join(", ");

  }


  function syncSelectedAddress() {

    const address =
      getSelectedAddress();


    if (!address) {

      setValue(
        "customerCity",
        ""
      );


      setValue(
        "customerPostalCode",
        ""
      );


      setValue(
        "customerAddress",
        ""
      );


      return;

    }


    setValue(
      "customerCity",
      address.city || ""
    );


    setValue(
      "customerPostalCode",
      address.postal_code || ""
    );


    setValue(
      "customerAddress",
      buildFullAddress(
        address
      )
    );

  }


  /* ========================================================
     WATCH ADDRESS SELECTION
     ======================================================== */

  function bindAddressSelection() {

    document.addEventListener(
      "change",
      function (event) {

        const target =
          event.target;


        if (
          !target ||
          target.name !==
          "checkout_address"
        ) {
          return;
        }


        /*
         * checkout-address.js menyimpan pilihan
         * ke localStorage pada event change.
         *
         * Jalankan setelah handler tersebut selesai.
         */

        setTimeout(
          syncSelectedAddress,
          0
        );

      }
    );

  }


  /* ========================================================
     SAFETY BEFORE SUBMIT
     ======================================================== */

  function bindCheckoutSubmit() {

    const forms =
      Array.from(
        document.querySelectorAll(
          "form"
        )
      );


    forms.forEach(
      function (form) {

        form.addEventListener(
          "submit",
          function () {

            /*
             * Pastikan alamat paling baru
             * sudah masuk ke compatibility fields.
             */

            syncSelectedAddress();

          },
          true
        );

      }
    );

  }


  /* ========================================================
     INIT
     ======================================================== */

  async function init() {

    hideLegacyCustomerSection();

    await loadCustomerProfile();


    /*
     * checkout-address.js mungkin masih sedang
     * mengambil alamat dari Supabase.
     */

    syncSelectedAddress();


    setTimeout(
      syncSelectedAddress,
      500
    );


    setTimeout(
      syncSelectedAddress,
      1200
    );


    bindAddressSelection();

    bindCheckoutSubmit();

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  }
  else {

    init();

  }


})();
