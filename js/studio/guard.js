/* =========================================================
   MEMORA STUDIO GUARD
   Protect all admin / studio pages
   ========================================================= */

(() => {

  "use strict";


  const LOGIN_URL =
    "/studio/login/";


  /* =====================================================
     AUTH OVERLAY
     ===================================================== */

  function createAuthOverlay() {

    if (
      document.getElementById(
        "memoraAuthOverlay"
      )
    ) {
      return;
    }


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "memoraAuthOverlay";


    overlay.innerHTML = `
      <div class="memora-auth-loader"></div>

      <strong>
        Memora Studio
      </strong>

      <span>
        Memeriksa akses...
      </span>
    `;


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "memoraAuthOverlayStyle";


    style.textContent = `

      #memoraAuthOverlay {
        position: fixed;
        inset: 0;

        z-index: 999999;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        gap: 8px;

        background: #f7f9f7;

        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          Arial,
          sans-serif;
      }

      #memoraAuthOverlay strong {
        margin-top: 8px;

        color: #173f35;

        font-size: 14px;
        letter-spacing: -.02em;
      }

      #memoraAuthOverlay span {
        color: #7b8982;

        font-size: 9px;
      }

      .memora-auth-loader {
        width: 30px;
        height: 30px;

        border: 3px solid #dfe8e2;
        border-top-color: #173f35;
        border-radius: 50%;

        animation:
          memoraAuthSpin .7s
          linear infinite;
      }

      @keyframes memoraAuthSpin {

        to {
          transform:
            rotate(360deg);
        }

      }

    `;


    document.head.appendChild(
      style
    );


    document.body.appendChild(
      overlay
    );

  }


  function removeAuthOverlay() {

    document.getElementById(
      "memoraAuthOverlay"
    )?.remove();


    document.getElementById(
      "memoraAuthOverlayStyle"
    )?.remove();

  }


  /* =====================================================
     REDIRECT
     ===================================================== */

  function redirectToLogin() {

    const current =
      window.location.pathname +
      window.location.search;


    const url =
      LOGIN_URL +
      "?redirect=" +
      encodeURIComponent(
        current
      );


    window.location.replace(
      url
    );

  }


  /* =====================================================
     OWNER INFO
     ===================================================== */

  function updateOwnerInformation(
    auth
  ) {

    const name =
      auth?.profile?.full_name ||
      auth?.profile?.name ||
      "Tassya & Arif";


    document
      .querySelectorAll(
        "[data-owner-name]"
      )
      .forEach(element => {

        element.textContent =
          name;

      });


    document
      .querySelectorAll(
        "[data-owner-role]"
      )
      .forEach(element => {

        element.textContent =
          "Owner";

      });

  }


  /* =====================================================
     LOGOUT
     ===================================================== */

  async function logout() {

    const buttons =
      document.querySelectorAll(
        '[data-action="studio-logout"]'
      );


    buttons.forEach(button => {

      button.disabled =
        true;

      button.textContent =
        "Keluar...";

    });


    try {

      if (
        window.memoraAuth?.logout
      ) {

        await window.memoraAuth.logout();

        return;

      }


      if (
        window.memoraSupabase
      ) {

        await window.memoraSupabase
          .auth
          .signOut();

      }


      window.location.replace(
        LOGIN_URL
      );

    }
    catch (error) {

      console.error(
        "Logout error:",
        error
      );


      window.location.replace(
        LOGIN_URL
      );

    }

  }


  function bindLogoutButtons() {

    document
      .querySelectorAll(
        '[data-action="studio-logout"]'
      )
      .forEach(button => {

        if (
          button.dataset.bound ===
          "true"
        ) {
          return;
        }


        button.dataset.bound =
          "true";


        button.addEventListener(
          "click",
          logout
        );

      });

  }


  /* =====================================================
     PROTECT PAGE
     ===================================================== */

  async function protectStudioPage() {

    createAuthOverlay();


    if (
      !window.memoraSupabase
    ) {

      console.error(
        "Supabase belum tersedia."
      );

      redirectToLogin();

      return;

    }


    if (
      !window.memoraAuth
    ) {

      console.error(
        "Memora Auth belum tersedia."
      );

      redirectToLogin();

      return;

    }


    try {

      const auth =
        await window.memoraAuth
          .getCurrentAuth();


      if (
        !auth?.user
      ) {

        redirectToLogin();

        return;

      }


      if (
        !auth?.isOwner
      ) {

        await window.memoraSupabase
          .auth
          .signOut();


        redirectToLogin();

        return;

      }


      updateOwnerInformation(
        auth
      );


      bindLogoutButtons();


      removeAuthOverlay();


      window.dispatchEvent(
        new CustomEvent(
          "memora-studio-ready",
          {
            detail: auth
          }
        )
      );

    }
    catch (error) {

      console.error(
        "Studio guard error:",
        error
      );


      try {

        await window.memoraSupabase
          .auth
          .signOut();

      }
      catch {}


      redirectToLogin();

    }

  }


  /* =====================================================
     AUTH CHANGE
     ===================================================== */

  window.addEventListener(
    "memora-auth-change",
    event => {

      const session =
        event.detail?.session;


      if (
        !session &&
        !window.location.pathname
          .includes(
            "/studio/login"
          )
      ) {

        redirectToLogin();

      }

    }
  );


  /* =====================================================
     START
     ===================================================== */

  document.addEventListener(
    "DOMContentLoaded",
    protectStudioPage
  );


  window.memoraStudioGuard = {

    logout,

    protectStudioPage

  };


})();

/* =========================================================
   AUTO CREATE LOGOUT BUTTON
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const ownerBox =
      document.querySelector(
        ".studio-owner"
      );


    if (
      ownerBox &&
      !ownerBox.querySelector(
        '[data-action="studio-logout"]'
      )
    ) {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "studio-auto-logout-button";


      button.dataset.action =
        "studio-logout";


      button.textContent =
        "Keluar";


      ownerBox.appendChild(
        button
      );


      button.addEventListener(
        "click",
        async () => {

          await window
            .memoraStudioGuard
            .logout();

        }
      );

    }

  }
);

