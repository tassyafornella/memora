(function () {

  "use strict";


  function escapeHtml(value) {

    const div =
      document.createElement(
        "div"
      );

    div.textContent =
      String(
        value ?? ""
      );

    return div.innerHTML;

  }


  function money(value) {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }
    ).format(
      Number(value) || 0
    );

  }


  function renderLoading(message) {

    const root =
      document.getElementById(
        "adminApp"
      );


    root.innerHTML = `

      <div class="loading-page">

        <div class="loading-inner">

          <strong>
            MEMORA
          </strong>

          <span>
            ${escapeHtml(message)}
          </span>

        </div>

      </div>

    `;

  }


  function renderError(
    title,
    message
  ) {

    const root =
      document.getElementById(
        "adminApp"
      );


    root.innerHTML = `

      <div class="error-page">

        <div class="error-card">

          <div class="eyebrow">
            MEMORA Studio
          </div>

          <h1>
            ${escapeHtml(title)}
          </h1>

          <p>
            ${escapeHtml(message)}
          </p>

        </div>

      </div>

    `;

  }


  function renderDashboardShell(
    user,
    profile
  ) {

    const root =
      document.getElementById(
        "adminApp"
      );


    root.innerHTML = `

      <div class="admin-layout">

        <aside class="sidebar">

          <div class="sidebar-brand">

            <strong>
              MEMORA
            </strong>

            <span>
              Studio Administration
            </span>

          </div>


          <nav class="sidebar-menu">

            <a
              href="/studio/dashboard/"
              class="${window.location.pathname.includes("/dashboard/") ? "active" : ""}"
            >
              Dashboard
            </a>

            <a
              href="/studio/orders/"
              class="${
                window.location.pathname.includes("/orders/") ||
                window.location.pathname.includes("/order-detail/")
                  ? "active"
                  : ""
              }"
            >
              Orders
            </a>

            <a
              href="/studio/products/"
              class="${window.location.pathname.includes("/products/") ? "active" : ""}"
            >
              Products
            </a>

            <a
              href="/studio/payments/"
              class="${window.location.pathname.includes("/payments/") ? "active" : ""}"
            >
              Payments
            </a>

            <a
              href="/studio/production/"
              class="${window.location.pathname.includes("/production/") ? "active" : ""}"
            >
              Production
            </a>

            <a
              href="/studio/finance/"
              class="${window.location.pathname.includes("/finance/") ? "active" : ""}"
            >
              Finance
            </a>

            <a
              href="/studio/invoices/"
              class="${
                window.location.pathname.includes("/invoices/") ||
                window.location.pathname.includes("/invoice-print/")
                  ? "active"
                  : ""
              }"
            >
              Invoices
            </a>

            <a
              href="/studio/customers/"
              class="${window.location.pathname.includes("/customers/") ? "active" : ""}"
            >
              Customers
            </a>

            <a
              href="/studio/gallery/"
              class="${window.location.pathname.includes("/gallery/") ? "active" : ""}"
            >
              Gallery
            </a>

            <a
              href="/studio/custom-orders/"
              class="${window.location.pathname.includes("/custom-orders/") ? "active" : ""}"
            >
              Custom Orders
            </a>

            <a
              href="/studio/archive/"
              class="${window.location.pathname.includes("/archive/") ? "active" : ""}"
            >
              Archive
            </a>

          </nav>


          <div class="sidebar-account">

            <strong>
              ${escapeHtml(
                profile.full_name ||
                "MEMORA Admin"
              )}
            </strong>

            <span>
              ${escapeHtml(
                profile.role ||
                "admin"
              )}
            </span>


            <button
              type="button"
              class="logout-button"
              id="logoutButton"
            >
              Logout
            </button>

          </div>

        </aside>


        <main class="main">

          <header class="topbar">

            <div class="topbar-title">

              <strong>
                MEMORA Studio
              </strong>

              <span>
                ${escapeHtml(
                  user.email ||
                  ""
                )}
              </span>

            </div>

          </header>


          <div
            class="content"
            id="adminContent"
          ></div>

        </main>

      </div>

    `;


    document
      .getElementById(
        "logoutButton"
      )
      .addEventListener(
        "click",
        async function () {

          await window
            .memoraSupabase
            .auth
            .signOut();


          window.location.replace(
            "/studio/login/"
          );

        }
      );

  }


  async function initialize() {

    try {

      renderLoading(
        "Memeriksa session..."
      );


      const db =
        window.memoraSupabase;


      if (!db) {

        renderError(
          "Supabase belum terhubung",
          "File js/supabase.js tidak tersedia."
        );

        return null;

      }


      const sessionResult =
        await db.auth.getSession();


      if (
        sessionResult.error
      ) {

        throw sessionResult.error;

      }


      const session =
        sessionResult.data?.session;


      if (!session) {

        window.location.replace(
          "/studio/login/"
        );

        return null;

      }


      const user =
        session.user;


      renderLoading(
        "Membaca profile admin..."
      );


      const profileResult =
        await db
          .from("profiles")
          .select(
            "id,full_name,role"
          )
          .eq(
            "id",
            user.id
          )
          .maybeSingle();


      if (
        profileResult.error
      ) {

        throw profileResult.error;

      }


      const profile =
        profileResult.data;


      if (!profile) {

        renderError(
          "Profile tidak ditemukan",
          "Akun ini belum memiliki profile Admin MEMORA."
        );

        return null;

      }


      const role =
        String(
          profile.role ||
          ""
        )
          .trim()
          .toLowerCase();


      if (
        role !== "owner" &&
        role !== "admin"
      ) {

        renderError(
          "Akses ditolak",
          "Akun ini bukan owner atau admin."
        );

        return null;

      }


      renderDashboardShell(
        user,
        profile
      );


      return {
        db,
        user,
        profile
      };

    }
    catch (error) {

      console.error(
        "ADMIN CORE:",
        error
      );


      renderError(
        "Admin gagal dimuat",
        error?.message ||
        "Terjadi kesalahan."
      );


      return null;

    }

  }


  window.MemoraAdmin = {
    initialize,
    escapeHtml,
    money
  };

})();