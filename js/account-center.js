(function () {
  "use strict";

  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.from(
      (parent || document).querySelectorAll(selector)
    );
  }

  function findSectionByText(words) {
    const sections = qsa(
      "main section, .account-page section, .account-main section"
    );

    return sections.find(function (section) {
      const text = String(
        section.textContent || ""
      ).toLowerCase();

      return words.some(function (word) {
        return text.includes(
          word.toLowerCase()
        );
      });
    }) || null;
  }

  function scrollToSection(id) {
    const element =
      document.getElementById(id);

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }


  function prepareSections() {

    const profileForm =
      document.getElementById(
        "accountProfileForm"
      );

    if (profileForm) {

      const profileSection =
        profileForm.closest("section") ||
        profileForm.parentElement;

      if (profileSection) {

        profileSection.id =
          "accountProfileSection";

        profileSection.classList.add(
          "account-content-section"
        );

      }

    }


    let ordersSection =
      findSectionByText([
        "pesanan saya",
        "belum ada pesanan"
      ]);

    if (ordersSection) {

      ordersSection.id =
        "accountOrdersSection";

      ordersSection.classList.add(
        "account-content-section"
      );

    }

  }


  function createAddressSection() {

    if (
      document.getElementById(
        "accountAddressesSection"
      )
    ) {
      return;
    }


    const section =
      document.createElement("section");

    section.id =
      "accountAddressesSection";

    section.className =
      "account-content-section account-address-section";


    section.innerHTML = `
      <div class="account-section-heading">
        <div>
          <span class="account-section-eyebrow">
            ALAMAT
          </span>

          <h2>
            Alamat Saya
          </h2>

          <p>
            Simpan alamat pengiriman agar proses checkout menjadi lebih cepat.
          </p>
        </div>
      </div>

      <div class="account-address-empty">
        <div class="account-address-icon">
          ⌂
        </div>

        <div>
          <strong>
            Belum ada alamat tersimpan
          </strong>

          <p>
            Alamat utama dan alamat lainnya akan tampil di bagian ini.
          </p>

          <span>
            Fitur tambah dan kelola alamat akan kita aktifkan pada tahap berikutnya.
          </span>
        </div>
      </div>
    `;


    const orders =
      document.getElementById(
        "accountOrdersSection"
      );

    if (
      orders &&
      orders.parentElement
    ) {

      orders.parentElement.insertBefore(
        section,
        orders
      );

      return;

    }


    const main =
      qs("main");

    if (main) {
      main.appendChild(section);
    }

  }


  function createAccountCenter() {

    if (
      document.getElementById(
        "memoraAccountCenter"
      )
    ) {
      return;
    }


    const center =
      document.createElement("section");

    center.id =
      "memoraAccountCenter";

    center.className =
      "memora-account-center";


    center.innerHTML = `
      <div class="account-center-heading">
        <span>AKUN MEMORA</span>

        <h2>
          Akun Saya
        </h2>

        <p>
          Kelola informasi akun, alamat, dan pesananmu dalam satu tempat.
        </p>
      </div>


      <div class="account-center-menu">

        <button
          type="button"
          class="account-center-item"
          data-account-target="accountProfileSection"
        >
          <span class="account-center-icon">
            P
          </span>

          <span class="account-center-copy">
            <strong>
              Profil Saya
            </strong>

            <small>
              Kelola informasi dan kontak akun
            </small>
          </span>

          <span class="account-center-arrow">
            →
          </span>
        </button>


        <button
          type="button"
          class="account-center-item"
          data-account-target="accountAddressesSection"
        >
          <span class="account-center-icon">
            A
          </span>

          <span class="account-center-copy">
            <strong>
              Alamat Saya
            </strong>

            <small>
              Kelola alamat untuk pengiriman pesanan
            </small>
          </span>

          <span class="account-center-arrow">
            →
          </span>
        </button>


        <button
          type="button"
          class="account-center-item"
          data-account-target="accountOrdersSection"
        >
          <span class="account-center-icon">
            O
          </span>

          <span class="account-center-copy">
            <strong>
              Pesanan Saya
            </strong>

            <small>
              Lihat pesanan dan perkembangannya
            </small>
          </span>

          <span class="account-center-arrow">
            →
          </span>
        </button>


        <button
          type="button"
          class="account-center-item account-center-logout"
          id="accountCenterLogout"
        >
          <span class="account-center-icon">
            ↗
          </span>

          <span class="account-center-copy">
            <strong>
              Keluar
            </strong>

            <small>
              Keluar dari akun Memora
            </small>
          </span>

          <span class="account-center-arrow">
            →
          </span>
        </button>

      </div>
    `;


    /*
     * Letakkan sesudah intro,
     * sebelum statistik lama.
     */

    const statGrid =
      qs(
        ".account-stats, .stats-grid, .account-stat-grid"
      );


    if (
      statGrid &&
      statGrid.parentElement
    ) {

      statGrid.parentElement.insertBefore(
        center,
        statGrid
      );

    }
    else {

      const main =
        qs("main");

      if (main) {

        const firstSection =
          qs("section", main);

        if (firstSection) {

          main.insertBefore(
            center,
            firstSection
          );

        }
        else {

          main.appendChild(center);

        }

      }

    }

  }


  function bindNavigation() {

    qsa(
      "[data-account-target]"
    ).forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            const target =
              button.getAttribute(
                "data-account-target"
              );

            scrollToSection(target);

          }
        );

      }
    );

  }


  function bindLogout() {

    const button =
      document.getElementById(
        "accountCenterLogout"
      );

    if (!button) {
      return;
    }


    button.addEventListener(
      "click",
      async function () {

        const confirmed =
          window.confirm(
            "Keluar dari akun Memora?"
          );

        if (!confirmed) {
          return;
        }


        const supabase =
          window.memoraSupabase || null;


        if (supabase) {

          try {

            await supabase
              .auth
              .signOut();

          }
          catch (error) {

            console.error(
              "Logout:",
              error
            );

          }

        }


        localStorage.removeItem(
          "memora_after_auth"
        );


        window.location.href =
          "/account/login/";

      }
    );

  }


  function normalizeAccountText() {

    /*
     * Jangan replace HTML/ID.
     * Hanya text node tertentu.
     */

    qsa("h1, h2, h3, p, span, strong")
      .forEach(function (element) {

        if (
          element.children.length > 0
        ) {
          return;
        }

        const text =
          String(
            element.textContent || ""
          ).trim();

        if (
          text === "Account Information"
        ) {

          element.textContent =
            "Informasi Profil";

        }

        if (
          text === "My Orders"
        ) {

          element.textContent =
            "Pesanan Saya";

        }

      });

  }


  function init() {

    prepareSections();

    createAddressSection();

    createAccountCenter();

    normalizeAccountText();

    bindNavigation();

    bindLogout();

    document.body.classList.add(
      "memora-account-center-ready"
    );

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
