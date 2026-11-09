(function () {
  "use strict";

  const db = window.memoraSupabase;

  const menu = [
    ["dashboard","Dashboard"],
    ["orders","Orders"],
    ["custom-orders","Custom Orders"],
    ["payments","Payments"],
    ["production","Production"],
    ["finance","Finance"],
    ["invoices","Invoices"],
    ["customers","Customers"],
    ["products","Products"],
    ["gallery","Gallery"],
    ["archive","Archive"]
  ];

  function money(value) {
    return new Intl.NumberFormat("id-ID", {
      style:"currency",
      currency:"IDR",
      maximumFractionDigits:0
    }).format(Number(value) || 0);
  }

  function date(value) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day:"2-digit",
      month:"short",
      year:"numeric"
    }).format(new Date(value));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function statusLabel(value) {
    const map = {
      menunggu_konfirmasi:"Menunggu Konfirmasi",
      data_belum_lengkap:"Data Belum Lengkap",
      menunggu_approval:"Menunggu Approval",
      desain:"Desain",
      printing:"Printing",
      finishing:"Finishing",
      quality_check:"Quality Check",
      packing:"Packing",
      dikirim:"Dikirim",
      selesai:"Selesai",
      dibatalkan:"Dibatalkan",

      belum_ada_pembayaran:"Belum Dibayar",
      dp_diterima:"DP Diterima",
      sebagian:"Sebagian",
      lunas:"Lunas",

      waiting_verification:"Waiting",
      verified:"Verified",
      rejected:"Rejected"
    };

    return map[value] || value || "-";
  }

  async function auth() {
    if (!db) {
      throw new Error("Supabase belum terhubung.");
    }

    const { data, error } =
      await db.auth.getSession();

    if (error) throw error;

    const session = data.session;

    if (!session) {
      window.location.replace("/studio/login/");
      return null;
    }

    const user = session.user;

    const { data:profile, error:profileError } =
      await db
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) throw profileError;

    if (
      !profile ||
      !["owner","admin"].includes(
        String(profile.role || "").toLowerCase()
      )
    ) {
      await db.auth.signOut();
      throw new Error("Akun ini bukan Administrator.");
    }

    return {
      user,
      profile
    };
  }

  function currentPage() {
    const path =
      window.location.pathname
        .split("/")
        .filter(Boolean);

    return path[1] || "dashboard";
  }

  function renderShell(authData) {
    const mount =
      document.getElementById("adminApp");

    if (!mount) return;

    const active =
      currentPage();

    const displayName =
      authData.profile.full_name ||
      authData.profile.name ||
      authData.user.email ||
      "Administrator";

    const initials =
      displayName
        .split(/\s+/)
        .map(x => x[0])
        .join("")
        .slice(0,2)
        .toUpperCase();

    const nav = menu.map(([slug,label]) => `
      <a
        href="/studio/${slug}/"
        class="${active === slug ? "active" : ""}"
      >
        <span class="nav-mark">${label.substring(0,1)}</span>
        <span>${label}</span>
      </a>
    `).join("");

    mount.innerHTML = `
      <div class="admin-shell">

        <div
          class="admin-overlay"
          id="adminOverlay"
        ></div>

        <aside
          class="admin-sidebar"
          id="adminSidebar"
        >
          <div class="admin-sidebar-head">
            <strong>MEMORA</strong>
            <span>Studio Administration</span>
          </div>

          <nav class="admin-nav">
            ${nav}
          </nav>

          <div class="admin-sidebar-foot">

            <div class="admin-user">
              <div class="admin-avatar">
                ${escapeHtml(initials)}
              </div>

              <div>
                <strong>
                  ${escapeHtml(displayName)}
                </strong>

                <span>
                  ${escapeHtml(authData.profile.role || "Admin")}
                </span>
              </div>
            </div>

            <button
              class="btn btn-block"
              id="adminLogout"
              type="button"
            >
              Logout
            </button>

          </div>
        </aside>

        <main class="admin-main">

          <header class="admin-topbar">

            <button
              class="admin-menu"
              id="adminMenu"
              type="button"
            >
              Menu
            </button>

            <div class="admin-topbar-title">
              MEMORA Studio
            </div>

            <div>
              ${escapeHtml(authData.user.email || "")}
            </div>

          </header>

          <div class="admin-content">
            <div id="adminPage"></div>
          </div>

        </main>

      </div>
    `;

    const sidebar =
      document.getElementById("adminSidebar");

    const overlay =
      document.getElementById("adminOverlay");

    document
      .getElementById("adminMenu")
      ?.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("show");
      });

    overlay?.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    });

    document
      .getElementById("adminLogout")
      ?.addEventListener("click", async () => {
        await db.auth.signOut();
        window.location.replace("/studio/login/");
      });
  }

  async function start(loader) {
    try {
      const authData = await auth();

      if (!authData) return;

      renderShell(authData);

      if (loader) {
        await loader(authData);
      }
    }
    catch (error) {
      console.error(error);

      const mount =
        document.getElementById("adminApp");

      if (mount) {
        mount.innerHTML = `
          <div class="admin-login-page">
            <div class="admin-login-card">
              <div class="admin-brand">MEMORA</div>
              <h1>Studio Error</h1>
              <p>
                ${escapeHtml(error.message || "Terjadi kesalahan.")}
              </p>
              <a class="btn btn-primary btn-block" href="/studio/login/">
                Kembali ke Login
              </a>
            </div>
          </div>
        `;
      }
    }
  }

  window.MemoraAdmin = {
    db,
    start,
    money,
    date,
    escapeHtml,
    statusLabel
  };

})();