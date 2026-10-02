(function () {

  "use strict";


  function clean(value) {

    return String(
      value || ""
    )
      .replace(/\s+/g, " ")
      .trim();

  }


  function getOrderNumber() {

    const bodyText =
      clean(
        document.body.textContent
      );


    const match =
      bodyText.match(
        /MEM-\d{8}-\d+/i
      );


    return match
      ? match[0]
      : "";

  }


  function getOrderDate() {

    const text =
      document.body.innerText || "";


    const month =
      "(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)";


    const regex =
      new RegExp(
        "\\b\\d{1,2}\\s+" +
        month +
        "\\s+\\d{4}\\b",
        "i"
      );


    const match =
      text.match(
        regex
      );


    return match
      ? match[0]
      : "";

  }


  function findHeading() {

    return Array
      .from(
        document.querySelectorAll(
          "h1, h2, h3, h4, h5, strong"
        )
      )
      .find(
        function (element) {

          return (
            clean(
              element.textContent
            ).toLowerCase() ===
            "informasi pesanan"
          );

        }
      );

  }


  function findInfoContainer() {

    const heading =
      findHeading();


    if (!heading) {
      return null;
    }


    let node =
      heading.parentElement;


    while (
      node &&
      node !== document.body
    ) {

      const text =
        clean(
          node.textContent
        );


      const hasOrderInfo =
        (
          text.includes(
            "Nomor Antrian"
          ) ||
          text.includes(
            "Nomor Pesanan"
          )
        ) &&
        text.includes(
          "Tanggal Acara"
        );


      if (hasOrderInfo) {

        return node;

      }


      node =
        node.parentElement;

    }


    return null;

  }


  function findLabelElement(
    container,
    names
  ) {

    const normalized =
      names.map(
        function (name) {

          return name.toLowerCase();

        }
      );


    return Array
      .from(
        container.querySelectorAll(
          "span, label, p, dt, div"
        )
      )
      .find(
        function (element) {

          const text =
            clean(
              element.textContent
            ).toLowerCase();


          return normalized.includes(
            text
          );

        }
      ) || null;

  }


  function findRow(
    label,
    container
  ) {

    if (!label) {
      return null;
    }


    let current =
      label;


    while (
      current &&
      current.parentElement &&
      current.parentElement !== container
    ) {

      const text =
        clean(
          current.textContent
        );


      const children =
        current.children
          ? current.children.length
          : 0;


      /*
       * Row informasi biasanya kecil,
       * hanya berisi label + value.
       */
      if (
        children >= 2 &&
        text.length < 120
      ) {

        return current;

      }


      current =
        current.parentElement;

    }


    return label.parentElement;

  }


  function makeRowContent(
    row,
    label,
    value
  ) {

    if (!row) {
      return;
    }


    row.innerHTML = "";


    const labelElement =
      document.createElement(
        "span"
      );


    labelElement.textContent =
      label;


    const valueElement =
      document.createElement(
        "strong"
      );


    valueElement.textContent =
      value || "-";


    row.appendChild(
      labelElement
    );


    row.appendChild(
      valueElement
    );

  }


  function fixInformation() {

    const container =
      findInfoContainer();


    if (!container) {
      return false;
    }


    const orderNumber =
      getOrderNumber();


    const orderDate =
      getOrderDate();


    if (
      !orderNumber ||
      !orderDate
    ) {

      return false;

    }


    const numberLabel =
      findLabelElement(
        container,
        [
          "Nomor Antrian",
          "Nomor Pesanan"
        ]
      );


    const dateLabel =
      findLabelElement(
        container,
        [
          "Target Selesai",
          "Tanggal Pesanan"
        ]
      );


    const eventLabel =
      findLabelElement(
        container,
        [
          "Tanggal Acara"
        ]
      );


    if (
      !numberLabel ||
      !dateLabel ||
      !eventLabel
    ) {

      return false;

    }


    const numberRow =
      findRow(
        numberLabel,
        container
      );


    const dateRow =
      findRow(
        dateLabel,
        container
      );


    const eventRow =
      findRow(
        eventLabel,
        container
      );


    if (
      !numberRow ||
      !dateRow ||
      !eventRow
    ) {

      return false;

    }


    /*
     * Simpan nilai tanggal acara yang sudah dirender
     * dari sistem.
     */

    let eventValue =
      "-";


    const eventStrong =
      eventRow.querySelector(
        "strong"
      );


    if (
      eventStrong &&
      clean(
        eventStrong.textContent
      )
    ) {

      eventValue =
        clean(
          eventStrong.textContent
        );

    }


    /*
     * GANTI ISI ROW SECARA UTUH.
     *
     * Ini memastikan:
     * #7 tidak mungkin tersisa.
     */

    makeRowContent(
      numberRow,
      "Nomor Pesanan",
      orderNumber
    );


    makeRowContent(
      dateRow,
      "Tanggal Pesanan",
      orderDate
    );


    makeRowContent(
      eventRow,
      "Tanggal Acara",
      eventValue
    );


    /*
     * Susun:
     *
     * Nomor Pesanan
     * Tanggal Pesanan
     * Tanggal Acara
     */

    const parent =
      numberRow.parentElement;


    if (
      parent &&
      dateRow.parentElement === parent &&
      eventRow.parentElement === parent
    ) {

      /*
       * Heading Informasi Pesanan tetap di atas.
       * Row disusun setelah heading:
       *
       * Informasi Pesanan
       * Nomor Pesanan
       * Tanggal Pesanan
       * Tanggal Acara
       */

      const heading =
        findHeading();


      if (
        heading &&
        heading.parentElement === parent
      ) {

        parent.insertBefore(
          numberRow,
          heading.nextSibling
        );


        parent.insertBefore(
          dateRow,
          numberRow.nextSibling
        );


        parent.insertBefore(
          eventRow,
          dateRow.nextSibling
        );

      }

    }


    return true;

  }


  function initialize() {

    /*
     * Coba langsung.
     */

    if (
      fixInformation()
    ) {

      return;

    }


    /*
     * customer-order-detail.js mengambil data
     * secara async dari Supabase.
     *
     * Tunggu sampai render selesai.
     */

    const observer =
      new MutationObserver(
        function () {

          if (
            fixInformation()
          ) {

            observer.disconnect();

          }

        }
      );


    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
        characterData: true
      }
    );


    /*
     * Fallback beberapa kali untuk kondisi
     * render lambat.
     */

    let attempt = 0;


    const timer =
      setInterval(
        function () {

          attempt += 1;


          if (
            fixInformation() ||
            attempt >= 20
          ) {

            clearInterval(
              timer
            );


            observer.disconnect();

          }

        },
        300
      );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );

  }
  else {

    initialize();

  }

})();

