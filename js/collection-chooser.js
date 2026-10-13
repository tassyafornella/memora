(() => {
  "use strict";


  const params =
    new URLSearchParams(
      window.location.search
    );


  /*
   * Kalau sudah pilih kategori,
   * biarkan catalog-final.js menjalankan
   * alur katalog existing.
   */

  if (
    params.get("category")
  ) {
    return;
  }


  function buildChooser() {

    if (
      document.getElementById(
        "memoraCollectionChooser"
      )
    ) {
      return;
    }


    const chooser =
      document.createElement(
        "main"
      );


    chooser.id =
      "memoraCollectionChooser";


    chooser.className =
      "memora-collection-chooser";


    chooser.innerHTML = `
      <div class="memora-collection-chooser-inner">

        <a
          href="/"
          class="memora-collection-back"
        >
          ← Kembali ke Home
        </a>


        <span class="memora-collection-eyebrow">
          KOLEKSI MEMORA
        </span>


        <h1 class="memora-collection-title">
          Mau order apa?
        </h1>


        <p class="memora-collection-description">
          Pilih jenis produk yang ingin kamu buat.
          Setelah itu kamu bisa melihat pilihan paket
          dan desain yang tersedia.
        </p>


        <div class="memora-collection-grid">


          <a
            href="/collection/?category=invitation"
            class="memora-collection-card"
          >

            <div class="memora-collection-card-icon">
              <svg viewBox="0 0 24 24">
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="14"
                  rx="2"
                ></rect>

                <path
                  d="M4 8l8 6 8-6"
                ></path>
              </svg>
            </div>

            <span class="memora-collection-arrow">
              →
            </span>

            <div class="memora-collection-card-copy">
              <strong>
                Invitation
              </strong>

              <span>
                Wedding Invitation dan
                Classic Folded Invitation.
              </span>
            </div>

          </a>


          <a
            href="/collection/?category=bridesmaid"
            class="memora-collection-card"
          >

            <div class="memora-collection-card-icon">
              <svg viewBox="0 0 24 24">
                <path
                  d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"
                ></path>
              </svg>
            </div>

            <span class="memora-collection-arrow">
              →
            </span>

            <div class="memora-collection-card-copy">
              <strong>
                Bridesmaid
              </strong>

              <span>
                Personalized card dan
                Bridesmaid / MOH set.
              </span>
            </div>

          </a>


          <a
            href="/collection/?category=keepsake"
            class="memora-collection-card"
          >

            <div class="memora-collection-card-icon">
              <svg viewBox="0 0 24 24">
                <rect
                  x="5"
                  y="4"
                  width="14"
                  height="16"
                  rx="2"
                ></rect>

                <path d="M8 9h8"></path>
                <path d="M8 13h5"></path>
              </svg>
            </div>

            <span class="memora-collection-arrow">
              →
            </span>

            <div class="memora-collection-card-copy">
              <strong>
                Keepsake
              </strong>

              <span>
                Memory cards dan
                personalized keepsake set.
              </span>
            </div>

          </a>


          <a
            href="/collection/?category=hangtag"
            class="memora-collection-card"
          >

            <div class="memora-collection-card-icon">
              <svg viewBox="0 0 24 24">
                <path
                  d="M4 5h9l7 7-8 8-8-8z"
                ></path>

                <circle
                  cx="9"
                  cy="9"
                  r="1.3"
                ></circle>
              </svg>
            </div>

            <span class="memora-collection-arrow">
              →
            </span>

            <div class="memora-collection-card-copy">
              <strong>
                Hangtag
              </strong>

              <span>
                Hangtag untuk souvenir,
                hampers dan packaging.
              </span>
            </div>

          </a>


          <a
            href="/collection/?category=sticker"
            class="memora-collection-card"
          >

            <div class="memora-collection-card-icon">
              <svg viewBox="0 0 24 24">
                <path
                  d="M12 3a9 9 0 1 0 9 9c0-1-.2-2-.5-2.9A6 6 0 0 1 15 15a6 6 0 0 1-6-6 6 6 0 0 1 3-5.2z"
                ></path>
              </svg>
            </div>

            <span class="memora-collection-arrow">
              →
            </span>

            <div class="memora-collection-card-copy">
              <strong>
                Sticker
              </strong>

              <span>
                Personalized sticker
                berbagai ukuran dan bentuk.
              </span>
            </div>

          </a>


          <a
            href="/collection/?category=birthday"
            class="memora-collection-card"
          >

            <div class="memora-collection-card-icon">
              <svg viewBox="0 0 24 24">
                <path
                  d="M5 10h14v10H5z"
                ></path>

                <path
                  d="M4 10h16"
                ></path>

                <path
                  d="M12 10v10"
                ></path>

                <path
                  d="M12 10c-4 0-5-2-4-3.5 1-1.5 4 .2 4 3.5z"
                ></path>

                <path
                  d="M12 10c4 0 5-2 4-3.5-1-1.5-4 .2-4 3.5z"
                ></path>
              </svg>
            </div>

            <span class="memora-collection-arrow">
              →
            </span>

            <div class="memora-collection-card-copy">
              <strong>
                Birthday
              </strong>

              <span>
                Birthday cards dan
                special occasion stationery.
              </span>
            </div>

          </a>


        </div>

      </div>
    `;


    /*
     * Sembunyikan konten katalog lama sementara
     * ketika belum memilih kategori.
     */

    Array.from(
      document.body.children
    )
      .forEach(
        element => {

          if (
            element.tagName === "SCRIPT" ||
            element.classList.contains(
              "memora-global-header"
            ) ||
            element.hasAttribute(
              "data-memora-global-bottom-nav"
            )
          ) {
            return;
          }


          element.dataset.collectionOriginalDisplay =
            element.style.display || "";


          element.style.display =
            "none";

        }
      );


    const header =
      document.querySelector(
        ".memora-global-header"
      );


    if (header) {

      header.insertAdjacentElement(
        "afterend",
        chooser
      );

    }
    else {

      document.body.prepend(
        chooser
      );

    }

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      buildChooser
    );

  }
  else {

    buildChooser();

  }

})();


