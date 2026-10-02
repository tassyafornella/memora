(() => {

  "use strict";


  const categoryMap = {

    invitation:
      "/collection/?category=invitation",

    bridesmaid:
      "/collection/?category=bridesmaid",

    keepsake:
      "/collection/?category=keepsake",

    hangtag:
      "/collection/?category=hangtag",

    sticker:
      "/collection/?category=sticker",

    birthday:
      "/collection/?category=birthday"

  };


  function clean(
    value
  ) {

    return String(
      value || ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  }


  function findHeading(
    text
  ) {

    return Array.from(
      document.querySelectorAll(
        "h1,h2,h3,h4,h5"
      )
    )
    .find(
      heading =>
        clean(
          heading.textContent
        )
        .toLowerCase()
        .includes(
          text.toLowerCase()
        )
    );

  }


  /* ==========================================================
     REMOVE KOLEKSI MEMORA
     ========================================================== */

  function removeOldCollection() {

    const heading =
      findHeading(
        "Koleksi Memora"
      );


    if (!heading) {

      return;

    }


    const section =
      heading.closest(
        "section"
      );


    if (section) {

      section.remove();

      return;

    }


    /*
      Fallback kalau section tidak menggunakan tag <section>.
    */

    const container =
      heading.closest(
        "[id], .section, .home-section, .collection-section"
      );


    if (container) {

      container.remove();

    }

  }


  /* ==========================================================
     CATEGORY LINKS
     ========================================================== */

  function installCategoryLinks() {

    const heading =
      findHeading(
        "Mau buat apa hari ini"
      );


    if (!heading) {

      return;

    }


    const section =
      heading.closest(
        "section"
      ) ||
      heading.parentElement?.parentElement ||
      heading.parentElement;


    if (!section) {

      return;

    }


    const elements =
      Array.from(
        section.querySelectorAll(
          "a"
        )
      );


    const aliases = {

      invitation: [
        "invitation",
        "undangan"
      ],

      bridesmaid: [
        "bridesmaid",
        "moh"
      ],

      keepsake: [
        "keepsake"
      ],

      hangtag: [
        "hangtag",
        "tag"
      ],

      sticker: [
        "sticker"
      ],

      birthday: [
        "birthday",
        "ulang tahun"
      ]

    };


    elements.forEach(
      link => {

        const text =
          clean(
            link.textContent
          )
          .toLowerCase();


        Object.entries(
          aliases
        )
        .forEach(
          ([key, words]) => {

            const match =
              words.some(
                word =>
                  text.includes(
                    word
                  )
              );


            if (!match) {

              return;

            }


            link.href =
              categoryMap[
                key
              ];


            link.removeAttribute(
              "target"
            );


            link.dataset.memoraCatalog =
              key;

          }
        );

      }
    );

  }


  function init() {

    removeOldCollection();

    installCategoryLinks();

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
