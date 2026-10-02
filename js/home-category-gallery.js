(() => {

  "use strict";


  const categories = {

    Invitation:
      "invitation",

    Bridesmaid:
      "bridesmaid",

    Keepsake:
      "keepsake",

    Hangtag:
      "hangtag",

    Sticker:
      "sticker",

    Birthday:
      "birthday"

  };


  function normalize(
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


  function findCategorySection() {

    const headings =
      Array.from(
        document.querySelectorAll(
          "h1,h2,h3,h4"
        )
      );


    const heading =
      headings.find(
        item =>
          normalize(
            item.textContent
          )
          .includes(
            "Mau buat apa hari ini?"
          )
      );


    if (!heading) {

      return null;

    }


    return (
      heading.closest(
        "section"
      ) ||
      heading.parentElement?.parentElement ||
      heading.parentElement
    );

  }


  function install() {

    const section =
      findCategorySection();


    if (!section) {

      return;

    }


    /*
      Cari card/link berdasarkan teks.
      Tidak mengubah section product lain.
    */

    const links =
      Array.from(
        section.querySelectorAll(
          "a"
        )
      );


    Object.entries(
      categories
    )
    .forEach(
      ([label, key]) => {

        const link =
          links.find(
            item => {

              const text =
                normalize(
                  item.textContent
                );


              return (
                text === label ||
                text.endsWith(
                  ` ${label}`
                ) ||
                text.includes(
                  label
                )
              );

            }
          );


        if (!link) {

          return;

        }


        link.href =
          `/collection/?category=${key}`;


        link.removeAttribute(
          "target"
        );


        link.setAttribute(
          "aria-label",
          `Lihat koleksi ${label} Memora`
        );

      }
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      install
    );

  }
  else {

    install();

  }

})();
