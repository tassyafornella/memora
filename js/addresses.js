(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  const MAX_ADDRESSES =
    5;


  let customer =
    null;


  let addresses =
    [];


  function el(id) {

    return document.getElementById(
      id
    );

  }


  function esc(value) {

    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }


  function normalizePhone(value) {

    return String(
      value || ""
    )
      .replace(
        /[^\d+]/g,
        ""
      )
      .trim();

  }


  function pageMessage(
    text,
    type = ""
  ) {

    const box =
      el(
        "pageAddressMessage"
      );


    box.textContent =
      text;


    box.className =
      `address-message ${type}`;

  }


  function formMessage(
    text,
    type = ""
  ) {

    const box =
      el(
        "addressFormMessage"
      );


    box.textContent =
      text;


    box.className =
      `address-form-message ${type}`;

  }


  /* ========================================================
     MODAL
  ======================================================== */

  function openModal() {

    el(
      "addressModal"
    ).hidden =
      false;

  }


  function closeModal() {

    el(
      "addressModal"
    ).hidden =
      true;


    resetForm();

  }


  function resetForm() {

    el(
      "addressForm"
    ).reset();


    el(
      "addressId"
    ).value =
      "";


    el(
      "addressModalTitle"
    ).textContent =
      "Tambah Alamat";


    el(
      "saveAddressButton"
    ).textContent =
      "Simpan Alamat";


    formMessage("");

  }


  /* ========================================================
     SESSION
  ======================================================== */

  async function loadCustomer() {

    if (!db) {

      throw new Error(
        "Koneksi Supabase belum tersedia."
      );

    }


    const {
      data: sessionData,
      error: sessionError
    } =
      await db.auth.getSession();


    if (sessionError) {
      throw sessionError;
    }


    const user =
      sessionData
        ?.session
        ?.user;


    if (!user) {

      el(
        "addressLoginRequired"
      ).hidden =
        false;


      return false;

    }


    const {
      data,
      error
    } =
      await db
        .from(
          "customers"
        )
        .select(
          "id, full_name, whatsapp"
        )
        .eq(
          "auth_user_id",
          user.id
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


    customer =
      data;


    el(
      "addressContent"
    ).hidden =
      false;


    return true;

  }


  /* ========================================================
     LOAD
  ======================================================== */

  async function loadAddresses() {

    const {
      data,
      error
    } =
      await db
        .from(
          "addresses"
        )
        .select("*")
        .eq(
          "customer_id",
          customer.id
        )
        .order(
          "is_primary",
          {
            ascending:
              false
          }
        )
        .order(
          "created_at",
          {
            ascending:
              true
          }
        );


    if (error) {
      throw error;
    }


    addresses =
      data || [];


    render();

  }


  /* ========================================================
     RENDER
  ======================================================== */

  function render() {

    el(
      "addressCount"
    ).textContent =
      `${addresses.length} dari ${MAX_ADDRESSES} alamat`;


    el(
      "addAddressButton"
    ).disabled =
      addresses.length >=
      MAX_ADDRESSES;


    if (
      addresses.length ===
      0
    ) {

      el(
        "addressList"
      ).innerHTML =
        "";


      el(
        "addressEmpty"
      ).hidden =
        false;


      return;

    }


    el(
      "addressEmpty"
    ).hidden =
      true;


    el(
      "addressList"
    ).innerHTML =
      addresses
        .map(
          address => {

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


            return `
              <article class="address-card ${address.is_primary ? "primary" : ""}">

                <div class="address-card-header">

                  <strong>
                    ${esc(address.label || "Alamat")}
                  </strong>

                  ${
                    address.is_primary
                      ? `
                        <span class="address-badge">
                          Utama
                        </span>
                      `
                      : ""
                  }

                </div>

                <p class="address-card-name">
                  ${esc(address.recipient_name)}
                </p>

                <p class="address-card-phone">
                  ${esc(address.phone)}
                </p>

                <p class="address-card-detail">
                  ${esc(address.address_line)}
                  <br>
                  ${esc(region)}
                </p>

                ${
                  address.landmark
                    ? `
                      <p class="address-card-landmark">
                        Patokan:
                        ${esc(address.landmark)}
                      </p>
                    `
                    : ""
                }

                <div class="address-card-actions">

                  ${
                    !address.is_primary
                      ? `
                        <button
                          type="button"
                          data-primary="${address.id}"
                        >
                          Jadikan Utama
                        </button>
                      `
                      : ""
                  }

                  <button
                    type="button"
                    data-edit="${address.id}"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="danger"
                    data-delete="${address.id}"
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


  /* ========================================================
     FORM DATA
  ======================================================== */

  function formPayload() {

    return {

      customer_id:
        customer.id,

      label:
        el(
          "addressLabel"
        ).value,

      recipient_name:
        el(
          "addressRecipient"
        ).value.trim(),

      phone:
        normalizePhone(
          el(
            "addressPhone"
          ).value
        ),

      province:
        el(
          "addressProvince"
        ).value.trim(),

      city:
        el(
          "addressCity"
        ).value.trim(),

      district:
        el(
          "addressDistrict"
        ).value.trim(),

      village:
        el(
          "addressVillage"
        ).value.trim(),

      postal_code:
        el(
          "addressPostalCode"
        ).value.trim() ||
        null,

      address_line:
        el(
          "addressLine"
        ).value.trim(),

      landmark:
        el(
          "addressLandmark"
        ).value.trim() ||
        null,

      is_primary:
        el(
          "addressPrimary"
        ).checked

    };

  }


  function validate(payload) {

    return Boolean(
      payload.recipient_name &&
      payload.phone &&
      payload.province &&
      payload.city &&
      payload.district &&
      payload.village &&
      payload.address_line
    );

  }


  /* ========================================================
     SAVE — TC-09
  ======================================================== */

  async function saveAddress(event) {

    event.preventDefault();


    const id =
      el(
        "addressId"
      ).value;


    if (
      !id &&
      addresses.length >=
      MAX_ADDRESSES
    ) {

      formMessage(
        "Maksimal 5 alamat dapat disimpan.",
        "error"
      );

      return;

    }


    const payload =
      formPayload();


    if (
      !validate(
        payload
      )
    ) {

      formMessage(
        "Lengkapi seluruh data alamat wajib.",
        "error"
      );

      return;

    }


    const button =
      el(
        "saveAddressButton"
      );


    button.disabled =
      true;


    button.textContent =
      "Menyimpan...";


    try {

      /*
       * Jika alamat baru ditandai utama,
       * lepaskan primary alamat lain.
       */

      if (
        payload.is_primary
      ) {

        const {
          error: primaryError
        } =
          await db
            .from(
              "addresses"
            )
            .update({
              is_primary:
                false
            })
            .eq(
              "customer_id",
              customer.id
            );


        if (primaryError) {
          throw primaryError;
        }

      }


      let result;


      if (id) {

        result =
          await db
            .from(
              "addresses"
            )
            .update(
              payload
            )
            .eq(
              "id",
              id
            )
            .eq(
              "customer_id",
              customer.id
            );

      }
      else {

        /*
         * Alamat pertama otomatis utama.
         */

        if (
          addresses.length ===
          0
        ) {

          payload.is_primary =
            true;

        }


        result =
          await db
            .from(
              "addresses"
            )
            .insert(
              payload
            );

      }


      if (
        result.error
      ) {

        throw result.error;

      }


      closeModal();


      await loadAddresses();


      pageMessage(
        id
          ? "Alamat berhasil diperbarui."
          : "Alamat pengiriman berhasil disimpan.",
        "success"
      );

    }
    catch (error) {

      console.error(
        "Save address:",
        error
      );


      formMessage(
        error?.message ||
        "Alamat belum berhasil disimpan.",
        "error"
      );

    }
    finally {

      button.disabled =
        false;


      button.textContent =
        id
          ? "Simpan Perubahan"
          : "Simpan Alamat";

    }

  }


  /* ========================================================
     EDIT
  ======================================================== */

  function editAddress(id) {

    const address =
      addresses.find(
        item =>
          item.id === id
      );


    if (!address) {
      return;
    }


    el(
      "addressId"
    ).value =
      address.id;


    el(
      "addressModalTitle"
    ).textContent =
      "Edit Alamat";


    el(
      "saveAddressButton"
    ).textContent =
      "Simpan Perubahan";


    el(
      "addressLabel"
    ).value =
      address.label ||
      "Rumah";


    el(
      "addressRecipient"
    ).value =
      address.recipient_name ||
      "";


    el(
      "addressPhone"
    ).value =
      address.phone ||
      "";


    el(
      "addressProvince"
    ).value =
      address.province ||
      "";


    el(
      "addressCity"
    ).value =
      address.city ||
      "";


    el(
      "addressDistrict"
    ).value =
      address.district ||
      "";


    el(
      "addressVillage"
    ).value =
      address.village ||
      "";


    el(
      "addressPostalCode"
    ).value =
      address.postal_code ||
      "";


    el(
      "addressLine"
    ).value =
      address.address_line ||
      "";


    el(
      "addressLandmark"
    ).value =
      address.landmark ||
      "";


    el(
      "addressPrimary"
    ).checked =
      Boolean(
        address.is_primary
      );


    openModal();

  }


  /* ========================================================
     PRIMARY
  ======================================================== */

  async function setPrimary(id) {

    try {

      const {
        error: resetError
      } =
        await db
          .from(
            "addresses"
          )
          .update({
            is_primary:
              false
          })
          .eq(
            "customer_id",
            customer.id
          );


      if (resetError) {
        throw resetError;
      }


      const {
        error
      } =
        await db
          .from(
            "addresses"
          )
          .update({
            is_primary:
              true
          })
          .eq(
            "id",
            id
          )
          .eq(
            "customer_id",
            customer.id
          );


      if (error) {
        throw error;
      }


      await loadAddresses();


      pageMessage(
        "Alamat utama berhasil diperbarui.",
        "success"
      );

    }
    catch (error) {

      pageMessage(
        error?.message ||
        "Alamat utama belum berhasil diperbarui.",
        "error"
      );

    }

  }


  /* ========================================================
     DELETE
  ======================================================== */

  async function deleteAddress(id) {

    const address =
      addresses.find(
        item =>
          item.id === id
      );


    if (!address) {
      return;
    }


    const confirmed =
      window.confirm(
        `Hapus alamat "${address.label || "Alamat"}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      const {
        error
      } =
        await db
          .from(
            "addresses"
          )
          .delete()
          .eq(
            "id",
            id
          )
          .eq(
            "customer_id",
            customer.id
          );


      if (error) {
        throw error;
      }


      await loadAddresses();


      pageMessage(
        "Alamat berhasil dihapus.",
        "success"
      );

    }
    catch (error) {

      pageMessage(
        error?.message ||
        "Alamat belum berhasil dihapus.",
        "error"
      );

    }

  }


  /* ========================================================
     EVENTS
  ======================================================== */

  function bindEvents() {

    el(
      "addAddressButton"
    )
      ?.addEventListener(
        "click",
        () => {

          if (
            addresses.length >=
            MAX_ADDRESSES
          ) {

            pageMessage(
              "Maksimal 5 alamat dapat disimpan.",
              "error"
            );

            return;

          }


          resetForm();


          el(
            "addressRecipient"
          ).value =
            customer?.full_name ||
            "";


          el(
            "addressPhone"
          ).value =
            customer?.whatsapp ||
            "";


          openModal();

        }
      );


    el(
      "addressForm"
    )
      ?.addEventListener(
        "submit",
        saveAddress
      );


    document.addEventListener(
      "click",
      event => {

        if (
          event.target.closest(
            "[data-close-address]"
          )
        ) {

          closeModal();

          return;

        }


        const edit =
          event.target.closest(
            "[data-edit]"
          );


        if (edit) {

          editAddress(
            edit.dataset.edit
          );

          return;

        }


        const primary =
          event.target.closest(
            "[data-primary]"
          );


        if (primary) {

          setPrimary(
            primary.dataset.primary
          );

          return;

        }


        const remove =
          event.target.closest(
            "[data-delete]"
          );


        if (remove) {

          deleteAddress(
            remove.dataset.delete
          );

        }

      }
    );

  }


  /* ========================================================
     INIT
  ======================================================== */

  async function init() {

    try {

      const loggedIn =
        await loadCustomer();


      if (!loggedIn) {
        return;
      }


      bindEvents();


      await loadAddresses();

    }
    catch (error) {

      console.error(
        "Address init:",
        error
      );


      pageMessage(
        error?.message ||
        "Alamat belum dapat dimuat.",
        "error"
      );

    }

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