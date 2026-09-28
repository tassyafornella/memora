document.addEventListener("DOMContentLoaded", async () => {

  const supabase =
    window.memoraSupabase;


  /* =====================================================
     ELEMENTS
     ===================================================== */

  const galleryLoading =
    document.getElementById("galleryLoading");

  const galleryEmpty =
    document.getElementById("galleryEmpty");

  const galleryGroups =
    document.getElementById("galleryGroups");


  const statTotalPhotos =
    document.getElementById("statTotalPhotos");

  const statProducts =
    document.getElementById("statProducts");

  const statCovers =
    document.getElementById("statCovers");


  const filterProduct =
    document.getElementById("filterProduct");

  const filterType =
    document.getElementById("filterType");

  const gallerySearch =
    document.getElementById("gallerySearch");


  const uploadModal =
    document.getElementById("uploadModal");

  const openUploadModal =
    document.getElementById("openUploadModal");

  const emptyUploadButton =
    document.getElementById("emptyUploadButton");

  const closeUploadModal =
    document.getElementById("closeUploadModal");

  const cancelUpload =
    document.getElementById("cancelUpload");


  const uploadForm =
    document.getElementById("uploadForm");

  const uploadProduct =
    document.getElementById("uploadProduct");

  const uploadVariant =
    document.getElementById("uploadVariant");

  const variantField =
    document.getElementById("variantField");

  const uploadTitle =
    document.getElementById("uploadTitle");

  const uploadImage =
    document.getElementById("uploadImage");

  const uploadAsCover =
    document.getElementById("uploadAsCover");

  const uploadSubmitButton =
    document.getElementById("uploadSubmitButton");

  const uploadSubmitText =
    document.getElementById("uploadSubmitText");

  const uploadError =
    document.getElementById("uploadError");


  const galleryDropZone =
    document.getElementById("galleryDropZone");

  const uploadPlaceholder =
    document.getElementById("uploadPlaceholder");

  const uploadPreview =
    document.getElementById("uploadPreview");

  const uploadPreviewImage =
    document.getElementById("uploadPreviewImage");

  const removePreviewImage =
    document.getElementById("removePreviewImage");


  const confirmModal =
    document.getElementById("confirmModal");

  const confirmTitle =
    document.getElementById("confirmTitle");

  const confirmMessage =
    document.getElementById("confirmMessage");

  const confirmCancel =
    document.getElementById("confirmCancel");

  const confirmAction =
    document.getElementById("confirmAction");


  const galleryToast =
    document.getElementById("galleryToast");

  const galleryToastTitle =
    document.getElementById("galleryToastTitle");

  const galleryToastMessage =
    document.getElementById("galleryToastMessage");


  const studioSidebar =
    document.getElementById("studioSidebar");

  const studioMenuButton =
    document.getElementById("studioMenuButton");


  /* =====================================================
     STATE
     ===================================================== */

  let products = [];
  let variants = [];
  let gallery = [];

  let selectedFile = null;

  let confirmCallback = null;


  /* =====================================================
     UTILITIES
     ===================================================== */

  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function safeFileName(name) {

    return String(name || "image")
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-")
      .replace(/-+/g, "-");

  }


  function showToast(
    title,
    message
  ) {

    galleryToastTitle.textContent =
      title;

    galleryToastMessage.textContent =
      message;

    galleryToast.classList.add(
      "show"
    );

    setTimeout(() => {

      galleryToast.classList.remove(
        "show"
      );

    }, 2500);

  }


  function showUploadError(message) {

    uploadError.textContent =
      message;

    uploadError.classList.remove(
      "hidden"
    );

  }


  function clearUploadError() {

    uploadError.textContent =
      "";

    uploadError.classList.add(
      "hidden"
    );

  }


  function setUploadLoading(value) {

    uploadSubmitButton.disabled =
      value;

    uploadSubmitButton.classList.toggle(
      "loading",
      value
    );

    uploadSubmitText.textContent =
      value
        ? "Uploading..."
        : "Upload Foto";

  }


  function getProduct(productId) {

    return products.find(
      item =>
        item.id === productId
    );

  }


  function getVariant(variantId) {

    return variants.find(
      item =>
        item.id === variantId
    );

  }


  function getImageTypeLabel(item) {

    if (item.is_cover) {
      return "Cover Katalog";
    }

    if (item.variant_id) {

      const variant =
        getVariant(
          item.variant_id
        );

      return variant
        ? `Variant • ${variant.name}`
        : "Variant";

    }

    return "Gallery";
  }


  /* =====================================================
     MODAL
     ===================================================== */

  function openModal() {

    clearUploadError();

    uploadModal.classList.remove(
      "hidden"
    );

    document.body.style.overflow =
      "hidden";

  }


  function closeModal() {

    uploadModal.classList.add(
      "hidden"
    );

    document.body.style.overflow =
      "";

    uploadForm.reset();

    variantField.classList.add(
      "hidden"
    );

    uploadVariant.innerHTML = `
      <option value="">
        Pilih variant
      </option>
    `;

    selectedFile = null;

    uploadImage.value = "";

    uploadPreviewImage.removeAttribute(
      "src"
    );

    uploadPreview.classList.add(
      "hidden"
    );

    uploadPlaceholder.classList.remove(
      "hidden"
    );

    clearUploadError();

  }


  function openConfirm({
    title,
    message,
    buttonLabel = "Hapus",
    callback
  }) {

    confirmTitle.textContent =
      title;

    confirmMessage.textContent =
      message;

    confirmAction.textContent =
      buttonLabel;

    confirmCallback =
      callback;

    confirmModal.classList.remove(
      "hidden"
    );

  }


  function closeConfirm() {

    confirmModal.classList.add(
      "hidden"
    );

    confirmCallback =
      null;

  }


  /* =====================================================
     PRODUCTS
     ===================================================== */

  async function loadProducts() {

    const response =
      await supabase
        .from("products")
        .select(
          "id, slug, name, category, is_active, sort_order"
        )
        .eq(
          "is_active",
          true
        )
        .order(
          "sort_order",
          {
            ascending: true
          }
        );


    if (response.error) {
      throw response.error;
    }


    products =
      response.data || [];


    filterProduct.innerHTML = `
      <option value="">
        Semua Produk
      </option>
    `;


    uploadProduct.innerHTML = `
      <option value="">
        Pilih produk
      </option>
    `;


    products.forEach(product => {

      const filterOption =
        document.createElement(
          "option"
        );

      filterOption.value =
        product.id;

      filterOption.textContent =
        product.name;

      filterProduct.appendChild(
        filterOption
      );


      const uploadOption =
        filterOption.cloneNode(true);

      uploadProduct.appendChild(
        uploadOption
      );

    });

  }


  async function loadVariants() {

    const response =
      await supabase
        .from("product_variants")
        .select(
          "id, product_id, code, name, sort_order, is_active"
        )
        .eq(
          "is_active",
          true
        )
        .order(
          "sort_order",
          {
            ascending: true
          }
        );


    if (response.error) {
      throw response.error;
    }


    variants =
      response.data || [];

  }


  function populateVariants(
    productId
  ) {

    uploadVariant.innerHTML = `
      <option value="">
        Pilih variant
      </option>
    `;


    const productVariants =
      variants.filter(
        item =>
          item.product_id ===
          productId
      );


    productVariants.forEach(
      variant => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          variant.id;

        option.textContent =
          variant.name;

        uploadVariant.appendChild(
          option
        );

      }
    );

  }


  /* =====================================================
     LOAD GALLERY
     ===================================================== */

  async function loadGallery() {

    galleryLoading.classList.remove(
      "hidden"
    );

    galleryEmpty.classList.add(
      "hidden"
    );

    galleryGroups.classList.add(
      "hidden"
    );


    const response =
      await supabase
        .from("product_gallery")
        .select(
          "id, product_id, variant_id, title, image_url, storage_path, image_type, is_cover, is_active, sort_order, created_at"
        )
        .order(
          "sort_order",
          {
            ascending: true
          }
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    galleryLoading.classList.add(
      "hidden"
    );


    if (response.error) {

      console.error(
        response.error
      );

      galleryEmpty.classList.remove(
        "hidden"
      );

      galleryEmpty.querySelector(
        "h2"
      ).textContent =
        "Gallery belum dapat dimuat";

      galleryEmpty.querySelector(
        "p"
      ).textContent =
        response.error.message;

      return;

    }


    gallery =
      response.data || [];


    renderGallery();

  }


  /* =====================================================
     FILTER
     ===================================================== */

  function getFilteredGallery() {

    const productFilter =
      filterProduct.value;

    const typeFilter =
      filterType.value;

    const search =
      gallerySearch.value
        .trim()
        .toLowerCase();


    return gallery.filter(item => {

      if (
        productFilter &&
        item.product_id !==
        productFilter
      ) {
        return false;
      }


      if (typeFilter) {

        if (
          typeFilter === "cover" &&
          !item.is_cover
        ) {
          return false;
        }


        if (
          typeFilter === "gallery" &&
          (
            item.is_cover ||
            item.variant_id
          )
        ) {
          return false;
        }


        if (
          typeFilter === "variant" &&
          !item.variant_id
        ) {
          return false;
        }

      }


      if (search) {

        const product =
          getProduct(
            item.product_id
          );

        const variant =
          getVariant(
            item.variant_id
          );


        const haystack = [
          item.title,
          product?.name,
          variant?.name
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


        if (
          !haystack.includes(search)
        ) {
          return false;
        }

      }


      return true;

    });

  }


  /* =====================================================
     RENDER
     ===================================================== */

  function renderStats() {

    const activeGallery =
      gallery.filter(
        item =>
          item.is_active
      );


    statTotalPhotos.textContent =
      activeGallery.length;


    statProducts.textContent =
      new Set(
        activeGallery.map(
          item =>
            item.product_id
        )
      ).size;


    statCovers.textContent =
      activeGallery.filter(
        item =>
          item.is_cover
      ).length;

  }


  function renderGallery() {

    renderStats();


    const filtered =
      getFilteredGallery();


    if (
      filtered.length === 0
    ) {

      galleryGroups.classList.add(
        "hidden"
      );

      galleryEmpty.classList.remove(
        "hidden"
      );

      return;

    }


    galleryEmpty.classList.add(
      "hidden"
    );

    galleryGroups.classList.remove(
      "hidden"
    );


    const grouped = {};


    filtered.forEach(item => {

      if (
        !grouped[item.product_id]
      ) {

        grouped[item.product_id] =
          [];

      }

      grouped[item.product_id].push(
        item
      );

    });


    galleryGroups.innerHTML =
      products
        .filter(
          product =>
            grouped[product.id]
        )
        .map(product => {

          const photos =
            grouped[product.id];


          const cards =
            photos
              .map(item => {

                const title =
                  item.title ||
                  product.name;


                const typeLabel =
                  getImageTypeLabel(
                    item
                  );


                return `
                  <article
                    class="gallery-photo-card"
                    data-gallery-id="${item.id}"
                  >

                    <div class="gallery-photo-image">

                      <img
                        src="${escapeHtml(item.image_url)}"
                        alt="${escapeHtml(title)}"
                      >

                      ${
                        item.is_cover
                          ? `
                            <div class="gallery-cover-badge">
                              ★ COVER
                            </div>
                          `
                          : ""
                      }

                      ${
                        !item.is_active
                          ? `
                            <div class="gallery-inactive-badge">
                              NONAKTIF
                            </div>
                          `
                          : ""
                      }

                    </div>


                    <div class="gallery-photo-info">

                      <h3>
                        ${escapeHtml(title)}
                      </h3>

                      <div class="gallery-photo-meta">
                        ${escapeHtml(typeLabel)}
                      </div>


                      <div class="gallery-photo-actions">

                        ${
                          !item.is_cover
                          ? `
                            <button
                              type="button"
                              data-action="cover"
                              data-id="${item.id}"
                            >
                              Set Cover
                            </button>
                          `
                          : ""
                        }


                        <button
                          type="button"
                          data-action="toggle"
                          data-id="${item.id}"
                        >
                          ${
                            item.is_active
                              ? "Nonaktifkan"
                              : "Aktifkan"
                          }
                        </button>


                        <button
                          type="button"
                          class="danger"
                          data-action="delete"
                          data-id="${item.id}"
                        >
                          Hapus
                        </button>

                      </div>

                    </div>

                  </article>
                `;

              })
              .join("");


          return `
            <section class="gallery-product-group">

              <div class="gallery-group-heading">

                <div>

                  <h2>
                    ${escapeHtml(product.name)}
                  </h2>

                  <span>
                    ${photos.length} foto
                  </span>

                </div>

              </div>


              <div class="gallery-card-grid">
                ${cards}
              </div>

            </section>
          `;

        })
        .join("");

  }


  /* =====================================================
     FILE PREVIEW
     ===================================================== */

  function setSelectedFile(file) {

    if (!file) {
      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      showUploadError(
        "Format foto harus JPG, PNG, atau WEBP."
      );

      return;

    }


    const maxSize =
      10 * 1024 * 1024;


    if (
      file.size > maxSize
    ) {

      showUploadError(
        "Ukuran foto maksimal 10 MB."
      );

      return;

    }


    selectedFile =
      file;


    const reader =
      new FileReader();


    reader.onload =
      event => {

        uploadPreviewImage.src =
          event.target.result;

        uploadPlaceholder.classList.add(
          "hidden"
        );

        uploadPreview.classList.remove(
          "hidden"
        );

      };


    reader.readAsDataURL(
      file
    );


    clearUploadError();

  }


  /* =====================================================
     UPLOAD
     ===================================================== */

  async function uploadGalleryImage() {

    clearUploadError();


    const productId =
      uploadProduct.value;


    const target =
      document.querySelector(
        'input[name="imageTarget"]:checked'
      )?.value || "gallery";


    const variantId =
      target === "variant"
        ? uploadVariant.value
        : null;


    const title =
      uploadTitle.value.trim();


    if (!productId) {

      showUploadError(
        "Pilih produk terlebih dahulu."
      );

      return;

    }


    if (
      target === "variant" &&
      !variantId
    ) {

      showUploadError(
        "Pilih variant untuk foto ini."
      );

      return;

    }


    if (!selectedFile) {

      showUploadError(
        "Pilih foto produk yang akan diupload."
      );

      return;

    }


    const product =
      getProduct(
        productId
      );


    if (!product) {

      showUploadError(
        "Data produk tidak ditemukan."
      );

      return;

    }


    setUploadLoading(true);


    try {

      const timestamp =
        Date.now();


      const folder =
        variantId
          ? (
              getVariant(
                variantId
              )?.code ||
              "variant"
            )
          : "gallery";


      const fileName =
        `${timestamp}-${safeFileName(selectedFile.name)}`;


      const storagePath =
        `${product.slug}/${folder}/${fileName}`;


      const uploadResponse =
        await supabase.storage
          .from("product-gallery")
          .upload(
            storagePath,
            selectedFile,
            {
              cacheControl: "3600",
              upsert: false
            }
          );


      if (uploadResponse.error) {
        throw uploadResponse.error;
      }


      const publicUrlResult =
        supabase.storage
          .from("product-gallery")
          .getPublicUrl(
            storagePath
          );


      const imageUrl =
        publicUrlResult
          .data
          .publicUrl;


      const imageType =
        uploadAsCover.checked
          ? "cover"
          : (
              variantId
                ? "variant"
                : "gallery"
            );


      const insertResponse =
        await supabase
          .from("product_gallery")
          .insert({
            product_id:
              productId,

            variant_id:
              variantId || null,

            title:
              title || null,

            image_url:
              imageUrl,

            storage_path:
              storagePath,

            image_type:
              imageType,

            is_cover:
              false,

            is_active:
              true
          })
          .select(
            "id"
          )
          .single();


      if (insertResponse.error) {

        await supabase.storage
          .from("product-gallery")
          .remove([
            storagePath
          ]);

        throw insertResponse.error;
      }


      if (
        uploadAsCover.checked
      ) {

        const coverResponse =
          await supabase.rpc(
            "set_product_gallery_cover",
            {
              p_gallery_id:
                insertResponse.data.id
            }
          );


        if (coverResponse.error) {
          throw coverResponse.error;
        }

      }


      closeModal();


      showToast(
        "Foto berhasil diupload",
        uploadAsCover.checked
          ? "Foto sudah menjadi cover katalog."
          : "Foto sudah masuk ke Gallery."
      );


      await loadGallery();

    }
    catch (error) {

      console.error(
        "Upload gallery error:",
        error
      );


      const message =
        String(
          error?.message || ""
        );


      if (
        message
          .toLowerCase()
          .includes("row-level security")
      ) {

        showUploadError(
          "Upload ditolak Supabase. Pastikan akun admin sudah login dan memiliki akses owner."
        );

      }
      else {

        showUploadError(
          message ||
          "Foto belum berhasil diupload."
        );

      }

    }
    finally {

      setUploadLoading(false);

    }

  }


  /* =====================================================
     SET COVER
     ===================================================== */

  async function setCover(id) {

    const response =
      await supabase.rpc(
        "set_product_gallery_cover",
        {
          p_gallery_id:
            id
        }
      );


    if (response.error) {
      throw response.error;
    }


    showToast(
      "Cover diperbarui",
      "Foto ini sekarang menjadi cover katalog."
    );


    await loadGallery();

  }


  /* =====================================================
     TOGGLE ACTIVE
     ===================================================== */

  async function toggleActive(id) {

    const item =
      gallery.find(
        photo =>
          photo.id === id
      );


    if (!item) {
      return;
    }


    const response =
      await supabase
        .from("product_gallery")
        .update({
          is_active:
            !item.is_active
        })
        .eq(
          "id",
          id
        );


    if (response.error) {
      throw response.error;
    }


    showToast(
      "Gallery diperbarui",
      item.is_active
        ? "Foto dinonaktifkan."
        : "Foto diaktifkan kembali."
    );


    await loadGallery();

  }


  /* =====================================================
     DELETE
     ===================================================== */

  async function deleteImage(id) {

    const item =
      gallery.find(
        photo =>
          photo.id === id
      );


    if (!item) {
      return;
    }


    if (
      item.storage_path
    ) {

      const storageResponse =
        await supabase.storage
          .from("product-gallery")
          .remove([
            item.storage_path
          ]);


      if (
        storageResponse.error
      ) {

        console.warn(
          "Storage delete warning:",
          storageResponse.error
        );

      }

    }


    const response =
      await supabase
        .from("product_gallery")
        .delete()
        .eq(
          "id",
          id
        );


    if (response.error) {
      throw response.error;
    }


    showToast(
      "Foto dihapus",
      "Foto sudah dihapus dari Gallery."
    );


    await loadGallery();

  }


  /* =====================================================
     EVENTS
     ===================================================== */

  openUploadModal.addEventListener(
    "click",
    openModal
  );


  emptyUploadButton.addEventListener(
    "click",
    openModal
  );


  closeUploadModal.addEventListener(
    "click",
    closeModal
  );


  cancelUpload.addEventListener(
    "click",
    closeModal
  );


  uploadModal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        uploadModal
      ) {

        closeModal();

      }

    }
  );


  uploadProduct.addEventListener(
    "change",
    () => {

      populateVariants(
        uploadProduct.value
      );

      const product =
        getProduct(
          uploadProduct.value
        );


      /*
       * Sticker memakai custom calculator,
       * jadi variant tidak diperlukan.
       */

      if (
        product?.slug ===
        "sticker"
      ) {

        const galleryRadio =
          document.querySelector(
            'input[name="imageTarget"][value="gallery"]'
          );

        galleryRadio.checked =
          true;

        variantField.classList.add(
          "hidden"
        );

      }

    }
  );


  document
    .querySelectorAll(
      'input[name="imageTarget"]'
    )
    .forEach(radio => {

      radio.addEventListener(
        "change",
        () => {

          const product =
            getProduct(
              uploadProduct.value
            );


          if (
            radio.value ===
            "variant" &&
            radio.checked &&
            product?.slug !==
            "sticker"
          ) {

            variantField.classList.remove(
              "hidden"
            );

            populateVariants(
              uploadProduct.value
            );

          }
          else if (
            radio.checked
          ) {

            variantField.classList.add(
              "hidden"
            );

            uploadVariant.value =
              "";

          }

        }
      );

    });


  uploadImage.addEventListener(
    "change",
    () => {

      const file =
        uploadImage.files?.[0];

      if (file) {

        setSelectedFile(
          file
        );

      }

    }
  );


  galleryDropZone.addEventListener(
    "dragover",
    event => {

      event.preventDefault();

      galleryDropZone.classList.add(
        "dragging"
      );

    }
  );


  galleryDropZone.addEventListener(
    "dragleave",
    () => {

      galleryDropZone.classList.remove(
        "dragging"
      );

    }
  );


  galleryDropZone.addEventListener(
    "drop",
    event => {

      event.preventDefault();

      galleryDropZone.classList.remove(
        "dragging"
      );


      const file =
        event.dataTransfer
          ?.files?.[0];


      if (file) {

        setSelectedFile(
          file
        );

      }

    }
  );


  removePreviewImage.addEventListener(
    "click",
    event => {

      event.preventDefault();
      event.stopPropagation();

      selectedFile = null;

      uploadImage.value =
        "";

      uploadPreviewImage.removeAttribute(
        "src"
      );

      uploadPreview.classList.add(
        "hidden"
      );

      uploadPlaceholder.classList.remove(
        "hidden"
      );

    }
  );


  uploadForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      uploadGalleryImage();

    }
  );


  filterProduct.addEventListener(
    "change",
    renderGallery
  );


  filterType.addEventListener(
    "change",
    renderGallery
  );


  gallerySearch.addEventListener(
    "input",
    renderGallery
  );


  galleryGroups.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-action]"
        );


      if (!button) {
        return;
      }


      const action =
        button.dataset.action;


      const id =
        button.dataset.id;


      if (
        action === "cover"
      ) {

        openConfirm({
          title:
            "Jadikan Cover?",

          message:
            "Foto ini akan menjadi gambar utama produk pada katalog customer.",

          buttonLabel:
            "Set Cover",

          callback:
            async () => {

              await setCover(
                id
              );

            }
        });

      }


      if (
        action === "toggle"
      ) {

        const item =
          gallery.find(
            photo =>
              photo.id === id
          );


        openConfirm({
          title:
            item?.is_active
              ? "Nonaktifkan Foto?"
              : "Aktifkan Foto?",

          message:
            item?.is_active
              ? "Foto tidak akan tampil pada website customer."
              : "Foto akan kembali tersedia pada website customer.",

          buttonLabel:
            item?.is_active
              ? "Nonaktifkan"
              : "Aktifkan",

          callback:
            async () => {

              await toggleActive(
                id
              );

            }
        });

      }


      if (
        action === "delete"
      ) {

        openConfirm({
          title:
            "Hapus Foto?",

          message:
            "Foto akan dihapus permanen dari database dan Supabase Storage.",

          buttonLabel:
            "Hapus",

          callback:
            async () => {

              await deleteImage(
                id
              );

            }
        });

      }

    }
  );


  confirmCancel.addEventListener(
    "click",
    closeConfirm
  );


  confirmAction.addEventListener(
    "click",
    async () => {

      if (!confirmCallback) {
        return;
      }


      confirmAction.disabled =
        true;


      try {

        await confirmCallback();

        closeConfirm();

      }
      catch (error) {

        console.error(
          "Gallery action error:",
          error
        );


        showToast(
          "Gagal",
          error?.message ||
          "Perubahan belum berhasil."
        );

      }
      finally {

        confirmAction.disabled =
          false;

      }

    }
  );


  confirmModal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        confirmModal
      ) {

        closeConfirm();

      }

    }
  );


  studioMenuButton.addEventListener(
    "click",
    () => {

      studioSidebar.classList.toggle(
        "open"
      );

    }
  );


  /* =====================================================
     START
     ===================================================== */

  if (
    !supabase
  ) {

    galleryLoading.classList.add(
      "hidden"
    );

    galleryEmpty.classList.remove(
      "hidden"
    );

    galleryEmpty.querySelector(
      "h2"
    ).textContent =
      "Supabase belum terhubung";

    galleryEmpty.querySelector(
      "p"
    ).textContent =
      "Periksa konfigurasi js/supabase.js.";

    return;

  }


  try {

    await Promise.all([
      loadProducts(),
      loadVariants()
    ]);


    await loadGallery();

  }
  catch (error) {

    console.error(
      "Gallery initialization error:",
      error
    );


    galleryLoading.classList.add(
      "hidden"
    );

    galleryEmpty.classList.remove(
      "hidden"
    );

    galleryEmpty.querySelector(
      "h2"
    ).textContent =
      "Gallery belum dapat dimuat";

    galleryEmpty.querySelector(
      "p"
    ).textContent =
      error?.message ||
      "Terjadi kesalahan saat membaca data.";

  }

});
