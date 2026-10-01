(function () {

  "use strict";


  const supabase =
    window.memoraSupabase;


  const MAX_ADDRESSES =
    5;


  const REGION_API =
    "https://www.emsifa.com/api-wilayah-indonesia/v2";


  let customerId =
    null;


  let customerData =
    null;


  let addresses =
    [];


  let provinceCache =
    [];


  let cityCache =
    [];


  let districtCache =
    [];


  let villageCache =
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


  const provinceSelect =
    document.getElementById(
      "addressProvince"
    );


  const citySelect =
    document.getElementById(
      "addressCity"
    );


  const districtSelect =
    document.getElementById(
      "addressDistrict"
    );


  const villageSelect =
    document.getElementById(
      "addressVillage"
    );


  const postalInput =
    document.getElementById(
      "addressPostalCode"
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


  function clearMessage(element) {

    if (!element) {
      return;
    }


    element.textContent =
      "";


    element.className =
      "address-message";

  }


  function selectedName(select) {

    if (
      !select ||
      !select.value
    ) {
      return "";
    }


    return (
      select
        .options[
          select.selectedIndex
        ]
        ?.dataset
        ?.name || ""
    );

  }


  function setLoadingOption(
    select,
    text
  ) {

    select.innerHTML =
      `<option value="">${text}</option>`;

    select.disabled =
      true;

  }


  function populateSelect(
    select,
    items,
    placeholder
  ) {

    select.innerHTML =
      `
        <option value="">
          ${placeholder}
        </option>
      ` +
      items
        .map(
          function (item) {

            return `
              <option
                value="${escapeHtml(item.id)}"
                data-name="${escapeHtml(item.name)}"
              >
                ${escapeHtml(item.name)}
              </option>
            `;

          }
        )
        .join("");


    select.disabled =
      false;

  }


  async function fetchRegion(path) {

    const response =
      await fetch(
        `${REGION_API}${path}`
      );


    if (!response.ok) {

      throw new Error(
        `Wilayah API ${response.status}`
      );

    }


    const result =
      await response.json();


    return result?.data || [];

  }


  /* ========================================================
     REGION
     ======================================================== */

  async function loadProvinces() {

    try {

      setLoadingOption(
        provinceSelect,
        "Memuat provinsi..."
      );


      provinceCache =
        await fetchRegion(
          "/provinces.json"
        );


      provinceCache.sort(
        function (a, b) {

          return a.name
            .localeCompare(
              b.name,
              "id"
            );

        }
      );


      populateSelect(
        provinceSelect,
        provinceCache,
        "Pilih Provinsi"
      );

    }
    catch (error) {

      console.error(
        "Load provinces:",
        error
      );


      provinceSelect.innerHTML =
        `
          <option value="">
            Provinsi gagal dimuat
          </option>
        `;


      showMessage(
        formMessage,
        "Data wilayah belum dapat dimuat. Periksa koneksi internet lalu coba kembali.",
        "error"
      );

    }

  }


  async function loadCities(
    provinceId
  ) {

    cityCache =
      [];

    districtCache =
      [];

    villageCache =
      [];


    postalInput.value =
      "";


    setLoadingOption(
      districtSelect,
      "Pilih kota / kabupaten terlebih dahulu"
    );


    setLoadingOption(
      villageSelect,
      "Pilih kecamatan terlebih dahulu"
    );


    if (!provinceId) {

      setLoadingOption(
        citySelect,
        "Pilih provinsi terlebih dahulu"
      );

      return;

    }


    setLoadingOption(
      citySelect,
      "Memuat kota / kabupaten..."
    );


    cityCache =
      await fetchRegion(
        `/regencies/${provinceId}.json`
      );


    populateSelect(
      citySelect,
      cityCache,
      "Pilih Kota / Kabupaten"
    );

  }


  async function loadDistricts(
    cityId
  ) {

    districtCache =
      [];

    villageCache =
      [];


    postalInput.value =
      "";


    setLoadingOption(
      villageSelect,
      "Pilih kecamatan terlebih dahulu"
    );


    if (!cityId) {

      setLoadingOption(
        districtSelect,
        "Pilih kota / kabupaten terlebih dahulu"
      );

      return;

    }


    setLoadingOption(
      districtSelect,
      "Memuat kecamatan..."
    );


    districtCache =
      await fetchRegion(
        `/districts/${cityId}.json`
      );


    populateSelect(
      districtSelect,
      districtCache,
      "Pilih Kecamatan"
    );

  }


  async function loadVillages(
    districtId
  ) {

    villageCache =
      [];


    postalInput.value =
      "";


    if (!districtId) {

      setLoadingOption(
        villageSelect,
        "Pilih kecamatan terlebih dahulu"
      );

      return;

    }


    setLoadingOption(
      villageSelect,
      "Memuat kelurahan / desa..."
    );


    villageCache =
      await fetchRegion(
        `/villages/${districtId}.json`
      );


    villageSelect.innerHTML =
      `
        <option value="">
          Pilih Kelurahan / Desa
        </option>
      ` +
      villageCache
        .map(
          function (item) {

            return `
              <option
                value="${escapeHtml(item.id)}"
                data-name="${escapeHtml(item.name)}"
                data-postal="${escapeHtml(item.postal_code || "")}"
              >
                ${escapeHtml(item.name)}
              </option>
            `;

          }
        )
        .join("");


    villageSelect.disabled =
      false;

  }


  provinceSelect.addEventListener(
    "change",
    async function () {

      clearMessage(
        formMessage
      );


      try {

        await loadCities(
          provinceSelect.value
        );

      }
      catch (error) {

        console.error(error);


        showMessage(
          formMessage,
          "Kota / kabupaten belum dapat dimuat.",
          "error"
        );

      }

    }
  );


  citySelect.addEventListener(
    "change",
    async function () {

      clearMessage(
        formMessage
      );


      try {

        await loadDistricts(
          citySelect.value
        );

      }
      catch (error) {

        console.error(error);


        showMessage(
          formMessage,
          "Kecamatan belum dapat dimuat.",
          "error"
        );

      }

    }
  );


  districtSelect.addEventListener(
    "change",
    async function () {

      clearMessage(
        formMessage
      );


      try {

        await loadVillages(
          districtSelect.value
        );

      }
      catch (error) {

        console.error(error);


        showMessage(
          formMessage,
          "Kelurahan / desa belum dapat dimuat.",
          "error"
        );

      }

    }
  );


  villageSelect.addEventListener(
    "change",
    function () {

      const option =
        villageSelect.options[
          villageSelect.selectedIndex
        ];


      postalInput.value =
        option?.dataset?.postal || "";

    }
  );


  /* ========================================================
     MODAL
     ======================================================== */

  function openModal() {

    modal.hidden =
      false;


    document.body.classList.add(
      "address-modal-open"
    );

  }


  function closeModal() {

    modal.hidden =
      true;


    document.body.classList.remove(
      "address-modal-open"
    );


    resetForm();

  }


  async function resetForm() {

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


    saveButton.textContent =
      "Simpan Alamat";


    clearMessage(
      formMessage
    );


    await loadProvinces();


    setLoadingOption(
      citySelect,
      "Pilih provinsi terlebih dahulu"
    );


    setLoadingOption(
      districtSelect,
      "Pilih kota / kabupaten terlebih dahulu"
    );


    setLoadingOption(
      villageSelect,
      "Pilih kecamatan terlebih dahulu"
    );


    postalInput.value =
      "";

  }


  /* ========================================================
     CUSTOMER
     ======================================================== */

  async function loadCustomer() {

    const {
      data: sessionData,
      error: sessionError
    } =
      await supabase.auth.getSession();


    const user =
      sessionData?.session?.user;


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


    customerData =
      customer;


    return true;

  }


  /* ========================================================
     LOAD ADDRESSES
     ======================================================== */

  async function loadAddresses() {

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


    count.textContent =
      `${addresses.length} dari ${MAX_ADDRESSES} alamat`;


    addButton.disabled =
      addresses.length >=
      MAX_ADDRESSES;


    if (
      addresses.length ===
      0
    ) {

      list.innerHTML =
        "";


      empty.hidden =
        false;


      return;

    }


    empty.hidden =
      true;


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


            return `
              <article
                class="address-card ${address.is_primary ? "primary" : ""}"
              >

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


                <p class="address-card-name">
                  ${escapeHtml(address.recipient_name)}
                </p>


                <p class="address-card-phone">
                  ${escapeHtml(address.phone)}
                </p>


                <p class="address-card-detail">
                  ${escapeHtml(address.address_line)}
                  ${
                    region
                      ? `<br>${escapeHtml(region)}`
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
                          class="address-action-button"
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
     ADD
     ======================================================== */

  addButton.addEventListener(
    "click",
    async function () {

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


      await resetForm();


      document
        .getElementById(
          "addressRecipient"
        )
        .value =
        customerData?.full_name || "";


      document
        .getElementById(
          "addressPhone"
        )
        .value =
        customerData?.whatsapp || "";


      openModal();

    }
  );


  /* ========================================================
     EDIT REGION
     ======================================================== */

  async function restoreRegionSelection(
    address
  ) {

    await loadProvinces();


    const province =
      provinceCache.find(
        function (item) {

          return (
            item.name
              .toLowerCase() ===
            String(
              address.province || ""
            ).toLowerCase()
          );

        }
      );


    if (!province) {
      return;
    }


    provinceSelect.value =
      province.id;


    await loadCities(
      province.id
    );


    const city =
      cityCache.find(
        function (item) {

          return (
            item.name
              .toLowerCase() ===
            String(
              address.city || ""
            ).toLowerCase()
          );

        }
      );


    if (!city) {
      return;
    }


    citySelect.value =
      city.id;


    await loadDistricts(
      city.id
    );


    const district =
      districtCache.find(
        function (item) {

          return (
            item.name
              .toLowerCase() ===
            String(
              address.district || ""
            ).toLowerCase()
          );

        }
      );


    if (!district) {
      return;
    }


    districtSelect.value =
      district.id;


    await loadVillages(
      district.id
    );


    const village =
      villageCache.find(
        function (item) {

          return (
            item.name
              .toLowerCase() ===
            String(
              address.village || ""
            ).toLowerCase()
          );

        }
      );


    if (village) {

      villageSelect.value =
        village.id;


      postalInput.value =
        village.postal_code ||
        address.postal_code ||
        "";

    }

  }


  /* ========================================================
     EDIT
     ======================================================== */

  async function editAddress(id) {

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


    saveButton.textContent =
      "Simpan Perubahan";


    clearMessage(
      formMessage
    );


    openModal();


    try {

      await restoreRegionSelection(
        address
      );

    }
    catch (error) {

      console.error(
        "Restore region:",
        error
      );


      showMessage(
        formMessage,
        "Wilayah alamat lama belum dapat dimuat.",
        "error"
      );

    }

  }


  /* ========================================================
     SAVE
     ======================================================== */

  async function saveAddress(event) {

    event.preventDefault();


    clearMessage(
      formMessage
    );


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


    const provinceName =
      selectedName(
        provinceSelect
      );


    const cityName =
      selectedName(
        citySelect
      );


    const districtName =
      selectedName(
        districtSelect
      );


    const villageName =
      selectedName(
        villageSelect
      );


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
        provinceName,

      city:
        cityName,

      district:
        districtName,

      village:
        villageName,

      postal_code:
        postalInput
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
      !payload.province ||
      !payload.city ||
      !payload.district ||
      !payload.village ||
      !payload.address_line
    ) {

      showMessage(
        formMessage,
        "Lengkapi nama penerima, nomor telepon, wilayah, dan alamat lengkap.",
        "error"
      );

      return;

    }


    saveButton.disabled =
      true;


    saveButton.textContent =
      "Menyimpan...";


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


      const errorMessage =
        error?.message ||
        "Unknown error";

      const errorCode =
        error?.code ||
        "-";

      const errorDetails =
        error?.details ||
        "-";

      const errorHint =
        error?.hint ||
        "-";


      console.error(
        "MEMORA ADDRESS SAVE ERROR",
        {
          message: errorMessage,
          code: errorCode,
          details: errorDetails,
          hint: errorHint,
          fullError: error
        }
      );


      if (
        String(errorMessage).includes(
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
          `Gagal menyimpan alamat. ${errorMessage} [${errorCode}]`,
          "error"
        );

      }

    }
    finally {

      saveButton.disabled =
        false;


      saveButton.textContent =
        id
          ? "Simpan Perubahan"
          : "Simpan Alamat";

    }

  }


  /* ========================================================
     PRIMARY
     ======================================================== */

  async function setPrimary(id) {

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

      console.error(error);


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

  async function deleteAddress(id) {

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

      console.error(error);


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
     ACTIONS
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
     CLOSE
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


  form.addEventListener(
    "submit",
    saveAddress
  );


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