/* ==========================================================
   CATEGORY BACK TO COLLECTION ROOT
   ========================================================== */

(() => {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const category =
    params.get("category");


  if (!category) {
    return;
  }


  function applyCollectionBack() {

    /*
     * Cari tombol/link kembali existing.
     */

    const links =
      Array.from(
        document.querySelectorAll("a")
      );


    const backLink =
      links.find(
        link => {

          const text =
            String(
              link.textContent || ""
            )
              .replace(/\s+/g, " ")
              .trim()
              .toLowerCase();


          return (
            text.includes("kembali") ||
            text.includes("back")
          );

        }
      );


    if (backLink) {

      backLink.href =
        "/collection/";

      backLink.textContent =
        "← KOLEKSI MEMORA";

      return;

    }


    /*
     * Kalau halaman kategori belum punya tombol kembali,
     * buat otomatis di bagian atas konten.
     */

    const main =
      document.querySelector("main");


    if (!main) {
      return;
    }


    if (
      document.getElementById(
        "memoraCategoryBack"
      )
    ) {
      return;
    }


    const wrapper =
      document.createElement("div");


    wrapper.id =
      "memoraCategoryBack";


    wrapper.style.marginBottom =
      "18px";


    const link =
      document.createElement("a");


    link.href =
      "/collection/";


    link.textContent =
      "← KOLEKSI MEMORA";


    link.style.display =
      "inline-flex";


    link.style.alignItems =
      "center";


    link.style.gap =
      "6px";


    link.style.fontSize =
      "12px";


    link.style.fontWeight =
      "500";


    link.style.color =
      "#617069";


    link.style.textDecoration =
      "none";


    wrapper.appendChild(
      link
    );


    main.prepend(
      wrapper
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      applyCollectionBack
    );

  }
  else {

    applyCollectionBack();

  }

})();

