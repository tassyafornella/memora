(function () {

  "use strict";


  const supabase =
    window.memoraSupabase;


  const list =
    document.getElementById(
      "checkoutAddressList"
    );


  const empty =
    document.getElementById(
      "checkoutAddressEmpty"
    );


  const loading =
    document.getElementById(
      "checkoutAddressLoading"
    );


  const selectedInput =
    document.getElementById(
      "selectedAddressId"
    );


  let customerId =
    null;


  let addresses =
    [];


  function escapeHtml(value) {

    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function saveSelectedAddress(address) {

    if (!address) {
      return;
    }


    if (selectedInput) {

      selectedInput.value =
        address.id;

    }


    localStorage.setItem(
      "memora_checkout_address",
      JSON.stringify(address)
    );

  }


  function getStoredAddressId() {

    try {

      const raw =
        localStorage.getItem(
          "memora_checkout_address"
        );


      if (!raw) {
        return "";
      }


      const parsed =
        JSON.parse(raw);


      return parsed?.id || "";

    }
    catch (error) {

      return "";

    }

  }


  async function loadCustomer() {

    if (!supabase) {
      return false;
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
      return false;
    }


    const {
      data: customer,
      error
    } =
      await supabase
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

      console.error(
        "Checkout customer:",
        error
      );

      return false;

    }


    customerId =
      customer.id;


    return true;

  }


  async function loadAddresses() {

    if (!customerId) {
      return;
    }


    const {
      data,
      error
    } =
      await supabase
        .from("addresses")
        .select("*")
        .eq(
          "customer_id",
          customerId
        )
        .order(
          "is_primary",
          {
            ascending: false
          }
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    if (loading) {
      loading.hidden = true;
    }


    if (error) {

      console.error(
        "Checkout addresses:",
        error
      );

      return;

    }


    addresses =
      data || [];


    renderAddresses();

  }


  function renderAddresses() {

    if (!list) {
      return;
    }


    if (
      addresses.length ===
      0
    ) {

      list.innerHTML =
        "";


      if (empty) {
        empty.hidden = false;
      }


      if (selectedInput) {
        selectedInput.value = "";
      }


      localStorage.removeItem(
        "memora_checkout_address"
      );


      return;

    }


    if (empty) {
      empty.hidden = true;
    }


    const storedId =
      getStoredAddressId();


    let selected =
      addresses.find(
        function (item) {
          return item.id === storedId;
        }
      );


    if (!selected) {

      selected =
        addresses.find(
          function (item) {
            return item.is_primary;
          }
        ) ||
        addresses[0];

    }


    saveSelectedAddress(
      selected
    );


    list.innerHTML =
      addresses
        .map(
          function (address) {

            const region =
              [
                address.village,
                address.district,
                address.city,
                address.province,
                address.postal_code
              ]
                .filter(Boolean)
                .join(", ");


            const isSelected =
              address.id === selected.id;


            return `
              <label
                class="checkout-address-card ${isSelected ? "selected" : ""}"
              >

                <input
                  type="radio"
                  name="checkout_address"
                  value="${escapeHtml(address.id)}"
                  ${isSelected ? "checked" : ""}
                >

                <span class="checkout-address-radio"></span>


                <span class="checkout-address-content">

                  <span class="checkout-address-top">

                    <strong>
                      ${escapeHtml(address.label)}
                    </strong>

                    ${
                      address.is_primary
                        ? `
                          <span class="checkout-address-badge">
                            Utama
                          </span>
                        `
                        : ""
                    }

                  </span>


                  <span class="checkout-address-name">
                    ${escapeHtml(address.recipient_name)}
                  </span>


                  <span class="checkout-address-phone">
                    ${escapeHtml(address.phone)}
                  </span>


                  <span class="checkout-address-detail">
                    ${escapeHtml(address.address_line)}
                    ${
                      region
                        ? `<br>${escapeHtml(region)}`
                        : ""
                    }
                  </span>


                  ${
                    address.landmark
                      ? `
                        <span class="checkout-address-landmark">
                          Patokan: ${escapeHtml(address.landmark)}
                        </span>
                      `
                      : ""
                  }

                </span>

              </label>
            `;

          }
        )
        .join("");


    document
      .querySelectorAll(
        'input[name="checkout_address"]'
      )
      .forEach(
        function (radio) {

          radio.addEventListener(
            "change",
            function () {

              const address =
                addresses.find(
                  function (item) {

                    return (
                      item.id ===
                      radio.value
                    );

                  }
                );


              if (!address) {
                return;
              }


              saveSelectedAddress(
                address
              );


              document
                .querySelectorAll(
                  ".checkout-address-card"
                )
                .forEach(
                  function (card) {

                    card.classList.remove(
                      "selected"
                    );

                  }
                );


              radio
                .closest(
                  ".checkout-address-card"
                )
                ?.classList
                .add(
                  "selected"
                );

            }
          );

        }
      );

  }


  async function init() {

    const ready =
      await loadCustomer();


    if (!ready) {

      if (loading) {
        loading.hidden = true;
      }

      return;

    }


    await loadAddresses();

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
