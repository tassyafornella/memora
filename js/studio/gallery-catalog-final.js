(() => {
  "use strict";


  /* ========================================================
     HELPERS
     ======================================================== */

  function normalize(value) {

    return String(
      value || ""
    )
      .replace(/\s+/g, " ")
      .trim();

  }


  function getLabelFor(element) {

    if (!element) {
      return null;
    }


    if (element.id) {

      const explicit =
        document.querySelector(
          `label[for="${element.id}"]`
        );

      if (explicit) {
        return explicit;
      }
    }


    return element.closest(
      "label"
    );
  }


  function replaceOwnLabelText(
    label,
    text
  ) {

    if (!label) {
      return;
    }


    const childElements =
      Array.from(
        label.children
      );


    const textNodes =
      Array.from(
        label.childNodes
      )
      .filter(
        node =>
          node.nodeType ===
          Node.TEXT_NODE
      );


    if (
      textNodes.length > 0
    ) {

      /*
       * Ubah text node pertama saja supaya
       * input/select yang ada di dalam label
       * tidak ikut terhapus.
       */

      textNodes[0].nodeValue =
        `\n${text}\n`;

      return;
    }


    /*
     * Kalau label cuma membungkus span.
     */

    const span =
      childElements.find(
        child =>
          child.tagName ===
          "SPAN"
      );


    if (span) {

      span.textContent =
        text;
    }

  }


  function addNote(
    element,
    text,
    key
  ) {

    if (!element) {
      return;
    }


    const parent =
      element.closest("label") ||
      element.parentElement;


    if (!parent) {
      return;
    }


    if (
      parent.querySelector(
        `[data-gallery-note="${key}"]`
      )
    ) {
      return;
    }


    const note =
      document.createElement(
        "small"
      );


    note.className =
      "gallery-catalog-field-note";


    note.dataset.galleryNote =
      key;


    note.textContent =
      text;


    parent.appendChild(
      note
    );

  }


  /* ========================================================
     PAGE TITLE
     ======================================================== */

  function updatePageCopy() {

    const page =
      document.querySelector(
        ".gallery-page"
      );


    if (!page) {
      return;
    }


    const h1 =
      page.querySelector(
        "h1"
      );


    if (h1) {

      h1.textContent =
        "Catalog Designs";
    }


    const paragraphs =
      Array.from(
        page.querySelectorAll(
          "p"
        )
      );


    const intro =
      paragraphs.find(
        p => {

          const text =
            normalize(
              p.textContent
            ).toLowerCase();


          return (
            text.includes("gallery") ||
            text.includes("foto produk")
          );

        }
      );


    if (intro) {

      intro.textContent =
        "Kelola foto desain yang tampil pada visual catalog customer berdasarkan produk dan paket.";

    }

  }


  /* ========================================================
     GUIDE
     ======================================================== */

  function createGuide() {

    const page =
      document.querySelector(
        ".gallery-page"
      );


    if (!page) {
      return;
    }


    if (
      page.querySelector(
        "#galleryCatalogGuide"
      )
    ) {
      return;
    }


    const guide =
      document.createElement(
        "section"
      );


    guide.id =
      "galleryCatalogGuide";


    guide.className =
      "gallery-catalog-guide";


    guide.innerHTML = `
      <div class="gallery-catalog-guide-copy">

        <span class="gallery-catalog-guide-eyebrow">
          VISUAL CATALOG
        </span>

        <h2>
          Foto desain untuk katalog customer
        </h2>

        <p>
          Setiap foto dapat dihubungkan ke produk dan paket.
          Nama foto digunakan sebagai nama desain pada katalog.
          Foto aktif dapat digunakan pada customer side,
          sedangkan cover tetap digunakan sebagai foto utama produk.
        </p>

      </div>

      <div class="gallery-catalog-flow">

        <div class="gallery-catalog-flow-item">
          <strong>1. Produk</strong>
          <span>
            Invitation, Bridesmaid, Keepsake, Hangtag,
            Sticker, Birthday.
          </span>
        </div>

        <div class="gallery-catalog-flow-item">
          <strong>2. Paket</strong>
          <span>
            Simple, Signature, Complete atau variant lain
            yang tersedia.
          </span>
        </div>

        <div class="gallery-catalog-flow-item">
          <strong>3. Desain</strong>
          <span>
            Beri nama desain lalu upload foto katalog.
          </span>
        </div>

      </div>
    `;


    const firstSection =
      Array.from(
        page.children
      )
      .find(
        element =>
          element.tagName ===
          "SECTION"
      );


    if (firstSection) {

      page.insertBefore(
        guide,
        firstSection
      );

    }
    else {

      page.prepend(
        guide
      );

    }

  }


  /* ========================================================
     UPLOAD FORM LABELS
     ======================================================== */

  function updateUploadForm() {

    const product =
      document.getElementById(
        "uploadProduct"
      );


    const variant =
      document.getElementById(
        "uploadVariant"
      );


    const title =
      document.getElementById(
        "uploadTitle"
      );


    const cover =
      document.getElementById(
        "uploadAsCover"
      );


    const image =
      document.getElementById(
        "uploadImage"
      );


    replaceOwnLabelText(
      getLabelFor(product),
      "Produk"
    );


    replaceOwnLabelText(
      getLabelFor(variant),
      "Paket / Variant"
    );


    replaceOwnLabelText(
      getLabelFor(title),
      "Nama Desain"
    );


    replaceOwnLabelText(
      getLabelFor(image),
      "Foto Katalog"
    );


    if (title) {

      title.placeholder =
        "Contoh: Burgundy Floral 01";

      title.setAttribute(
        "autocomplete",
        "off"
      );

    }


    addNote(
      product,
      "Pilih produk tempat desain ini akan ditampilkan.",
      "product"
    );


    addNote(
      variant,
      "Untuk produk berpacaket, pilih Simple, Signature, atau Complete.",
      "variant"
    );


    addNote(
      title,
      "Nama ini digunakan sebagai identitas desain pada visual catalog.",
      "title"
    );


    addNote(
      image,
      "Gunakan foto portrait/square yang jelas. JPG, PNG, atau WEBP.",
      "image"
    );


    if (cover) {

      const coverLabel =
        getLabelFor(
          cover
        );


      if (coverLabel) {

        /*
         * Jangan replace seluruh label karena
         * checkbox berada di dalam label.
         */

        const text =
          normalize(
            coverLabel.textContent
          );


        if (
          text &&
          !text
            .toLowerCase()
            .includes(
              "cover utama produk"
            )
        ) {

          const textNodes =
            Array.from(
              coverLabel.childNodes
            )
            .filter(
              node =>
                node.nodeType ===
                Node.TEXT_NODE
            );


          if (
            textNodes.length > 0
          ) {

            textNodes[
              textNodes.length - 1
            ].nodeValue =
              " Jadikan cover utama produk";

          }

        }

      }


      addNote(
        cover,
        "Cover digunakan sebagai foto utama produk. Untuk foto desain paket biasa, biarkan tidak dicentang.",
        "cover"
      );

    }


    /*
     * Ubah copy target lama secara visual,
     * tanpa mengubah value radio existing.
     */

    const targetRadios =
      Array.from(
        document.querySelectorAll(
          'input[name="imageTarget"]'
        )
      );


    targetRadios.forEach(
      radio => {

        const label =
          getLabelFor(
            radio
          );


        if (!label) {
          return;
        }


        const value =
          String(
            radio.value || ""
          ).toLowerCase();


        if (
          value === "gallery"
        ) {

          replaceOwnLabelText(
            label,
            "Foto Produk Umum"
          );

        }


        if (
          value === "variant"
        ) {

          replaceOwnLabelText(
            label,
            "Foto Desain per Paket"
          );

        }

      }
    );


    /*
     * Tambahkan penjelasan kecil dalam modal.
     */

    const form =
      title?.closest("form") ||
      document.querySelector(
        "#uploadModal form"
      );


    if (
      form &&
      !form.querySelector(
        "#galleryCatalogUploadTip"
      )
    ) {

      const tip =
        document.createElement(
          "div"
        );


      tip.id =
        "galleryCatalogUploadTip";


      tip.className =
        "gallery-catalog-tip";


      tip.innerHTML = `
        <strong>Untuk visual catalog:</strong>
        pilih Foto Desain per Paket, pilih variant/package,
        isi Nama Desain, lalu upload foto.
      `;


      form.insertBefore(
        tip,
        form.firstChild
      );

    }

  }


  /* ========================================================
     GALLERY CARD ENHANCEMENT
     ======================================================== */

  function enhanceCards() {

    /*
     * Existing gallery.js tetap bertanggung jawab
     * render data. Script ini hanya memberikan
     * badge tambahan berdasarkan text/card yang
     * sudah dirender.
     */

    const possibleCards =
      Array.from(
        document.querySelectorAll(
          [
            ".gallery-card",
            ".gallery-item",
            "[data-gallery-id]",
            ".product-gallery-card"
          ].join(",")
        )
      );


    possibleCards.forEach(
      card => {

        if (
          card.querySelector(
            ".memora-design-meta"
          )
        ) {
          return;
        }


        const text =
          normalize(
            card.textContent
          );


        if (!text) {
          return;
        }


        const meta =
          document.createElement(
            "div"
          );


        meta.className =
          "memora-design-meta";


        const packages = [
          "Simple",
          "Signature",
          "Complete"
        ];


        const packageName =
          packages.find(
            item =>
              text
                .toLowerCase()
                .includes(
                  item.toLowerCase()
                )
          );


        if (packageName) {

          const badge =
            document.createElement(
              "span"
            );


          badge.className =
            "memora-design-badge package";


          badge.textContent =
            packageName;


          meta.appendChild(
            badge
          );

        }


        if (
          text
            .toLowerCase()
            .includes("cover")
        ) {

          const badge =
            document.createElement(
              "span"
            );


          badge.className =
            "memora-design-badge cover";


          badge.textContent =
            "Cover";


          meta.appendChild(
            badge
          );

        }


        if (
          meta.children.length > 0
        ) {

          card.appendChild(
            meta
          );

        }

      }
    );

  }


  /* ========================================================
     OBSERVER
     Gallery dirender async setelah Supabase load.
     ======================================================== */

  function observeGallery() {

    const page =
      document.querySelector(
        ".gallery-page"
      );


    if (!page) {
      return;
    }


    const observer =
      new MutationObserver(
        () => {

          updateUploadForm();

          enhanceCards();

        }
      );


    observer.observe(
      page,
      {
        childList: true,
        subtree: true
      }
    );

  }


  /* ========================================================
     INIT
     ======================================================== */

  function init() {

    updatePageCopy();

    createGuide();

    updateUploadForm();

    enhanceCards();

    observeGallery();

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      () => {

        setTimeout(
          init,
          250
        );

      }
    );

  }
  else {

    setTimeout(
      init,
      250
    );

  }

})();
