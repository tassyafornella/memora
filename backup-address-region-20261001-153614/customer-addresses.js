(function () {

  "use strict";


  const supabase =
    window.memoraSupabase;


  const MAX_ADDRESSES =
    5;


  let customerId =
    null;


  let addresses =
    [];


  const list =
    document.getElementById(
      "addressList"
    );


  const empty =
    document.getElementById(
      "addressEmpty"
    );


  const count =
    document.getElementById(
      "addressCount"
    );


  const addButton =
    document.getElementById(
      "addAddressButton"
    );


  const modal =
    document.getElementById(
      "addressModal"
    );


  const form =
    document.getElementById(
      "addressForm"
    );


  const formMessage =
    document.getElementById(
      "addressFormMessage"
    );


  const pageMessage =
    document.getElementById(
      "pageAddressMessage"
    );


  const saveButton =
    document.getElementById(
      "saveAddressButton"
    );


  /* ========================================================
     HELPERS
     ======================================================== */

  function escapeHtml(value) {

    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function normalizePhone(value) {

    return String(value || "")
      .replace(/[^\d+]/g, "")
      .trim();

  }


  function showMessage(
    element,
    text,
    type
  ) {

    if (!element) {
      return;
    }


    element.textContent =
      text;


    element.className =
      `address-message show ${type}`;

  }


  function clearMessage(
    element
  ) {

    if (!element) {
      return;
    }


    element.textContent =
      "";


    element.className =
      "address-message";

  }


  /* ========================================================
     MODAL
     ======================================================== */

  function openModal() {

    if (!modal) {
      return;
    }


    modal.hidden =
      false;


    document.body.classList.add(
      "address-modal-open"
    );

  }


  function closeModal() {

    if (!modal) {
      return;
    }


    modal.hidden =
      true;


    document.body.classList.remove(
      "address-modal-open"
    );


    resetForm();

  }


  function resetForm() {

    if (!form) {
      return;
    }


    form.reset();


    document
      .getElementById(
        "addressId"
      )
      .value =
      "";


    document
      .getElementById(
        "addressModalTitle"
      )
      .textContent =
      "Tambah Alamat";


    if (saveButton) {

      saveButton.textContent =
        "Simpan Alamat";

    }


    clearMessage(
      formMessage
    );

  }


  /* ========================================================
     CUSTOMER
     ======================================================== */

  async function loadCustomer() {

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
        .select(
          "id, full_name, whatsapp"
        )
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
        "Load customer:",
        error
      );


      showMessage(
        pageMessage,
        "Profil customer belum terhubung.",
        "error"
      );


      return false;

    }


    customerId =
      customer.id;


    /*
     * Untuk tambah alamat baru,
     * otomatis isi nama + nomor customer.
     */

    addButton
      ?.addEventListener(
        "click",
        function () {

          if (
            addresses.length >=
            MAX_ADDRESSES
          ) {

            showMessage(
              pageMessage,
              "Maksimal 5 alamat dapat disimpan.",
              "error"
            );

            return;

          }


          resetForm();


          document
            .getElementById(
              "addressRecipient"
            )
            .value =
            customer.full_name || "";


          document
            .getElementById(
              "addressPhone"
            )
            .value =
            customer.whatsapp || "";


          openModal();

        }
      );


    return true;

  }


  /* ========================================================
     LOAD ADDRESSES
     ======================================================== */

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


    if (error) {

      console.error(
        "Load addresses:",
        error
      );


      showMessage(
        pageMessage,
        "Alamat belum dapat dimuat.",
        "error"
      );


      return;

    }


    addresses =
      data || [];


    renderAddresses();

  }


  /* ========================================================
     RENDER
     ======================================================== */

  function renderAddresses() {

    clearMessage(
      pageMessage
    );


    if (count) {

      count.textContent =
        `${addresses.length} dari ${MAX_ADDRESSES} alamat`;

    }


    if (addButton) {

      addButton.disabled =
        addresses.length >=
        MAX_ADDRESSES;

    }


    if (
      addresses.length ===
      0
    ) {

      if (list) {
        list.innerHTML = "";
      }


      if (empty) {
        empty.hidden = false;
      }


      return;

    }


    if (empty) {
      empty.hidden = true;
    }


    if (!list) {
      return;
    }


    list.innerHTML =
      addresses
        .map(
          function (address) {

            const area =
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
              <article
                class="address-card ${address.is_primary ? "primary" : ""}"
              >

                <div class="address-card-top">

                  <div class="address-card-title">

                    <strong>
                      ${escapeHtml(address.label)}
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

                </div>


                <p class="address-card-name">
                  ${escapeHtml(address.recipient_name)}
                </p>


                <p class="address-card-phone">
                  ${escapeHtml(address.phone)}
                </p>


                <p class="address-card-detail">
                  ${escapeHtml(address.address_line)}
                  ${
                    area
                      ? `<br>${escapeHtml(area)}`
                      : ""
                  }
                </p>


                ${
                  address.landmark
                    ? `
                      <p class="address-card-landmark">
                        Patokan:
                        ${escapeHtml(address.landmark)}
                      </p>
                    `
                    : ""
                }


                <div class="address-actions">

                  ${
                    !address.is_primary
                      ? `
                        <button
                          type="button"
                          class="address-action-button primary-action"
                          data-primary-address="${address.id}"
                        >
                          Jadikan Utama
                        </button>
                      `
                      : ""
                  }


                  <button
                    type="button"
                    class="address-action-button"
                    data-edit-address="${address.id}"
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    class="address-action-button delete"
                    data-delete-address="${address.id}"
                  >
                    Hapus
                  </button>

                </div>

              </article>
            `;

          }
        )
        .join("");


    bindCardActions();

  }


  /* ========================================================
     EDIT
     ======================================================== */

  function editAddress(id) {

    const address =
      addresses.find(
        function (item) {

          return item.id === id;

        }
      );


    if (!address) {
      return;
    }


    document
      .getElementById(
        "addressModalTitle"
      )
      .textContent =
      "Edit Alamat";


    document
      .getElementById(
        "addressId"
      )
      .value =
      address.id;


    document
      .getElementById(
        "addressLabel"
      )
      .value =
      address.label || "Rumah";


    document
      .getElementById(
        "addressRecipient"
      )
      .value =
      address.recipient_name || "";


    document
      .getElementById(
        "addressPhone"
      )
      .value =
      address.phone || "";


    document
      .getElementById(
        "addressProvince"
      )
      .value =
      address.province || "";


    document
      .getElementById(
        "addressCity"
      )
      .value =
      address.city || "";


    document
      .getElementById(
        "addressDistrict"
      )
      .value =
      address.district || "";


    document
      .getElementById(
        "addressVillage"
      )
      .value =
      address.village || "";


    document
      .getElementById(
        "addressPostalCode"
      )
      .value =
      address.postal_code || "";


    document
      .getElementById(
        "addressLine"
      )
      .value =
      address.address_line || "";


    document
      .getElementById(
        "addressLandmark"
      )
      .value =
      address.landmark || "";


    document
      .getElementById(
        "addressPrimary"
      )
      .checked =
      Boolean(
        address.is_primary
      );


    if (saveButton) {

      saveButton.textContent =
        "Simpan Perubahan";

    }


    clearMessage(
      formMessage
    );


    openModal();

  }


  /* ========================================================
     SAVE
     ======================================================== */

  async function saveAddress(
    event
  ) {

    event.preventDefault();


    clearMessage(
      formMessage
    );


    if (!customerId) {
      return;
    }


    const id =
      document
        .getElementById(
          "addressId"
        )
        .value;


    if (
      !id &&
      addresses.length >=
      MAX_ADDRESSES
    ) {

      showMessage(
        formMessage,
        "Maksimal 5 alamat dapat disimpan.",
        "error"
      );

      return;

    }


    const payload = {

      customer_id:
        customerId,

      label:
        document
          .getElementById(
            "addressLabel"
          )
          .value,

      recipient_name:
        document
          .getElementById(
            "addressRecipient"
          )
          .value
          .trim(),

      phone:
        normalizePhone(
          document
            .getElementById(
              "addressPhone"
            )
            .value
        ),

      province:
        document
          .getElementById(
            "addressProvince"
          )
          .value
          .trim() || null,

      city:
        document
          .getElementById(
            "addressCity"
          )
          .value
          .trim(),

      district:
        document
          .getElementById(
            "addressDistrict"
          )
          .value
          .trim() || null,

      village:
        document
          .getElementById(
            "addressVillage"
          )
          .value
          .trim() || null,

      postal_code:
        document
          .getElementById(
            "addressPostalCode"
          )
          .value
          .trim() || null,

      address_line:
        document
          .getElementById(
            "addressLine"
          )
          .value
          .trim(),

      landmark:
        document
          .getElementById(
            "addressLandmark"
          )
          .value
          .trim() || null,

      is_primary:
        document
          .getElementById(
            "addressPrimary"
          )
          .checked

    };


    if (
      !payload.recipient_name ||
      !payload.phone ||
      !payload.city ||
      !payload.address_line
    ) {

      showMessage(
        formMessage,
        "Nama penerima, nomor telepon, kota, dan alamat lengkap wajib diisi.",
        "error"
      );

      return;

    }


    if (saveButton) {

      saveButton.disabled =
        true;

      saveButton.textContent =
        "Menyimpan...";

    }


    try {

      let result;


      if (id) {

        result =
          await supabase
            .from("addresses")
            .update(payload)
            .eq(
              "id",
              id
            )
            .eq(
              "customer_id",
              customerId
            );

      }
      else {

        result =
          await supabase
            .from("addresses")
            .insert(payload);

      }


      if (result.error) {
        throw result.error;
      }


      closeModal();


      await loadAddresses();


      showMessage(
        pageMessage,
        id
          ? "Alamat berhasil diperbarui."
          : "Alamat berhasil ditambahkan.",
        "success"
      );

    }
    catch (error) {

      console.error(
        "Save address:",
        error
      );


      const message =
        String(
          error?.message || ""
        );


      if (
        message.includes(
          "Maksimal 5 alamat"
        )
      ) {

        showMessage(
          formMessage,
          "Maksimal 5 alamat dapat disimpan.",
          "error"
        );

      }
      else {

        showMessage(
          formMessage,
          "Alamat belum berhasil disimpan.",
          "error"
        );

      }

    }
    finally {

      if (saveButton) {

        saveButton.disabled =
          false;


        saveButton.textContent =
          id
            ? "Simpan Perubahan"
            : "Simpan Alamat";

      }

    }

  }


  /* ========================================================
     PRIMARY
     ======================================================== */

  async function setPrimary(
    id
  ) {

    const {
      error
    } =
      await supabase
        .from("addresses")
        .update({
          is_primary: true
        })
        .eq(
          "id",
          id
        )
        .eq(
          "customer_id",
          customerId
        );


    if (error) {

      console.error(
        "Primary address:",
        error
      );


      showMessage(
        pageMessage,
        "Alamat utama belum berhasil diubah.",
        "error"
      );


      return;

    }


    await loadAddresses();


    showMessage(
      pageMessage,
      "Alamat utama berhasil diperbarui.",
      "success"
    );

  }


  /* ========================================================
     DELETE
     ======================================================== */

  async function deleteAddress(
    id
  ) {

    const address =
      addresses.find(
        function (item) {

          return item.id === id;

        }
      );


    if (!address) {
      return;
    }


    const confirmed =
      window.confirm(
        `Hapus alamat "${address.label}"?`
      );


    if (!confirmed) {
      return;
    }


    const {
      error
    } =
      await supabase
        .from("addresses")
        .delete()
        .eq(
          "id",
          id
        )
        .eq(
          "customer_id",
          customerId
        );


    if (error) {

      console.error(
        "Delete address:",
        error
      );


      showMessage(
        pageMessage,
        "Alamat belum berhasil dihapus.",
        "error"
      );


      return;

    }


    await loadAddresses();


    showMessage(
      pageMessage,
      "Alamat berhasil dihapus.",
      "success"
    );

  }


  /* ========================================================
     CARD ACTIONS
     ======================================================== */

  function bindCardActions() {

    document
      .querySelectorAll(
        "[data-edit-address]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              editAddress(
                button.getAttribute(
                  "data-edit-address"
                )
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-primary-address]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              setPrimary(
                button.getAttribute(
                  "data-primary-address"
                )
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-delete-address]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              deleteAddress(
                button.getAttribute(
                  "data-delete-address"
                )
              );

            }
          );

        }
      );

  }


  /* ========================================================
     CLOSE EVENTS
     ======================================================== */

  document
    .querySelectorAll(
      "[data-close-address-modal]"
    )
    .forEach(
      function (element) {

        element.addEventListener(
          "click",
          closeModal
        );

      }
    );


  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key ===
        "Escape"
      ) {

        closeModal();

      }

    }
  );


  if (form) {

    form.addEventListener(
      "submit",
      saveAddress
    );

  }


  /* ========================================================
     INIT
     ======================================================== */

  async function init() {

    if (!supabase) {

      showMessage(
        pageMessage,
        "Koneksi akun belum tersedia.",
        "error"
      );

      return;

    }


    const ready =
      await loadCustomer();


    if (!ready) {
      return;
    }


    await loadAddresses();

  }


  document.addEventListener(
    "DOMContentLoaded",
    init
  );


})();
