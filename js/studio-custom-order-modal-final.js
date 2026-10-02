(() => {
  "use strict";

  function getElements() {

    const closeButton =
      document.getElementById(
        "closeCreateButton"
      );

    const cancelButton =
      document.getElementById(
        "cancelCreateButton"
      );

    const form =
      document.getElementById(
        "customOrderForm"
      );

    const panel =
      form?.closest(
        ".custom-modal"
      ) ||
      closeButton?.closest(
        ".custom-modal"
      );

    /*
      Struktur halaman:
      wrapper / backdrop
        -> .custom-modal
           -> form
    */

    const wrapper =
      panel?.parentElement || null;


    return {
      closeButton,
      cancelButton,
      panel,
      wrapper
    };
  }


  function closeModal(event) {

    if (event) {

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

    }


    const {
      panel,
      wrapper
    } = getElements();


    /*
      Prioritas menutup wrapper modal.
      Jangan sembunyikan panel saja agar tombol
      + Buat Custom Order tetap bisa membuka ulang.
    */

    if (
      wrapper &&
      wrapper !== document.body &&
      wrapper !== document.documentElement
    ) {

      wrapper.hidden = true;

      wrapper.classList.remove(
        "active",
        "open",
        "show",
        "visible",
        "is-open"
      );

      wrapper.setAttribute(
        "aria-hidden",
        "true"
      );

    }
    else if (panel) {

      panel.hidden = true;

      panel.classList.remove(
        "active",
        "open",
        "show",
        "visible",
        "is-open"
      );

    }


    document.body.classList.remove(
      "modal-open",
      "custom-modal-open",
      "no-scroll",
      "overflow-hidden"
    );

    document.documentElement.classList.remove(
      "modal-open",
      "custom-modal-open",
      "no-scroll",
      "overflow-hidden"
    );

  }


  function bindButtons() {

    const {
      closeButton,
      cancelButton
    } = getElements();


    if (closeButton) {

      /*
        cloneNode digunakan supaya listener lama
        yang mungkin rusak tidak ikut terbawa.
      */

      const cleanClose =
        closeButton.cloneNode(true);

      closeButton.replaceWith(
        cleanClose
      );

      cleanClose.addEventListener(
        "click",
        closeModal,
        true
      );

    }


    if (cancelButton) {

      const cleanCancel =
        cancelButton.cloneNode(true);

      cancelButton.replaceWith(
        cleanCancel
      );

      cleanCancel.addEventListener(
        "click",
        closeModal,
        true
      );

    }

  }


  /*
    Escape juga menutup modal.
  */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {

        const {
          wrapper,
          panel
        } = getElements();

        const visible =
          wrapper &&
          !wrapper.hidden;

        if (
          visible ||
          (
            panel &&
            !panel.hidden
          )
        ) {

          closeModal(event);

        }

      }

    },
    true
  );


  /*
    Jalankan setelah semua JS existing selesai bind.
  */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      () => {

        setTimeout(
          bindButtons,
          300
        );

      }
    );

  }
  else {

    setTimeout(
      bindButtons,
      300
    );

  }


  /*
    Saat modal dibuka kembali, beberapa script existing
    bisa membuat ulang isi modal.
    Bind ulang tombol setelah klik Buat Custom Order.
  */

  document.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "button"
        );

      if (!button) {
        return;
      }


      const text =
        String(
          button.textContent || ""
        )
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();


      if (
        text === "buat custom order" ||
        text === "+ buat custom order"
      ) {

        setTimeout(
          bindButtons,
          100
        );

      }

    },
    false
  );

})();
