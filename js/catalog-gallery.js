(() => {

  "use strict";


  const data =
    window.MEMORA_CATALOG_DATA ||
    {};


  const descriptions = {

    invitation:
      "Temukan inspirasi desain undangan dari koleksi Memora.",

    bridesmaid:
      "Proposal card dan personalized stationery untuk bridesmaid dan Maid of Honor.",

    keepsake:
      "Koleksi keepsake personalized untuk menyimpan little memories.",

    hangtag:
      "Inspirasi personalized hangtag untuk souvenir, gift, dan hampers.",

    sticker:
      "Custom sticker untuk special moments, souvenir, dan packaging.",

    birthday:
      "Personalized birthday stationery untuk merayakan setiap little chapter."

  };


  const params =
    new URLSearchParams(
      location.search
    );


  let category =
    (
      params.get(
        "category"
      ) ||
      "invitation"
    )
    .toLowerCase();


  if (!data[category]) {

    category =
      "invitation";

  }


  const current =
    data[category];


  const gallery =
    document.getElementById(
      "catalogGallery"
    );


  const filters =
    document.getElementById(
      "catalogFilters"
    );


  const empty =
    document.getElementById(
      "catalogEmpty"
    );


  const modal =
    document.getElementById(
      "catalogModal"
    );


  let activeFilter =
    "Semua";


  /* ==========================================================
     HEADER
     ========================================================== */

  document.title =
    `${current.title} Collection — Memora`;


  document.getElementById(
    "catalogEyebrow"
  ).textContent =
    `${current.title.toUpperCase()} COLLECTION`;


  document.getElementById(
    "catalogTitle"
  ).textContent =
    current.title;


  document.getElementById(
    "catalogDescription"
  ).textContent =
    descriptions[
      category
    ] ||
    "Temukan inspirasi desain dari koleksi Memora.";


  /* ==========================================================
     FILTERS
     ========================================================== */

  function getFilters() {

    const values =
      new Set(
        [
          "Semua"
        ]
      );


    (
      current.items ||
      []
    )
    .forEach(
      item => {

        (
          item.filter ||
          []
        )
        .forEach(
          value =>
            values.add(
              value
            )
        );

      }
    );


    return [
      ...values
    ];

  }


  function renderFilters() {

    filters.innerHTML =
      "";


    getFilters()
      .forEach(
        filter => {

          const button =
            document.createElement(
              "button"
            );


          button.type =
            "button";


          button.className =
            "catalog-filter";


          if (
            filter ===
            activeFilter
          ) {

            button.classList.add(
              "active"
            );

          }


          button.textContent =
            filter;


          button.addEventListener(
            "click",
            () => {

              activeFilter =
                filter;


              renderFilters();

              renderGallery();

            }
          );


          filters.appendChild(
            button
          );

        }
      );

  }


  /* ==========================================================
     GALLERY
     ========================================================== */

  function renderGallery() {

    gallery.innerHTML =
      "";


    const items =
      (
        current.items ||
        []
      )
      .filter(
        item => {

          if (
            activeFilter ===
            "Semua"
          ) {

            return true;

          }


          return (
            item.filter ||
            []
          )
          .includes(
            activeFilter
          );

        }
      );


    if (!items.length) {

      empty.hidden =
        false;

      return;

    }


    empty.hidden =
      true;


    items.forEach(
      item => {

        const article =
          document.createElement(
            "article"
          );


        article.className =
          "catalog-card";


        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "catalog-card-button";


        const imageUrl =
          encodeURI(
            item.image
          );


        button.innerHTML = `

          <div class="catalog-image-wrap">

            <img
              src="${imageUrl}"
              alt="${item.title}"
              class="catalog-image"
              loading="lazy"
            >

          </div>


          <div class="catalog-card-copy">

            <span class="catalog-card-type">
              ${item.category}
            </span>

            <h2 class="catalog-card-title">
              ${item.title}
            </h2>

            <p class="catalog-card-meta">
              ${item.meta}
            </p>

          </div>

        `;


        button.addEventListener(
          "click",
          () => {

            openModal(
              item
            );

          }
        );


        article.appendChild(
          button
        );


        gallery.appendChild(
          article
        );

      }
    );

  }


  /* ==========================================================
     MODAL
     ========================================================== */

  function openModal(
    item
  ) {

    const image =
      document.getElementById(
        "modalImage"
      );


    image.src =
      encodeURI(
        item.image
      );


    image.alt =
      item.title;


    document.getElementById(
      "modalCategory"
    ).textContent =
      item.category;


    document.getElementById(
      "modalTitle"
    ).textContent =
      item.title;


    document.getElementById(
      "modalMeta"
    ).textContent =
      item.meta;


    document.getElementById(
      "modalDescription"
    ).textContent =
      item.description;


    document.getElementById(
      "modalProductLink"
    ).href =
      item.product;


    modal.classList.add(
      "open"
    );


    modal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "catalog-modal-open"
    );

  }


  function closeModal() {

    modal.classList.remove(
      "open"
    );


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.classList.remove(
      "catalog-modal-open"
    );

  }


  document
    .querySelectorAll(
      "[data-close-modal]"
    )
    .forEach(
      element => {

        element.addEventListener(
          "click",
          closeModal
        );

      }
    );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeModal();

      }

    }
  );


  renderFilters();

  renderGallery();


})();
