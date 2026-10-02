(() => {
  "use strict";

  const normalize = (value) =>
    String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();


  function findCustomOrderDialog() {

    const headings = Array.from(
      document.querySelectorAll("h1, h2, h3, strong")
    );

    const heading = headings.find((el) =>
      normalize(el.textContent).includes("buat custom order")
    );

    if (!heading) {
      return null;
    }


    return (
      heading.closest(
        '[role="dialog"], dialog, .modal, .studio-modal, .custom-order-modal, .custom-admin-modal, .modal-overlay, .modal-backdrop, [class*="modal"]'
      ) ||
      heading.parentElement?.parentElement?.parentElement ||
      null
    );
  }


  function closeCustomOrderDialog() {

    const dialog = findCustomOrderDialog();

    if (!dialog) {
      console.warn(
        "[Memora] Modal Buat Custom Order tidak ditemukan."
      );

      return;
    }


    dialog.classList.remove(
      "active",
      "open",
      "show",
      "is-open",
      "visible"
    );


    dialog.setAttribute(
      "aria-hidden",
      "true"
    );


    dialog.hidden = true;


    document.body.classList.remove(
      "modal-open",
      "no-scroll",
      "overflow-hidden"
    );


    document.documentElement.classList.remove(
      "modal-open",
      "no-scroll",
      "overflow-hidden"
    );
  }


  function prepareDialogForOpen() {

    setTimeout(() => {

      const dialog = findCustomOrderDialog();

      if (!dialog) {
        return;
      }


      dialog.hidden = false;

      dialog.removeAttribute(
        "aria-hidden"
      );

    }, 0);
  }


  document.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "button, [role='button'], a"
        );

      if (!button) {
        return;
      }


      const text =
        normalize(
          button.textContent
        );


      /* ======================================================
         OPEN BUTTON
         ====================================================== */

      if (
        text === "buat custom order" ||
        text === "+ buat custom order"
      ) {

        prepareDialogForOpen();

        return;
      }


      const dialog =
        findCustomOrderDialog();

      if (!dialog) {
        return;
      }


      if (!dialog.contains(button)) {
        return;
      }


      /* ======================================================
         CLOSE X
         ====================================================== */

      const rawText =
        String(
          button.textContent || ""
        ).trim();


      const looksLikeCloseButton =
        rawText === "×" ||
        rawText === "x" ||
        text === "close" ||
        text === "tutup" ||
        button.getAttribute("aria-label")?.toLowerCase() === "close" ||
        button.getAttribute("aria-label")?.toLowerCase() === "tutup";


      if (looksLikeCloseButton) {

        event.preventDefault();
        event.stopPropagation();

        closeCustomOrderDialog();

        return;
      }


      /* ======================================================
         BATAL
         ====================================================== */

      if (
        text === "batal" ||
        text.startsWith("batal ")
      ) {

        event.preventDefault();
        event.stopPropagation();

        closeCustomOrderDialog();

        return;
      }

    },
    true
  );


  /* ==========================================================
     ESC KEY
     ========================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Escape") {
        return;
      }


      const dialog =
        findCustomOrderDialog();

      if (!dialog || dialog.hidden) {
        return;
      }


      closeCustomOrderDialog();
    }
  );

})();
